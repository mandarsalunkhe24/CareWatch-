require("dotenv").config();

const express = require("express");
const dns = require('dns');
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Prefer IPv4 to avoid Atlas TLS issues on networks with broken IPv6 routing
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

mongoose.set('bufferCommands', false);

let mongoReady = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
let connecting = false;

const connectWithRetry = async () => {
  if (connecting) return;
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. Check server/.env');
    return;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  connecting = true;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
  } catch (err) {
    mongoReady = false;
    const delayMs = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
    reconnectAttempts += 1;
    console.error(`MongoDB connect failed (attempt ${reconnectAttempts}). Retrying in ${delayMs}ms.`, err?.message);
    reconnectTimer = setTimeout(() => {
      connecting = false;
      connectWithRetry();
    }, delayMs);
  } finally {
    connecting = false;
  }
};

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  const delayMs = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
  reconnectAttempts += 1;
  console.error(`MongoDB disconnected. Retrying connect in ${delayMs}ms...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWithRetry();
  }, delayMs);
};

mongoose.connection.on('connected', () => {
  mongoReady = true;
  reconnectAttempts = 0;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  console.log('MongoDB connected');
});
mongoose.connection.on('disconnected', () => {
  mongoReady = false;
  console.error('MongoDB disconnected');
  scheduleReconnect();
});
mongoose.connection.on('error', (err) => {
  mongoReady = false;
  console.error('MongoDB connection error:', err.message);
  scheduleReconnect();
});

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use((req, res, next) => {
  if (!mongoReady && (req.path.startsWith('/api') || req.path.startsWith('/api/'))) {
    return res.status(503).json({
      success: false,
      message:
        'Database not connected. If you use MongoDB Atlas, whitelist your current IP in Atlas (Network Access) or allow 0.0.0.0/0 for development, then restart the server.',
    });
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "CareWatch API running" });
});

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/sos-alerts', require('./routes/sosAlerts'));
app.use('/api/v1/vitals', require('./routes/vitalReadings'));
app.use('/api/v1/visits', require('./routes/caregiverVisits'));
app.use('/api/v1/summary', require('./routes/summary'));

app.use(require('./middleware/error'));

// 🔥 FORCE PORT — NO 5000 ANYWHERE
const PORT = Number(process.env.PORT) || 5001;

connectWithRetry();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("SERVER STARTED ON PORT", PORT);
  });
}

module.exports = app;


const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: [0, 'Systolic must be positive']
    },
    diastolic: {
      type: Number,
      min: [0, 'Diastolic must be positive']
    }
  },
  heartRate: {
    type: Number,
    min: [0, 'Heart rate must be positive']
  },
  temperature: {
    value: {
      type: Number,
      min: [0, 'Temperature must be positive']
    },
    unit: {
      type: String,
      enum: ['C', 'F'],
      default: 'C'
    }
  },
  bloodOxygen: {
    type: Number,
    min: [0, 'Blood oxygen must be between 0-100'],
    max: [100, 'Blood oxygen must be between 0-100']
  },
  bloodGlucose: {
    value: {
      type: Number,
      min: [0, 'Blood glucose must be positive']
    },
    unit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      default: 'mg/dL'
    }
  },
  weight: {
    value: {
      type: Number,
      min: [0, 'Weight must be positive']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  device: {
    type: String,
    enum: ['manual', 'wearable', 'mobile_app', 'other'],
    default: 'manual'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add geospatial index for location-based queries
VitalSchema.index({ 'location.coordinates': '2dsphere' });

// Static method to get average vital stats
VitalSchema.statics.getAverageStats = async function(userId) {
  const obj = await this.aggregate([
    {
      $match: { user: userId }
    },
    {
      $group: {
        _id: '$user',
        avgHeartRate: { $avg: '$heartRate' },
        avgSystolic: { $avg: '$bloodPressure.systolic' },
        avgDiastolic: { $avg: '$bloodPressure.diastolic' },
        avgTemperature: { $avg: '$temperature.value' },
        avgBloodOxygen: { $avg: '$bloodOxygen' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('User').findByIdAndUpdate(userId, {
      averageStats: obj[0] || {}
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageStats after save
VitalSchema.post('save', function() {
  this.constructor.getAverageStats(this.user);
});

// Call getAverageStats before remove
VitalSchema.post('remove', function() {
  this.constructor.getAverageStats(this.user);
});

module.exports = mongoose.model('Vital', VitalSchema);

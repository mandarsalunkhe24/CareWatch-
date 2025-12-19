const mongoose = require('mongoose');

const VitalReadingSchema = new mongoose.Schema(
  {
    ts: {
      type: Date,
      default: Date.now,
    },
    systolic: {
      type: Number,
      required: true,
      min: 0,
    },
    diastolic: {
      type: Number,
      required: true,
      min: 0,
    },
    hr: {
      type: Number,
      required: true,
      min: 0,
    },
    elderName: {
      type: String,
      default: 'Elder',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VitalReading', VitalReadingSchema);

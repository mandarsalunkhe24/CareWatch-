const mongoose = require('mongoose');

const SosAlertSchema = new mongoose.Schema(
  {
    elderName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'reached'],
      default: 'pending',
    },
    assignedTo: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SosAlert', SosAlertSchema);

const mongoose = require('mongoose');

const CaregiverVisitSchema = new mongoose.Schema(
  {
    caregiverName: {
      type: String,
      required: true,
      trim: true,
    },
    elderName: {
      type: String,
      required: true,
      trim: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaregiverVisit', CaregiverVisitSchema);

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  elder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please select an elder']
  },
  caregiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please select a caregiver']
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['checkup', 'medication', 'meal', 'exercise', 'social', 'other'],
    required: [true, 'Please select appointment type']
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
  },
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    type: Date
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    daysOfWeek: [{
      type: Number,
      min: 0, // Sunday
      max: 6  // Saturday
    }],
    endDate: Date
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add geospatial index for location-based queries
AppointmentSchema.index({ 'location.coordinates': '2dsphere' });

// Index for date range queries
AppointmentSchema.index({ startTime: 1, endTime: 1 });

// Index for status and type for faster filtering
AppointmentSchema.index({ status: 1, type: 1 });

// Cascade delete related data when an appointment is deleted
AppointmentSchema.pre('remove', async function(next) {
  await this.model('Notification').deleteMany({ appointment: this._id });
  next();
});

// Static method to check for scheduling conflicts
AppointmentSchema.statics.checkAvailability = async function(caregiverId, startTime, endTime, excludeAppointmentId = null) {
  const query = {
    caregiver: caregiverId,
    $or: [
      // New appointment starts during an existing appointment
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      // New appointment ends during an existing appointment
      { startTime: { $lt: endTime }, endTime: { $gt: endTime } },
      // New appointment completely contains an existing appointment
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const conflicts = await this.find(query);
  return conflicts.length === 0;
};

// Virtual for duration in minutes
AppointmentSchema.virtual('duration').get(function() {
  return (this.endTime - this.startTime) / (1000 * 60);
});

// Method to check if appointment is in progress
AppointmentSchema.methods.isInProgress = function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

// Method to check if appointment is upcoming
AppointmentSchema.methods.isUpcoming = function() {
  return new Date() < this.startTime;
};

// Method to check if appointment is past
AppointmentSchema.methods.isPast = function() {
  return new Date() > this.endTime;
};

module.exports = mongoose.model('Appointment', AppointmentSchema);

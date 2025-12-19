const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['SOS', 'fall', 'medical', 'other'],
    required: [true, 'Please specify emergency type']
  },
  status: {
    type: String,
    enum: ['active', 'in-progress', 'resolved', 'false-alarm'],
    default: 'active'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      required: [true, 'Location coordinates are required']
    },
    address: String
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    },
    notes: String
  }],
  vitals: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vital'
  },
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    description: String
  }],
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: String,
    action: String,
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    notes: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDetails: String
  },
  isFalseAlarm: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['mobile-app', 'wearable', 'manual', 'system'],
    required: true
  },
  relatedAppointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment'
  },
  metadata: {
    deviceInfo: String,
    appVersion: String,
    os: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add geospatial index for location-based queries
EmergencySchema.index({ 'location.coordinates': '2dsphere' });

// Index for status and priority for faster filtering
EmergencySchema.index({ status: 1, priority: 1 });

// Index for user and timestamp for user-specific queries
EmergencySchema.index({ user: 1, createdAt: -1 });

// Method to add a timeline event
EmergencySchema.methods.addTimelineEvent = function(event) {
  this.timeline.push({
    status: event.status || this.status,
    action: event.action,
    performedBy: event.performedBy,
    notes: event.notes
  });
};

// Method to assign a responder
EmergencySchema.methods.assignResponder = function(userId, role) {
  this.assignedTo.push({
    user: userId,
    role: role,
    status: 'pending'
  });
  
  this.addTimelineEvent({
    action: 'assigned',
    status: 'in-progress',
    performedBy: userId,
    notes: `Assigned to ${role}`
  });
  
  this.status = 'in-progress';
};

// Method to resolve the emergency
EmergencySchema.methods.resolve = function(userId, notes = '') {
  this.status = 'resolved';
  this.resolution = {
    resolvedAt: new Date(),
    resolvedBy: userId,
    notes: notes
  };
  
  this.addTimelineEvent({
    action: 'resolved',
    status: 'resolved',
    performedBy: userId,
    notes: notes
  });
};

// Static method to get active emergencies near a location
EmergencySchema.statics.findNearby = async function(coordinates, maxDistance = 5000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance // in meters
      }
    },
    status: { $in: ['active', 'in-progress'] }
  }).populate('user', 'name phone profileImage');
};

module.exports = mongoose.model('Emergency', EmergencySchema);

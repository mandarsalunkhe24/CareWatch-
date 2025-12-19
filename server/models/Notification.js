const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'emergency',
      'appointment',
      'medication',
      'vital-alert',
      'message',
      'system',
      'reminder',
      'care-team-update',
      'health-summary',
      'activity'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: Boolean,
    default: false
  },
  actionLabel: {
    type: String,
    trim: true,
    maxlength: [50, 'Action label cannot be more than 50 characters']
  },
  actionLink: {
    type: String,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedDocument: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedDocumentModel'
  },
  relatedDocumentModel: {
    type: String,
    enum: ['Emergency', 'Appointment', 'User', 'Vital', 'Medication']
  },
  expiryDate: {
    type: Date
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ 'channels.email': 1, isRead: 1 });
NotificationSchema.index({ 'channels.sms': 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

// Static method to create a notification
NotificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = await this.create(notificationData);
    
    // Emit real-time notification (you'll need to implement your real-time solution here)
    // io.to(`user_${notification.recipient}`).emit('new-notification', notification);
    
    // Send email/SMS if enabled (implement your email/SMS service here)
    if (notification.channels.email) {
      // await sendEmailNotification(notification);
    }
    
    if (notification.channels.sms) {
      // await sendSmsNotification(notification);
    }
    
    if (notification.channels.push) {
      // await sendPushNotification(notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Method to mark notification as read
NotificationSchema.methods.markAsRead = async function() {
  if (this.isRead) return this;
  
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
  
  return this;
};

// Method to mark notification as unread
NotificationSchema.methods.markAsUnread = async function() {
  if (!this.isRead) return this;
  
  this.isRead = false;
  this.readAt = undefined;
  await this.save();
  
  return this;
};

// Method to mark action as taken
NotificationSchema.methods.markActionAsTaken = async function(notes = '') {
  this.actionTaken = true;
  this.actionRequired = false;
  this.data = { ...this.data, actionNotes: notes };
  await this.save();
  
  return this;
};

// Pre-save hook to set expiry date for certain notification types
NotificationSchema.pre('save', function(next) {
  if (!this.expiryDate) {
    // Default expiry: 30 days for most notifications, 1 year for important ones
    const expiryDays = ['emergency', 'vital-alert'].includes(this.type) ? 365 : 30;
    this.expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to get unread count for a user
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Static method to mark all notifications as read
NotificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

// Static method to clean up expired notifications
NotificationSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({
    expiryDate: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);

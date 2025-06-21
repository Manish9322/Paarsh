const mongoose = require('mongoose');

// Define the notification schema
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    recipientType: {
      type: String,
      required: [true, 'Recipient type is required'],
      enum: {
        values: ['agent', 'student', 'user', 'all'],
        message: 'Invalid recipient type',
      },
    },
    recipientIds: {
      type: [String],
      default: [],
    },
    sentTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['sent', 'failed'],
        message: 'Invalid status',
      },
      default: 'sent',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent model overwrite by checking if the model is already defined
const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel;
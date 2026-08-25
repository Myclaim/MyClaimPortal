const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      // e.g., 'ticket_assigned', 'ticket_reassigned', 'comment_added', 'doc_rejected', 'doc_approved', 'task_completed'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      // e.g., '?tab=tickets&id=123', '?tab=docs'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Ensure index on user + createdAt for fast queries
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

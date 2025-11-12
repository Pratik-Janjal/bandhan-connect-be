const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  type: { type: String, enum: ['info', 'success', 'warning', 'error'] },
  title: String,
  message: String,
  timestamp: String,
  read: Boolean,
  actionUrl: String,
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Notification', NotificationSchema); 
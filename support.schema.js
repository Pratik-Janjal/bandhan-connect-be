const mongoose = require('mongoose');
const { Schema } = mongoose;

const SupportTicketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['technical', 'billing', 'account', 'general', 'bug', 'feature'], 
    default: 'general' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }, // admin assigned to handle
  replies: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  resolvedAt: Date,
  closedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema); 
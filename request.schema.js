const mongoose = require('mongoose');
const { Schema } = mongoose;

const RequestSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  roleRequested: { 
    type: String, 
    enum: ['vendor', 'counselor', 'community'], 
    required: true 
  },
  message: String,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reviewedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedAt: Date,
  rejectionReason: String,
  source: { 
    type: String, 
    enum: ['public_form', 'admin_invite'], 
    default: 'public_form' 
  },
  inviteCode: String, // for admin invites
  additionalInfo: {
    businessName: String, // for vendors
    specialization: String, // for counselors
    communityName: String, // for communities
    experience: Number,
    location: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema); 
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  contentType: { type: String, required: true }, // e.g., 'profile', 'post'
  contentId: { type: String, required: true },
  reportedBy: { type: String, required: true }, // user ID or email
  reason: { type: String, required: true },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  description: { type: String }
});

export default mongoose.model('Report', ReportSchema); 
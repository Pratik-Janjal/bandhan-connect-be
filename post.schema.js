import mongoose from 'mongoose';
const { Schema } = mongoose;

const PostSchema = new Schema({
  author: {
    name: String,
    photo: String,
    verified: Boolean
  },
  content: String,
  image: String,
  timestamp: String,
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  type: { type: String, enum: ['success_story', 'advice', 'event', 'general'], default: 'general' }
}, { timestamps: true });

export default mongoose.model('Post', PostSchema); 
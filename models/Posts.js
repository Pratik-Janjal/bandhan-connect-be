import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "registeruser",
    required: true,
  },
  caption: {
    type: String,
    required: true,
    trim: true,
  },
  postType: {
    type: String,
    enum: ["advice", "success", "general"],
    required: true,
    trim: true,
    lowercase: true,
  },
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("communityPosts", PostSchema); 
export default Post; 

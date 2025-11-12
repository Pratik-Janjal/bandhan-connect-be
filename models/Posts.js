import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    postType: {
      type: String,
      enum: ["General", "Advice", "Success Story"],
      default: "General",
    },
  },
  { timestamps: true }
);
const Post = mongoose.models.Post || mongoose.model("communityPosts", postSchema);
export default Post;

import express from "express";
import upload from "../../middleware/upload.js";
import Post from "../../models/Posts.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

const PostsRouter = express.Router();

PostsRouter.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { caption, postType, userId } = req.body;
    if (!caption || !userId) {
      return res.status(400).json({ message: "Caption and userId are required" });
    }

    let imageUrl = null;

    if (req.file) {
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "bandhanconnect/posts",
        resource_type: "image",
      });

      imageUrl = uploadResult.secure_url;

      // Delete local temp file (optional cleanup)
      fs.unlinkSync(req.file.path);
    }

    // Create post
    const post = new Post({
      userId,
      caption,
      postType,
      imageUrl,
    });

    await post.save();

    res.status(201).json({
      message: "Post created successfully!",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default PostsRouter;

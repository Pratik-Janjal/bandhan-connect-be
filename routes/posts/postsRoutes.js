import express from "express";
import Post from "../../models/Posts.js";
import upload from "../../middleware/multer.js";
import cloudinary from "../../config/cloudinary.js";

const router = express.Router();

/**
 * @route POST /api/posts/create
 * @desc Create a community post (with or without image)
 * @access Public or Protected (depending on your auth)
 */

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { userId, caption, postType } = req.body;

    // Validate required fields
    if (!userId || !caption || !postType) {
      return res.status(400).json({ message: "userId, caption and postType are required" });
    }

    // Optional: Normalize postType to lowercase and trim
    const normalizedPostType = postType.trim().toLowerCase();

    // Upload image if provided
    let imageUrl = null;
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "community_posts" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        imageUrl = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ message: "Image upload failed", error: err.message });
      }
    }

    // Create the post
    const post = await Post.create({
      userId,
      caption,
      postType: normalizedPostType,
      imageUrl,
    });

    await post.populate("userId", "name"); // Get user's name

    res.status(201).json({
      message: "Post created successfully",
      post: {
        id: post._id,
        userName: post.userId.name,
        caption: post.caption,
        postType: post.postType,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route GET /api/posts 
 * @desc Get all community posts 
 * @access Public 
 */        

router.get("/", async (req, res) => { 
  try { 
    const posts = await Post.find() 
      .populate("userId", "name") 
      .sort({ createdAt: -1 }); 

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// 📌 Get all community posts (for community feed)
router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name profilePicture") // fetch name, profile picture, etc.
      .sort({ createdAt: -1 }); // latest posts first

    res.status(200).json({
      message: "All community posts fetched successfully",
      count: posts.length,
      posts: posts.map((post) => ({
        id: post._id,
        userId: post.userId._id,
        userName: post.userId.name,
        userProfile: post.userId.profilePicture || null,
        caption: post.caption,
        postType: post.postType,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error while fetching posts", error: error.message });
  }
});



export default router;

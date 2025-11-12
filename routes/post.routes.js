const express = require('express');
const router = express.Router();
const Post = require('../post.schema');

// Create post
router.post('/', async (req, res) => {
  res.json(await new Post(req.body).save());
});

// List/search posts
router.get('/', async (req, res) => {
  res.json(await Post.find());
});

// Get post details
router.get('/:id', async (req, res) => {
  res.json(await Post.findById(req.params.id));
});

// Update post
router.put('/:id', async (req, res) => {
  res.json(await Post.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

// Delete post
router.delete('/:id', async (req, res) => {
  res.json(await Post.findByIdAndDelete(req.params.id));
});

// Like/unlike post
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.liked = !post.liked;
    post.likes = post.liked ? post.likes + 1 : Math.max(0, post.likes - 1);
    await post.save();
    
    res.json({ message: post.liked ? 'Post liked' : 'Post unliked', likes: post.likes });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
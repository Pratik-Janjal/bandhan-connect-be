const express = require('express');
const router = express.Router();
const Match = require('../match.schema');
const User = require('../user.schema');
const auth = require('../middleware/auth');

// Create match
router.post('/', async (req, res) => {
  res.json(await new Match(req.body).save());
});

// Get potential matches for current user
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const filters = req.query;
    
    // Get all users except current user
    let query = { _id: { $ne: currentUserId } };
    
    // Apply filters
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
      query.age = { $gte: minAge, $lte: maxAge };
    }
    
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters.education) {
      query.education = { $regex: filters.education, $options: 'i' };
    }
    
    if (filters.profession) {
      query.profession = { $regex: filters.profession, $options: 'i' };
    }
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like a user
router.post('/like', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.userId;
    
    // Create a match record
    const match = new Match({
      user1: currentUserId,
      user2: userId,
      status: 'liked',
      timestamp: new Date()
    });
    
    await match.save();
    res.json({ message: 'User liked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject a user
router.post('/reject', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.userId;
    
    // Create a match record with rejected status
    const match = new Match({
      user1: currentUserId,
      user2: userId,
      status: 'rejected',
      timestamp: new Date()
    });
    
    await match.save();
    res.json({ message: 'User rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get liked users
router.get('/liked', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const matches = await Match.find({
      user1: currentUserId,
      status: 'liked'
    }).populate('user2', '-password');
    
    const likedUsers = matches.map(match => match.user2);
    res.json(likedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get matches (basic CRUD)
router.get('/', async (req, res) => {
  res.json(await Match.find());
});

// Get match by ID
router.get('/:id', async (req, res) => {
  res.json(await Match.findById(req.params.id));
});

// Update match
router.put('/:id', async (req, res) => {
  res.json(await Match.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

// Delete match
router.delete('/:id', async (req, res) => {
  res.json(await Match.findByIdAndDelete(req.params.id));
});

module.exports = router; 
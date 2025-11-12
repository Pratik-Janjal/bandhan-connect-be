const express = require('express');
const router = express.Router();
const User = require('../user.schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('../notification.schema');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      password: hashedPassword,
      name,
      isVerified: false,
      profileComplete: false,
      role: 'user'
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        profileComplete: user.profileComplete,
        role: user.role
      },
      token
    });
  } catch (err) { 
    res.status(400).json({ error: err.message }); 
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        profileComplete: user.profileComplete,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByIdAndUpdate(
      decoded.userId, 
      req.body, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (basic CRUD)
router.post('/', async (req, res) => {
  res.json(await User.create(req.body));
});

// Get user by ID
router.get('/:id', async (req, res) => {
  res.json(await User.findById(req.params.id));
});

// Update user
router.put('/:id', async (req, res) => {
  res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

// Delete user
router.delete('/:id', async (req, res) => {
  res.json(await User.findByIdAndDelete(req.params.id));
});

// List/search users
router.get('/', async (req, res) => {
  res.json(await User.find());
});

// Admin: Verify user
router.patch('/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, status: 'verified' },
      { new: true }
    );
    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'success',
      title: 'Profile Verified',
      message: 'Your profile has been verified by the admin.',
      timestamp: new Date().toISOString(),
      read: false
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Admin: Suspend user
router.patch('/:id/suspend', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'warning',
      title: 'Account Suspended',
      message: 'Your account has been suspended by the admin.',
      timestamp: new Date().toISOString(),
      read: false
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Admin: Activate user
router.patch('/:id/activate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'info',
      title: 'Account Activated',
      message: 'Your account has been re-activated by the admin.',
      timestamp: new Date().toISOString(),
      read: false
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Admin: Make user premium
router.patch('/:id/premium', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isPremium: true },
      { new: true }
    );
    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'success',
      title: 'Premium Activated',
      message: 'Congratulations! You have been granted premium status by the admin.',
      timestamp: new Date().toISOString(),
      read: false
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to make user premium' });
  }
});

// Make user admin
router.patch('/:id/make-admin', async (req, res) => {
  try {
    console.log('Making user admin - User ID:', req.params.id);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    );
    
    if (!user) {
      console.log('Make admin - User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Make admin - User role updated successfully:', user._id, user.role);
    
    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'success',
      title: 'Admin Role Granted',
      message: 'You have been granted admin privileges by the system.',
      timestamp: new Date().toISOString(),
      read: false
    });
    
    res.json(user);
  } catch (error) {
    console.error('Make admin - Error:', error);
    res.status(500).json({ error: 'Failed to make user admin: ' + error.message });
  }
});

module.exports = router; 
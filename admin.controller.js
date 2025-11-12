import User from './models/User.js';
import Post from './post.schema.js';
import Report from './report.schema.js';
import { getIO } from './socket.js';

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, status: 'active' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    try {
      getIO().emit('userUpdated', { userId: user._id, user });
    } catch (socketError) {
      // Socket.IO not initialized, continue without emitting
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    try {
      getIO().emit('userUpdated', { userId: user._id, user });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    try {
      getIO().emit('userUpdated', { userId: user._id, user });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const premiumUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isPremium: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    try {
      getIO().emit('userUpdated', { userId: user._id, user });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    try {
      getIO().emit('userDeleted', { userId: req.params.id });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json({ message: 'User deleted', userId: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    try {
      getIO().emit('postUpdated', { postId: post._id, post });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    try {
      getIO().emit('postUpdated', { postId: post._id, post });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    try {
      getIO().emit('postDeleted', { postId: req.params.id });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json({ message: 'Post deleted', postId: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    try {
      getIO().emit('reportUpdated', { reportId: report._id, report });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'reviewed' },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    try {
      getIO().emit('reportUpdated', { reportId: report._id, report });
    } catch (socketError) {
      console.log('Socket.IO not available, skipping emit');
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
const express = require('express');
const router = express.Router();
const Message = require('../message.schema');
const auth = require('../middleware/auth');

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.userId;
    
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
      isRead: false
    });
    
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Get conversations list
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    
    // Get all unique conversations for the current user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', currentUserId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $last: '$message' },
          timestamp: { $last: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiverId', currentUserId] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { timestamp: -1 } }
    ]);
    
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Get single message
router.get('/:id', async (req, res) => {
  res.json(await Message.findById(req.params.id));
});
// Mark as read
router.put('/:id/read', async (req, res) => {
  res.json(await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }));
});

module.exports = router; 
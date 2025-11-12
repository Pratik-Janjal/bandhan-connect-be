const express = require('express');
const router = express.Router();
const SupportTicket = require('../support.schema');
const User = require('../user.schema');
const jwt = require('jsonwebtoken');
const Notification = require('../notification.schema');
const { getIO } = require('../socket');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Auth middleware - Token provided:', !!token);
  
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully:', decoded);
    console.log('Auth middleware - User ID from token:', decoded.userId);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - Token verification failed:', error.message);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Create a new support ticket (user)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    
    const ticket = new SupportTicket({
      userId: req.user.userId,
      subject,
      message,
      category: category || 'general',
      priority: priority || 'medium'
    });
    
    await ticket.save();
    
    // Populate the ticket for socket emission
    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');
    
    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: 'info',
        title: 'New Support Ticket',
        message: `New support ticket: ${subject}`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }
    
    // Emit socket event for real-time updates
    try {
      const io = getIO();
      io.emit('supportTicketCreated', { ticket: populatedTicket });
    } catch (error) {
      console.error('Socket emission failed:', error);
    }
    
    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Get user's own tickets
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.userId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get specific ticket (user can only see their own)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('replies.userId', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check if user owns the ticket or is admin
    const user = await User.findById(req.user.userId);
    if (ticket.userId._id.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Add reply to ticket
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user.userId);
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check if user owns the ticket or is admin
    if (ticket.userId.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const reply = {
      userId: req.user.userId,
      message,
      isAdmin: user.role === 'admin',
      timestamp: new Date()
    };
    
    ticket.replies.push(reply);
    
    // Update status if admin replies
    if (user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    
    await ticket.save();
    
    // Populate the ticket for socket emission
    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('replies.userId', 'name email');
    
    // Create notification for the other party
    const notificationUserId = user.role === 'admin' ? ticket.userId : ticket.assignedTo;
    if (notificationUserId) {
      await Notification.create({
        userId: notificationUserId,
        type: 'info',
        title: 'Support Ticket Update',
        message: `New reply to ticket: ${ticket.subject}`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }
    
    // Emit socket event for real-time updates
    try {
      const io = getIO();
      io.emit('supportTicketUpdated', { ticket: populatedTicket });
    } catch (error) {
      console.error('Socket emission failed:', error);
    }
    
    res.json(populatedTicket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Admin: Get all tickets
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    console.log('Admin getAllTickets - User ID:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    console.log('Admin getAllTickets - User found:', !!user, 'Role:', user?.role);
    
    if (!user) {
      console.log('Admin getAllTickets - User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      console.log('Admin getAllTickets - User is not admin:', user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('Admin getAllTickets - Fetching tickets...');
    const tickets = await SupportTicket.find()
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Admin getAllTickets - Tickets found:', tickets.length);
    res.json(tickets);
  } catch (error) {
    console.error('Admin getAllTickets - Error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets: ' + error.message });
  }
});

// Admin: Update ticket status
router.patch('/admin/:id/status', authenticateToken, async (req, res) => {
  try {
    console.log('Admin updateStatus - User ID:', req.user.userId, 'Ticket ID:', req.params.id, 'Status:', req.body.status);
    
    const user = await User.findById(req.user.userId);
    console.log('Admin updateStatus - User found:', !!user, 'Role:', user?.role);
    
    if (!user) {
      console.log('Admin updateStatus - User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      console.log('Admin updateStatus - User is not admin:', user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { status } = req.body;
    if (!status) {
      console.log('Admin updateStatus - Status not provided');
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updateData = { status };
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    } else if (status === 'closed') {
      updateData.closedAt = new Date();
    }
    
    console.log('Admin updateStatus - Updating ticket with data:', updateData);
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email')
     .populate('assignedTo', 'name email');
    
    if (!ticket) {
      console.log('Admin updateStatus - Ticket not found');
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    console.log('Admin updateStatus - Ticket updated successfully:', ticket._id);
    
    // Create notification for user
    try {
      await Notification.create({
        userId: ticket.userId._id,
        type: 'info',
        title: 'Support Ticket Update',
        message: `Your ticket "${ticket.subject}" status has been updated to ${status}`,
        timestamp: new Date().toISOString(),
        read: false
      });
      console.log('Admin updateStatus - Notification created for user');
    } catch (notificationError) {
      console.error('Admin updateStatus - Failed to create notification:', notificationError);
    }
    
    // Emit socket event for real-time updates
    try {
      const io = getIO();
      io.emit('supportTicketUpdated', { ticket });
      console.log('Admin updateStatus - Socket event emitted');
    } catch (error) {
      console.error('Admin updateStatus - Socket emission failed:', error);
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Admin updateStatus - Error:', error);
    res.status(500).json({ error: 'Failed to update ticket status: ' + error.message });
  }
});

// Admin: Assign ticket to admin
router.patch('/admin/:id/assign', authenticateToken, async (req, res) => {
  try {
    console.log('Admin assignTicket - User ID:', req.user.userId, 'Ticket ID:', req.params.id, 'AssignedTo:', req.body.assignedTo);
    
    const user = await User.findById(req.user.userId);
    console.log('Admin assignTicket - User found:', !!user, 'Role:', user?.role);
    
    if (!user) {
      console.log('Admin assignTicket - User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      console.log('Admin assignTicket - User is not admin:', user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { assignedTo } = req.body;
    
    console.log('Admin assignTicket - Updating ticket assignment to:', assignedTo);
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate('userId', 'name email')
     .populate('assignedTo', 'name email');
    
    if (!ticket) {
      console.log('Admin assignTicket - Ticket not found');
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    console.log('Admin assignTicket - Ticket assigned successfully:', ticket._id);
    
    // Create notification for assigned admin
    if (assignedTo) {
      try {
        await Notification.create({
          userId: assignedTo,
          type: 'info',
          title: 'Ticket Assigned',
          message: `You have been assigned ticket: ${ticket.subject}`,
          timestamp: new Date().toISOString(),
          read: false
        });
        console.log('Admin assignTicket - Notification created for assigned admin');
      } catch (notificationError) {
        console.error('Admin assignTicket - Failed to create notification:', notificationError);
      }
    }
    
    // Emit socket event for real-time updates
    try {
      const io = getIO();
      io.emit('supportTicketUpdated', { ticket });
      console.log('Admin assignTicket - Socket event emitted');
    } catch (error) {
      console.error('Admin assignTicket - Socket emission failed:', error);
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Admin assignTicket - Error:', error);
    res.status(500).json({ error: 'Failed to assign ticket: ' + error.message });
  }
});

// Admin: Update ticket priority
router.patch('/admin/:id/priority', authenticateToken, async (req, res) => {
  try {
    console.log('Admin updatePriority - User ID:', req.user.userId, 'Ticket ID:', req.params.id, 'Priority:', req.body.priority);
    
    const user = await User.findById(req.user.userId);
    console.log('Admin updatePriority - User found:', !!user, 'Role:', user?.role);
    
    if (!user) {
      console.log('Admin updatePriority - User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      console.log('Admin updatePriority - User is not admin:', user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { priority } = req.body;
    if (!priority) {
      console.log('Admin updatePriority - Priority not provided');
      return res.status(400).json({ error: 'Priority is required' });
    }
    
    console.log('Admin updatePriority - Updating ticket priority to:', priority);
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    ).populate('userId', 'name email')
     .populate('assignedTo', 'name email');
    
    if (!ticket) {
      console.log('Admin updatePriority - Ticket not found');
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    console.log('Admin updatePriority - Ticket priority updated successfully:', ticket._id);
    
    // Emit socket event for real-time updates
    try {
      const io = getIO();
      io.emit('supportTicketUpdated', { ticket });
      console.log('Admin updatePriority - Socket event emitted');
    } catch (error) {
      console.error('Admin updatePriority - Socket emission failed:', error);
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Admin updatePriority - Error:', error);
    res.status(500).json({ error: 'Failed to update priority: ' + error.message });
  }
});

module.exports = router; 
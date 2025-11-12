const express = require('express');
const router = express.Router();
const Event = require('../event.schema');
const auth = require('../middleware/auth');

// Create event
router.post('/', async (req, res) => {
  res.json(await new Event(req.body).save());
});

// List/search events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events); // Always return 200 with array
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event details
router.get('/:id', async (req, res) => {
  res.json(await Event.findById(req.params.id));
});

// Update event
router.put('/:id', async (req, res) => {
  res.json(await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

// Delete event
router.delete('/:id', async (req, res) => {
  res.json(await Event.findByIdAndDelete(req.params.id));
});

// Register for event
router.post('/:id/join', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is already registered
    if (event.registeredUsers.includes(userId)) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Add user to registered users and increment count
    event.registeredUsers.push(userId);
    event.currentParticipants += 1;
    await event.save();
    
    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
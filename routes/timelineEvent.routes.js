const express = require('express');
const router = express.Router();
const TimelineEvent = require('../timelineEvent.schema');

// Add event
router.post('/', async (req, res) => {
  res.json(await new TimelineEvent(req.body).save());
});
// Get all timeline events for a user
router.get('/user/:userId', async (req, res) => {
  res.json(await TimelineEvent.find({ participants: req.params.userId }));
});
// Update event
router.put('/:id', async (req, res) => {
  res.json(await TimelineEvent.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
// Delete event
router.delete('/:id', async (req, res) => {
  res.json(await TimelineEvent.findByIdAndDelete(req.params.id));
});

module.exports = router; 
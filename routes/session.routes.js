const express = require('express');
const router = express.Router();
const Session = require('../session.schema');

// Book session
router.post('/', async (req, res) => {
  res.json(await new Session(req.body).save());
});
// Get all sessions for a user
router.get('/user/:userId', async (req, res) => {
  res.json(await Session.find({ userId: req.params.userId }));
});
// Update session
router.put('/:id', async (req, res) => {
  res.json(await Session.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
// Cancel session
router.delete('/:id', async (req, res) => {
  res.json(await Session.findByIdAndDelete(req.params.id));
});

module.exports = router;
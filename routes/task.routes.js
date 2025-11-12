const express = require('express');
const router = express.Router();
const Task = require('../task.schema');

// Add task
router.post('/', async (req, res) => {
  res.json(await new Task(req.body).save());
});
// Get all tasks for a user
router.get('/user/:userId', async (req, res) => {
  res.json(await Task.find({ assignedTo: req.params.userId }));
});
// Update task
router.put('/:id', async (req, res) => {
  res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
// Delete task
router.delete('/:id', async (req, res) => {
  res.json(await Task.findByIdAndDelete(req.params.id));
});

module.exports = router; 
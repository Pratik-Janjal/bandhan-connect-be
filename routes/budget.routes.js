const express = require('express');
const router = express.Router();
const Budget = require('../budget.schema');

// Add budget item
router.post('/', async (req, res) => {
  res.json(await new Budget(req.body).save());
});
// Get all budget items for a user
router.get('/user/:userId', async (req, res) => {
  res.json(await Budget.find({ userId: req.params.userId }));
});
// Update budget item
router.put('/:id', async (req, res) => {
  res.json(await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
// Delete budget item
router.delete('/:id', async (req, res) => {
  res.json(await Budget.findByIdAndDelete(req.params.id));
});

module.exports = router; 
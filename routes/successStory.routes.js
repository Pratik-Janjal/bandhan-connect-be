const express = require('express');
const router = express.Router();
const SuccessStory = require('../successStory.schema');

// Add success story
router.post('/', async (req, res) => {
  res.json(await new SuccessStory(req.body).save());
});
// List/search stories
router.get('/', async (req, res) => {
  res.json(await SuccessStory.find());
});
// Get story details
router.get('/:id', async (req, res) => {
  res.json(await SuccessStory.findById(req.params.id));
});
// Update story
router.put('/:id', async (req, res) => {
  res.json(await SuccessStory.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
// Delete story
router.delete('/:id', async (req, res) => {
  res.json(await SuccessStory.findByIdAndDelete(req.params.id));
});

module.exports = router; 
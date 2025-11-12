const express = require('express');
const router = express.Router();
const Service = require('../service.schema');

// Add service
router.post('/', async (req, res) => {
  res.json(await new Service(req.body).save());
});
// List/search services
router.get('/', async (req, res) => {
  res.json(await Service.find());
});
// Get service details
router.get('/:id', async (req, res) => {
  res.json(await Service.findById(req.params.id));
});
// Update service
router.put('/:id', async (req, res) => {
  res.json(await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
// Delete service
router.delete('/:id', async (req, res) => {
  res.json(await Service.findByIdAndDelete(req.params.id));
});

module.exports = router; 
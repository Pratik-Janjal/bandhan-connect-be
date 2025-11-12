const express = require('express');
const router = express.Router();
const requestController = require('../request.controller');
const auth = require('../middleware/auth');

// Create a new request (public)
router.post('/', requestController.submitRequest);
router.get('/status', requestController.checkRequestStatus);

// Admin routes
router.get('/admin/all', auth, requestController.getAllRequests);
router.get('/admin/stats', auth, requestController.getRequestStats);
router.get('/admin/:id', auth, requestController.getRequestById);
router.patch('/:id/approve', auth, requestController.approveRequest);
router.patch('/:id/reject', auth, requestController.rejectRequest);

module.exports = router; 
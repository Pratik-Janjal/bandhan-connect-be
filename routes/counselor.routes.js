const express = require('express');
const router = express.Router();
const counselorController = require('../counselor.controller');
const auth = require('../middleware/auth');

// Public routes
router.get('/all', counselorController.getAllCounselors);
router.get('/:counselorId', counselorController.getCounselorById);
router.get('/user/:userId', counselorController.getCounselorByUserId);

// Protected routes (require authentication)
router.use(auth);

// Create counselor profile
router.post('/', counselorController.createCounselor);

// Update counselor profile
router.put('/:counselorId', counselorController.updateCounselor);

// Update counselor status (admin only)
router.patch('/:counselorId/status', counselorController.updateCounselorStatus);

// Time slot management
router.post('/:counselorId/time-slots', counselorController.addTimeSlot);
router.put('/:counselorId/time-slots/:slotId', counselorController.updateTimeSlot);
router.delete('/:counselorId/time-slots/:slotId', counselorController.deleteTimeSlot);

// Analytics
router.get('/:counselorId/analytics', counselorController.getCounselorAnalytics);

// Counseling Requests
router.get('/:counselorId/requests', counselorController.getCounselingRequests);
router.put('/:counselorId/requests/:requestId/status', counselorController.updateRequestStatus);
// Sessions
router.get('/:counselorId/sessions', counselorController.getSessions);
router.put('/:counselorId/sessions/:sessionId/status', counselorController.updateSessionStatus);

// Delete counselor (admin only)
router.delete('/:counselorId', counselorController.deleteCounselor);

module.exports = router; 
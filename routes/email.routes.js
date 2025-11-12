const express = require('express');
const router = express.Router();
const emailController = require('../email.controller');
const auth = require('../middleware/auth');

// All email routes require authentication
router.use(auth);

// Send test email
router.post('/test', emailController.sendTestEmail);

// Send welcome email to role user
router.post('/welcome', emailController.sendWelcomeEmail);

// Send bulk notification to role users
router.post('/bulk', emailController.sendBulkNotification);

// Get email statistics
router.get('/stats', emailController.getEmailStats);

module.exports = router; 
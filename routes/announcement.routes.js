const express = require('express');
const router = express.Router();
const announcementController = require('../announcement.controller');

// Announcements
router.post('/', announcementController.createAnnouncement);
router.get('/', announcementController.getAnnouncements);
router.patch('/:id/activate', announcementController.activateAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router; 
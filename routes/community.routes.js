const express = require('express');
const router = express.Router();
const communityController = require('../community.controller');
const auth = require('../middleware/auth');

// Public routes
router.get('/all', communityController.getAllCommunities);
router.get('/:communityId', communityController.getCommunityById);
router.get('/user/:userId', communityController.getCommunityByUserId);

// Protected routes (require authentication)
router.use(auth);

// Create community profile
router.post('/', communityController.createCommunity);

// Update community profile
router.put('/:communityId', communityController.updateCommunity);

// Update community status (admin only)
router.patch('/:communityId/status', communityController.updateCommunityStatus);

// Event management
router.post('/:communityId/events', communityController.addEvent);
router.put('/:communityId/events/:eventId', communityController.updateEvent);
router.delete('/:communityId/events/:eventId', communityController.deleteEvent);

// Analytics
router.get('/:communityId/analytics', communityController.getCommunityAnalytics);

// Members
router.get('/:communityId/members', communityController.getCommunityMembers);

// Matrimonial Profiles
router.get('/:communityId/profiles', communityController.getMatrimonialProfiles);
router.put('/:communityId/profiles/:profileId/status', communityController.updateProfileStatus);
// Queries
router.get('/:communityId/queries', communityController.getCommunityQueries);
router.post('/:communityId/queries/:queryId/reply', communityController.replyToCommunityQuery);

// Delete community (admin only)
router.delete('/:communityId', communityController.deleteCommunity);

module.exports = router; 
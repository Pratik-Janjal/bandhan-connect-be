const express = require('express');
const router = express.Router();
const vendorController = require('../vendor.controller');
const auth = require('../middleware/auth');

// Admin routes
router.get('/admin/all', auth, vendorController.getAllVendors);
router.get('/admin/requests', auth, vendorController.getVendorRequests);
router.post('/admin/requests/:requestId/approve', auth, vendorController.approveVendorRequest);
router.post('/admin/requests/:requestId/reject', auth, vendorController.rejectVendorRequest);
router.put('/admin/:vendorId/status', auth, vendorController.updateVendorStatus);

// Vendor routes
router.get('/profile', auth, vendorController.getVendorById);
router.post('/profile', auth, vendorController.createVendorProfile);
router.put('/profile', auth, vendorController.updateVendorProfile);
router.get('/analytics', auth, vendorController.getVendorAnalytics);

// Leads
router.get('/profile/leads', auth, vendorController.getClientLeads);
router.put('/profile/leads/:leadId/status', auth, vendorController.updateLeadStatus);

// Queries
router.get('/profile/queries', auth, vendorController.getQueries);
router.post('/profile/queries/:queryId/reply', auth, vendorController.replyToQuery);

// Service Packages
router.get('/profile/service-packages', auth, vendorController.getServicePackages);
router.post('/profile/service-packages', auth, vendorController.addServicePackage);
router.put('/profile/service-packages/:packageId', auth, vendorController.updateServicePackage);
router.delete('/profile/service-packages/:packageId', auth, vendorController.deleteServicePackage);

// Bookings
router.get('/profile/bookings', auth, vendorController.getBookings);
router.post('/profile/bookings', auth, vendorController.addBooking);

// Reviews
router.get('/profile/reviews', auth, vendorController.getReviews);
router.post('/profile/reviews', auth, vendorController.addReview);
// Earnings
router.get('/profile/earnings', auth, vendorController.getEarnings);
router.post('/profile/earnings', auth, vendorController.addEarning);
// Documents
router.get('/profile/documents', auth, vendorController.getDocuments);
router.post('/profile/documents', auth, vendorController.addDocument);
// Achievements
router.get('/profile/achievements', auth, vendorController.getAchievements);
router.post('/profile/achievements', auth, vendorController.addAchievement);

// Public routes
router.get('/:id', vendorController.getVendorById);

module.exports = router; 
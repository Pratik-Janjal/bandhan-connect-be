const Vendor = require('./vendor.schema');
const User = require('./user.schema');
const Request = require('./request.schema');
const emailService = require('./email.service');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Get all vendors (admin only)
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Error fetching vendor' });
  }
};

// Create vendor profile (after approval)
const createVendorProfile = async (req, res) => {
  try {
    const {
      businessName,
      services,
      city,
      location,
      address,
      phone,
      website,
      description,
      packages,
      workingHours,
      specializations,
      experience,
      socialMedia
    } = req.body;

    const vendor = new Vendor({
      userId: req.user.userId,
      businessName,
      services,
      city,
      location,
      address,
      phone,
      website,
      description,
      packages,
      workingHours,
      specializations,
      experience,
      socialMedia
    });

    await vendor.save();
    
    // Update user role to vendor
    await User.findByIdAndUpdate(req.user.userId, { role: 'vendor' });
    
    res.status(201).json({ message: 'Vendor profile created successfully', vendor });
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    res.status(500).json({ message: 'Error creating vendor profile' });
  }
};

// Update vendor profile
const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    res.json({ message: 'Vendor profile updated successfully', vendor });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ message: 'Error updating vendor profile' });
  }
};

// Get vendor requests (admin only)
const getVendorRequests = async (req, res) => {
  try {
    const requests = await Request.find({ 
      roleRequested: 'vendor',
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching vendor requests:', error);
    res.status(500).json({ message: 'Error fetching vendor requests' });
  }
};

// Approve vendor request (admin only)
const approveVendorRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { businessName, services, city, location } = req.body;
    
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    
    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    
    // Create user account
    const user = new User({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      phone: request.phone,
      role: 'vendor',
      status: 'active'
    });
    
    await user.save();
    
    // Create vendor profile
    const vendor = new Vendor({
      userId: user._id,
      businessName,
      services,
      city,
      location,
      status: 'active'
    });
    
    await vendor.save();
    
    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    await request.save();
    
    // Send approval email
    try {
      const userData = {
        name: request.name,
        email: request.email,
        phone: request.phone,
        id: user._id,
        tempPassword // include temp password for email
      };
      const dashboardUrl = `${process.env.FRONTEND_URL || 'https://bc-project-pbiz.vercel.app'}/vendor/dashboard`;
      await emailService.sendEmail(
        userData.email,
        'roleApplicationApproved',
        { userData, roleType: 'vendor', dashboardUrl }
      );
      await emailService.sendEmail(
        userData.email,
        'welcomeRole',
        { userData, roleType: 'vendor', dashboardUrl }
      );
      console.log('Vendor approval email sent successfully');
    } catch (emailError) {
      console.error('Error sending vendor approval email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ 
      message: 'Vendor request approved successfully',
      user: { id: user._id, email: user.email },
      tempPassword
    });
  } catch (error) {
    console.error('Error approving vendor request:', error);
    res.status(500).json({ message: 'Error approving vendor request' });
  }
};

// Reject vendor request (admin only)
const rejectVendorRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    
    request.status = 'rejected';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();
    
    // Send rejection email
    try {
      const userData = { 
        name: request.name, 
        email: request.email, 
        phone: request.phone 
      };
      await emailService.sendRoleApplicationRejected(userData, 'vendor', rejectionReason);
      console.log('Vendor rejection email sent successfully');
    } catch (emailError) {
      console.error('Error sending vendor rejection email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ message: 'Vendor request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting vendor request:', error);
    res.status(500).json({ message: 'Error rejecting vendor request' });
  }
};

// Update vendor status (admin only)
const updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;
    
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { status },
      { new: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Update user status if vendor is suspended
    if (status === 'suspended') {
      await User.findByIdAndUpdate(vendor.userId, { status: 'suspended' });
    } else if (status === 'active') {
      await User.findByIdAndUpdate(vendor.userId, { status: 'active' });
    }
    
    // Send status change email
    try {
      const user = await User.findById(vendor.userId);
      if (user) {
        const userData = { 
          name: user.name, 
          email: user.email, 
          phone: user.phone 
        };
        await emailService.sendRoleStatusChanged(userData, 'vendor', status);
        console.log('Vendor status change email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending vendor status change email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ message: 'Vendor status updated successfully', vendor });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({ message: 'Error updating vendor status' });
  }
};

// Get vendor analytics (vendor only)
const getVendorAnalytics = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    // TODO: Implement analytics logic
    const analytics = {
      totalLeads: 0,
      totalBookings: 0,
      averageRating: vendor.rating,
      totalReviews: vendor.totalReviews,
      monthlyRevenue: 0,
      popularServices: vendor.services
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    res.status(500).json({ message: 'Error fetching vendor analytics' });
  }
};

// --- Service Packages ---
// Add a service package
const addServicePackage = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.packages.push(req.body);
    await vendor.save();
    const newPackage = vendor.packages[vendor.packages.length - 1];
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: 'Error adding package' });
  }
};
// Update a service package
const updateServicePackage = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const pkg = vendor.packages.id(req.params.packageId);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    Object.assign(pkg, req.body);
    await vendor.save();
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: 'Error updating package' });
  }
};
// Delete a service package
const deleteServicePackage = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.packages.id(req.params.packageId).remove();
    await vendor.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package' });
  }
};
// --- Leads ---
// Get all leads
const getClientLeads = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.leads || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads' });
  }
};
// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const lead = vendor.leads.id(req.params.leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.status = req.body.status;
    await vendor.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lead status' });
  }
};
// --- Queries ---
// Get all queries
const getQueries = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.queries || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queries' });
  }
};
// Reply to a query
const replyToQuery = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const query = vendor.queries.id(req.params.queryId);
    if (!query) return res.status(404).json({ message: 'Query not found' });
    query.reply = req.body.reply;
    query.status = 'replied';
    await vendor.save();
    res.json(query);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to query' });
  }
};

// --- Bookings ---
const getBookings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.bookings || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};
const addBooking = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.bookings.push(req.body);
    await vendor.save();
    res.status(201).json(vendor.bookings[vendor.bookings.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding booking' });
  }
};

// --- Reviews ---
const getReviews = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.reviews || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
const addReview = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.reviews.push(req.body);
    await vendor.save();
    res.status(201).json(vendor.reviews[vendor.reviews.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review' });
  }
};
// --- Earnings ---
const getEarnings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.earnings || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching earnings' });
  }
};
const addEarning = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.earnings.push(req.body);
    await vendor.save();
    res.status(201).json(vendor.earnings[vendor.earnings.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding earning' });
  }
};
// --- Documents ---
const getDocuments = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.documents || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
};
const addDocument = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.documents.push(req.body);
    await vendor.save();
    res.status(201).json(vendor.documents[vendor.documents.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding document' });
  }
};
// --- Achievements ---
const getAchievements = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.achievements || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching achievements' });
  }
};
const addAchievement = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.achievements.push(req.body);
    await vendor.save();
    res.status(201).json(vendor.achievements[vendor.achievements.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding achievement' });
  }
};

const getServicePackages = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor.packages || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service packages' });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendorProfile,
  updateVendorProfile,
  getVendorRequests,
  approveVendorRequest,
  rejectVendorRequest,
  updateVendorStatus,
  getVendorAnalytics,
  addServicePackage,
  updateServicePackage,
  deleteServicePackage,
  getClientLeads,
  updateLeadStatus,
  getQueries,
  replyToQuery,
  getBookings,
  addBooking,
  getReviews,
  addReview,
  getEarnings,
  addEarning,
  getDocuments,
  addDocument,
  getAchievements,
  addAchievement,
  getServicePackages
}; 
const Request = require('./request.schema');
const emailService = require('./email.service');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./user.schema');

// Submit a new request (public)
const submitRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      roleRequested,
      message,
      additionalInfo
    } = req.body;

    // Check if email already has a pending request
    const existingRequest = await Request.findOne({
      email,
      roleRequested,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending request for this role' 
      });
    }

    const request = new Request({
      name,
      email,
      phone,
      roleRequested,
      message,
      additionalInfo
    });

    await request.save();

    // Send confirmation email
    try {
      const userData = { name, email, phone };
      await emailService.sendRoleApplicationSubmitted(userData, roleRequested);
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ 
      message: 'Request submitted successfully. We will review and get back to you soon.',
      requestId: request._id
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Error submitting request' });
  }
};

// Get all requests (admin only)
const getAllRequests = async (req, res) => {
  try {
    const { status, roleRequested } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (roleRequested) filter.roleRequested = roleRequested;

    const requests = await Request.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
};

// Get request statistics (admin only)
const getRequestStats = async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: { role: '$roleRequested', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      byRole: {
        vendor: { total: 0, pending: 0, approved: 0, rejected: 0 },
        counselor: { total: 0, pending: 0, approved: 0, rejected: 0 },
        community: { total: 0, pending: 0, approved: 0, rejected: 0 }
      }
    };

    stats.forEach(stat => {
      const { role, status } = stat._id;
      const count = stat.count;
      
      formattedStats.total += count;
      formattedStats[status] += count;
      
      if (formattedStats.byRole[role]) {
        formattedStats.byRole[role].total += count;
        formattedStats.byRole[role][status] += count;
      }
    });

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching request stats:', error);
    res.status(500).json({ message: 'Error fetching request stats' });
  }
};

// Check request status (public)
const checkRequestStatus = async (req, res) => {
  try {
    const { email, roleRequested } = req.query;

    if (!email || !roleRequested) {
      return res.status(400).json({ 
        message: 'Email and role are required' 
      });
    }

    const request = await Request.findOne({
      email,
      roleRequested
    }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(404).json({ 
        message: 'No request found for this email and role' 
      });
    }

    res.json({
      status: request.status,
      submittedAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      rejectionReason: request.rejectionReason
    });
  } catch (error) {
    console.error('Error checking request status:', error);
    res.status(500).json({ message: 'Error checking request status' });
  }
};

// Approve a request (admin only)
const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    let user = await User.findOne({ email: request.email });
    // Always generate a new temp password and update user for any role
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    if (user) {
      user.name = request.name;
      user.password = hashedPassword;
      user.status = 'active';
      user.role = request.roleRequested;
      await user.save();
    } else {
      user = new User({
        name: request.name,
        email: request.email,
        password: hashedPassword,
        phone: request.phone,
        role: request.roleRequested,
        status: 'active'
      });
      await user.save();
    }
    const userId = user._id;

    request.status = 'approved';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    await request.save();

    // Send approval and welcome emails (with tempPassword if present)
    try {
      const userData = {
        name: request.name,
        email: request.email,
        phone: request.phone,
        id: userId,
        tempPassword
      };
      const dashboardUrl = `${process.env.FRONTEND_URL || 'https://bc-project-pbiz.vercel.app'}/app/${request.roleRequested}/${userId}`;
      console.log('=== EMAIL APPROVAL DEBUG ===');
      console.log('Sending approval email with userData:', JSON.stringify(userData, null, 2));
      console.log('roleType:', request.roleRequested, 'dashboardUrl:', dashboardUrl);
      console.log('Email service available:', !!emailService);
      console.log('Email templates available:', Object.keys(emailService.emailTemplates || {}));
      const approvalResult = await emailService.sendEmail(
        userData.email,
        'roleApplicationApproved',
        { userData, roleType: request.roleRequested, dashboardUrl }
      );
      const welcomeResult = await emailService.sendEmail(
        userData.email,
        'welcomeRole',
        { userData, roleType: request.roleRequested, dashboardUrl }
      );
      console.log('Approval email result:', JSON.stringify(approvalResult, null, 2));
      console.log('Welcome email result:', JSON.stringify(welcomeResult, null, 2));
      
      if (approvalResult.success && welcomeResult.success) {
        console.log('✅ Approval and welcome emails sent successfully');
      } else {
        console.error('❌ Error sending approval/welcome email:');
        console.error('   Approval result:', approvalResult);
        console.error('   Welcome result:', welcomeResult);
      }
      console.log('=== END EMAIL APPROVAL DEBUG ===');
    } catch (emailError) {
      console.error('Error sending approval/welcome email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Error approving request' });
  }
};

// Reject a request (admin only)
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'rejected';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    request.rejectionReason = req.body.rejectionReason || '';
    await request.save();

    // Send rejection email
    try {
      const userData = {
        name: request.name,
        email: request.email,
        phone: request.phone,
        id: request._id
      };
      const rejectionResult = await emailService.sendRoleApplicationRejected(userData, request.roleRequested, request.rejectionReason);
      if (rejectionResult.success) {
        console.log('Rejection email sent successfully');
      } else {
        console.error('Error sending rejection email:', rejectionResult);
      }
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Request rejected successfully', request });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Error rejecting request' });
  }
};

module.exports = {
  submitRequest,
  getAllRequests,
  getRequestById,
  getRequestStats,
  checkRequestStatus,
  approveRequest,
  rejectRequest
}; 
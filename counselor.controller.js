const Counselor = require('./counselor.schema');
const User = require('./user.schema');
const Request = require('./request.schema');
const emailService = require('./email.service');

// Get all counselors (for admin)
const getAllCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: counselors
    });
  } catch (error) {
    console.error('Error fetching counselors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselors'
    });
  }
};

// Get counselor by ID
const getCounselorById = async (req, res) => {
  try {
    const { counselorId } = req.params;
    
    const counselor = await Counselor.findById(counselorId)
      .populate('userId', 'name email phone');
    
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }
    
    res.json({
      success: true,
      data: counselor
    });
  } catch (error) {
    console.error('Error fetching counselor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselor'
    });
  }
};

// Get counselor by user ID
const getCounselorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const counselor = await Counselor.findOne({ userId })
      .populate('userId', 'name email phone');
    
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }
    
    res.json({
      success: true,
      data: counselor
    });
  } catch (error) {
    console.error('Error fetching counselor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselor'
    });
  }
};

// Create counselor profile
const createCounselor = async (req, res) => {
  try {
    const {
      userId,
      name,
      specialization,
      experience,
      counselingMethods,
      availableCities,
      sessionFees,
      description,
      phone,
      email
    } = req.body;

    // Check if counselor already exists
    const existingCounselor = await Counselor.findOne({ userId });
    if (existingCounselor) {
      return res.status(400).json({
        success: false,
        message: 'Counselor profile already exists for this user'
      });
    }

    const counselor = new Counselor({
      userId,
      name,
      specialization,
      experience,
      counselingMethods,
      availableCities,
      sessionFees,
      description,
      phone,
      email
    });

    await counselor.save();

    // Update user role
    await User.findByIdAndUpdate(userId, {
      $addToSet: { roles: 'counselor' }
    });

    res.status(201).json({
      success: true,
      message: 'Counselor profile created successfully',
      data: counselor
    });
  } catch (error) {
    console.error('Error creating counselor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create counselor profile'
    });
  }
};

// Update counselor profile
const updateCounselor = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const updateData = req.body;

    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    res.json({
      success: true,
      message: 'Counselor profile updated successfully',
      data: counselor
    });
  } catch (error) {
    console.error('Error updating counselor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update counselor profile'
    });
  }
};

// Update counselor status (approve/reject/suspend)
const updateCounselorStatus = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { status, reason } = req.body;

    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      { status },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    // Update request status if it exists
    await Request.findOneAndUpdate(
      { userId: counselor.userId, roleType: 'counselor' },
      { status: status === 'active' ? 'approved' : status === 'suspended' ? 'rejected' : 'pending' }
    );

    // Send status change email
    try {
      const user = await User.findById(counselor.userId);
      if (user) {
        const userData = { 
          name: user.name, 
          email: user.email, 
          phone: user.phone 
        };
        await emailService.sendRoleStatusChanged(userData, 'counselor', status, reason);
        console.log('Counselor status change email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending counselor status change email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: `Counselor status updated to ${status}`,
      data: counselor
    });
  } catch (error) {
    console.error('Error updating counselor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update counselor status'
    });
  }
};

// Add time slot
const addTimeSlot = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const timeSlotData = req.body;

    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      { $push: { timeSlots: timeSlotData } },
      { new: true, runValidators: true }
    );

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    res.json({
      success: true,
      message: 'Time slot added successfully',
      data: counselor.timeSlots[counselor.timeSlots.length - 1]
    });
  } catch (error) {
    console.error('Error adding time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add time slot'
    });
  }
};

// Update time slot
const updateTimeSlot = async (req, res) => {
  try {
    const { counselorId, slotId } = req.params;
    const updateData = req.body;

    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    const timeSlotIndex = counselor.timeSlots.findIndex(slot => slot._id.toString() === slotId);
    if (timeSlotIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    counselor.timeSlots[timeSlotIndex] = { ...counselor.timeSlots[timeSlotIndex].toObject(), ...updateData };
    await counselor.save();

    res.json({
      success: true,
      message: 'Time slot updated successfully',
      data: counselor.timeSlots[timeSlotIndex]
    });
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update time slot'
    });
  }
};

// Delete time slot
const deleteTimeSlot = async (req, res) => {
  try {
    const { counselorId, slotId } = req.params;

    const counselor = await Counselor.findByIdAndUpdate(
      counselorId,
      { $pull: { timeSlots: { _id: slotId } } },
      { new: true }
    );

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    res.json({
      success: true,
      message: 'Time slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete time slot'
    });
  }
};

// Get counselor analytics
const getCounselorAnalytics = async (req, res) => {
  try {
    const { counselorId } = req.params;

    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    // Calculate analytics
    const analytics = {
      totalSessions: counselor.totalSessions,
      completedSessions: counselor.completedSessions,
      totalRequests: counselor.totalRequests,
      averageRating: counselor.rating,
      totalEarnings: counselor.totalEarnings,
      monthlyGrowth: counselor.monthlyGrowth || 0
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching counselor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Delete counselor
const deleteCounselor = async (req, res) => {
  try {
    const { counselorId } = req.params;

    const counselor = await Counselor.findByIdAndDelete(counselorId);
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found'
      });
    }

    // Remove counselor role from user
    await User.findByIdAndUpdate(counselor.userId, {
      $pull: { roles: 'counselor' }
    });

    res.json({
      success: true,
      message: 'Counselor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting counselor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete counselor'
    });
  }
};

// --- Counseling Requests ---
// Get all counseling requests
const getCounselingRequests = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.counselorId);
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' });
    res.json(counselor.counselingRequests || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching counseling requests' });
  }
};
// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.counselorId);
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' });
    const request = counselor.counselingRequests.id(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = req.body.status;
    await counselor.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status' });
  }
};
// --- Sessions ---
// Get all sessions
const getSessions = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.counselorId);
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' });
    res.json(counselor.sessions || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};
// Update session status
const updateSessionStatus = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.counselorId);
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' });
    const session = counselor.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.status = req.body.status;
    await counselor.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error updating session status' });
  }
};

module.exports = {
  getAllCounselors,
  getCounselorById,
  getCounselorByUserId,
  createCounselor,
  updateCounselor,
  updateCounselorStatus,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getCounselorAnalytics,
  deleteCounselor,
  getCounselingRequests,
  updateRequestStatus,
  getSessions,
  updateSessionStatus
}; 
const Community = require('./community.schema');
const User = require('./user.schema');
const Request = require('./request.schema');
const emailService = require('./email.service');

// Get all communities (for admin)
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communities'
    });
  }
};

// Get community by ID
const getCommunityById = async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const community = await Community.findById(communityId)
      .populate('userId', 'name email phone');
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }
    
    res.json({
      success: true,
      data: community
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community'
    });
  }
};

// Get community by user ID
const getCommunityByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const community = await Community.findOne({ userId })
      .populate('userId', 'name email phone');
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }
    
    res.json({
      success: true,
      data: community
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community'
    });
  }
};

// Create community profile
const createCommunity = async (req, res) => {
  try {
    const {
      userId,
      communityName,
      religion,
      region,
      rules,
      description,
      contactEmail,
      contactPhone,
      location
    } = req.body;

    // Check if community already exists
    const existingCommunity = await Community.findOne({ userId });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'Community profile already exists for this user'
      });
    }

    const community = new Community({
      userId,
      communityName,
      religion,
      region,
      rules,
      description,
      contactEmail,
      contactPhone,
      location
    });

    await community.save();

    // Update user role
    await User.findByIdAndUpdate(userId, {
      $addToSet: { roles: 'community' }
    });

    res.status(201).json({
      success: true,
      message: 'Community profile created successfully',
      data: community
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create community profile'
    });
  }
};

// Update community profile
const updateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const updateData = req.body;

    const community = await Community.findByIdAndUpdate(
      communityId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    res.json({
      success: true,
      message: 'Community profile updated successfully',
      data: community
    });
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update community profile'
    });
  }
};

// Update community status (approve/reject/suspend)
const updateCommunityStatus = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { status, reason } = req.body;

    const community = await Community.findByIdAndUpdate(
      communityId,
      { status },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Update request status if it exists
    await Request.findOneAndUpdate(
      { userId: community.userId, roleType: 'community' },
      { status: status === 'active' ? 'approved' : status === 'suspended' ? 'rejected' : 'pending' }
    );

    // Send status change email
    try {
      const user = await User.findById(community.userId);
      if (user) {
        const userData = { 
          name: user.name, 
          email: user.email, 
          phone: user.phone 
        };
        await emailService.sendRoleStatusChanged(userData, 'community', status, reason);
        console.log('Community status change email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending community status change email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: `Community status updated to ${status}`,
      data: community
    });
  } catch (error) {
    console.error('Error updating community status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update community status'
    });
  }
};

// Add community event
const addEvent = async (req, res) => {
  try {
    const { communityId } = req.params;
    const eventData = req.body;

    const community = await Community.findByIdAndUpdate(
      communityId,
      { $push: { events: eventData } },
      { new: true, runValidators: true }
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    res.json({
      success: true,
      message: 'Event added successfully',
      data: community.events[community.events.length - 1]
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add event'
    });
  }
};

// Update community event
const updateEvent = async (req, res) => {
  try {
    const { communityId, eventId } = req.params;
    const updateData = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    const eventIndex = community.events.findIndex(event => event._id.toString() === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    community.events[eventIndex] = { ...community.events[eventIndex].toObject(), ...updateData };
    await community.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: community.events[eventIndex]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
};

// Delete community event
const deleteEvent = async (req, res) => {
  try {
    const { communityId, eventId } = req.params;

    const community = await Community.findByIdAndUpdate(
      communityId,
      { $pull: { events: { _id: eventId } } },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

// Get community analytics
const getCommunityAnalytics = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Calculate analytics
    const analytics = {
      totalMembers: community.totalMembers,
      activeMembers: community.activeMembers,
      totalMatches: community.totalMatches,
      successfulMatches: community.successfulMatches,
      totalEvents: community.events.length,
      monthlyGrowth: community.monthlyGrowth || 0
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching community analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Get community members
const getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { status } = req.query;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // TODO: Implement member fetching logic
    // This would typically involve querying a separate members collection
    // or user profiles that are associated with this community

    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching community members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members'
    });
  }
};

// Delete community
const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findByIdAndDelete(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Remove community role from user
    await User.findByIdAndUpdate(community.userId, {
      $pull: { roles: 'community' }
    });

    res.json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete community'
    });
  }
};

// --- Matrimonial Profiles ---
// Get all matrimonial profiles
const getMatrimonialProfiles = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    res.json(community.matrimonialProfiles || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matrimonial profiles' });
  }
};
// Update profile status
const updateProfileStatus = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    const profile = community.matrimonialProfiles.id(req.params.profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.status = req.body.status;
    await community.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile status' });
  }
};
// --- Queries ---
// Get all queries
const getCommunityQueries = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    res.json(community.queries || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queries' });
  }
};
// Reply to a query
const replyToCommunityQuery = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    const query = community.queries.id(req.params.queryId);
    if (!query) return res.status(404).json({ message: 'Query not found' });
    query.reply = req.body.reply;
    query.status = 'replied';
    await community.save();
    res.json(query);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to query' });
  }
};

module.exports = {
  getAllCommunities,
  getCommunityById,
  getCommunityByUserId,
  createCommunity,
  updateCommunity,
  updateCommunityStatus,
  addEvent,
  updateEvent,
  deleteEvent,
  getCommunityAnalytics,
  getCommunityMembers,
  deleteCommunity,
  getMatrimonialProfiles,
  updateProfileStatus,
  getCommunityQueries,
  replyToCommunityQuery
}; 
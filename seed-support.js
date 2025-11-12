const mongoose = require('mongoose');
const SupportTicket = require('./support.schema');
const User = require('./user.schema');

// Connect to MongoDB
mongoose.connect('mongodb+srv://abhi:abhi%40123@cluster.zvjlqyq.mongodb.net/bandhaconnect?retryWrites=true&w=majority&appName=Cluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sampleTickets = [
  {
    subject: 'Cannot upload profile photo',
    message: 'I\'m trying to upload my profile photo but it keeps showing an error. The file is under 5MB and in JPG format. Please help!',
    category: 'technical',
    priority: 'medium',
    status: 'open',
    replies: [
      {
        userId: '507f1f77bcf86cd799439011', // This will be replaced with actual user ID
        message: 'Thank you for reporting this issue. We are looking into it and will get back to you soon.',
        isAdmin: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    ]
  },
  {
    subject: 'Premium subscription not working',
    message: 'I paid for premium subscription yesterday but I\'m still not seeing premium features. The payment was successful.',
    category: 'billing',
    priority: 'high',
    status: 'in_progress',
    replies: [
      {
        userId: '507f1f77bcf86cd799439011',
        message: 'We have received your payment. Let me check your account and activate premium features.',
        isAdmin: true,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        userId: '507f1f77bcf86cd799439011',
        message: 'Your premium features have been activated. Please refresh the page and try again.',
        isAdmin: true,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ]
  },
  {
    subject: 'Account verification issue',
    message: 'I submitted my documents for verification 3 days ago but haven\'t heard back yet. How long does verification usually take?',
    category: 'account',
    priority: 'medium',
    status: 'open'
  },
  {
    subject: 'App crashes on Android',
    message: 'The app keeps crashing when I try to open the messages section. I\'m using Android 12. This started happening after the last update.',
    category: 'bug',
    priority: 'urgent',
    status: 'open'
  },
  {
    subject: 'Feature request: Video calls',
    message: 'It would be great to have video call functionality in the app. This would make it easier to connect with matches before meeting in person.',
    category: 'feature',
    priority: 'low',
    status: 'open'
  },
  {
    subject: 'Forgot password',
    message: 'I can\'t remember my password and the reset email is not working. Please help me access my account.',
    category: 'account',
    priority: 'high',
    status: 'resolved',
    replies: [
      {
        userId: '507f1f77bcf86cd799439011',
        message: 'I\'ve sent you a new password reset email. Please check your inbox and spam folder.',
        isAdmin: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: '507f1f77bcf86cd799439011',
        message: 'Great! I was able to reset my password. Thank you for the help.',
        isAdmin: false,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      }
    ]
  }
];

async function seedSupportTickets() {
  try {
    // Get a sample user to use as the ticket creator
    const sampleUser = await User.findOne();
    if (!sampleUser) {
      console.log('No users found. Please run the main seed script first.');
      return;
    }

    // Clear existing tickets
    await SupportTicket.deleteMany({});
    console.log('Cleared existing support tickets');

    // Create sample tickets with the actual user ID
    const ticketsWithUser = sampleTickets.map(ticket => ({
      ...ticket,
      userId: sampleUser._id,
      replies: ticket.replies ? ticket.replies.map(reply => ({
        ...reply,
        userId: reply.isAdmin ? sampleUser._id : sampleUser._id // For demo, using same user
      })) : []
    }));

    const createdTickets = await SupportTicket.insertMany(ticketsWithUser);
    console.log(`Created ${createdTickets.length} sample support tickets`);

    console.log('Support tickets seeded successfully!');
  } catch (error) {
    console.error('Error seeding support tickets:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedSupportTickets(); 
const mongoose = require('mongoose');
const User = require('./user.schema');
const Post = require('./post.schema');
const Report = require('./report.schema');

const users = [
  {
    _id: new mongoose.Types.ObjectId('64a1b2c3d4e5f6a7b8c9d0e1'),
    email: 'you@email.com',
    password: 'password',
    name: 'You',
    age: 28,
    lastActive: '2 hours ago',
    compatibilityScore: 92,
    photos: ['https://randomuser.me/api/portraits/men/1.jpg'],
    location: 'Mumbai',
    education: 'Graduate',
    profession: 'Software',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Passionate software developer who loves coding and building meaningful applications. Looking for someone who shares similar values and goals.',
    interests: ['Technology', 'Coding', 'Travel', 'Music', 'Reading'],
    isVerified: true,
    role: 'user',
  },
  {
    _id: new mongoose.Types.ObjectId('686b98d57624046327960886'),
    email: 'priya@email.com',
    password: 'password',
    name: 'Priya Sharma',
    age: 26,
    lastActive: '10 minutes ago',
    compatibilityScore: 88,
    photos: ['https://randomuser.me/api/portraits/women/1.jpg'],
    location: 'Delhi',
    education: 'Post Graduate',
    profession: 'Business',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Business professional with a love for entrepreneurship and innovation. Enjoys networking, traveling, and exploring new cultures.',
    interests: ['Business', 'Travel', 'Networking', 'Cooking', 'Fitness'],
    isVerified: true,
    role: 'user',
  },
  {
    _id: new mongoose.Types.ObjectId('64a1b2c3d4e5f6a7b8c9d0e2'),
    email: 'rahul@email.com',
    password: 'password',
    name: 'Rahul Verma',
    age: 30,
    lastActive: '1 day ago',
    compatibilityScore: 85,
    photos: ['https://randomuser.me/api/portraits/men/2.jpg'],
    location: 'Bangalore',
    education: 'Professional',
    profession: 'Healthcare',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Healthcare professional dedicated to helping others. Passionate about medicine, fitness, and making a positive impact in people\'s lives.',
    interests: ['Healthcare', 'Fitness', 'Sports', 'Reading', 'Volunteering'],
    isVerified: false,
    role: 'user',
  },
  {
    _id: new mongoose.Types.ObjectId('64a1b2c3d4e5f6a7b8c9d0e3'),
    email: 'kavya@email.com',
    password: 'password',
    name: 'Kavya Reddy',
    age: 24,
    lastActive: '3 days ago',
    compatibilityScore: 78,
    photos: ['https://randomuser.me/api/portraits/women/3.jpg'],
    location: 'Hyderabad',
    education: 'Graduate',
    profession: 'Software',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Software engineer with a passion for AI and machine learning. Loves reading sci-fi and exploring new technologies.',
    interests: ['AI/ML', 'Technology', 'Reading', 'Travel', 'Photography'],
    isVerified: true,
    role: 'user',
  }
];

const posts = [
  {
    author: {
      name: 'You',
      photo: 'https://randomuser.me/api/portraits/men/1.jpg',
      verified: true
    },
    content: 'Excited to join BandhanConnect! Looking forward to meeting new people.',
    image: '',
    status: 'pending',
    likes: 2,
    comments: 1,
    type: 'general',
    timestamp: new Date().toISOString()
  },
  {
    author: {
      name: 'Priya Sharma',
      photo: 'https://randomuser.me/api/portraits/women/1.jpg',
      verified: true
    },
    content: 'Just got my profile verified! Thank you BandhanConnect team.',
    image: '',
    status: 'approved',
    likes: 5,
    comments: 2,
    type: 'success_story',
    timestamp: new Date().toISOString()
  }
];

const reports = [
  {
    contentType: 'profile',
    contentId: '64a1b2c3d4e5f6a7b8c9d0e2', // Rahul Verma
    reportedBy: '64a1b2c3d4e5f6a7b8c9d0e1', // You
    reason: 'Inappropriate content',
    status: 'pending',
    timestamp: new Date().toISOString(),
    description: 'Profile contains inappropriate language.'
  },
  {
    contentType: 'post',
    contentId: '1', // Will be replaced after post insert
    reportedBy: '64a1b2c3d4e5f6a7b8c9d0e3', // Kavya Reddy
    reason: 'Spam',
    status: 'pending',
    timestamp: new Date().toISOString(),
    description: 'This post looks like spam.'
  }
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/bandhaconnect'); // Update if needed
  await User.deleteMany({});
  await Post.deleteMany({});
  await Report.deleteMany({});
  await User.insertMany(users);
  const insertedPosts = await Post.insertMany(posts);
  // Update report post contentId to real post id
  reports[1].contentId = insertedPosts[0]._id.toString();
  await Report.insertMany(reports);
  console.log('Sample users, posts, and reports seeded!');
  process.exit();
}

seed(); 
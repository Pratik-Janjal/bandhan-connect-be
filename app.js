const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
let io = null;

// Import routers
const userRoutes = require('./routes/user.routes');
const matchRoutes = require('./routes/match.routes');
const messageRoutes = require('./routes/message.routes');
const timelineEventRoutes = require('./routes/timelineEvent.routes');
const taskRoutes = require('./routes/task.routes');
const budgetRoutes = require('./routes/budget.routes');
const serviceRoutes = require('./routes/service.routes');
const counselorRoutes = require('./routes/counselor.routes');
const sessionRoutes = require('./routes/session.routes');
const postRoutes = require('./routes/post.routes');
const successStoryRoutes = require('./routes/successStory.routes');
const notificationRoutes = require('./routes/notification.routes');
const eventRoutes = require('./routes/event.routes');
const adminRoutes = require('./routes/admin.routes');
const announcementRoutes = require('./routes/announcement.routes');
const supportRoutes = require('./routes/support.routes');
const vendorRoutes = require('./routes/vendor.routes');
const requestRoutes = require('./routes/request.routes');
const communityRoutes = require('./routes/community.routes');
const emailRoutes = require('./routes/email.routes');
const { setIO } = require('./socket');

const allowedOrigins = [
  'http://localhost:5173', // Local frontend
  'https://bc-project-pbiz.vercel.app', // Main production frontend
  // Add more static URLs if needed
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow main production frontend
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow Vercel preview deployments
    if (/^https:\/\/bc-project-yz4x-.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Log Origin header and CORS errors for debugging
app.use((req, res, next) => {
  console.log(`[CORS DEBUG] Origin: ${req.headers.origin} | Path: ${req.path}`);
  next();
});

// In the CORS middleware, add an error handler for CORS
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    console.error(`[CORS ERROR] Blocked Origin: ${req.headers.origin} | Path: ${req.path}`);
    res.status(403).json({ error: 'CORS error: Origin not allowed' });
  } else {
    next(err);
  }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ success: true, message: 'CORS is working!' });
});

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://abhi:abhi%40123@cluster.zvjlqyq.mongodb.net/bandhaconnect?retryWrites=true&w=majority&appName=Cluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/timeline', timelineEventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/counselors', counselorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/success-stories', successStoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/email', emailRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('BandhaConnect API is running');
});

// Start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = http.createServer(app);
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://bc-project-pbiz.vercel.app'
      ],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });
  io.on('connection', (socket) => {
    console.log('Socket.IO client connected:', socket.id);
  });
  setIO(io); // Make io accessible globally
  app.set('io', io); // (optional, for legacy)
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; 
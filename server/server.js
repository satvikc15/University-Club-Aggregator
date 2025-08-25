const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const Event = require('./models/event');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/University_Club_Aggregator';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB - University_Club_Aggregator'))
  .catch(err => console.error('MongoDB connection error:', err));

// Single User Model for both Club and Student
const userSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['club', 'student'] 
  },
  username: { 
    type: String, 
    required: function() { return this.type === 'club'; } 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // Club-specific fields
  clubName: { 
    type: String, 
    required: function() { return this.type === 'club'; } 
  },
  // Student-specific fields
  name: { 
    type: String, 
    required: function() { return this.type === 'student'; } 
  },
  studentId: { 
    type: String, 
    required: function() { return this.type === 'student'; } 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const User = mongoose.model('login', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Multer setup for poster uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only jpg, jpeg, png
  if (/\.(jpg|jpeg|png)$/i.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes

// Club Admin Registration
app.post('/api/club/register', async (req, res) => {
  try {
    const { username, password, clubName, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new club admin
    const clubAdmin = new User({
      type: 'club',
      username,
      password: hashedPassword,
      clubName,
      email
    });

    await clubAdmin.save();
    res.status(201).json({ message: 'Club admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Club Admin Login
app.post('/api/club/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const clubAdmin = await User.findOne({ username, type: 'club' });
    if (!clubAdmin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, clubAdmin.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: clubAdmin._id, username: clubAdmin.username, type: 'club' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: clubAdmin._id,
        username: clubAdmin.username,
        clubName: clubAdmin.clubName,
        email: clubAdmin.email,
        type: 'club'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Registration
app.post('/api/student/register', async (req, res) => {
  try {
    const { email, password, name, studentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const student = new User({
      type: 'student',
      email,
      password: hashedPassword,
      name,
      studentId
    });

    await student.save();
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Login
app.post('/api/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const student = await User.findOne({ email, type: 'student' });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: student._id, email: student.email, type: 'student' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
        studentId: student.studentId,
        type: 'student'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/events - Create a new event (Club Admin only)
app.post('/api/events', authenticateToken, upload.single('poster'), async (req, res) => {
  try {
    if (req.user.type !== 'club') {
      return res.status(403).json({ message: 'Only club admins can post events' });
    }
    const { title, description, dateTime, location, registrationLink, category } = req.body;
    if (!title || title.length < 3) {
      return res.status(400).json({ message: 'Title is required and must be at least 3 characters.' });
    }
    if (!description || description.split(/\s+/).length > 1000) {
      return res.status(400).json({ message: 'Description is required and must be at most 1000 words' });
    }
    if (!dateTime) {
      return res.status(400).json({ message: 'Date and time are required' });
    }
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    let posterPath = undefined;
    if (req.file) {
      posterPath = `/uploads/${req.file.filename}`;
    }
    const clubName = req.user.clubName || req.user.username;
    const event = new Event({
      title,
      description,
      dateTime: new Date(dateTime),
      venue: location,
      poster: posterPath,
      club: req.user.userId,
      organizer: req.user.userId,
      registrationLink,
      category,
      tags: [clubName]
    });
    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/events - Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({})
      .sort({ dateTime: -1 })
      .lean();
    // Make poster URLs absolute
    const baseUrl = req.protocol + '://' + req.get('host');
    events.forEach(event => {
      if (event.poster && !event.poster.startsWith('http')) {
        event.poster = baseUrl + event.poster;
      }
    });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (for debugging)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/University_Club_Aggregator';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB - University_Club_Aggregator'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Model (same as in server.js)
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
  clubName: { 
    type: String, 
    required: function() { return this.type === 'club'; } 
  },
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

// Predefined club data
const sampleClubs = [
  {
    username: 'IEEESBOUCE',
    password: 'ieeesbouce',
    clubName: 'IEEE SB OUCE',
    email: 'ieeesb@ouce.in'
  },
  {
    username: 'EMCC',
    password: 'emccouce',
    clubName: 'EMCC',
    email: 'emcc@ouce.in'
  },
  {
    username: 'CISC',
    password: 'ciscouce',
    clubName: 'CISC',
    email: 'cisc@ouce.in'
  },
  {
    username: 'IETE',
    password: 'ieteouce',
    clubName: 'IETE',
    email: 'iete@ouce.in'
  },
  {
    username: 'Photography',
    password: 'photography',
    clubName: 'Photography',
    email: 'photography@ouce.in'
  },
  {
    username: 'NSS',
    password: 'nssouce',
    clubName: 'NSS',
    email: 'nss@ouce.in'
  },
  {
    username: 'NCC',
    password: 'nccouce',
    clubName: 'NCC',
    email: 'ncc@ouce.in'
  },
  {
    username: 'SAE',
    password: 'saeouce',
    clubName: 'SAE',
    email: 'sae@ouce.in'
  }
];

async function addSampleClubs() {
  try {
    console.log('Adding sample club users...');
    
    for (const club of sampleClubs) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ username: club.username }, { email: club.email }] 
      });
      
      if (existingUser) {
        console.log(`Club ${club.clubName} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(club.password, 10);

      // Create new club admin
      const newClub = new User({
        type: 'club',
        username: club.username,
        password: hashedPassword,
        clubName: club.clubName,
        email: club.email
      });

      await newClub.save();
      console.log(`✅ Added: ${club.clubName} (${club.username}/${club.password})`);
    }

    console.log('\n🎉 Sample clubs added successfully!');
    console.log('\nLogin Credentials:');
    sampleClubs.forEach(club => {
      console.log(`${club.clubName}: ${club.username} / ${club.password}`);
    });

  } catch (error) {
    console.error('Error adding sample clubs:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addSampleClubs(); 
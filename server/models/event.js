const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Social', 'Other'],
    required: true 
  },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateTime: { type: Date, required: true },
  venue: { type: String, required: true },
  maxParticipants: { type: Number },
  registrationDeadline: { type: Date },
  poster: { type: String },
  registrationLink: { type: String },
  tags: [String],
  rsvpUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft' 
  },
  isApproved: { type: Boolean, default: false },
  requirements: [String],
  contactInfo: {
    email: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
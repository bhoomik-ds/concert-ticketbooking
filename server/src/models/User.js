const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  fullName: { type: String },
  email: { type: String, required: true, unique: true },
  
  // ✅ ADDED: Mobile Number & City
  phoneNumber: { type: String },
  city: { type: String },

  role: { 
    type: String, 
    default: 'user', 
    enum: ['user', 'admin'] 
  },

  // ✅ ADDED: History of bookings
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],

  savedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
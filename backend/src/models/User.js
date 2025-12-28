const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 1. Clerk ID (Vital for linking the user)
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  fullName: { 
    type: String
    // We remove 'required: true' just in case a user signs up with only a phone number initially
  },

  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // ❌ PASSWORD FIELD REMOVED (Clerk manages this now)

  // 2. Keep your existing helpful fields
  role: { 
    type: String, 
    default: 'user', 
    enum: ['user', 'admin'] 
  },

  phoneNumber: {
    type: String
  },

  savedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);
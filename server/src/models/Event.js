const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  category: String,
  rating: Number,
  votes: String,
  interested: String,
  tags: [String],
  about: String,
  highlights: [String],
  date: Date,
  time: String,
  duration: String,
  venue: {
    name: String,
    city: String,
    address: String
  },
  priceRange: String,
  originalPrice: String,
  bannerImage: String,
  galleryImages: [String],
  
  // ✅ UPDATED TICKET SCHEMA
  ticketTypes: [{
    name: String,         // e.g., "Fanpit"
    price: Number,
    totalSeats: Number,   // e.g., 1000
    availableSeats: Number, // e.g., 450 (Updates automatically)
    
    // 👇 NEW FIELD: Tracks the last ID (e.g., if 500 sold, next is #501)
    soldCount: { type: Number, default: 0 } 
  }]
});

module.exports = mongoose.model('Event', eventSchema);
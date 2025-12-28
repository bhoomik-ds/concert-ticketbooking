const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  category: String,      // New
  rating: Number,        // New
  votes: String,         // New
  interested: String,    // New
  tags: [String],        // New
  about: String,         // New
  highlights: [String],  // New
  date: Date,
  time: String,          // New
  duration: String,      // New
  venue: {
    name: String,
    city: String,
    address: String      // New
  },
  priceRange: String,    // New
  originalPrice: String, // New
  bannerImage: String,
  galleryImages: [String], // New
  ticketTypes: [{
    name: String,
    price: Number,
    totalSeats: Number,
    availableSeats: Number
  }]
});

// This line exports the model so other files can use it
module.exports = mongoose.model('Event', eventSchema);
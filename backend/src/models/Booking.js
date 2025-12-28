const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketType: { type: String, required: true }, // e.g., "Gold"
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'confirmed' }, // confirmed, cancelled
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
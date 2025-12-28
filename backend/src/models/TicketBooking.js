const mongoose = require('mongoose');

const ticketBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userEmail: String,
  tickets: [
    {
      ticketType: String,
      price: Number,
      quantity: Number,
      subtotal: Number
    }
  ],
  totalTickets: Number,
  totalAmount: Number, // Original Price
  
  // --- NEW FIELDS FOR DISCOUNT ---
  discountCode: String,
  discountAmount: { type: Number, default: 0 },
  finalAmount: Number, // The price user actually pays
  // ------------------------------

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAt: Date,
  
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TicketBooking', ticketBookingSchema);
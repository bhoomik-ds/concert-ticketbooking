const mongoose = require('mongoose');

const ticketBookingSchema = new mongoose.Schema({
  // ✅ UPDATE: Changed to ObjectId to link with User Collection (Hybrid Approach)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  eventId: { type: String, required: true },

  // ✅ SNAPSHOT FIELDS: Saved permanently for this Invoice/Ticket
  guestName: { type: String, required: true },
  mobile: { type: String, required: true },
  city: { type: String, required: true },
  
  // Optional: If you want to snapshot email too
  userEmail: String,

  tickets: [
    {
      ticketType: String,
      quantity: Number,
      price: Number,      // Optional
      subtotal: Number    // Optional
    }
  ],
  
  totalTickets: Number,
  totalAmount: Number, 
  
  // --- DISCOUNT FIELDS ---
  discountCode: String,
  discountAmount: { type: Number, default: 0 },
  finalAmount: Number, 
  // -----------------------

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
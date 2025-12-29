const mongoose = require('mongoose');

const ticketBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String }, // ✅ Added Event ID
  
  // ✅ NEW FIELDS: Save Guest Details for this specific booking
  guestName: String,
  mobile: String,
  city: String,

  userEmail: String,
  tickets: [
    {
      ticketType: String,
      quantity: Number,
      price: Number,    // Optional
      subtotal: Number  // Optional
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
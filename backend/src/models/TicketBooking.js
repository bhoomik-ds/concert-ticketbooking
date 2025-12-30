const mongoose = require('mongoose');

const ticketBookingSchema = new mongoose.Schema({
  // ✅ FIX: Changed to String. If this is ObjectId, it CRASHES with Clerk IDs.
  userId: { type: String, required: true },
  
  eventId: { type: String, required: true },

  // Snapshot Fields (Invoice Details)
  guestName: { type: String, required: true },
  mobile: { type: String, required: true },
  city: { type: String, required: true },
  
  tickets: [
    {
      ticketType: String,
      quantity: Number,
      price: Number,      
      subtotal: Number    
    }
  ],
  
  totalTickets: Number,
  totalAmount: Number, 
  finalAmount: Number, 
  
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
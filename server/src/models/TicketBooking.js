const mongoose = require('mongoose');

const ticketBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },

  // Snapshot Fields
  guestName: { type: String, required: true },
  mobile: { type: String, required: true },
  city: { type: String, required: true },
  
  tickets: [
    {
      ticketType: String,
      quantity: Number,
      // ✅ NEW FIELD: Stores the specific generated IDs (e.g. ["FANPIT-101", "FANPIT-102"])
      seatNumbers: [String], 
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
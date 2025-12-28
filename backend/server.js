const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay'); 
const crypto = require('crypto');     
require('dotenv').config();

// --- IMPORT MODELS ---
// Adjust paths if needed (e.g. ./models/Event instead of ./src/models/Event)
const Event = require('./src/models/Event'); 
const User = require('./src/models/User');
const TicketBooking = require('./src/models/TicketBooking');
const GiftCard = require('./src/models/GiftCard'); 

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================
//        ROUTES
// ==========================

// 1. GET Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. POST Save User
app.post('/api/save-user', async (req, res) => {
  const { clerkId, name, email } = req.body;
  try {
    let user = await User.findOne({ clerkId });
    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }
    user = new User({ clerkId, fullName: name, email });
    await user.save();
    console.log("✅ New User Saved:", name);
    res.status(201).json({ message: "User saved successfully", user });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 3. POST Create Booking
app.post('/api/ticketbooking', async (req, res) => {
  try {
    const { userId, userEmail, tickets, totalTickets, totalAmount } = req.body;
    const newBooking = new TicketBooking({
      userId,
      userEmail,
      tickets,
      totalTickets,
      totalAmount,
      paymentStatus: 'pending' 
    });
    const savedBooking = await newBooking.save();
    console.log("🎟️ New Booking Created:", savedBooking._id);
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

// 4. GET Booking by ID
app.get('/api/ticketbooking/:id', async (req, res) => {
  try {
    const booking = await TicketBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 5. POST Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await TicketBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Use finalAmount if discount exists, otherwise totalAmount
    const amountToPay = booking.finalAmount !== undefined ? booking.finalAmount : booking.totalAmount;

    const options = {
      amount: Math.round(amountToPay * 100), // Paise
      currency: "INR",
      receipt: booking._id.toString(),
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID,
      booking_details: booking 
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
});

// 6. POST Verify Payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await TicketBooking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        paidAt: new Date(),
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature
      });
      console.log("✅ Payment Verified for Booking:", bookingId);
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 7. GET My Bookings
app.get('/api/my-bookings/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await TicketBooking.find({ userId: userId }).sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 8. ADMIN: Create Gift Card
app.post('/api/admin/create-gift-card', async (req, res) => {
  try {
    const { code, discountType, value } = req.body;
    const newCard = new GiftCard({ code, discountType, value });
    await newCard.save();
    res.json({ message: "Gift Card Created", newCard });
  } catch (error) {
    res.status(500).json({ message: "Error creating card" });
  }
});

// 9. APPLY Discount
app.post('/api/apply-discount', async (req, res) => {
  try {
    const { bookingId, code } = req.body;
    const booking = await TicketBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const giftCard = await GiftCard.findOne({ code: code, isActive: true });
    if (!giftCard) return res.status(400).json({ message: "Invalid or Expired Code" });

    let discountAmount = 0;
    if (giftCard.discountType === 'flat') {
      discountAmount = giftCard.value;
    } else if (giftCard.discountType === 'percent') {
      discountAmount = (booking.totalAmount * giftCard.value) / 100;
    }

    if (discountAmount > booking.totalAmount) discountAmount = booking.totalAmount;

    booking.discountCode = code;
    booking.discountAmount = Math.round(discountAmount);
    booking.finalAmount = Math.round(booking.totalAmount - discountAmount);
    
    await booking.save();

    res.json({ 
      success: true, 
      discountAmount: booking.discountAmount,
      finalAmount: booking.finalAmount 
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ==========================
//   DB CONNECTION & START
// ==========================
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-domain.vercel.app"], // We will add the real domain later
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log('❌ Connection Error:', err));
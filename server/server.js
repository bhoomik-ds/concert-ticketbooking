require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT MODELS ---
const Event = require('./src/models/Event'); 
const User = require('./src/models/User');
const TicketBooking = require('./src/models/TicketBooking');
const GiftCard = require('./src/models/GiftCard'); 

// --- IMPORT ROUTES & CONTROLLERS ---
const paymentRoutes = require('./src/routes/paymentRoutes'); // ✅ Use the file we created
const userController = require('./src/controllers/userController'); // ✅ Import Controller

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
    origin: [
        "https://raghavevents.in",               // YOUR NEW DOMAIN
        "https://www.raghavevents.in"            // YOUR NEW DOMAIN (with www)
    ],
    credentials: true
}));
app.use(express.json());

// ==========================
//        CORE ROUTES
// ==========================

// ✅ 1. Payment Routes (Links to src/routes/paymentRoutes.js)
app.use('/api/payment', paymentRoutes);

// ✅ 2. User Update Route (Links to src/controllers/userController.js)
app.post('/api/user/update', userController.updateUserProfile);


// ==========================
//      INLINE ROUTES
// ==========================

// 3. GET Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 4. POST Save User (Initial Login)
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

// 5. POST Create Booking
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

// 6. GET Booking by ID
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
//    DB CONNECTION & START
// ==========================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log('❌ Connection Error:', err));
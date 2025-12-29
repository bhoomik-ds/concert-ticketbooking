const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking'); // Ensure you have this model

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, seats, eventId, userId } = req.body;

    const options = {
      amount: amount * 100, // Razorpay takes amount in paisa (100 INR = 10000 paisa)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).send("Error creating order");

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Payment Order Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// 2. Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

    // Create signature to verify
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // ✅ Payment Verified! Now Save Booking to DB
      const newBooking = new Booking({
        userId: bookingData.userId,
        eventId: bookingData.eventId,
        tickets: bookingData.seats.map(s => ({ ticketType: s, quantity: 1 })), // Adjust based on your Schema
        totalAmount: bookingData.totalAmount,
        paymentId: razorpay_payment_id,
        status: "Confirmed"
      });

      await newBooking.save();

      res.json({ success: true, message: "Payment Verified", bookingId: newBooking._id });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("Payment Verify Error:", error);
    res.status(500).send("Verification Failed");
  }
};
const Razorpay = require('razorpay');
const crypto = require('crypto');
const TicketBooking = require('../models/TicketBooking'); 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; 

    if (!amount) return res.status(400).send("Amount is required");

    const options = {
      amount: Math.round(amount * 100), // Convert to paisa
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

// 2. Verify Payment & SAVE BOOKING (Hybrid Strategy)
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

    // Safety Check
    if (!bookingData) {
        return res.status(400).json({ success: false, message: "Booking Data Missing" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      
      // ✅ Payment Verified! Now Save to DB using Hybrid Strategy
      const newBooking = new TicketBooking({
        userId: bookingData.userId, // This links to the User Account
        eventId: bookingData.eventId,
        
        // ✅ SNAPSHOT: Saving details directly to the ticket (For Invoice)
        guestName: bookingData.guestName, 
        mobile: bookingData.mobile,
        city: bookingData.city,

        // Map seats to schema format
        tickets: bookingData.seats.map(s => ({
            ticketType: s.ticketType,
            quantity: s.quantity
        })),
        
        totalTickets: bookingData.seats.reduce((sum, s) => sum + s.quantity, 0),
        totalAmount: bookingData.totalAmount,
        finalAmount: bookingData.totalAmount, 
        
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date()
      });

      await newBooking.save();

      // OPTIONAL: Decrease Inventory Count Here (Future Step)
      
      res.json({ success: true, message: "Payment Verified", bookingId: newBooking._id });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("Payment Verify Error:", error);
    res.status(500).send("Verification Failed");
  }
};
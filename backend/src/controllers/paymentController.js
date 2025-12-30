const Razorpay = require('razorpay');
const crypto = require('crypto');
const TicketBooking = require('../models/TicketBooking'); 
const Event = require('../models/Event'); 

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; 
    if (!amount) return res.status(400).send("Amount is required");

    const options = {
      amount: Math.round(amount * 100), 
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

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

    if (!bookingData) return res.status(400).json({ success: false, message: "Booking Data Missing" });

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      
      // 1. Fetch Event
      const event = await Event.findById(bookingData.eventId);
      if (!event) return res.status(404).json({ success: false, message: "Event not found" });

      // 2. Generate Seat IDs
      const finalSeats = [];
      for (const requestedSeat of bookingData.seats) {
          const ticketCategory = event.ticketTypes.find(t => t.name === requestedSeat.ticketType);

          if (ticketCategory) {
              if (ticketCategory.availableSeats < requestedSeat.quantity) {
                  throw new Error(`Not enough seats for ${ticketCategory.name}`);
              }

              const generatedIds = [];
              let currentCount = ticketCategory.soldCount || 0;

              for (let i = 1; i <= requestedSeat.quantity; i++) {
                  generatedIds.push(`${ticketCategory.name.toUpperCase()}-${currentCount + i}`);
              }

              ticketCategory.soldCount = (ticketCategory.soldCount || 0) + requestedSeat.quantity;
              ticketCategory.availableSeats -= requestedSeat.quantity;

              finalSeats.push({
                  ticketType: requestedSeat.ticketType,
                  quantity: requestedSeat.quantity,
                  seatNumbers: generatedIds // ✅ Saves IDs like ["VIP-501"]
              });
          }
      }

      await event.save();

      // 3. Save Booking
      const newBooking = new TicketBooking({
        userId: bookingData.userId, 
        eventId: bookingData.eventId,
        guestName: bookingData.guestName, 
        mobile: bookingData.mobile,
        city: bookingData.city,
        tickets: finalSeats, // ✅ Includes seatNumbers
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

      res.json({ success: true, message: "Booking Confirmed!", bookingId: newBooking._id });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("❌ BOOKING ERROR:", error.message);
    res.status(500).json({ success: false, message: "Booking Failed", error: error.message });
  }
};
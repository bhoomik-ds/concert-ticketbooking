const Event = require('../models/Event');
const Booking = require('../models/Booking');

// API 3: Create Booking (The "Buy" Button Logic)
exports.createBooking = async (req, res) => {
  const { userId, eventId, ticketTypeName, quantity } = req.body;

  try {
    // 1. Find the Event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 2. Find the specific ticket category (e.g., "Gold") inside the event
    const ticketCategory = event.ticketTypes.find(
      (t) => t.name === ticketTypeName
    );

    if (!ticketCategory) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    // 3. Check if enough seats are available
    if (ticketCategory.availableSeats < quantity) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // 4. Calculate Total Price
    const totalCost = ticketCategory.price * quantity;

    // 5. Create the Booking Record
    const newBooking = new Booking({
      userId,
      eventId,
      ticketType: ticketTypeName,
      quantity,
      totalPrice: totalCost,
      status: 'confirmed'
    });

    // 6. Update the Event's available seats (Reduce inventory)
    ticketCategory.availableSeats -= quantity;
    await event.save(); // Save the updated seat count to DB
    await newBooking.save(); // Save the receipt to DB

    res.status(201).json({
      message: 'Booking successful!',
      booking: newBooking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
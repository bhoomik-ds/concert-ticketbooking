const express = require('express');
const cors = require('cors');

// Import your route files
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
// const userRoutes = require('./routes/userRoutes'); // Uncomment this when you make user routes

const app = express();

// Middleware (Rules for the app)
app.use(cors()); // Allow frontend to access backend
app.use(express.json()); // Allow backend to read JSON data

// Mount Routes (The URLs)
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
// app.use('/api/users', userRoutes); 

module.exports = app;
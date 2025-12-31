const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// This route receives the POST request when payment is initiated
router.post('/', bookingController.createBooking); 

module.exports = router;
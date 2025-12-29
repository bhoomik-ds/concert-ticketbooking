const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Define the routes
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
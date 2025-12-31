const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAllEvents);       // GET /api/events
router.get('/:id', eventController.getEventById);    // GET /api/events/:id

module.exports = router;
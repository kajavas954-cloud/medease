const express = require('express');
const router = express.Router();
const { SupportTicket } = require('../models');

// Submit a new support ticket
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const ticket = await SupportTicket.create({ name, email, message });
    res.status(201).json({ message: 'Support ticket submitted successfully!', ticket });
  } catch (err) {
    console.error('Support ticket error:', err);
    res.status(500).json({ message: 'Server error while submitting ticket.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Prescription, Sequelize } = require('../models');
const { Op } = Sequelize;

const JWT_SECRET = process.env.JWT_SECRET || 'medease_secret_key_123';

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// GET /api/prescriptions?q=searchterm
// Returns prescriptions for the logged-in user, filtered by optional search query
router.get('/', auth, async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';

    // Return empty array if no search term
    if (!q) return res.json([]);

    const rx = await Prescription.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { rxId:     { [Op.like]: `%${q}%` } },
          { medicine: { [Op.like]: `%${q}%` } },
          { doctor:   { [Op.like]: `%${q}%` } },
          { diagnosis:{ [Op.like]: `%${q}%` } },
          { dosage:   { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['date', 'DESC']]
    });
    res.json(rx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


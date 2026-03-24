const express = require('express');
const router = express.Router();
const { Medicine } = require('../models');

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.findAll();
    res.json(medicines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medicine by ID
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backdoor auto-seed
router.get('/force-seed/execute', async (req, res) => {
  try {
    const products = require('../medicine-data');
    await Medicine.sync({ force: true });
    await Medicine.bulkCreate(products);
    res.json({ message: 'Seeded successfully!', count: products.length });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;

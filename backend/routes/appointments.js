const express = require('express');
const router = express.Router();
const { Appointment, User } = require('../models');
const auth = require('../middleware/auth');

// Book an appointment
router.post('/', auth, async (req, res) => {
  try {
    const { service, hospitalName, hospitalCity, hospitalAddress, appointmentDate, appointmentTime, notes } = req.body;
    if (!service || !hospitalName || !hospitalCity || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    const appointment = await Appointment.create({
      userId: req.user.id,
      service,
      hospitalName,
      hospitalCity,
      hospitalAddress,
      appointmentDate,
      appointmentTime,
      notes: notes || null
    });
    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's appointments
router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.user.id },
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel (delete) an appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appt = await Appointment.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!appt) return res.status(404).json({ message: 'Appointment not found.' });
    await appt.destroy();
    res.json({ message: 'Appointment cancelled.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

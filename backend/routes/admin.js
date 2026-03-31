const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Medicine, Order, OrderItem, User, SupportTicket } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'medease_secret_key_123';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ----------------------------------------
// Admin Auth
// ----------------------------------------
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, message: 'Admin login successful' });
  }
  return res.status(401).json({ message: 'Invalid admin credentials' });
});

// Admin Middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// ----------------------------------------
// Dashboard Overview
// ----------------------------------------
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Medicine.count();
    const totalOrders = await Order.count();
    const totalUsers = await User.count();
    res.json({ totalProducts, totalOrders, totalUsers });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------------------
// User Management
// ----------------------------------------
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (err) {
    console.error("Admin Users Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------------------
// Product Management
// ----------------------------------------
router.get('/medicines', adminAuth, async (req, res) => {
  try {
    const products = await Medicine.findAll({ order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/medicines', adminAuth, async (req, res) => {
  try {
    const { name, category, price, description, imageUrl, stockQuantity, uses, warning, limit, expiry, beforeUse } = req.body;
    const medicine = await Medicine.create({ 
      name, 
      category, 
      price, 
      description, 
      imageUrl,
      uses,
      warning,
      limit,
      expiry,
      beforeUse,
      stockQuantity: stockQuantity || 100 // Default stock if not provided
    });
    res.status(201).json(medicine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/medicines/:id', adminAuth, async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    
    // Update fields
    const { name, category, price, description, imageUrl, stockQuantity, uses, warning, limit, expiry, beforeUse } = req.body;
    if (name) medicine.name = name;
    if (category) medicine.category = category;
    if (price !== undefined) medicine.price = price;
    if (description) medicine.description = description;
    if (imageUrl) medicine.imageUrl = imageUrl;
    if (uses !== undefined) medicine.uses = uses;
    if (warning !== undefined) medicine.warning = warning;
    if (limit !== undefined) medicine.limit = limit;
    if (expiry !== undefined) medicine.expiry = expiry;
    if (beforeUse !== undefined) medicine.beforeUse = beforeUse;
    if (stockQuantity !== undefined) medicine.stockQuantity = stockQuantity;

    await medicine.save();
    res.json(medicine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/medicines/:id', adminAuth, async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    
    await medicine.destroy();
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------------------
// Order Management
// ----------------------------------------
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, include: [Medicine] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body; // 'Pending', 'Shipped', 'Delivered'
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------------------
// Support Tickets Management
// ----------------------------------------
router.get('/tickets', adminAuth, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({ order: [['createdAt', 'DESC']] });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/tickets/:id/resolve', adminAuth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    ticket.status = 'Resolved';
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/tickets/:id', adminAuth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    await ticket.destroy();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

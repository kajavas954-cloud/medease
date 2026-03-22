const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Order, OrderItem, Medicine } = require('../models');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, address, deliveryTimeSlot, totalAmount } = req.body;
    // items should be [{ medicineId, quantity, priceAtTime }]
    
    // Create the order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      address,
      deliveryTimeSlot
    });

    // Create order items
    const orderItems = items.map(item => ({
      orderId: order.id,
      medicineId: item.medicineId,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime
    }));

    await OrderItem.bulkCreate(orderItems);

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        include: [Medicine]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

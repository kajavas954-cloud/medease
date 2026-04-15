const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Order, OrderItem, Medicine, sequelize } = require('../models');

// Create a new order
router.post('/', auth, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, address, deliveryTimeSlot, totalAmount } = req.body;
    
    // 1. Create the order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      address,
      deliveryTimeSlot
    }, { transaction: t });

    // 2. Process items and decrement stock
    for (const item of items) {
      const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
      
      if (!medicine) {
        throw new Error(`Medicine with ID ${item.medicineId} not found`);
      }

      if (medicine.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}, Requested: ${item.quantity}`);
      }

      // Decrement stock
      await medicine.update({ 
        stockQuantity: medicine.stockQuantity - item.quantity 
      }, { transaction: t });

      // Create order item
      await OrderItem.create({
        orderId: order.id,
        medicineId: item.medicineId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(order);
  } catch (err) {
    await t.rollback();
    console.error('Order Transaction Error:', err.message);
    res.status(400).json({ message: err.message || 'Server error during order placement' });
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

// Cancel an order (by user)
router.put('/:id/cancel', auth, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: OrderItem }]
    }, { transaction: t });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!['Pending', 'Processing'].includes(order.status)) {
      throw new Error(`Order cannot be cancelled in current status: ${order.status}`);
    }

    // 1. Update order status and reason
    order.status = 'Cancelled';
    order.cancelReason = reason;
    await order.save({ transaction: t });

    // 2. Restore stock for each item
    for (const item of order.OrderItems) {
      const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
      if (medicine) {
        await medicine.update({
          stockQuantity: medicine.stockQuantity + item.quantity
        }, { transaction: t });
      }
    }

    await t.commit();
    res.json({ message: 'Order cancelled successfully and stock restored', order });
  } catch (err) {
    await t.rollback();
    console.error('Order Cancellation Error:', err.message);
    res.status(400).json({ message: err.message || 'Server error during order cancellation' });
  }
});

// Request a return (by user)
router.put('/:id/return', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'Delivered') {
      throw new Error(`Only delivered orders can be returned. Current status: ${order.status}`);
    }

    // 1. Update order status and return reason
    order.status = 'Return Requested';
    order.returnReason = reason;
    await order.save();

    res.json({ message: 'Return request submitted successfully', order });
  } catch (err) {
    console.error('Order Return Error:', err.message);
    res.status(400).json({ message: err.message || 'Server error during return request' });
  }
});

module.exports = router;

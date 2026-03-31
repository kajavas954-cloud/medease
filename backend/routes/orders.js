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
        priceAtTime: item.priceAtTime,
        prescriptionUrl: item.prescriptionUrl || null
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

module.exports = router;

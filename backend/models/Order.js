module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Pending' // Pending, Processing, Shipped, Delivered
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    deliveryTimeSlot: {
      type: DataTypes.STRING
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    returnReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
  return Order;
};

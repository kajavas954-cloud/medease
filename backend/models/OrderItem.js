module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    priceAtTime: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  });
  return OrderItem;
};

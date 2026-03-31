module.exports = (sequelize, DataTypes) => {
  const Medicine = sequelize.define('Medicine', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    reviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    uses: { type: DataTypes.TEXT },
    warning: { type: DataTypes.TEXT },
    limit: { type: DataTypes.STRING },
    expiry: { type: DataTypes.STRING },
    beforeUse: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING },
    stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 }
  });
  return Medicine;
};

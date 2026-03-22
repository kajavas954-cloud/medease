const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'medease.sqlite'),
  logging: false
});

const db = {
  sequelize,
  Sequelize
};

// Import Models
db.User = require('./User')(sequelize, Sequelize);
db.Medicine = require('./Medicine')(sequelize, Sequelize);
db.Order = require('./Order')(sequelize, Sequelize);
db.OrderItem = require('./OrderItem')(sequelize, Sequelize);

// Define Associations
db.User.hasMany(db.Order, { foreignKey: 'userId' });
db.Order.belongsTo(db.User, { foreignKey: 'userId' });

db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });

db.Medicine.hasMany(db.OrderItem, { foreignKey: 'medicineId' });
db.OrderItem.belongsTo(db.Medicine, { foreignKey: 'medicineId' });

module.exports = db;

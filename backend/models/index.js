const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || 'mysql',
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
db.SupportTicket = require('./SupportTicket')(sequelize, Sequelize);
db.Feedback = require('./Feedback')(sequelize, Sequelize);
db.Appointment = require('./Appointment')(sequelize, Sequelize);

// Define Associations
db.User.hasMany(db.Order, { foreignKey: 'userId' });
db.Order.belongsTo(db.User, { foreignKey: 'userId' });

db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });

db.Medicine.hasMany(db.OrderItem, { foreignKey: 'medicineId' });
db.OrderItem.belongsTo(db.Medicine, { foreignKey: 'medicineId' });

db.Order.hasOne(db.Feedback, { foreignKey: 'orderId' });
db.Feedback.belongsTo(db.Order, { foreignKey: 'orderId' });

db.User.hasMany(db.Feedback, { foreignKey: 'userId' });
db.Feedback.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Appointment, { foreignKey: 'userId' });
db.Appointment.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;


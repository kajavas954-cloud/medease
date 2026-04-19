module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    service: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hospitalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hospitalCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hospitalAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    appointmentTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
      defaultValue: 'Pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
  return Appointment;
};

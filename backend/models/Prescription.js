module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    rxId: { 
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false 
    },
    medicine: { type: DataTypes.STRING, allowNull: false },
    doctor: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    dosage: { type: DataTypes.TEXT, allowNull: false },
    diagnosis: { type: DataTypes.STRING, allowNull: false },
    validTill: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Active' }
  });
  return Prescription;
};

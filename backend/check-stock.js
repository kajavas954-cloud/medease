require("dotenv").config();
const { Medicine } = require('./models');
const { Op } = require('sequelize');

async function checkStock() {
  try {
    const med = await Medicine.findOne({
      where: { name: { [Op.like]: '%Paracetamol%' } }
    });
    if (med) {
      console.log(`id: ${med.id}, name: ${med.name}, stock: ${med.stockQuantity}`);
    } else {
      console.log('Paracetamol not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStock();

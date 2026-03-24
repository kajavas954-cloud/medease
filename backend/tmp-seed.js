require('dotenv').config();
const { Medicine } = require('./models');
const medicineData = require('./medicine-data');

async function reseed() {
  try {
    console.log("Emptying medicines table natively...");
    await Medicine.destroy({ where: {} });
    console.log("Seeding fresh expanded catalog...");
    await Medicine.bulkCreate(medicineData);
    console.log("SUCCESS!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
reseed();

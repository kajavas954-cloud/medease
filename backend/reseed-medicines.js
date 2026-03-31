/**
 * reseed-medicines.js
 * Resets the Medicines table with fresh seed data.
 * Disables FK checks to bypass the orderitems constraint.
 *
 * Run from backend/ directory:
 *   node reseed-medicines.js
 */
require('dotenv').config();
const { sequelize, Medicine } = require('./models');
const products = require('./medicine-data');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected.\n');

    // Disable FK checks so we can truncate even with orderitems referencing medicines
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('⚠️  Foreign key checks disabled.');

    await Medicine.destroy({ where: {}, truncate: true });
    console.log('🗑️  Medicines table cleared.\n');

    // Re-enable FK checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Foreign key checks re-enabled.\n');

    // Insert fresh seed data
    await Medicine.bulkCreate(products);
    console.log(`✅ Inserted ${products.length} medicines successfully.\n`);

    await sequelize.close();
    console.log('Done! DB connection closed.');
  } catch (err) {
    // Make sure FK checks are always re-enabled even on error
    try { await sequelize.query('SET FOREIGN_KEY_CHECKS = 1'); } catch {}
    console.error('Reseed failed:', err.message);
    process.exit(1);
  }
}

run();

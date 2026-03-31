/**
 * MedEase - Full Database Setup Script
 * =====================================
 * 1. Creates the `medease` MySQL database (if not exists)
 * 2. Syncs all Sequelize models (creates tables)
 * 3. Seeds the full medicine catalog (if empty)
 *
 * Usage: node setup-db.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'medease';

async function run() {
  // ─── Step 1: Create the database if it doesn't exist ─────────────────────
  console.log('\n🔌 Connecting to MySQL server...');
  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
    });
  } catch (err) {
    console.error('\n❌ Could not connect to MySQL. Is the server running?');
    console.error(`   Host: ${DB_HOST} | User: ${DB_USER}`);
    console.error(`   Error: ${err.message}\n`);
    process.exit(1);
  }

  console.log(`✅ Connected! Creating database "${DB_NAME}" if not exists...`);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`✅ Database "${DB_NAME}" is ready.`);
  await conn.end();

  // ─── Step 2: Sync all models (create tables) ──────────────────────────────
  console.log('\n📦 Syncing Sequelize models (creating tables)...');
  const { sequelize, User, Medicine, Order, OrderItem, Prescription, SupportTicket } = require('./models');

  try {
    await sequelize.sync({ force: false, alter: true });
  } catch (err) {
    console.error('\n❌ Failed to sync models:', err.message);
    process.exit(1);
  }

  console.log('✅ All tables synced successfully:');
  console.log('   · Users');
  console.log('   · Medicines');
  console.log('   · Orders');
  console.log('   · OrderItems');
  console.log('   · Prescriptions');
  console.log('   · SupportTickets');

  // ─── Step 3: Seed medicines if table is empty ─────────────────────────────
  const count = await Medicine.count();
  if (count > 0) {
    console.log(`\n⚠️  Medicines table already has ${count} records. Skipping seed.`);
    console.log('   (Delete all rows manually and re-run to force re-seed)\n');
  } else {
    console.log('\n🌱 Seeding medicines catalog...');
    const products = require('./medicine-data');
    await Medicine.bulkCreate(products);
    console.log(`✅ Successfully seeded ${products.length} medicines!\n`);
  }

  // ─── Done ──────────────────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 MedEase database setup complete!');
  console.log(`   DB: ${DB_NAME} @ ${DB_HOST}`);
  console.log('   You can now run: npm run dev');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await sequelize.close();
  process.exit(0);
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

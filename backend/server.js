const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/support', require('./routes/support'));

// Auto-Seed Helper
const seedMedicines = async () => {
  const { Medicine } = require('./models');
  try {
    const count = await Medicine.count();
    if (count === 0) {
      const products = require('./medicine-data');
      await Medicine.bulkCreate(products);
      console.log('39 medicine defaults organically injected into empty DB!');
    }
  } catch(e) { console.error('Auto-seeding skipped/failed:', e.message); }
};


// Sync DB and Start Server
sequelize.sync({ alter: true }).then(async () => {
  console.log('MySQL Database synchronized, forced wipe applied!');
  await seedMedicines();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});

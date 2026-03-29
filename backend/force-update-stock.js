require('dotenv').config();
const { Medicine } = require('./models');
const products = require('./medicine-data');

const updateStock = async () => {
  console.log('Force-syncing stock data from medicine-data.js...');
  
  for (const product of products) {
    try {
      const [medicine, created] = await Medicine.findOrCreate({
        where: { name: product.name },
        defaults: product
      });

      if (!created) {
        // Update stock for existing medicine
        await medicine.update({ stockQuantity: product.stockQuantity || 0 });
        console.log(`Updated: ${product.name} (Stock: ${product.stockQuantity})`);
      } else {
        console.log(`Created: ${product.name} (Stock: ${product.stockQuantity})`);
      }
    } catch (err) {
      console.error(`Failed to update ${product.name}:`, err.message);
    }
  }

  process.exit(0);
};

updateStock();

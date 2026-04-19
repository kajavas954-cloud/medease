require('dotenv').config();
const { sequelize, Medicine } = require('./models');

// These 38 have no real local images — set imageUrl to null
// so the frontend falls back to the category image
const noLocalImage = [
  'Paracetamol 500mg', 'Vitamin C Tablets', 'Amoxicillin', 'Cetirizine',
  'Aspirin 100mg', 'Metformin 500mg', 'Atorvastatin 10mg',
  'Digital Thermometer', 'BP Monitor', 'Pulse Oximeter',
  'Glucometer Kit', 'Nebulizer Machine',
  'Face Wash', 'Hand Sanitizer', 'Sunscreen SPF 50', 'Moisturizing Lotion',
  'Surgical Mask (50pcs)',
  'Fitness Band', 'Whey Protein 1kg', 'Yoga Mat',
  'Ayush Kadha', 'Ashwagandha Powder', 'Triphala Churna',
  'Homeo Cold Drops', 'Homeo Digest Syrup',
  'Giloy Tablets', 'Tulsi Drops', 'Amla Juice 1L',
  'Homeo Hair Care Drops', 'Homeo Sleep Aid',
  'Brahmi Vati', 'Chyawanprash 500g', 'Arnica Hair Oil', 'Nux Vomica 30CH',
  'Anti-Dandruff Shampoo', 'Liver Tonic for Pets', 'Stethoscope',
  'Men\'s Multivitamin' // placeholder was set earlier, clear it too
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.\n');
    let updated = 0;

    for (const name of noLocalImage) {
      const med = await Medicine.findOne({ where: { name } });
      if (med) {
        med.imageUrl = null;
        await med.save();
        console.log(`🗑️  Cleared: ${name}`);
        updated++;
      } else {
        console.warn(`⚠️  Not found: ${name}`);
      }
    }

    console.log(`\nDone! ${updated} medicines cleared → will use category fallback image.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();

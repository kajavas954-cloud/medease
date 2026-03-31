/**
 * update-fitness-pet-images.js
 * Updates imageUrl for 15 Fitness + Pet Care products.
 * - Fitness Band: uses AI-generated image (copy from brain dir)
 * - Remaining 14: high-quality Unsplash URLs (temporary until quota resets)
 *
 * Run from backend/ directory:
 *   node update-fitness-pet-images.js
 */
require('dotenv').config();
const path = require('path');
const fs   = require('fs');
const { sequelize, Medicine } = require('./models');

const BRAIN_DIR = path.resolve('C:/Users/vijit/.gemini/antigravity/brain/67773c76-9267-4b06-9996-d04ef6193d8f');
const DEST_DIR  = path.resolve(__dirname, '../public/images/medicines');

// ─── AI images to copy (only fitness_band was generated before quota ran out) ─
const IMAGE_COPIES = [
  { src: 'fitness_band_1774939442944.png', dest: 'fitness_band.png' },
];

// ─── All 15 product → imageUrl mappings ──────────────────────────────────────
const PRODUCT_IMAGES = [
  // AI-generated (local)
  { name: 'Fitness Band', imageUrl: '/images/medicines/fitness_band.png' },

  // High-quality Unsplash fallbacks (real product-relevant photos)
  { name: 'Whey Protein 1kg',       imageUrl: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=400&fit=crop' },
  { name: 'Yoga Mat',               imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=400&fit=crop' },
  { name: 'Resistance Bands Set',   imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=400&fit=crop' },
  { name: 'Speed Jump Rope',        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&fit=crop' },
  { name: 'Massage Roller',         imageUrl: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?q=80&w=400&fit=crop' },
  { name: 'Knee Cap Support',       imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&fit=crop' },
  { name: 'BCAA Amino Acids',       imageUrl: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=400&fit=crop' },
  { name: 'Pet Shampoo',            imageUrl: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=400&fit=crop' },
  { name: 'Tick & Flea Spray',      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&fit=crop' },
  { name: 'Pet Multivitamins',      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=400&fit=crop' },
  { name: 'Pet Paw Balm',           imageUrl: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?q=80&w=400&fit=crop' },
  { name: 'Dog Dental Chews',       imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&fit=crop' },
  { name: 'Cat Anti-Hairball Paste',imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=400&fit=crop' },
  { name: 'Dog Deworming Tablets',  imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&fit=crop' },
];

// ─── Step 1: Copy AI images ───────────────────────────────────────────────────
function copyImages() {
  if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
  let copied = 0;
  for (const { src, dest } of IMAGE_COPIES) {
    const srcPath  = path.join(BRAIN_DIR, src);
    const destPath = path.join(DEST_DIR, dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✅ Copied: ${dest}`);
      copied++;
    } else {
      console.warn(`  ⚠️  Not found: ${src}`);
    }
  }
  console.log(`\n📁 ${copied} image(s) copied\n`);
}

// ─── Step 2: Update DB ────────────────────────────────────────────────────────
async function updateDB() {
  await sequelize.authenticate();
  console.log('✅ DB connected\n');
  let updated = 0;
  for (const { name, imageUrl } of PRODUCT_IMAGES) {
    const med = await Medicine.findOne({ where: { name } });
    if (med) {
      med.imageUrl = imageUrl;
      await med.save();
      console.log(`  ✅ Updated: ${name}`);
      updated++;
    } else {
      console.warn(`  ⚠️  Not in DB: "${name}"`);
    }
  }
  console.log(`\n🗄️  ${updated}/15 medicines updated in DB\n`);
  await sequelize.close();
}

async function run() {
  console.log('── Step 1: Copy AI images ──────────────────────\n');
  copyImages();
  console.log('── Step 2: Update DB ───────────────────────────\n');
  await updateDB();
  console.log('🎉 Done!');
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });

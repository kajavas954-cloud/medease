/**
 * update-fitness-pet-images-v2.js
 * Updates imageUrl for 15 Fitness + Pet Care products:
 *   - Fitness Band        → AI-generated local image (copied from brain dir)
 *   - Remaining 14       → unique, product-relevant Unsplash photos
 *
 * Run from backend/ directory:
 *   node update-fitness-pet-images-v2.js
 */
require('dotenv').config();
const path = require('path');
const fs   = require('fs');
const { sequelize, Medicine } = require('./models');

const BRAIN_DIR = path.resolve('C:/Users/vijit/.gemini/antigravity/brain/be170a12-19f0-4964-80b1-3ddefd713399');
const DEST_DIR  = path.resolve(__dirname, '../public/images/medicines');

// ─── AI images to copy ────────────────────────────────────────────────────────
const IMAGE_COPIES = [
  { src: 'fitness_band_1774940045869.png', dest: 'fitness_band_v2.png' },
];

// ─── All 15 product → imageUrl mappings ──────────────────────────────────────
const PRODUCT_IMAGES = [
  // 1. AI-generated (local)
  { name: 'Fitness Band',
    imageUrl: '/images/medicines/fitness_band_v2.png' },

  // 2–15. Unique high-quality Unsplash fallbacks
  { name: 'Whey Protein 1kg',
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=400&fit=crop' },

  { name: 'Yoga Mat',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=400&fit=crop' },

  { name: 'Resistance Bands Set',
    imageUrl: 'https://images.unsplash.com/photo-1618355776464-8666794d2520?q=80&w=400&fit=crop' },

  { name: 'Speed Jump Rope',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=400&fit=crop' },

  { name: 'Massage Roller',
    imageUrl: 'https://images.unsplash.com/photo-1591311630200-ffa9120a540f?q=80&w=400&fit=crop' },

  { name: 'Knee Cap Support',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=400&fit=crop' },

  { name: 'BCAA Amino Acids',
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=400&fit=crop' },

  { name: 'Pet Shampoo',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&fit=crop' },

  { name: 'Tick & Flea Spray',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400&fit=crop' },

  { name: 'Pet Multivitamins',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&fit=crop' },

  { name: 'Pet Paw Balm',
    imageUrl: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?q=80&w=400&fit=crop' },

  { name: 'Dog Dental Chews',
    imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=400&fit=crop' },

  { name: 'Cat Anti-Hairball Paste',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&fit=crop' },

  { name: 'Dog Deworming Tablets',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&fit=crop' },
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
      console.warn(`  ⚠️  Not found: ${src}  (skipping)`);
    }
  }
  console.log(`\n📁 ${copied} image(s) copied to public/images/medicines/\n`);
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
  console.log(`\n🗄️  ${updated}/15 products updated in DB\n`);
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

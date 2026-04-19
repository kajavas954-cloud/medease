/**
 * update-batch3-images.js
 * Copies 13 newly AI-generated images and updates their products in DB.
 * Run from backend/ directory: node update-batch3-images.js
 */
require('dotenv').config();
const path = require('path');
const fs   = require('fs');
const { sequelize, Medicine } = require('./models');

const BRAIN_DIR = path.resolve('C:/Users/vijit/.gemini/antigravity/brain/67773c76-9267-4b06-9996-d04ef6193d8f');
const DEST_DIR  = path.resolve(__dirname, '../public/images/medicines');

const IMAGE_COPIES = [
  { src: 'digital_thermometer_1776320574232.png',  dest: 'digital_thermometer.png'  },
  { src: 'bp_monitor_1776320589961.png',           dest: 'bp_monitor.png'           },
  { src: 'pulse_oximeter_1776320606765.png',       dest: 'pulse_oximeter.png'       },
  { src: 'glucometer_kit_1776320632943.png',       dest: 'glucometer_kit.png'       },
  { src: 'stethoscope_1776320649615.png',          dest: 'stethoscope.png'          },
  { src: 'whey_protein_1kg_1776320666297.png',     dest: 'whey_protein.png'         },
  { src: 'ayush_kadha_new_1776320693534.png',      dest: 'ayush_kadha.png'          },
  { src: 'ashwagandha_powder_new_1776320708857.png', dest: 'ashwagandha_powder.png' },
  { src: 'triphala_churna_new_1776320722602.png',  dest: 'triphala_churna.png'      },
  { src: 'giloy_tablets_new_1776320752994.png',    dest: 'giloy_tablets.png'        },
  { src: 'tulsi_drops_new_1776320771731.png',      dest: 'tulsi_drops.png'          },
  { src: 'amla_juice_new_1776320789218.png',       dest: 'amla_juice.png'           },
  { src: 'brahmi_vati_new_1776320815585.png',      dest: 'brahmi_vati.png'          },
];

const PRODUCT_IMAGES = [
  { name: 'Digital Thermometer', imageUrl: '/images/medicines/digital_thermometer.png' },
  { name: 'BP Monitor',          imageUrl: '/images/medicines/bp_monitor.png'          },
  { name: 'Pulse Oximeter',      imageUrl: '/images/medicines/pulse_oximeter.png'      },
  { name: 'Glucometer Kit',      imageUrl: '/images/medicines/glucometer_kit.png'      },
  { name: 'Stethoscope',         imageUrl: '/images/medicines/stethoscope.png'         },
  { name: 'Whey Protein 1kg',    imageUrl: '/images/medicines/whey_protein.png'        },
  { name: 'Ayush Kadha',         imageUrl: '/images/medicines/ayush_kadha.png'         },
  { name: 'Ashwagandha Powder',  imageUrl: '/images/medicines/ashwagandha_powder.png'  },
  { name: 'Triphala Churna',     imageUrl: '/images/medicines/triphala_churna.png'     },
  { name: 'Giloy Tablets',       imageUrl: '/images/medicines/giloy_tablets.png'       },
  { name: 'Tulsi Drops',         imageUrl: '/images/medicines/tulsi_drops.png'         },
  { name: 'Amla Juice 1L',       imageUrl: '/images/medicines/amla_juice.png'          },
  { name: 'Brahmi Vati',         imageUrl: '/images/medicines/brahmi_vati.png'         },
];

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
      console.warn(`  ⚠️  Missing: ${src}`);
    }
  }
  console.log(`\n📁 ${copied}/${IMAGE_COPIES.length} images copied\n`);
}

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
  console.log(`\n🗄️  ${updated}/${PRODUCT_IMAGES.length} medicines updated\n`);
  await sequelize.close();
}

async function run() {
  console.log('── Step 1: Copy images ──────────────────────────\n');
  copyImages();
  console.log('── Step 2: Update DB ────────────────────────────\n');
  await updateDB();
  console.log('🎉 Done!');
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });

/**
 * update-product-images.js
 * Copies AI-generated images from the brain dir to public/images/medicines/
 * then updates each medicine's imageUrl in the DB by name (no truncate, FK-safe).
 *
 * Run from the backend/ directory:
 *   node update-product-images.js
 */
require('dotenv').config();
const path = require('path');
const fs   = require('fs');
const { sequelize, Medicine } = require('./models');

const BRAIN_DIR = path.resolve('C:/Users/vijit/.gemini/antigravity/brain/67773c76-9267-4b06-9996-d04ef6193d8f');
const DEST_DIR  = path.resolve(__dirname, '../public/images/medicines');

const IMAGE_COPIES = [
  { src: 'liver_tonic_pets_1774937439104.png',    dest: 'liver_tonic_pets.png'   },
  { src: 'ayush_kadha_1774937453467.png',          dest: 'ayush_kadha.png'        },
  { src: 'ashwagandha_powder_1774937468982.png',   dest: 'ashwagandha_powder.png' },
  { src: 'triphala_churna_1774937493595.png',      dest: 'triphala_churna.png'    },
  { src: 'giloy_tablets_1774937508714.png',        dest: 'giloy_tablets.png'      },
  { src: 'tulsi_drops_1774937525558.png',          dest: 'tulsi_drops.png'        },
  { src: 'amla_juice_1774937551331.png',           dest: 'amla_juice.png'         },
  { src: 'brahmi_vati_1774937566232.png',          dest: 'brahmi_vati.png'        },
  { src: 'chyawanprash_1774937584501.png',         dest: 'chyawanprash.png'       },
  { src: 'homeo_cold_drops_1774937610519.png',     dest: 'homeo_cold_drops.png'   },
  { src: 'homeo_digest_syrup_1774937625206.png',   dest: 'homeo_digest_syrup.png' },
  { src: 'homeo_hair_drops_1774937640717.png',     dest: 'homeo_hair_drops.png'   },
  { src: 'homeo_sleep_aid_1774937664975.png',      dest: 'homeo_sleep_aid.png'    },
  { src: 'arnica_hair_oil_1774937680400.png',      dest: 'arnica_hair_oil.png'    },
  { src: 'nux_vomica_1774938317318.png',           dest: 'nux_vomica.png'         },
];

const PRODUCT_IMAGES = [
  { name: 'Liver Tonic for Pets',   imageUrl: '/images/medicines/liver_tonic_pets.png'   },
  { name: 'Ayush Kadha',            imageUrl: '/images/medicines/ayush_kadha.png'         },
  { name: 'Ashwagandha Powder',     imageUrl: '/images/medicines/ashwagandha_powder.png'  },
  { name: 'Triphala Churna',        imageUrl: '/images/medicines/triphala_churna.png'     },
  { name: 'Giloy Tablets',          imageUrl: '/images/medicines/giloy_tablets.png'       },
  { name: 'Tulsi Drops',            imageUrl: '/images/medicines/tulsi_drops.png'         },
  { name: 'Amla Juice 1L',          imageUrl: '/images/medicines/amla_juice.png'          },
  { name: 'Brahmi Vati',            imageUrl: '/images/medicines/brahmi_vati.png'         },
  { name: 'Chyawanprash 500g',      imageUrl: '/images/medicines/chyawanprash.png'        },
  { name: 'Homeo Cold Drops',       imageUrl: '/images/medicines/homeo_cold_drops.png'    },
  { name: 'Homeo Digest Syrup',     imageUrl: '/images/medicines/homeo_digest_syrup.png'  },
  { name: 'Homeo Hair Care Drops',  imageUrl: '/images/medicines/homeo_hair_drops.png'    },
  { name: 'Homeo Sleep Aid',        imageUrl: '/images/medicines/homeo_sleep_aid.png'     },
  { name: 'Arnica Hair Oil',        imageUrl: '/images/medicines/arnica_hair_oil.png'     },
  { name: 'Nux Vomica 30CH',        imageUrl: '/images/medicines/nux_vomica.png'          },
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
      console.warn(`  ⚠️  Not found: ${src}`);
    }
  }
  console.log(`\n📁 ${copied} images copied to public/images/medicines/\n`);
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
      console.log(`  ✅ DB updated: ${name}`);
      updated++;
    } else {
      console.warn(`  ⚠️  Not in DB: "${name}"`);
    }
  }
  console.log(`\n🗄️  ${updated} medicines updated in DB\n`);
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

/**
 * update-all-product-images.js
 * Master script — copies ALL AI-generated images and updates ALL products in DB.
 *
 * Run from backend/ directory:
 *   node update-all-product-images.js
 */
require('dotenv').config();
const path = require('path');
const fs   = require('fs');
const { sequelize, Medicine } = require('./models');

const BRAIN_DIR = path.resolve('C:/Users/vijit/.gemini/antigravity/brain/67773c76-9267-4b06-9996-d04ef6193d8f');
const DEST_DIR  = path.resolve(__dirname, '../public/images/medicines');

// ─── All AI-generated images to copy ─────────────────────────────────────────
const IMAGE_COPIES = [
  // Batch 1 (previous session)
  { src: 'liver_tonic_pets_1774937439104.png',    dest: 'liver_tonic_pets.png'    },
  { src: 'ayush_kadha_1774937453467.png',          dest: 'ayush_kadha.png'          },
  { src: 'ashwagandha_powder_1774937468982.png',   dest: 'ashwagandha_powder.png'   },
  { src: 'triphala_churna_1774937493595.png',      dest: 'triphala_churna.png'      },
  { src: 'giloy_tablets_1774937508714.png',        dest: 'giloy_tablets.png'        },
  { src: 'tulsi_drops_1774937525558.png',          dest: 'tulsi_drops.png'          },
  { src: 'amla_juice_1774937551331.png',           dest: 'amla_juice.png'           },
  { src: 'brahmi_vati_1774937566232.png',          dest: 'brahmi_vati.png'          },
  { src: 'chyawanprash_1774937584501.png',         dest: 'chyawanprash.png'         },
  { src: 'homeo_cold_drops_1774937610519.png',     dest: 'homeo_cold_drops.png'     },
  { src: 'homeo_digest_syrup_1774937625206.png',   dest: 'homeo_digest_syrup.png'   },
  { src: 'homeo_hair_drops_1774937640717.png',     dest: 'homeo_hair_drops.png'     },
  { src: 'homeo_sleep_aid_1774937664975.png',      dest: 'homeo_sleep_aid.png'      },
  { src: 'arnica_hair_oil_1774937680400.png',      dest: 'arnica_hair_oil.png'      },
  { src: 'nux_vomica_1774938317318.png',           dest: 'nux_vomica.png'           },
  { src: 'fitness_band_1774939442944.png',         dest: 'fitness_band.png'         },

  // Batch 2 (this session - 6 generated before quota ran out)
  { src: 'adhesive_plasters_1774950358560.png',    dest: 'adhesive_plasters.png'    },
  { src: 'pain_relief_patch_1774950375569.png',    dest: 'pain_relief_patch.png'    },
  { src: 'yoga_mat_1774950423306.png',             dest: 'yoga_mat.png'             },
  { src: 'resistance_bands_1774950475509.png',     dest: 'resistance_bands.png'     },
  { src: 'speed_jump_rope_1774950501839.png',      dest: 'speed_jump_rope.png'      },
  { src: 'massage_roller_1774950530351.png',       dest: 'massage_roller.png'       },
];

// ─── All product image mappings ───────────────────────────────────────────────
const PRODUCT_IMAGES = [
  // ── AI-generated (local PNGs) ──────────────────────────────────────────────
  // Ayush
  { name: 'Ayush Kadha',            imageUrl: '/images/medicines/ayush_kadha.png'         },
  { name: 'Ashwagandha Powder',     imageUrl: '/images/medicines/ashwagandha_powder.png'  },
  { name: 'Triphala Churna',        imageUrl: '/images/medicines/triphala_churna.png'     },
  { name: 'Giloy Tablets',          imageUrl: '/images/medicines/giloy_tablets.png'       },
  { name: 'Tulsi Drops',            imageUrl: '/images/medicines/tulsi_drops.png'         },
  { name: 'Amla Juice 1L',          imageUrl: '/images/medicines/amla_juice.png'          },
  { name: 'Brahmi Vati',            imageUrl: '/images/medicines/brahmi_vati.png'         },
  { name: 'Chyawanprash 500g',      imageUrl: '/images/medicines/chyawanprash.png'        },
  // Homeopathy
  { name: 'Homeo Cold Drops',       imageUrl: '/images/medicines/homeo_cold_drops.png'    },
  { name: 'Homeo Digest Syrup',     imageUrl: '/images/medicines/homeo_digest_syrup.png'  },
  { name: 'Homeo Hair Care Drops',  imageUrl: '/images/medicines/homeo_hair_drops.png'    },
  { name: 'Homeo Sleep Aid',        imageUrl: '/images/medicines/homeo_sleep_aid.png'     },
  { name: 'Arnica Hair Oil',        imageUrl: '/images/medicines/arnica_hair_oil.png'     },
  { name: 'Nux Vomica 30CH',        imageUrl: '/images/medicines/nux_vomica.png'          },
  // Pet Care
  { name: 'Liver Tonic for Pets',   imageUrl: '/images/medicines/liver_tonic_pets.png'   },
  // Fitness
  { name: 'Fitness Band',           imageUrl: '/images/medicines/fitness_band.png'        },
  // First Aid
  { name: 'Adhesive Plasters (100pcs)', imageUrl: '/images/medicines/adhesive_plasters.png' },
  { name: 'Pain Relief Patch',      imageUrl: '/images/medicines/pain_relief_patch.png'   },
  // Fitness (batch 2)
  { name: 'Yoga Mat',               imageUrl: '/images/medicines/yoga_mat.png'            },
  { name: 'Resistance Bands Set',   imageUrl: '/images/medicines/resistance_bands.png'    },
  { name: 'Speed Jump Rope',        imageUrl: '/images/medicines/speed_jump_rope.png'     },
  { name: 'Massage Roller',         imageUrl: '/images/medicines/massage_roller.png'      },

  // ── Unsplash fallbacks (quota exhausted — real product photos) ─────────────
  { name: 'Whey Protein 1kg',       imageUrl: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=400&fit=crop' },
  { name: 'Knee Cap Support',       imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&fit=crop' },
  { name: 'BCAA Amino Acids',       imageUrl: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=400&fit=crop' },
  { name: 'Pet Shampoo',            imageUrl: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=400&fit=crop' },
  { name: 'Tick & Flea Spray',      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&fit=crop' },
  { name: 'Pet Multivitamins',      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=400&fit=crop' },
  { name: 'Pet Paw Balm',           imageUrl: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?q=80&w=400&fit=crop' },
  { name: 'Dog Dental Chews',       imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=400&fit=crop' },
  { name: 'Cat Anti-Hairball Paste',imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=400&fit=crop' },
  { name: 'Dog Deworming Tablets',  imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&fit=crop' },
];

// ─── Step 1: Copy AI images ───────────────────────────────────────────────────
function copyImages() {
  if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
  let copied = 0, missing = 0;
  for (const { src, dest } of IMAGE_COPIES) {
    const srcPath  = path.join(BRAIN_DIR, src);
    const destPath = path.join(DEST_DIR, dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✅ Copied: ${dest}`);
      copied++;
    } else {
      console.warn(`  ⚠️  Missing: ${src}`);
      missing++;
    }
  }
  console.log(`\n📁 Copied: ${copied}  |  Missing: ${missing}\n`);
}

// ─── Step 2: Update DB ────────────────────────────────────────────────────────
async function updateDB() {
  await sequelize.authenticate();
  console.log('✅ DB connected\n');
  let updated = 0, notFound = 0;
  for (const { name, imageUrl } of PRODUCT_IMAGES) {
    const med = await Medicine.findOne({ where: { name } });
    if (med) {
      med.imageUrl = imageUrl;
      await med.save();
      const tag = imageUrl.startsWith('/') ? '🖼️  local' : '🔗  url  ';
      console.log(`  ✅ ${tag}  ${name}`);
      updated++;
    } else {
      console.warn(`  ⚠️  Not in DB: "${name}"`);
      notFound++;
    }
  }
  console.log(`\n🗄️  Updated: ${updated}  |  Not found: ${notFound}\n`);
  await sequelize.close();
}

async function run() {
  console.log('══ Step 1: Copy AI images to public/images/medicines/ ══\n');
  copyImages();
  console.log('══ Step 2: Update imageUrl in DB ══\n');
  await updateDB();
  console.log('🎉 All done!');
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });

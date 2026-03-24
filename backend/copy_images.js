const fs = require('fs');
const path = require('path');
const srcDir = 'C:\\Users\\vijit\\.gemini\\antigravity\\brain\\64d5901a-8c06-4a07-b4f8-77f0f23f5d54\\';
const destDir = 'c:\\Users\\vijit\\OneDrive\\Documents\\GitHub\\medease\\public\\images\\medicines\\';

const files = fs.readdirSync(srcDir);
const targetPrefixes = [
  'first_aid_kit_', 'antiseptic_liquid_', 'medical_tape_', 'cotton_swabs_', 'burn_ointment_',
  'giloy_tablets_', 'tulsi_drops_', 'amla_juice_', 'homeo_hair_drops_', 'homeo_sleep_aid_',
  'pet_paw_balm_', 'dog_dental_chews_', 'cat_hairball_paste_', 'resistance_bands_', 'speed_jump_rope_'
];

files.forEach(file => {
  for (let prefix of targetPrefixes) {
    if (file.startsWith(prefix) && file.endsWith('.png')) {
      const srcPath = path.join(srcDir, file);
      // Clean up the timestamp artifact: 'first_aid_kit.png'
      const destName = prefix.slice(0, -1) + '.png';
      const destPath = path.join(destDir, destName);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Successfully mapped: ${file} => ${destName}`);
    }
  }
});

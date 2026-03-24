const fs = require('fs');

const map = {
  'dolo_650mg_1774330358959.png': 'dolo_650mg.png',
  'azithromycin_500mg_1774330507464.png': 'azithromycin_500mg.png',
  'cough_syrup_1774330635771.png': 'cough_syrup.png',
  'pantoprazole_40mg_1774330669681.png': 'pantoprazole_40mg.png',
  'vitamin_d3_capsules_1774330733422.png': 'vitamin_d3_capsules.png',
  'weight_scale_1774330746990.png': 'weight_scale.png'
};

const srcPrefix = 'C:\\Users\\vijit\\.gemini\\antigravity\\brain\\64d5901a-8c06-4a07-b4f8-77f0f23f5d54\\';
const outPrefix = 'c:\\Users\\vijit\\OneDrive\\Documents\\GitHub\\medease\\public\\images\\medicines\\';

for (let [src, out] of Object.entries(map)) {
  fs.copyFileSync(srcPrefix + src, outPrefix + out);
  console.log(`Successfully mapped: ${out}`);
}

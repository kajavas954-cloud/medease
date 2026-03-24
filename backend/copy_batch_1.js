const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\vijit\\.gemini\\antigravity\\brain\\64d5901a-8c06-4a07-b4f8-77f0f23f5d54';
const destDir = path.join(__dirname, '../public/images/medicines');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  'dolo_650mg_1774330358959.png',
  'azithromycin_500mg_1774330507464.png',
  'cough_syrup_1774330635771.png',
  'pantoprazole_40mg_1774330669681.png',
  'vitamin_d3_capsules_1774330733422.png',
  'weight_scale_1774330746990.png'
];

let count = 0;
filesToCopy.forEach(file => {
  const srcFile = path.join(srcDir, file);
  // Ensure the generic name for easier mapping
  const destName = file.split('_1774')[0] + '.png';
  const destFile = path.join(destDir, destName);
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log('Copied:', destName);
    count++;
  } else {
    console.log('Missing:', file);
  }
});
console.log('Finished copying ' + count + ' items.');

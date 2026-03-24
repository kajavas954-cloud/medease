const fs = require('fs');

try {
  fs.copyFileSync('C:/Users/vijit/.gemini/antigravity/brain/64d5901a-8c06-4a07-b4f8-77f0f23f5d54/dolo_650mg_1774330358959.png', 'c:/Users/vijit/OneDrive/Documents/GitHub/medease/public/images/medicines/dolo_650mg.png');
  fs.copyFileSync('C:/Users/vijit/.gemini/antigravity/brain/64d5901a-8c06-4a07-b4f8-77f0f23f5d54/azithromycin_500mg_1774330507464.png', 'c:/Users/vijit/OneDrive/Documents/GitHub/medease/public/images/medicines/azithromycin_500mg.png');
  fs.copyFileSync('C:/Users/vijit/.gemini/antigravity/brain/64d5901a-8c06-4a07-b4f8-77f0f23f5d54/cough_syrup_1774330635771.png', 'c:/Users/vijit/OneDrive/Documents/GitHub/medease/public/images/medicines/cough_syrup.png');
  fs.copyFileSync('C:/Users/vijit/.gemini/antigravity/brain/64d5901a-8c06-4a07-b4f8-77f0f23f5d54/pantoprazole_40mg_1774330669681.png', 'c:/Users/vijit/OneDrive/Documents/GitHub/medease/public/images/medicines/pantoprazole_40mg.png');
  fs.copyFileSync('C:/Users/vijit/.gemini/antigravity/brain/64d5901a-8c06-4a07-b4f8-77f0f23f5d54/vitamin_d3_capsules_1774330733422.png', 'c:/Users/vijit/OneDrive/Documents/GitHub\medease/public/images/medicines/vitamin_d3_capsules.png');
  fs.copyFileSync('C:/Users/vijit/.gemini/antigravity/brain/64d5901a-8c06-4a07-b4f8-77f0f23f5d54/weight_scale_1774330746990.png', 'c:/Users/vijit/OneDrive/Documents/GitHub/medease/public/images/medicines/weight_scale.png');
  
  // Automatically fix medicine-data.js blocked Unsplash URLs to standard clean placeholders
  const targetPath = 'c:/Users/vijit/OneDrive/Documents/GitHub/medease/backend/medicine-data.js';
  let data = fs.readFileSync(targetPath, 'utf8');
  let fixed = data.replace(/https:\/\/images\.unsplash\.com\/[^"]+/g, () => 'https://placehold.co/400x400/eeeeee/333333?text=Product+Image');
  fs.writeFileSync(targetPath, fixed);
  
  console.log("ALL FILES COPIED AND UNSPLASH LINKS SANITIZED SUCCESSFULLY.");
} catch(e) {
  console.error("FAILED EXECUTION: " + e.message);
}

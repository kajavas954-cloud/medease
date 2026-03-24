const fs = require('fs');
const path = require('path');

const medicines = [
  "Ibuprofen 400mg", "Omeprazole 20mg", "Men's Multivitamin", "Women's Multivitamin",
  "Electrolyte Powder", "Honey Cough Syrup", "Dolo 650mg", "Azithromycin 500mg",
  "Cough Syrup (Sugar-Free)", "Pantoprazole 40mg", "Diclofenac Gel", "Vitamin D3 Capsules",
  "Weight Scale", "Anti-Dandruff Shampoo", "Crepe Bandage", "Sterile Gauze",
  "Complete First Aid Kit", "Antiseptic Liquid", "Medical Tape", "Cotton Swabs",
  "Burn Healing Ointment", "Antiseptic Liquid High Grade", "Adhesive Plasters (100pcs)",
  "Pain Relief Patch", "Fitness Band", "Whey Protein 1kg", "Yoga Mat", "Resistance Bands Set",
  "Speed Jump Rope", "Massage Roller", "Knee Cap Support", "BCAA Amino Acids",
  "Pet Shampoo", "Tick & Flea Spray", "Pet Multivitamins", "Pet Paw Balm",
  "Dog Dental Chews", "Cat Anti-Hairball Paste", "Dog Deworming Tablets", "Liver Tonic for Pets",
  "Ayush Kadha", "Ashwagandha Powder", "Triphala Churna", "Giloy Tablets", "Tulsi Drops",
  "Amla Juice 1L", "Brahmi Vati", "Chyawanprash 500g", "Homeo Cold Drops",
  "Homeo Digest Syrup", "Homeo Hair Care Drops", "Homeo Sleep Aid", "Arnica Hair Oil",
  "Nux Vomica 30CH"
];

const gradients = [
  ['#4facfe', '#00f2fe'], ['#fccb90', '#d57eeb'], ['#e0c3fc', '#8ec5fc'],
  ['#f093fb', '#f5576c'], ['#84fab0', '#8fd3f4'], ['#ffecd2', '#fcb69f'],
  ['#cfd9df', '#e2ebf0'], ['#a18cd1', '#fbc2eb'], ['#ff9a9e', '#fecfef'],
  ['#f6d365', '#fda085'], ['#d4fc79', '#96e6a1'], ['#84fab0', '#8fd3f4'],
  ['#a6c0fe', '#f68084'], ['#fccb90', '#d57eeb'], ['#e0c3fc', '#8ec5fc']
];

const dir = path.join(__dirname, 'src', 'image', 'medicine');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

medicines.forEach((med, index) => {
  const safeName = med.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const fileName = `${safeName}.svg`;
  const colors = gradients[index % gradients.length];
  
  // Create an appealing SVG string with a sleek clinical feel
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.15"/>
      </filter>
    </defs>
    
    <rect width="100%" height="100%" fill="url(#grad${index})" />
    <path d="M 0 0 L 400 400 M 400 0 L 0 400" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
    <circle cx="200" cy="200" r="160" fill="rgba(255, 255, 255, 0.4)" filter="url(#shadow)" />
    <rect x="80" y="140" width="240" height="120" rx="16" fill="#ffffff" filter="url(#shadow)" />
    
    <text x="200" y="200" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="28" fill="#333333" text-anchor="middle" dominant-baseline="middle">
      MedEase
    </text>
    <text x="200" y="235" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="500" font-size="20" fill="#666666" text-anchor="middle" dominant-baseline="middle">
      ${med.length > 25 ? med.substring(0, 22) + '...' : med}
    </text>
  </svg>`;

  fs.writeFileSync(path.join(dir, fileName), svg);
});

console.log('Successfully generated 54 unique placeholder images in src/image/medicine');

require('dotenv').config();
const { sequelize, Medicine } = require('./models');
const fs = require('fs');

const newProducts = [
  // Medicine
  { name: "Dolo 650mg", price: 30, category: "Medicine", rating: 4.6, reviews: 200, uses: "Relieves fever, headache, and body aches effectively.", warning: "Do not exceed 4000mg a day or mix with alcohol.", limit: "1 tablet every 6 hours.", expiry: "Dec 2026", beforeUse: "Store below 25°C.", imageUrl: "https://images.unsplash.com/photo-1577401239170-891f141ce8dd?q=80&w=400&fit=crop" },
  { name: "Azithromycin 500mg", price: 110, category: "Medicine", rating: 4.5, reviews: 85, uses: "Broad-spectrum antibiotic for bacterial infections.", warning: "Complete entire prescription course.", limit: "1 tablet per day for 3-5 days.", expiry: "Oct 2025", beforeUse: "Take 1 hour before or 2 hours after meals.", imageUrl: "https://images.unsplash.com/photo-1549419163-d1df5ed4fa32?q=80&w=400&fit=crop" },
  { name: "Cough Syrup (Sugar-Free)", price: 95, category: "Medicine", rating: 4.7, reviews: 150, uses: "Relieves dry cough and throat irritation.", warning: "May cause slight drowsiness.", limit: "10ml thrice daily.", expiry: "Mar 2026", beforeUse: "Shake well before use.", imageUrl: "https://images.unsplash.com/photo-1588612154687-327ce4358bbd?q=80&w=400&fit=crop" },
  { name: "Pantoprazole 40mg", price: 65, category: "Medicine", rating: 4.8, reviews: 140, uses: "Treats severe acidity and heartburn.", warning: "Take on an empty stomach.", limit: "1 tablet morning before breakfast.", expiry: "Jan 2027", beforeUse: "Do not chew or crush.", imageUrl: "https://images.unsplash.com/photo-1550572017-edb79a0cfb2e?q=80&w=400&fit=crop" },
  { name: "Diclofenac Gel", price: 85, category: "Medicine", rating: 4.4, reviews: 90, uses: "Topical relief for joint pain and sprains.", warning: "Do not apply on broken skin or wounds.", limit: "Apply 2-3 times daily gently.", expiry: "Aug 2025", beforeUse: "Wash hands after application.", imageUrl: "https://images.unsplash.com/photo-1629858639255-b46187514a60?q=80&w=400&fit=crop" },
  { name: "Vitamin D3 Capsules", price: 150, category: "Medicine", rating: 4.9, reviews: 210, uses: "Enhances calcium absorption for bone health.", warning: "Avoid overdose which may cause toxicity.", limit: "1 capsule per week as prescribed.", expiry: "Sep 2026", beforeUse: "Take after meals preferably with milk.", imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=400&fit=crop" },

  // Device
  { name: "Weight Scale", price: 1299, category: "Device", rating: 4.6, reviews: 300, uses: "High-precision digital BMI and weight monitor.", warning: "Do not use with wet feet to prevent slipping.", limit: "Max carrying capacity 180kg.", expiry: "N/A (Warranty 1 yr)", beforeUse: "Place on a flat, hard surface.", imageUrl: "https://images.unsplash.com/photo-1616641629168-1bc905df1af5?q=80&w=400&fit=crop" },
  { name: "Heating Pad", price: 599, category: "Device", rating: 4.8, reviews: 450, uses: "Electric hot water bag for muscle cramps.", warning: "Do not puncture or plug while using on body.", limit: "Use for 15-20 min intervals.", expiry: "N/A", beforeUse: "Check for any wire damage.", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&fit=crop" },
  { name: "Stethoscope", price: 850, category: "Device", rating: 4.7, reviews: 110, uses: "Classic dual-head acoustic heartbeat monitor.", warning: "Do not subject to extreme temperatures or solvents.", limit: "Unlimited usage.", expiry: "N/A", beforeUse: "Clean eartips regularly.", imageUrl: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=400&fit=crop" },

  // Personal Care
  { name: "Aloe Vera Gel", price: 199, category: "Personal Care", rating: 4.9, reviews: 520, uses: "Pure skin hydration and soothing for sunburns.", warning: "For external use only.", limit: "Apply generously as needed.", expiry: "Jul 2026", beforeUse: "Keep refrigerated for extra cooling.", imageUrl: "https://images.unsplash.com/photo-1611077544717-1996504a559e?q=80&w=400&fit=crop" },
  { name: "Anti-Dandruff Shampoo", price: 349, category: "Personal Care", rating: 4.5, reviews: 290, uses: "Clinically proven to reduce scalp flaking.", warning: "Avoid eye contact.", limit: "Use 2-3 times per week.", expiry: "Feb 2027", beforeUse: "Lather well and let sit for 2 mins.", imageUrl: "https://images.unsplash.com/photo-1629198725965-05e9d9976bb2?q=80&w=400&fit=crop" },

  // First Aid
  { name: "Antiseptic Liquid", price: 140, category: "First Aid", rating: 4.8, reviews: 330, uses: "Disinfects floors, surfaces, and minor wounds.", warning: "Corrosive if undiluted. Toxic if ingested.", limit: "Dilute 1 capful in 250ml water.", expiry: "Jun 2027", beforeUse: "Dilute before use.", imageUrl: "https://images.unsplash.com/photo-1584820927498-cafe0c1692ce?q=80&w=400&fit=crop" },
  { name: "Adhesive Plasters (100pcs)", price: 120, category: "First Aid", rating: 4.7, reviews: 600, uses: "Breathable bandages for minor cuts and scrapes.", warning: "Change daily or when wet.", limit: "Single use per plaster.", expiry: "Oct 2028", beforeUse: "Clean and dry wound first.", imageUrl: "https://images.unsplash.com/photo-1583947581924-860bda6a5a04?q=80&w=400&fit=crop" },
  { name: "Pain Relief Patch", price: 199, category: "First Aid", rating: 4.4, reviews: 150, uses: "Transdermal patch for fast sprain and back ache relief.", warning: "Do not apply over broken skin.", limit: "Keep on for up to 8 hours.", expiry: "Jan 2026", beforeUse: "Peel off securely.", imageUrl: "https://images.unsplash.com/photo-1610427958561-12c40cbf685a?q=80&w=400&fit=crop" },

  // Fitness
  { name: "Knee Cap Support", price: 350, category: "Fitness", rating: 4.6, reviews: 220, uses: "Provides orthopaedic joint compression during sports.", warning: "Do not wear while sleeping.", limit: "Wear during activity.", expiry: "N/A", beforeUse: "Check for proper sizing.", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&fit=crop" },
  { name: "BCAA Amino Acids", price: 1599, category: "Fitness", rating: 4.8, reviews: 410, uses: "Prevents muscle breakdown and aids workout recovery.", warning: "Consult physician before use.", limit: "1 scoop during workout.", expiry: "Dec 2026", beforeUse: "Mix with 300ml cold water.", imageUrl: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=400&fit=crop" },

  // Pet Care
  { name: "Dog Deworming Tablets", price: 250, category: "Pet Care", rating: 4.9, reviews: 85, uses: "Effective broad-spectrum parasite control for dogs.", warning: "Not for pregnant dogs unless directed by vet.", limit: "1 tablet per 10kg body weight.", expiry: "Apr 2026", beforeUse: "Can be hidden in food.", imageUrl: "https://images.unsplash.com/photo-1606788075761-26dd66f7f0fa?q=80&w=400&fit=crop" },
  { name: "Liver Tonic for Pets", price: 320, category: "Pet Care", rating: 4.7, reviews: 110, uses: "Supports liver function and digestion in cats & dogs.", warning: "Only for animal use.", limit: "As directed by veterinarian.", expiry: "Nov 2025", beforeUse: "Shake well.", imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&fit=crop" },

  // Ayush
  { name: "Brahmi Vati", price: 180, category: "Ayush", rating: 4.6, reviews: 175, uses: "Ayurvedic formulation to enhance memory and focus.", warning: "Avoid overdose.", limit: "1-2 tablets twice daily.", expiry: "May 2027", beforeUse: "Take with milk or warm water.", imageUrl: "https://images.unsplash.com/photo-1596541223130-5d56a73fb116?q=80&w=400&fit=crop" },
  { name: "Chyawanprash 500g", price: 310, category: "Ayush", rating: 4.9, reviews: 850, uses: "Traditional immunity builder rich in Vitamin C.", warning: "Diabetics must use sugar-free variant.", limit: "1-2 spoons daily.", expiry: "Jan 2026", beforeUse: "Best consumed with warm milk.", imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&fit=crop" },

  // Homeopathy
  { name: "Arnica Hair Oil", price: 210, category: "Homeopathy", rating: 4.5, reviews: 190, uses: "Controls hair fall and prevents premature graying.", warning: "For external scalp use only.", limit: "Massage deeply 2 times a week.", expiry: "Sep 2026", beforeUse: "Shake before application.", imageUrl: "https://images.unsplash.com/photo-1608248593842-8395f1712a32?q=80&w=400&fit=crop" },
  { name: "Nux Vomica 30CH", price: 110, category: "Homeopathy", rating: 4.4, reviews: 80, uses: "Fast acting homeopathic relief for digestion/acidity.", warning: "Avoid strong smells while taking medication.", limit: "4-5 globules 3 times a day.", expiry: "Dec 2028", beforeUse: "Do not touch globules with bare hands.", imageUrl: "https://images.unsplash.com/photo-1628771457497-7c050a41d73c?q=80&w=400&fit=crop" }
];

Medicine.sync().then(async () => {
  let logStr = "Started processing injection...\n";
  try {
    for (const prod of newProducts) {
      const existing = await Medicine.findOne({ where: { name: prod.name } });
      if (!existing) {
        await Medicine.create(prod);
        logStr += `Injected: ${prod.name}\n`;
      } else {
        logStr += `Skipped (Already exists): ${prod.name}\n`;
      }
    }
    logStr += "✅ Successfully injected 21 new unique items into the Medicine dashboard database!\n";
  } catch (err) {
    logStr += `ERROR: ${err.message}\n${err.stack}\n`;
  }
  fs.writeFileSync('seed-more-output.log', logStr);
  process.exit();
}).catch(err => {
  fs.writeFileSync('seed-more-output.log', `ROOT ERROR: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});

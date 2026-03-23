const { Medicine, sequelize } = require('./models');
const fs = require('fs');

async function run() {
  let log = "";
  try {
    log += "Connecting...\n";
    await sequelize.authenticate();
    log += "Connected successfully.\n";
    
    // Also try seeding here just in case!
    const products = [
      { name: "Paracetamol 500mg", price: 30, category: "Medicine", rating: 4.5, reviews: 120, uses: "Relieves mild to moderate pain and fever.", warning: "Do not exceed 4000mg per day.", limit: "1-2 tablets max.", expiry: "Dec 2026", beforeUse: "Store below 25C.", imageUrl: "/images/medicines/paracetamol_500mg_1774028012018.png" },
      { name: "Vitamin C Tablets", price: 50, category: "Medicine", rating: 4.8, reviews: 85, uses: "Boosts immune system.", warning: "None.", limit: "1 tablet daily.", expiry: "Mar 2026", beforeUse: "Keep closed.", imageUrl: "/images/medicines/vitamin_c_tablets_1774028034331.png" }
    ];
    
    log += "Syncing Medicine table...\n";
    await Medicine.sync();
    log += "Sync complete.\n";
    
    let count = await Medicine.count();
    log += "Count before seed: " + count + "\n";
    
    if (count === 0) {
      await Medicine.bulkCreate(products);
      let countAfter = await Medicine.count();
      log += "Count after seed: " + countAfter + "\n";
    }
  } catch(e) {
    log += "ERROR: " + e.stack + "\n";
  } finally {
    fs.writeFileSync('tester.log', log);
    process.exit();
  }
}
run();

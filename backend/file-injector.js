const fs = require('fs');
fs.writeFileSync('injector.log', 'Initiating MySQL Sequelize Engine...\n');

try {
  require('dotenv').config();
  const { sequelize, Medicine } = require('./models');
  const products = require('./medicine-data');
  
  fs.appendFileSync('injector.log', `Loaded exactly ${products.length} models for mapping.\n`);

  sequelize.sync({ alter: false }).then(async () => {
    fs.appendFileSync('injector.log', 'Synchronized successfully. Commencing insertion block...\n');
    try {
      let count = 0;
      for(let prod of products) {
        const exist = await Medicine.findOne({ where: { name: prod.name }});
        if(!exist) {
           await Medicine.create(prod);
           count++;
        }
      }
      fs.appendFileSync('injector.log', `✅ Injection COMPLETE! Native insert count: ${count}\n`);
      process.exit(0);
    } catch (e) {
      fs.appendFileSync('injector.log', `Bulk Create Error: ${e.message}\n`);
      process.exit(1);
    }
  }).catch(err => {
      fs.appendFileSync('injector.log', `Sync Rejection Error: ${err.message}\n`);
      process.exit(1);
  });
} catch (e) {
  fs.appendFileSync('injector.log', `Model Rejection Error: ${e.message}\n`);
  process.exit(1);
}

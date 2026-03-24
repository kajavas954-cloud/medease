require('dotenv').config();
const { sequelize, Medicine } = require('./models');
const products = require('./medicine-data');

console.log("Forcing a MySQL table drop and recreation cascade...");
sequelize.sync({ force: true }).then(async () => {
    try {
        console.log(`Injecting ${products.length} products dynamically...`);
        await Medicine.bulkCreate(products);
        console.log('✅ SUCCESSFULLY RE-SEEDED ALL ITEMS NATIVELY!');
    } catch(err) {
        console.error('ERROR SEEDING: ', err);
    }
    console.log("Exiting execution block.");
    process.exit(0);
});

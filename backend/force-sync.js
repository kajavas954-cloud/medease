require('dotenv').config();
const { sequelize } = require('./models');
const fs = require('fs');

async function forceSync() {
  let log = "";
  try {
    log += 'Authenticating...\n';
    await sequelize.authenticate();
    log += 'Syncing database with alter: true...\n';
    await sequelize.sync({ alter: true });
    log += 'SUCCESS! Database tables have been updated with new columns.\n';
  } catch (error) {
    log += 'ERROR syncing database: ' + error.toString() + '\n';
  } finally {
    fs.writeFileSync('force-sync.log', log);
    process.exit();
  }
}

forceSync();

forceSync();

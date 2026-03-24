const fs = require('fs');
const http = require('http');

console.log('Auto-reverter started, waiting for port 5000 to stabilize with >50 JSON items...');

function check() {
  http.get('http://localhost:5000/api/medicines', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const data = JSON.parse(rawData);
        if (data.length > 50) {
          console.log('Seeded successfully with ' + data.length + ' items!');
          const path = './server.js';
          let code = fs.readFileSync(path, 'utf8');
          if (code.includes('sequelize.sync({ force: true })')) {
            code = code.replace('sequelize.sync({ force: true })', 'sequelize.sync({ alter: true })');
            fs.writeFileSync(path, code);
            console.log('Reverted server.js safely back to alter mode.');
          }
          process.exit(0);
        } else {
          setTimeout(check, 3000);
        }
      } catch (e) {
        setTimeout(check, 3000);
      }
    });
  }).on('error', (e) => {
    setTimeout(check, 3000);
  });
}

check();

const { execSync } = require('child_process');
const fs = require('fs');
try {
  console.log("Running seed.js...");
  const result = execSync('node seed.js', { encoding: 'utf8' });
  fs.writeFileSync('seed_output.log', "SUCCESS:\n" + result);
} catch (e) {
  fs.writeFileSync('seed_output.log', "ERROR:\n" + e.stdout + '\n' + e.stderr);
}

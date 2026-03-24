const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Running seed-more.js...");
  const result = execSync('node seed-more.js', { encoding: 'utf8' });
  fs.writeFileSync('seed-more-debug.log', "SUCCESS:\n" + result);
  console.log("Finished executing, output logged.");
} catch (e) {
  fs.writeFileSync('seed-more-debug.log', "ERROR:\nSTDOUT:\n" + e.stdout + '\nSTDERR:\n' + e.stderr);
  console.log("Executed with errors, output logged.");
}

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /#2980b9/g, replace: '#1abc9c' },
  { search: /#3498db/g, replace: '#1abc9c' },
  { search: /#1f6391/g, replace: '#16a085' },
  { search: /#6dd5fa/g, replace: '#a8e6cf' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const r of replacements) {
        if (content.match(r.search)) {
          content = content.replace(r.search, r.replace);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done!');

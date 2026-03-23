const fs = require('fs');

fetch('http://localhost:5000/api/medicines')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    fs.writeFileSync('medicines-check.log', `SUCCESS: Found ${data.length} medicines.\n`);
  })
  .catch(err => {
    fs.writeFileSync('medicines-check.log', `ERROR: ${err.message}\n`);
  });

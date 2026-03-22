const fs = require('fs');
const path = require('path');

const sourceDir = "C:\\Users\\vijit\\.gemini\\antigravity\\brain\\3bd24aff-8383-4180-954e-828bb676a516";
const destDir = "c:\\Users\\vijit\\OneDrive\\Desktop\\medease\\medease-frontend\\public\\images\\medicines";

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(sourceDir).forEach(file => {
    if (file.endsWith('.png')) {
        fs.copyFileSync(
            path.join(sourceDir, file),
            path.join(destDir, file)
        );
        console.log(`Copied ${file}`);
    }
});
console.log("All AI images copied successfully!");

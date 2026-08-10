const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../frontend/src');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const prefix = "(import.meta.env.VITE_API_URL || '') + ";

walk(directoryPath, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace fetch('/api/...
        if (content.includes("fetch('/api/")) {
            content = content.replace(/fetch\('\/api\//g, "fetch((import.meta.env.VITE_API_URL || '') + '/api/");
            modified = true;
        }

        // Replace fetch(`/api/...
        if (content.includes("fetch(`/api/")) {
            content = content.replace(/fetch\(`\/api\//g, "fetch((import.meta.env.VITE_API_URL || '') + `/api/");
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    }
});

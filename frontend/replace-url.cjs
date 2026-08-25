const fs = require('fs');
const path = require('path');

const targetUrl = 'https://myclaimportal.onrender.com';
const localUrl = 'http://localhost:5005';

function replaceInDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      replaceInDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(targetUrl)) {
        const newContent = content.split(targetUrl).join(localUrl);
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceInDirectory(path.join(__dirname, 'src'));
console.log('Done!');

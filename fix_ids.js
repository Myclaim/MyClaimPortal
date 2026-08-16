const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('frontend/src/pages', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Pattern 1: X.client_id_ref || `PREFIX-${parseInt(String().substring(0,8), 16) * 1000}
    // Note: the `PREFIX` part can contain -, like `CLT-`
    newContent = newContent.replace(/([a-zA-Z0-9_?]+)\.client_id_ref\s*\|\|\s*\`([A-Z0-9_-]+)\$\{parseInt\(String\(\)\.substring\(0,8\), 16\) \* 1000/g, (match, p1, p2) => {
      let objVar = p1;
      return `${objVar}.client_id_ref || \`${p2}\${parseInt(String(${objVar}._id).substring(0,8), 16).toString(36).toUpperCase()}`;
    });

    // Pattern 2: editForm.role ... `PREFIX-${parseInt(String().substring(0,8), 16) * 1000}
    // E.g. in Users.jsx
    newContent = newContent.replace(/\`\$\{([^\}]+)\}-\$\{parseInt\(String\(\)\.substring\(0,8\), 16\) \* 1000/g, (match, p1) => {
       // We can just use the object from p1. E.g. editForm.role -> editForm
       let obj = p1.split('.')[0] || 'u';
       return `\`\$\{${p1}\}-\$\{parseInt(String(${obj}._id).substring(0,8), 16).toString(36).toUpperCase()}`;
    });

    // Pattern 3: t._id ? parseInt(String().substring(0,8), 16) * 1000 : '0000'
    newContent = newContent.replace(/([a-zA-Z0-9_?]+)\._id \? parseInt\(String\(\)\.substring\(0,8\), 16\) \* 1000 : '0000'/g, (match, p1) => {
      return `${p1}._id ? parseInt(String(${p1}._id).substring(0,8), 16).toString(36).toUpperCase() : '0000'`;
    });

    // Pattern 4: any remaining parseInt(String().substring(0,8), 16) * 1000
    // Try to fallback to u._id
    newContent = newContent.replace(/parseInt\(String\(\)\.substring\(0,8\), 16\) \* 1000/g, 'parseInt(String(u._id).substring(0,8), 16).toString(36).toUpperCase()');

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Fixed:', filePath);
    }
  }
});

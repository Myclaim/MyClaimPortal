const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const brokenPattern = 'CLT-\\';
let found = [];

walk('frontend/src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(brokenPattern)) {
      found.push(filePath);
    }
  }
});

if (found.length === 0) {
  console.log('✅ No broken patterns found!');
} else {
  console.log('❌ Found broken patterns in:');
  found.forEach(f => console.log(' -', f));
  
  // Auto-fix each file
  found.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix all variable names: x.client_id_ref || CLT-\,
    const patterns = [
      // With 8 spaces indent
      [/^( +)const uid = u\.client_id_ref \|\| CLT-\\;$/mg,
       `$1const uid = u.client_id_ref || \`CLT-\${parseInt(String(u._id).substring(0,8), 16)}\`;`],
      // data.client_id_ref
      [/^( +)id: data\.client_id_ref \|\| CLT-\\,$/mg,
       `$1id: data.client_id_ref || \`CLT-\${parseInt(String(data._id).substring(0,8), 16)}\`,`],
      // l.client_id_ref
      [/^( +)id: l\.client_id_ref \|\| CLT-\\,$/mg,
       `$1id: l.client_id_ref || \`CLT-\${parseInt(String(l._id).substring(0,8), 16)}\`,`],
      // c.client_id_ref
      [/^( +)id: c\.client_id_ref \|\| CLT-\\,$/mg,
       `$1id: c.client_id_ref || \`CLT-\${parseInt(String(c._id).substring(0,8), 16)}\`,`],
    ];
    
    patterns.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', filePath);
  });
}

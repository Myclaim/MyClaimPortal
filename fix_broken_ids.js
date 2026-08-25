const fs = require('fs');
const filePath = 'frontend/src/pages/dashboards/super-partner/SuperPartnerDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

let count = 0;

// Fix all broken patterns - each has a different variable prefix
const replacements = [
  // Pattern: id: l.client_id_ref || CLT-\,
  [`          id: l.client_id_ref || CLT-\\,`, `          id: l.client_id_ref || \`CLT-\${parseInt(String(l._id).substring(0,8), 16)}\`,`],
  // Pattern: id: c.client_id_ref || CLT-\,
  [`          id: c.client_id_ref || CLT-\\,`, `          id: c.client_id_ref || \`CLT-\${parseInt(String(c._id).substring(0,8), 16)}\`,`],
  // Pattern: id: data.client_id_ref || CLT-\,  (with extra indentation)
  [`            id: data.client_id_ref || CLT-\\,`, `            id: data.client_id_ref || \`CLT-\${parseInt(String(data._id).substring(0,8), 16)}\`,`],
];

for (const [broken, fixed] of replacements) {
  if (content.includes(broken)) {
    content = content.replace(broken, fixed);
    count++;
    console.log('Fixed:', broken.trim());
  } else {
    console.log('NOT FOUND:', broken.trim());
  }
}

fs.writeFileSync(filePath, content);
console.log(`Done. Fixed ${count} patterns.`);

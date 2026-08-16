const fs = require('fs');
const filePath = 'frontend/src/pages/user-lists/ClientForm.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const broken = `                                const uid = u.client_id_ref || CLT-\\;`;
const fixed  = `                                const uid = u.client_id_ref || \`CLT-\${parseInt(String(u._id).substring(0,8), 16)}\`;`;

let count = 0;
while (content.includes(broken)) {
  content = content.replace(broken, fixed);
  count++;
}

fs.writeFileSync(filePath, content);
console.log(`Fixed ${count} occurrences in ClientForm.jsx`);

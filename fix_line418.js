const fs = require('fs');
const filePath = 'frontend/src/pages/dashboards/super-partner/SuperPartnerDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The broken string we need to replace (handles both CRLF and LF)
const broken = `        id: data.client_id_ref || CLT-\\,`;
const fixed  = `        id: data.client_id_ref || \`CLT-\${parseInt(String(data._id).substring(0,8), 16)}\`,`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(filePath, content);
  console.log('Fixed line 418 successfully');
} else {
  // Show what's around that area
  const lines = content.split(/\r?\n/);
  console.log('Line 416-420:');
  lines.slice(415, 420).forEach((l, i) => console.log(415+i+1, JSON.stringify(l)));
}

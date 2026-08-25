const fs = require('fs');

const files = [
  'frontend/src/pages/dashboards/partner/PartnerDashboard.jsx',
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;

  const replacements = [
    [`          id: l.client_id_ref || CLT-\\,`, `          id: l.client_id_ref || \`CLT-\${parseInt(String(l._id).substring(0,8), 16)}\`,`],
    [`          id: c.client_id_ref || CLT-\\,`, `          id: c.client_id_ref || \`CLT-\${parseInt(String(c._id).substring(0,8), 16)}\`,`],
    [`            id: data.client_id_ref || CLT-\\,`, `            id: data.client_id_ref || \`CLT-\${parseInt(String(data._id).substring(0,8), 16)}\`,`],
    [`        id: data.client_id_ref || CLT-\\,`, `        id: data.client_id_ref || \`CLT-\${parseInt(String(data._id).substring(0,8), 16)}\`,`],
  ];

  for (const [broken, fixed] of replacements) {
    while (content.includes(broken)) {
      content = content.replace(broken, fixed);
      count++;
      console.log(`Fixed in ${filePath}:`, broken.trim());
    }
  }

  if (count > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`Saved ${filePath}. Fixed ${count} patterns.`);
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
});

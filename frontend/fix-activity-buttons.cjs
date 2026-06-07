const fs = require('fs');
const file = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/pages/activity/Activity.jsx';
let content = fs.readFileSync(file, 'utf8');

// The Quick filter buttons
content = content.replace(/background: filter === r \? '#16a34a' : 'transparent',/g, "background: filter === r ? 'var(--blue)' : 'var(--card)',");
content = content.replace(/color: filter === r \? '#fff' : 'var\(--text-muted\)',/g, "color: filter === r ? '#fff' : 'var(--text)',");
content = content.replace(/borderColor: filter === r \? '#16a34a' : 'var\(--border\)',/g, "borderColor: filter === r ? 'var(--blue)' : 'var(--border)',");

fs.writeFileSync(file, content);
console.log('Fixed Activity log buttons');

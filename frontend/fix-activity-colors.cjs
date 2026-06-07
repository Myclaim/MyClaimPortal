const fs = require('fs');
const file = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/pages/activity/Activity.jsx';
let content = fs.readFileSync(file, 'utf8');

// The timeline dots have hardcoded dark green color #15803d
content = content.replace(/color: '#15803d'/g, "color: 'var(--blue)'");

// Any other #15803d hardcoded
content = content.replace(/#15803d/g, "var(--blue)");

// Any #16a34a hardcoded
content = content.replace(/#16a34a/g, "var(--green)");

fs.writeFileSync(file, content);
console.log('Fixed hardcoded dark green colors in Activity Log');

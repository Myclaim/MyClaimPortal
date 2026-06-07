const fs = require('fs');
const file = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/pages/hr/Users.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.btn-primary \{([^}]+)color: #000;/g, '.btn-primary {$1color: #ffffff;');
content = content.replace(/\.btn-create-rect \{([^}]+)color: #000;/g, '.btn-create-rect {$1color: #ffffff;');
content = content.replace(/\.um-icon-badge \{([^}]+)color: #000;/g, '.um-icon-badge {$1color: #ffffff;');

fs.writeFileSync(file, content);
console.log('Fixed extra dark text on green buttons');

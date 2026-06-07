const fs = require('fs');

// 1. Fix index.css
let indexFile = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/index.css';
let indexContent = fs.readFileSync(indexFile, 'utf8');
// Replace extra dark greens with vibrant emeralds
indexContent = indexContent.replace(/--green: #166534;/g, '--green: #059669;');
indexContent = indexContent.replace(/--blue: #15803d;/g, '--blue: #10b981;');
fs.writeFileSync(indexFile, indexContent);

// 2. Fix Users.jsx gradients
let usersFile = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/pages/hr/Users.jsx';
let usersContent = fs.readFileSync(usersFile, 'utf8');
// Make the linear gradient use the global variables instead of hardcoded dark greens
usersContent = usersContent.replace(/linear-gradient\(135deg, #0F9D58, #22C55E, #34D399\)/g, 'linear-gradient(135deg, var(--green), var(--blue))');
fs.writeFileSync(usersFile, usersContent);

// 3. DepartmentBoard.jsx is already using var(--green) and var(--blue), so it will automatically be fixed by index.css change.

console.log('Fixed extra dark green color globally');

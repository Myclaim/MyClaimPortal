const fs = require('fs');
const file = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/pages/departments/DepartmentBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Variable mappings
content = content.replace(/var\(--text-primary\)/g, 'var(--text)');
content = content.replace(/var\(--text-secondary\)/g, 'var(--text-muted)');
content = content.replace(/var\(--glass-border\)/g, 'var(--border)');
content = content.replace(/var\(--accent-green\)/g, 'var(--green)');
content = content.replace(/var\(--card-bg\)/g, 'var(--card)');
content = content.replace(/var\(--bg-primary\)/g, 'var(--bg)');
content = content.replace(/var\(--muted\)/g, 'var(--text-light)');

// CSS hardcoded colors to CSS variables
content = content.replace(/rgba\(13, 19, 38, 0\.4\)/g, 'var(--bg)');
content = content.replace(/rgba\(255,255,255,0\.02\)/g, 'var(--sidebar-hover)');
content = content.replace(/border-bottom: 1px solid rgba\(255,255,255,0\.03\)/g, 'border-bottom: 1px solid var(--border)');
content = content.replace(/border-bottom: 1px solid rgba\(255,255,255,0\.05\)/g, 'border-bottom: 1px solid var(--border)');

// toggle background and tab count
content = content.replace(/background: rgba\(255,255,255,0\.1\)/g, 'background: var(--border)');
content = content.replace(/background: rgba\(255,255,255,0\.03\)/g, 'background: var(--sidebar-hover)');

// toggle dot shadow
content = content.replace(/border-radius: 50%; transition: 0\.3s; }/g, 'border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }');

// Primary button gradient fix
content = content.replace(/linear-gradient\(135deg, #059669, var\(--green\)\)/g, 'linear-gradient(135deg, var(--green), var(--blue))');

fs.writeFileSync(file, content);
console.log('Fixed CSS theme variables');

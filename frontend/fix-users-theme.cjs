const fs = require('fs');
const file = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/pages/hr/Users.jsx';
let content = fs.readFileSync(file, 'utf8');

// Global variable replacements for compatibility
content = content.replace(/var\(--bg-primary\)/g, 'var(--bg)');
content = content.replace(/var\(--bg-secondary\)/g, 'var(--card)');
content = content.replace(/var\(--card-bg\)/g, 'var(--card)');
content = content.replace(/var\(--text-primary\)/g, 'var(--text)');
content = content.replace(/var\(--text-secondary\)/g, 'var(--text-muted)');
content = content.replace(/var\(--glass-border\)/g, 'var(--border)');
content = content.replace(/var\(--accent-green\)/g, 'var(--green)');
content = content.replace(/var\(--neon-green\)/g, 'var(--green)');
content = content.replace(/var\(--muted\)/g, 'var(--text-light)');

// Specific hardcoded RGBA to green/light theme variables
content = content.replace(/rgba\(13, 19, 38, 0\.5\)/g, 'var(--green-light)');
content = content.replace(/rgba\(13, 19, 38, 0\.3\)/g, 'var(--sidebar-hover)'); 
content = content.replace(/border-bottom: 1px solid rgba\(255,255,255,0\.03\)/g, 'border-bottom: 1px solid var(--border)');
content = content.replace(/rgba\(17, 24, 45, 0\.5\)/g, 'var(--card)');
content = content.replace(/rgba\(17, 24, 45, 0\.8\)/g, 'var(--sidebar-hover)');

// Other specific color fixes to use theme vars instead of dark specific
content = content.replace(/background: #000/g, 'background: var(--sidebar-hover)');
content = content.replace(/rgba\(34, 197, 94, 0\.03\)/g, 'var(--sidebar-hover)');
content = content.replace(/color: #000/g, 'color: var(--text)');

fs.writeFileSync(file, content);
console.log('Fixed CSS theme variables for Users.jsx');

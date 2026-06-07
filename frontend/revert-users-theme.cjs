const fs = require('fs');
const file = '/Users/prathmesh/Downloads/My_Claim-main 11/frontend/src/pages/hr/Users.jsx';
let content = fs.readFileSync(file, 'utf8');

// The user liked the "previous combo" (likely what we did in DepartmentBoard.jsx where we used var(--bg) and var(--border) and var(--card))
// They said "some area is very dark for current", which might mean var(--green-light) in dark mode was too dark (it's 0.15 opacity),
// or they just prefer var(--bg) for table headers and section headers.

// Let's replace the var(--green-light) in headers with var(--bg)
content = content.replace(/\.fintech-section-header \{([^}]+)background: var\(--green-light\);/g, '.fintech-section-header {$1background: var(--bg);');

// And the table header background: var(--sidebar-hover) to var(--bg)
content = content.replace(/\.fintech-table th \{([^}]+)background: var\(--sidebar-hover\);/g, '.fintech-table th {$1background: var(--bg);');

// For the primary buttons, let's restore the color to #000 or #fff if they looked weird.
// Wait, the primary button is linear-gradient green, so color #000 is usually best.
content = content.replace(/\.btn-primary \{([^}]+)color: var\(--text\);/g, '.btn-primary {$1color: #000;');
content = content.replace(/\.btn-create-rect \{([^}]+)color: var\(--text\);/g, '.btn-create-rect {$1color: #000;');
content = content.replace(/\.um-icon-badge \{([^}]+)color: var\(--text\);/g, '.um-icon-badge {$1color: #000;');

// For um-search-input:focus, background: var(--sidebar-hover) might be weird. Let's make it var(--bg) or transparent.
content = content.replace(/\.um-search-input:focus \{([^}]+)background: var\(--sidebar-hover\);/g, '.um-search-input:focus {$1background: var(--bg);');

fs.writeFileSync(file, content);
console.log('Reverted to previous combo for Users.jsx');

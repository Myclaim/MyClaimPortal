const fs = require('fs');

// --- 1. Update index.css ---
const cssPath = 'c:/Users/Smart User/My_Claim/frontend/src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Update variables to pure frosted glass
css = css.replace(/--sidebar: rgba\(29, 26, 57, 0\.95\);/g, '--sidebar: rgba(255, 255, 255, 0.03);');
css = css.replace(/--sidebar-bg: rgba\(29, 26, 57, 0\.95\);/g, '--sidebar-bg: rgba(255, 255, 255, 0.03);');
css = css.replace(/--card-bg: rgba\(29, 26, 57, 0\.4\);/g, '--card-bg: rgba(255, 255, 255, 0.05);');
css = css.replace(/--card: rgba\(29, 26, 57, 0\.4\);/g, '--card: rgba(255, 255, 255, 0.05);');
css = css.replace(/--border: rgba\(232, 188, 185, 0\.2\);/g, '--border: rgba(255, 255, 255, 0.12);');
css = css.replace(/--sidebar-hover: rgba\(69, 25, 82, 0\.5\);/g, '--sidebar-hover: rgba(255, 255, 255, 0.1);');

// Add global glassmorphism styles if missing
const topbarRegex = /\.topbar \{[\s\S]*?\}/;
if (css.match(topbarRegex)) {
  css = css.replace(topbarRegex, `.topbar { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-bottom: 1px solid var(--border); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); position: sticky; top: 0; z-index: 100; transition: all 0.3s; }`);
}

// Enhance sidebar glass
const sidebarRegex = /\.sidebar \{[\s\S]*?z-index: 100;[\s\S]*?\}/;
if (css.match(sidebarRegex)) {
  css = css.replace(sidebarRegex, `.sidebar { width: 240px; background: var(--sidebar); height: 100vh; overflow-y: auto; flex-shrink: 0; display: flex; flex-direction: column; z-index: 100; border-right: 1px solid var(--border); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1); }`);
}

fs.writeFileSync(cssPath, css, 'utf8');

// --- 2. Update useClientTheme.js ---
const themePath = 'c:/Users/Smart User/My_Claim/frontend/src/hooks/useClientTheme.js';
let themeCode = fs.readFileSync(themePath, 'utf8');

themeCode = themeCode.replace(/--sidebar: rgba\(29, 26, 57, 0\.95\) !important;/g, '--sidebar: rgba(255, 255, 255, 0.03) !important;');
themeCode = themeCode.replace(/--sidebar-bg: rgba\(29, 26, 57, 0\.95\) !important;/g, '--sidebar-bg: rgba(255, 255, 255, 0.03) !important;');
themeCode = themeCode.replace(/--card: rgba\(29, 26, 57, 0\.4\) !important;/g, '--card: rgba(255, 255, 255, 0.05) !important;');
themeCode = themeCode.replace(/--border: rgba\(232, 188, 185, 0\.2\) !important;/g, '--border: rgba(255, 255, 255, 0.12) !important;');
themeCode = themeCode.replace(/--sidebar-hover: rgba\(69, 25, 82, 0\.5\) !important;/g, '--sidebar-hover: rgba(255, 255, 255, 0.1) !important;');

themeCode = themeCode.replace(/\.sidebar \{ background: rgba\(29, 26, 57, 0\.95\) !important; backdrop-filter: blur\(20px\); border-right: 1px solid rgba\(232, 188, 185, 0\.15\) !important; \}/g, '.sidebar { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(24px) !important; -webkit-backdrop-filter: blur(24px) !important; border-right: 1px solid rgba(255, 255, 255, 0.12) !important; box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1) !important; }');
themeCode = themeCode.replace(/\.topbar \{ background: transparent !important; border-bottom: 1px solid rgba\(232, 188, 185, 0\.15\) !important; \}/g, '.topbar { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(24px) !important; -webkit-backdrop-filter: blur(24px) !important; border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important; }');

fs.writeFileSync(themePath, themeCode, 'utf8');

console.log('Successfully applied frosted glass finish globally!');

const fs = require('fs');

// 1. Update index.css
const cssPath = 'src/index.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Insert variables into :root
if (!cssContent.includes('--dashboard-bg:')) {
  cssContent = cssContent.replace(/:root\s*\{/, `:root {
  --dashboard-bg: #F8FAFC;
  --dashboard-bg-image: radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.06) 0%, transparent 60%), radial-gradient(circle at 90% 100%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
  --dashboard-card: rgba(255, 255, 255, 0.7);
  --dashboard-card-image: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%);
  --dashboard-card-soft: rgba(255, 255, 255, 0.5);
  --dashboard-border: rgba(0, 0, 0, 0.06);
  --dashboard-text: #0f172a;
  --dashboard-text-muted: #64748b;
  --dashboard-accent: #10B981;
`);
}

// Insert variables into .dark
if (!cssContent.includes('--dashboard-bg: #030712')) {
  cssContent = cssContent.replace(/\.dark\s*\{/, `.dark {
  --dashboard-bg: #030712;
  --dashboard-bg-image: radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.04) 0%, transparent 60%), radial-gradient(circle at 90% 100%, rgba(16, 185, 129, 0.02) 0%, transparent 50%);
  --dashboard-card: rgba(255, 255, 255, 0.02);
  --dashboard-card-image: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 40%);
  --dashboard-card-soft: rgba(255, 255, 255, 0.01);
  --dashboard-border: rgba(255, 255, 255, 0.04);
  --dashboard-text: #f8fafc;
  --dashboard-text-muted: #94a3b8;
  --dashboard-accent: #10B981;
`);
}
fs.writeFileSync(cssPath, cssContent);

// 2. Update ClientDashboard.jsx
const path1 = 'src/pages/dashboards/client/ClientDashboard.jsx';
let content1 = fs.readFileSync(path1, 'utf8');

content1 = content1.replace(/const CL = \{[\s\S]*?\};/, `const CL = {
  bg: 'var(--dashboard-bg)',
  bgImage: 'var(--dashboard-bg-image)',
  card: 'var(--dashboard-card)', 
  cardBgImage: 'var(--dashboard-card-image)',
  cardSoft: 'var(--dashboard-card-soft)',
  border: 'var(--dashboard-border)', 
  text: 'var(--dashboard-text)',              
  textMuted: 'var(--dashboard-text-muted)',         
  accent: 'var(--dashboard-accent)',            
  accentSoft: 'rgba(16, 185, 129, 0.15)',
  green: 'var(--dashboard-accent)',
  greenSoft: 'rgba(16, 185, 129, 0.08)'
};`);

fs.writeFileSync(path1, content1);

// 3. Update ClientServiceHub.jsx
const path2 = 'src/pages/dashboards/client/ClientServiceHub.jsx';
let content2 = fs.readFileSync(path2, 'utf8');

content2 = content2.replace(/const C = \{[\s\S]*?\};/, `const C = {
  bg:          'var(--dashboard-bg)',
  bgImage:     'var(--dashboard-bg-image)',
  bgCard:      'var(--dashboard-card)',
  bgCardImage: 'var(--dashboard-card-image)',
  bgCard2:     'var(--dashboard-card-soft)',
  border:      'var(--dashboard-border)',
  borderGreen: 'rgba(16,185,129,0.25)',
  text:        'var(--dashboard-text)',
  textMuted:   'var(--dashboard-text-muted)',
  textSub:     'var(--dashboard-text-muted)',
  green:       'var(--dashboard-accent)',
  greenSoft:   'rgba(16,185,129,0.10)',
  greenGlow:   'rgba(16,185,129,0.18)',
  greenDark:   '#059669',
};`);

fs.writeFileSync(path2, content2);
console.log('Fixed theme synchronization in ClientDashboard.jsx, ClientServiceHub.jsx, and index.css');

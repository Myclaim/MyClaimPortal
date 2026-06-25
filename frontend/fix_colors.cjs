const fs = require('fs');

const path1 = 'src/pages/dashboards/client/ClientDashboard.jsx';
let content1 = fs.readFileSync(path1, 'utf8');

content1 = content1.replace(/const CL = \{[\s\S]*?\};/, `const CL = {
  bg: 'var(--bg)',               
  card: 'var(--card)', 
  cardSoft: 'var(--bg-secondary, #f1f5f9)',
  border: 'var(--border)', 
  text: 'var(--text)',              
  textMuted: 'var(--text-muted)',         
  accent: 'var(--accent-green)',            
  accentSoft: 'rgba(16, 185, 129, 0.15)',
  green: 'var(--accent-green)',
  greenSoft: 'rgba(16, 185, 129, 0.08)'
};`);

content1 = content1.replace(/#0B1120/g, "CL.bg");
content1 = content1.replace(/'rgba\(255, 255, 255, 0\.0\d\)'/g, "CL.border");
content1 = content1.replace(/'rgba\(255,\s?255,\s?255,\s?0\.\d+\)'/g, "CL.border");
content1 = content1.replace(/'#F8FAFC'/g, "CL.text");
content1 = content1.replace(/'#94A3B8'/g, "CL.textMuted");
content1 = content1.replace(/'#050B14'/g, "CL.bg");
content1 = content1.replace(/rgba\(11,17,32,0\.85\)/g, "var(--card)");
content1 = content1.replace(/rgba\(5,11,20,0\.95\)/g, "var(--bg)");
content1 = content1.replace(/'linear-gradient.*?rgba\(5,11,20,0\.3\)\)'/g, "CL.card");
content1 = content1.replace(/border: '1px solid rgba\(255,255,255,0\.04\)'/g, "border: `1px solid ${CL.border}`");
content1 = content1.replace(/rgba\(255, 255, 255, 0\.06\)/g, "var(--border)");
content1 = content1.replace(/rgba\(255, 255, 255, 0\.05\)/g, "var(--border)");
content1 = content1.replace(/rgba\(255, 255, 255, 0\.04\)/g, "var(--border)");

fs.writeFileSync(path1, content1);

const path2 = 'src/pages/dashboards/client/ClientServiceHub.jsx';
let content2 = fs.readFileSync(path2, 'utf8');

content2 = content2.replace(/const C = \{[\s\S]*?\};/, `const C = {
  bg:          'var(--bg)',
  bgCard:      'var(--card)',
  bgCard2:     'var(--bg-secondary, #f8fafc)',
  border:      'var(--border)',
  borderGreen: 'rgba(16,185,129,0.25)',
  text:        'var(--text)',
  textMuted:   'var(--text-muted)',
  textSub:     'var(--text-muted)',
  green:       'var(--accent-green)',
  greenSoft:   'rgba(16,185,129,0.10)',
  greenGlow:   'rgba(16,185,129,0.18)',
  greenDark:   'var(--accent-green)',
};`);

content2 = content2.replace(/#fff/g, "C.bg");
content2 = content2.replace(/rgba\(255,255,255,0\.05\)/g, "var(--border)");
content2 = content2.replace(/rgba\(255,255,255,0\.07\)/g, "var(--border)");

fs.writeFileSync(path2, content2);
console.log('Fixed colors in ClientDashboard.jsx and ClientServiceHub.jsx');

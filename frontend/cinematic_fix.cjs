const fs = require('fs');

const path1 = 'src/pages/dashboards/client/ClientDashboard.jsx';
let content1 = fs.readFileSync(path1, 'utf8');

content1 = content1.replace(/const CL = \{[\s\S]*?\};/, `const CL = {
  bg: '#030712',
  bgImage: 'radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.04) 0%, transparent 60%), radial-gradient(circle at 90% 100%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)',
  card: 'rgba(255, 255, 255, 0.02)', 
  cardBgImage: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 40%)',
  cardSoft: 'rgba(255, 255, 255, 0.01)',
  border: 'rgba(255, 255, 255, 0.04)', 
  text: '#f8fafc',              
  textMuted: '#94a3b8',         
  accent: '#10b981',            
  accentSoft: 'rgba(16, 185, 129, 0.15)',
  green: '#10b981',
  greenSoft: 'rgba(16, 185, 129, 0.08)'
};`);

content1 = content1.replace(/<main style={{ minHeight: '100%', padding: '24px', background: CL.bg, color: CL.text }}>/, `<main style={{ minHeight: '100vh', padding: '32px', backgroundColor: CL.bg, backgroundImage: CL.bgImage, color: CL.text, boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)' }}>`);

// Add cinematic styles to cards
content1 = content1.replace(/background: CL\.card/g, "backgroundColor: CL.card, backgroundImage: CL.cardBgImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'");

fs.writeFileSync(path1, content1);

const path2 = 'src/pages/dashboards/client/ClientServiceHub.jsx';
let content2 = fs.readFileSync(path2, 'utf8');

content2 = content2.replace(/const C = \{[\s\S]*?\};/, `const C = {
  bg:          '#030712',
  bgImage:     'radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.04) 0%, transparent 60%), radial-gradient(circle at 90% 100%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)',
  bgCard:      'rgba(255, 255, 255, 0.02)',
  bgCardImage: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 40%)',
  bgCard2:     'rgba(255, 255, 255, 0.04)',
  border:      'rgba(255, 255, 255, 0.04)',
  borderGreen: 'rgba(16,185,129,0.25)',
  text:        '#f8fafc',
  textMuted:   '#94a3b8',
  textSub:     '#94a3b8',
  green:       '#10b981',
  greenSoft:   'rgba(16,185,129,0.10)',
  greenGlow:   'rgba(16,185,129,0.18)',
  greenDark:   '#059669',
};`);

content2 = content2.replace(/background: C\.bg,/g, "backgroundColor: C.bg, backgroundImage: C.bgImage,");
content2 = content2.replace(/background: C\.bgCard/g, "backgroundColor: C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'");
content2 = content2.replace(/background: hovered \? C\.bgCard2 : C\.bgCard/g, "backgroundColor: hovered ? C.bgCard2 : C.bgCard, backgroundImage: C.bgCardImage, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'");

fs.writeFileSync(path2, content2);
console.log('Fixed cinematic dark mode colors in ClientDashboard.jsx and ClientServiceHub.jsx');

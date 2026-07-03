const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/client/ClientDashboard.jsx', 'utf8');
content = content.replace(/\]\.map\(\(s, idx\) => \([\s\S]*?\}\)\)/m, '].map((s, idx) => (\n          <StatChip \n            key={s.label}\n            label={s.label}\n            value={s.value}\n            color={s.color === CL.text ? \'#3B82F6\' : s.color}\n            barColor={s.color === CL.text ? \'#3B82F6\' : s.color}\n            icon={s.icon}\n            delay={idx * 150}\n          />\n        ))');
content = content.replace(/\{claims\.slice\(0, 3\)\.map\(\(claim, i\) => \{[\s\S]*?\}\)\}/m, '{claims.slice(0, 3).map((claim, i) => (\n            <ClaimCard \n              key={i} \n              claim={claim} \n              animDelay={i * 200} \n              onViewDetails={() => navigate(\\'/client?tab=claims\\')}\n            />\n          ))}');
fs.writeFileSync('src/pages/dashboards/client/ClientDashboard.jsx', content);
console.log('done');


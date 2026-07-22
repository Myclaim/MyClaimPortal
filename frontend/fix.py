
with open('src/pages/dashboards/client/ClientDashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

lines[1677] = '        ].map((s, idx) => ('
lines[1678] = '          <StatChip key={s.label} label={s.label} value={s.value} color={s.color === CL.text ? \'#3B82F6\' : s.color} barColor={s.color === CL.text ? \'#3B82F6\' : s.color} icon={s.icon} delay={idx * 150} />'
lines[1688] = '        ))}'

for i in range(1679, 1688):
    lines[i] = '          '

lines[1706] = '          {claims.slice(0, 3).map((claim, i) => ('
lines[1707] = '            <ClaimCard key={i} claim={claim} animDelay={i * 200} onViewDetails={() => navigate(\'/client?tab=claims\')} />'
lines[1731] = '          ))}'

for i in range(1708, 1731):
    lines[i] = '          '

with open('src/pages/dashboards/client/ClientDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))


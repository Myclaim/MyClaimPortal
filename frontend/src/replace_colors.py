import re

path = r'd:\Web Development\Internship\My_Claim\frontend\src\pages\dashboards\client\ClientDashboard.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace hardcoded dark-mode colors with CSS variables
replacements = {
    r'rgba\(255,\s*255,\s*255,\s*0\.03\)': 'var(--dashboard-card-soft)',
    r'rgba\(255,\s*255,\s*255,\s*0\.05\)': 'var(--dashboard-card)',
    r'rgba\(255,\s*255,\s*255,\s*0\.06\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.09\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.1\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.12\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.15\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.2\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.22\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.25\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.28\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.3\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.4\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.45\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.55\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.7\)': 'var(--dashboard-border)',
    r'rgba\(255,\s*255,\s*255,\s*0\.9\)': 'var(--dashboard-card)',
    r'#0f172a': 'var(--dashboard-text)',
    r'#1e293b': 'var(--dashboard-text)',
    r'#334155': 'var(--dashboard-text-muted)',
    r'#475569': 'var(--dashboard-text-muted)',
    r'#64748b': 'var(--dashboard-text-muted)',
    r'#94a3b8': 'var(--dashboard-text-muted)',
    r'#e2e8f0': 'var(--dashboard-border)',
    r'#f1f5f9': 'var(--dashboard-bg)',
    r'#0A0F1C': 'var(--dashboard-bg)',
    r'color:\s*#fff': 'color: var(--dashboard-text)',
    r'color:\s*\'#fff\'': 'color: \'var(--dashboard-text)\''
}

for pattern, repl in replacements.items():
    text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Done!')

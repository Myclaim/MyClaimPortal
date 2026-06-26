const fs = require('fs');
const path = 'd:/Projects/My_Claim/frontend/src/pages/dashboards/client/ClientDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update NavTabs
content = content.replace(
  /const tabs = \[[\s\S]*?\];/,
  `const tabs = [
      { id: 'overview', label: 'Dashboard', icon: BarChart3 },
      { id: 'services', label: 'My Services', icon: Box },
      { id: 'tickets', label: 'My Tickets', icon: Briefcase },
      { id: 'documents',label: 'Documents', icon: FileText },
      { id: 'track-progress', label: 'Track Progress', icon: Activity },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'profile', label: 'Profile', icon: UserCircle },
      { id: 'support', label: 'Support', icon: Shield },
    ];`
);

// 2. Update OverviewTab buttons
content = content.replace(
  /<button className="topbar-btn" onClick=\{\(\) => setActivePage\('services'\)\} style=\{\{ padding: '12px 28px', borderRadius: '12px' \}\}>Track Progress<\/button>\r?\n\s*<button className="topbar-btn secondary" onClick=\{\(\) => setActivePage\('catalog'\)\} style=\{\{ background: 'var\(--banner-btn-secondary\)', borderColor: 'var\(--banner-border\)', color: 'var\(--banner-btn-text\)', padding: '12px 28px', borderRadius: '12px' \}\}>Start New Service<\/button>/,
  `<button className="topbar-btn" onClick={() => setActivePage('track-progress')} style={{ padding: '12px 28px', borderRadius: '12px' }}>Track Progress</button>
            <button className="topbar-btn secondary" onClick={() => setActivePage('support')} style={{ background: 'var(--banner-btn-secondary)', borderColor: 'var(--banner-border)', color: 'var(--banner-btn-text)', padding: '12px 28px', borderRadius: '12px' }}>Contact Support</button>`
);

// 3. Update OverviewTab empty state
content = content.replace(
  /Explore services to start one<\/button>/,
  `Contact Support</button>`
);
content = content.replace(
  /onClick=\{\(\) => setActivePage\('catalog'\)\}(.*?)>Explore services to start one/g,
  `onClick={() => setActivePage('support')}$1>Contact Support`
);

// 4. Update ServicesTab empty state
content = content.replace(
  /You haven't requested any services yet\. Visit our catalog to browse our offerings\./,
  `You haven't requested any services yet. Contact support for assistance.`
);
content = content.replace(
  /onClick=\{\(\) => setActivePage\('catalog'\)\}(.*?)>Browse Catalog<\/button>/,
  `onClick={() => setActivePage('support')}$1>Contact Support</button>`
);

// 5. Remove CatalogTab and requestModal
const startStr = 'const [requestModal, setRequestModal]';
const endStr = '// 4. TICKET DETAILS PAGE';
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
} else {
  console.log('Could not find CatalogTab block');
}

// 6. Remove CatalogTab from render switch
content = content.replace(
  /\{\(activePage === 'catalog' \|\| activePage === 'client-hub'\) && <CatalogTab \/>\}\r?\n\s*/,
  ''
);

// Save back
fs.writeFileSync(path, content);
console.log('ClientDashboard.jsx updated successfully.');

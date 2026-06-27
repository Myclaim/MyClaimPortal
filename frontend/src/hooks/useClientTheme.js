import { useEffect } from 'react';

export const useClientTheme = () => {
  useEffect(() => {
    document.body.style.background = '#030712';
    const oldBg = document.documentElement.style.background;
    document.documentElement.style.background = '#030712';
    document.body.classList.add('client-light-theme'); // reusing the class name for simplicity
    
    let style = document.createElement('style');
    style.id = 'client-theme-override';
    style.innerHTML = `
      :root, .dark, body {
        --bg: #030712 !important;
        --card: rgba(255, 255, 255, 0.02) !important;
        --border: rgba(255, 255, 255, 0.06) !important;
        --text: #F8FAFC !important;
        --text-muted: #94A3B8 !important;
        --sidebar: #050B14 !important;
        --sidebar-bg: #050B14 !important;
        --sidebar-hover: rgba(16, 185, 129, 0.08) !important;
        --sidebar-active: rgba(16, 185, 129, 0.12) !important;
        background: #030712 !important;
        background-image: radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 50%) !important;
        background-attachment: fixed !important;
      }
      .sidebar { background: #050B14 !important; border-right: 1px solid rgba(255, 255, 255, 0.06) !important; box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5) !important; }
      .topbar { background: #030712 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5) !important; }
      .sidebar-item { color: #94A3B8 !important; }
      .sidebar-item:hover { background: rgba(16, 185, 129, 0.08) !important; color: #10B981 !important; }
      .sidebar-logo-text { color: #F8FAFC !important; }
      .topbar-title { color: #F8FAFC !important; }
      .topbar-subtitle { color: #94A3B8 !important; }
      .dark .sidebar-item.active { background: rgba(16, 185, 129, 0.12) !important; color: #10B981 !important; box-shadow: none !important; border-left: 3px solid #10B981 !important; }
      .claim-card, .stat-chip, .detail-section, .client-notif-item, .card-body, .family-node-hover { color: #F8FAFC !important; }
      .claim-card *, .stat-chip *, .detail-section *, .client-notif-item *, .card-body * { color: inherit; }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = oldBg;
      document.body.classList.remove('client-light-theme');
      const s = document.getElementById('client-theme-override');
      if (s) s.remove();
    };
  }, []);
};

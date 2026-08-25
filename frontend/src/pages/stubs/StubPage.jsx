import React from 'react';

const StubPage = ({ title, subtitle }) => {
  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="topbar">
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-subtitle">{subtitle || 'This module is coming soon.'}</div>
        </div>
        <div className="topbar-spacer"></div>
      </div>
      <div style={{ padding: '32px' }}>
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Not implemented yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
            The route exists so navigation works, but the UI is still under development.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StubPage;


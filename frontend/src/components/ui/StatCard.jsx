import React from 'react';

const StatCard = ({ label, value, icon, trend, color, delay, loading }) => (
  <div className="stat-card" style={{ 
    animation: `fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
    overflow: 'hidden'
  }}>
    <div className="stat-icon" style={{ background: `${color}15`, color: color }}>
      {icon}
    </div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ fontSize: '28px' }}>{loading ? '...' : value}</div>
      {trend && <div className="stat-trend" style={{ fontSize: '11px' }}>{trend}</div>}
    </div>
    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }}>
      {React.cloneElement(icon, { size: 80 })}
    </div>
  </div>
);

export default StatCard;

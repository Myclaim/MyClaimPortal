// Basic ui components
import React from 'react';

export const StatCard = ({ title, value, icon, colorClass = "bg-brand-50 text-brand-600" }) => (
  <div className="card p-6 flex items-center hover-lift">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export const Badge = ({ status }) => {
  const colors = {
    pending: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
  };
  
  const mappedStatus = status || 'pending';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colors[mappedStatus]}`}>
      {mappedStatus.replace('-', ' ')}
    </span>
  );
};

export const Button = ({ children, variant = 'primary', onClick, type = 'button', className = '' }) => {
  const baseStyle = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${className}`}>
      {children}
    </button>
  );
};

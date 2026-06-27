import React, { useState, useEffect } from 'react';
import { Bell, X, User as UserIcon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================================
// ROLE-BASED DASHBOARD ROUTER
// This file ONLY handles routing to the correct role dashboard.
// To edit a role's UI, go to its own folder under /dashboards/:
//
//  super_admin  → /dashboards/super-admin/SuperAdminDashboard.jsx
//  admin        → /dashboards/admin/AdminDashboard.jsx
//  super_partner→ /dashboards/super-partner/SuperPartnerDashboard.jsx
//  partner      → /dashboards/partner/PartnerDashboard.jsx
//  client       → /dashboards/client/ClientDashboard.jsx
//  employee     → /dashboards/employee/EmployeeDashboard.jsx
// ============================================================

import SuperAdminDashboard  from '../dashboards/super-admin/SuperAdminDashboard';
import AdminDashboard       from '../dashboards/admin/AdminDashboard';
import SuperPartnerDashboard from '../dashboards/super-partner/SuperPartnerDashboard';
import PartnerDashboard     from '../dashboards/partner/PartnerDashboard';
import ClientDashboard      from '../dashboards/client/ClientDashboard';
import EmployeeDashboard    from '../dashboards/employee/EmployeeDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {},
    leads: { total: 0, new: 0 },
    claims: { total: 0, pending: 0 },
    proposals: { total: 0, active: 0 },
    activity: [],
    revenue: '0'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ─── Super Partner: full-screen standalone layout ─────────
  // SuperPartnerDashboard has its OWN sidebar, so it must escape
  // the shared Layout. We render it as a fixed full-screen overlay.
  if (user?.role === 'super_partner' || user?.role === 'partner') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--bg)', display: 'flex',
      }}>
        {user?.role === 'super_partner' ? <SuperPartnerDashboard /> : <PartnerDashboard />}
      </div>
    );
  }

  // ----------------------------------------------------------
  // Route to the correct dashboard based on logged-in role.
  // Add new roles here without touching any dashboard file.
  // ----------------------------------------------------------
  const renderDashboardByRole = () => {
    const sharedProps = { stats, loading, setActiveModal, user };

    switch (user?.role) {
      case 'super_admin':
        return <SuperAdminDashboard {...sharedProps} />;
      case 'admin':
        return <AdminDashboard {...sharedProps} />;
      case 'partner':
        return <PartnerDashboard {...sharedProps} />;
      case 'client':
        return <ClientDashboard {...sharedProps} />;
      case 'employee':
        return <EmployeeDashboard {...sharedProps} />;
      default:
        return <AdminDashboard {...sharedProps} />;
    }
  };

  return (
    <div className="page active" style={{ display: 'block' }}>
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blobFloat { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        .animate-slide-up { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(34, 197, 94, 0.1); }
        .wave { display: inline-block; animation: wave 2.5s infinite; transform-origin: 70% 70%; }
        @keyframes wave { 0%, 100%, 60% { transform: rotate(0deg) } 10%, 30% { transform: rotate(14deg) } 20% { transform: rotate(-8deg) } 40% { transform: rotate(-4deg) } 50% { transform: rotate(10deg) } }
        
        .blob { position: fixed; width: 500px; height: 500px; background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%); border-radius: 50%; z-index: -1; pointer-events: none; animation: blobFloat 20s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95); }
        .blob-1 { top: -100px; right: -100px; }
        .blob-2 { bottom: -100px; left: -100px; background: radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%); animation-delay: -5s; }
        
        .welcome-text { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 850; font-size: 1.1em; }
      `}</style>

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="topbar" style={{ 
        padding: '24px 20px', 
        borderBottom: '1px solid var(--border)', 
        background: 'var(--card)', 
        backdropFilter: 'blur(20px)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div className="animate-slide-up">
          <div className="topbar-title" style={{ 
            fontSize: '28px', 
            fontWeight: 850, 
            color: 'var(--text)', 
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '6px',
            flexWrap: 'wrap'
          }}>
            Welcome back, <span style={{ color: 'var(--green)', fontWeight: 900 }}>
              {user?.name ? (user.name.toLowerCase().includes('admin') ? user.name : user.name.split(' ')[0]) : (user?.role === 'super_admin' ? 'Super Admin' : (user?.client_id_ref || 'User'))}
            </span> <span className="wave" style={{ fontSize: '32px' }}>👋</span>
          </div>
          
          <div className="topbar-subtitle" style={{ 
            color: 'var(--text-muted)', 
            fontSize: '15px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {user?.role === 'super_admin' ? (
              <>Your frontline <span style={{ color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase' }}>originations overview</span></>
            ) : (
              <>Here's your <span style={{ fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role?.replace(/_/g, ' ')}</span> command center.</>
            )}
          </div>
        </div>

        {user?.role === 'super_admin' && (
          <div style={{ position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)' }}>
            <div 
              style={{ 
                position: 'relative', 
                cursor: 'pointer', 
                background: 'var(--sidebar-hover)', 
                padding: '10px', 
                borderRadius: '50%',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text)'
              }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {stats.activity && stats.activity.length > 0 && (
                <div style={{ 
                  position: 'absolute', top: '2px', right: '4px', 
                  width: '10px', height: '10px', background: '#ef4444', 
                  borderRadius: '50%', border: '2px solid var(--card)' 
                }}></div>
              )}
            </div>

            {showNotifications && (
              <div style={{ 
                position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                width: '380px', background: 'var(--card)', borderRadius: '16px',
                border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                zIndex: 1000, overflow: 'hidden', animation: 'slideUpFade 0.2s ease-out'
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>Activity Center</div>
                  <X size={18} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowNotifications(false)} />
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {stats.activity && stats.activity.length > 0 ? (
                    stats.activity.map((act, i) => (
                      <div key={act._id || i} style={{ 
                        padding: '16px 20px', borderBottom: '1px solid var(--border)', 
                        display: 'flex', gap: '14px', alignItems: 'flex-start',
                        background: i === 0 ? 'var(--sidebar-active)' : 'transparent',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          background: 'var(--blue-light)', color: 'var(--blue)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                        }}>
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4, marginBottom: '4px' }}>
                            {act.action}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700 }}>
                            {new Date(act.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                      No recent activities found.
                    </div>
                  )}
                </div>
                <div 
                  style={{ padding: '12px', background: 'var(--sidebar-hover)', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--blue)', cursor: 'pointer' }}
                  onClick={() => {
                    setShowNotifications(false);
                    // Just navigate to the activity tab if they have one, or maybe it's in the sidebar
                    // we can trigger the navigation using the existing active modal or router
                    window.location.href = '/super-admin/activity';
                  }}
                >
                  View All Activity
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="content" style={{ padding: '24px 20px' }}>
        {renderDashboardByRole()}
      </div>
    </div>
  );
};

export default Dashboard;

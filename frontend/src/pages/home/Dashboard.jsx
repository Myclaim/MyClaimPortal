import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, User as UserIcon, Search, ChevronDown, ChevronRight, Menu, RefreshCw } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

import SuperAdminDashboard  from '../dashboards/super-admin/SuperAdminDashboard';
import AdminDashboard       from '../dashboards/admin/AdminDashboard';
import SuperPartnerDashboard from '../dashboards/super-partner/SuperPartnerDashboard';
import PartnerDashboard     from '../dashboards/partner/PartnerDashboard';
import ClientDashboard      from '../dashboards/client/ClientDashboard';
import EmployeeDashboard    from '../dashboards/employee/EmployeeDashboard';

/* ── helpers ── */
const fmtDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};
const fmtTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const MOCK_NOTIFS = [
  { id: 1, title: 'Claim Prediction Updated', sub: 'Recovery forecast refreshed for Q3', time: '2m ago', color: '#17E6A1', read: false },
  { id: 2, title: 'Manager Invited', sub: 'Rajesh K accepted admin invite', time: '15m ago', color: '#3b82f6', read: false },
  { id: 3, title: 'AI Audit Completed', sub: 'All 34 nodes passed integrity check', time: '1h ago', color: '#a78bfa', read: true },
];

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  partner: 'Partner',
  super_partner: 'Super Partner',
  client: 'Client',
  employee: 'Employee',
};

const PAGE_TITLE = {
  super_admin: 'Enterprise Control Center',
  admin: 'Admin Command Center',
  partner: 'Partner Overview',
  super_partner: 'Super Partner Hub',
  client: 'Client Portal',
  employee: 'Employee Dashboard',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile]             = useState(false);
  const [loading, setLoading]   = useState(true);
  const [lastSync, setLastSync] = useState(fmtTime());
  const [now, setNow]           = useState(fmtDate());
  const [searchVal, setSearchVal] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [stats, setStats] = useState({
    users: {}, leads: { total: 0, new: 0 },
    claims: { total: 0, pending: 0 },
    proposals: { total: 0, active: 0 },
    activity: [], revenue: '0'
  });
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
        setLastSync(fmtTime());
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally { setLoading(false); }
    };
    fetchStats();
    const t = setInterval(() => setNow(fmtDate()), 60000);
    return () => clearInterval(t);
  }, []);

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (user?.role === 'super_partner' || user?.role === 'partner') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', display: 'flex' }}>
        {user?.role === 'super_partner' ? <SuperPartnerDashboard /> : <PartnerDashboard />}
      </div>
    );
  }

  const renderDashboardByRole = () => {
    const sharedProps = { stats, loading, setActiveModal, user };
    switch (user?.role) {
      case 'super_admin': return <SuperAdminDashboard {...sharedProps} />;
      case 'admin':       return <AdminDashboard {...sharedProps} />;
      case 'partner':     return <PartnerDashboard {...sharedProps} />;
      case 'client':      return <ClientDashboard {...sharedProps} />;
      case 'employee':    return <EmployeeDashboard {...sharedProps} />;
      default:            return <AdminDashboard {...sharedProps} />;
    }
  };

  const displayName = user?.name
    ? (user.name.toLowerCase().includes('admin') ? user.name : user.name.split(' ')[0])
    : ROLE_LABEL[user?.role] ?? 'User';

  const unread = MOCK_NOTIFS.filter(n => !n.read).length;
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="page active" style={{ display: 'block' }}>
      <style>{`
        @keyframes slideUpFade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes wave { 0%,100%,60% { transform:rotate(0deg) } 10%,30% { transform:rotate(14deg) } 20% { transform:rotate(-8deg) } 40% { transform:rotate(-4deg) } 50% { transform:rotate(10deg) } }
        @keyframes blobFloat { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-50px) scale(1.1); } 66% { transform:translate(-20px,20px) scale(.9); } }
        .animate-slide-up { animation:slideUpFade .6s cubic-bezier(.16,1,.3,1) both; }
        .wave { display:inline-block; animation:wave 2.5s infinite; transform-origin:70% 70%; }
        .blob { position:fixed; width:500px; height:500px; background:radial-gradient(circle,rgba(0,208,132,.07) 0%,transparent 70%); border-radius:50%; z-index:-1; pointer-events:none; animation:blobFloat 20s infinite alternate; }
        .blob-1 { top:-100px; right:-100px; }
        .blob-2 { bottom:-100px; left:-100px; background:radial-gradient(circle,rgba(23,230,161,.05) 0%,transparent 70%); animation-delay:-5s; }
        .dash-topbar-search:focus { outline:none; border-color:rgba(0,208,132,.4) !important; box-shadow:0 0 0 3px rgba(0,208,132,.1); }
        .notif-row:hover { background:rgba(255,255,255,.04) !important; }
        .profile-item:hover { background:rgba(255,255,255,.05) !important; }
      `}</style>

      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* ════════════════════ TOP BAR ════════════════════ */}
      <div style={{
        padding: '0 32px', height: 76,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,21,38,.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,.15)'
      }}>

        {/* ☰ + Welcome block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>Dashboard</span>
              <ChevronRight size={11} style={{ color: 'var(--text-light)', opacity: .5 }} />
              <span style={{ fontSize: 11, color: '#17E6A1', fontWeight: 700 }}>{PAGE_TITLE[user?.role] ?? 'Overview'}</span>
            </div>
            {/* Welcome row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                Welcome back, <span style={{ background: 'linear-gradient(135deg,#00D084,#17E6A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName}</span>
              </span>
              <span className="wave" style={{ fontSize: 22 }}>👋</span>
            </div>
            {/* Date + Sync row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 2 }}>
              <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500 }}>{now}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-light)', opacity: .7 }}>
                <RefreshCw size={10} />Last sync {lastSync}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            className="dash-topbar-search"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search Organizations..."
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12, height: 38,
              background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12, color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
              transition: 'border .2s, box-shadow .2s', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Notification */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifications(v => !v); setShowProfile(false); }}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: showNotifications ? 'rgba(0,208,132,.12)' : 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)', position: 'relative', transition: 'background .2s'
            }}
          >
            <Bell size={18} strokeWidth={1.8} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 7, right: 7, width: 8, height: 8,
                background: '#ef4444', borderRadius: '50%', border: '2px solid #0d1526'
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 360, background: '#0D1526', borderRadius: 16,
              border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 20px 50px rgba(0,0,0,.4)',
              zIndex: 1000, overflow: 'hidden', animation: 'slideUpFade .2s ease'
            }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Notifications</span>
                  {unread > 0 && <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(0,208,132,.15)', color: '#17E6A1', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{unread} New</span>}
                </div>
                <X size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowNotifications(false)} />
              </div>
              {MOCK_NOTIFS.map((n, i) => (
                <div key={n.id} className="notif-row" style={{
                  display: 'flex', gap: 12, padding: '14px 18px',
                  borderBottom: '1px solid rgba(255,255,255,.04)',
                  background: !n.read ? 'rgba(0,208,132,.03)' : 'transparent',
                  cursor: 'pointer', transition: 'background .15s'
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${n.color}18`, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={15} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{n.title}</span>
                      {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.color, flexShrink: 0, marginTop: 4 }} />}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{n.sub}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px 18px', textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#17E6A1', borderTop: '1px solid rgba(255,255,255,.05)' }}
                onClick={() => setShowNotifications(false)}>
                View All
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              background: showProfile ? 'rgba(0,208,132,.1)' : 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)', borderRadius: 12,
              cursor: 'pointer', color: 'var(--text)', transition: 'background .2s'
            }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#00D084,#17E6A1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#000' }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{displayName}</span>
              <span style={{ fontSize: 10, color: '#17E6A1', fontWeight: 600, marginTop: 1 }}>{ROLE_LABEL[user?.role]}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform .2s', transform: showProfile ? 'rotate(180deg)' : 'none' }} />
          </button>

          {showProfile && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 200, background: '#0D1526', borderRadius: 14,
              border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 20px 40px rgba(0,0,0,.4)',
              zIndex: 1000, overflow: 'hidden', animation: 'slideUpFade .2s ease'
            }}>
              {[{ label: 'Profile Settings' }, { label: 'Account Security' }, { label: 'Preferences' }].map(item => (
                <div key={item.label} className="profile-item" style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', transition: 'background .15s' }}>
                  {item.label}
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '4px 0' }} />
              <div className="profile-item" style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#ef4444', cursor: 'pointer', transition: 'background .15s' }}>
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════ CONTENT ════════════════════ */}
      <div className="content" style={{ padding: '28px 32px' }}>
        {renderDashboardByRole()}
      </div>
    </div>
  );
};

export default Dashboard;

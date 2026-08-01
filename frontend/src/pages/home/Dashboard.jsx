import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, X, User as UserIcon, Search, ChevronDown, ChevronRight, Menu, RefreshCw,
  Shield, Key, Settings, LogOut, Check, Sliders, Lock, Mail, Phone, Globe, Moon, Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile]             = useState(false);
  const [profileModal, setProfileModal]           = useState(null); // 'profile' | 'security' | 'preferences'
  const [loading, setLoading]   = useState(true);
  const [lastSync, setLastSync] = useState(fmtTime());
  const [now, setNow]           = useState(fmtDate());
  const [searchVal, setSearchVal] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  // Form states for profile modals
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'System Admin',
    email: user?.email || 'admin@myclaim.com',
    phone: '+91 98765 43210',
    role: ROLE_LABEL[user?.role] ?? 'Super Admin',
    org: 'MyClaim Wealth Management'
  });

  const [securityForm, setSecurityForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: '',
    tfaEnabled: true
  });

  const [prefForm, setPrefForm] = useState({
    theme: 'dark',
    currency: 'INR (₹)',
    autoSync: '30s',
    emailAlerts: true
  });

  const [stats, setStats] = useState({
    users: {}, leads: { total: 0, new: 0 },
    claims: { total: 0, pending: 0 },
    proposals: { total: 0, active: 0 },
    activity: [], revenue: '0'
  });
  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const SEARCHABLE_ENTITIES = [
    { id: 'o1', type: 'Organization', title: 'Apex Capital Ltd', sub: 'Mumbai Hub • 142 Active Clients', link: '/admin-list' },
    { id: 'o2', type: 'Organization', title: 'Starlight Mutual Funds', sub: 'Delhi NCR • IEPF Portfolio', link: '/admin-list' },
    { id: 'o3', type: 'Organization', title: 'Nexus Global Wealth', sub: 'Bangalore Tech Park • 89 Clients', link: '/admin-list' },
    { id: 'o4', type: 'Organization', title: 'Zenith Holdings', sub: 'Gujarat Circle • Corporate Accounts', link: '/admin-list' },
    { id: 'c1', type: 'Client', title: 'Vikram Malhotra', sub: 'CLI-8821 • ₹1.2 Cr Recovered', link: '/clients' },
    { id: 'c2', type: 'Client', title: 'Ananya Sharma', sub: 'CLI-9043 • IEPF Claim Pending', link: '/clients' },
    { id: 'c3', type: 'Client', title: 'Rajesh Kumar', sub: 'CLI-5519 • Dividend Recovery', link: '/clients' },
    { id: 'cl1', type: 'Claim', title: 'CLM-90210 - Tata Motors IEPF', sub: 'Status: Approved • ₹45.2 L', link: '/claims' },
    { id: 'cl2', type: 'Claim', title: 'CLM-88402 - Reliance Dividend', sub: 'Status: Under Verification', link: '/claims' },
  ];

  const searchResults = searchVal.trim()
    ? SEARCHABLE_ENTITIES.filter(item =>
        item.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.sub.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.type.toLowerCase().includes(searchVal.toLowerCase())
      )
    : [];

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
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSearchDropdown(false);
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

  const handleSignOut = () => {
    setShowProfile(false);
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    navigate('/login');
  };

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
        .profile-item:hover { background:rgba(255,255,255,.08) !important; color:#17E6A1 !important; }
      `}</style>

      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* ════════════════════ TOP BAR ════════════════════ */}
      <div style={{
        padding: '0 36px', height: 92,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,21,38,.90)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: '0 6px 30px rgba(0,0,0,.25)'
      }}>

        {/* Welcome block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.02em' }}>Dashboard</span>
              <ChevronRight size={13} style={{ color: 'var(--text-light)', opacity: .6 }} />
              <span style={{ fontSize: 13, color: '#17E6A1', fontWeight: 800, letterSpacing: '0.02em' }}>{PAGE_TITLE[user?.role] ?? 'Overview'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 25, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                Welcome back, <span style={{ background: 'linear-gradient(135deg,#00D084,#17E6A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName}</span>
              </span>
              <span className="wave" style={{ fontSize: 26 }}>👋</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 600 }}>{now}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-light)', opacity: .8, fontWeight: 600 }}>
                <RefreshCw size={12} />Last sync {lastSync}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative', width: 330 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: searchVal ? '#17E6A1' : 'var(--text-light)' }} />
          <input
            className="dash-topbar-search"
            value={searchVal}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={e => {
              setSearchVal(e.target.value);
              setShowSearchDropdown(true);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchVal.trim()) {
                setShowSearchDropdown(false);
                navigate('/admin-list');
              }
            }}
            placeholder="Search Organizations..."
            style={{
              width: '100%', paddingLeft: 40, paddingRight: searchVal ? 36 : 14, height: 46,
              background: 'rgba(255,255,255,.06)', border: searchVal ? '1px solid #17E6A1' : '1px solid rgba(255,255,255,.12)',
              borderRadius: 14, color: 'var(--text)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              transition: 'border .2s, box-shadow .2s', boxSizing: 'border-box', outline: 'none'
            }}
          />
          {searchVal && (
            <X
              size={16}
              onClick={() => { setSearchVal(''); setShowSearchDropdown(false); }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}
            />
          )}

          {showSearchDropdown && searchVal.trim().length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              width: 360, background: '#0D1526', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              zIndex: 1000, overflow: 'hidden', animation: 'slideUpFade .2s ease'
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Search Results ({searchResults.length})</span>
                <span style={{ fontSize: 10, color: '#17E6A1' }}>Press Enter to view all</span>
              </div>

              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {searchResults.length > 0 ? (
                  searchResults.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate(item.link);
                      }}
                      style={{
                        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer', transition: 'background 0.15s',
                        display: 'flex', flexDirection: 'column', gap: 2
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.title}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                          background: item.type === 'Organization' ? 'rgba(0,208,132,0.15)' : item.type === 'Client' ? 'rgba(59,130,246,0.15)' : 'rgba(167,139,250,0.15)',
                          color: item.type === 'Organization' ? '#17E6A1' : item.type === 'Client' ? '#3b82f6' : '#a78bfa'
                        }}>
                          {item.type}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    No results found for "{searchVal}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text)', transition: 'all .2s'
          }}
        >
          {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#818cf8" />}
        </button>

        {/* Notification */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifications(v => !v); setShowProfile(false); }}
            style={{
              width: 46, height: 46, borderRadius: 14,
              background: showNotifications ? 'rgba(0,208,132,.15)' : 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)', position: 'relative', transition: 'background .2s'
            }}
          >
            <Bell size={20} strokeWidth={2} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 8, width: 10, height: 10,
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
              {MOCK_NOTIFS.map((n) => (
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
              <div
                style={{ padding: '12px 18px', textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#17E6A1', borderTop: '1px solid rgba(255,255,255,.05)' }}
                onClick={() => {
                  setShowNotifications(false);
                  navigate(user?.role === 'super_admin' ? '/super-admin/activity' : '/activity');
                }}
              >
                View All
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
              background: showProfile ? 'rgba(0,208,132,.12)' : 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.1)', borderRadius: 14,
              cursor: 'pointer', color: 'var(--text)', transition: 'background .2s'
            }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#00D084,#17E6A1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#000' }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{displayName}</span>
              <span style={{ fontSize: 11, color: '#17E6A1', fontWeight: 700, marginTop: 2 }}>{ROLE_LABEL[user?.role]}</span>
            </div>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)', transition: 'transform .2s', transform: showProfile ? 'rotate(180deg)' : 'none' }} />
          </button>

          {showProfile && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 210, background: '#0D1526', borderRadius: 14,
              border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 20px 40px rgba(0,0,0,.5)',
              zIndex: 1000, overflow: 'hidden', animation: 'slideUpFade .2s ease'
            }}>
              <div
                className="profile-item"
                onClick={() => { setShowProfile(false); setProfileModal('profile'); }}
                style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', transition: 'background .15s', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <UserIcon size={15} color="#17E6A1" /> Profile Settings
              </div>

              <div
                className="profile-item"
                onClick={() => { setShowProfile(false); setProfileModal('security'); }}
                style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', transition: 'background .15s', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <Lock size={15} color="#3b82f6" /> Account Security
              </div>

              <div
                className="profile-item"
                onClick={() => { setShowProfile(false); setProfileModal('preferences'); }}
                style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', transition: 'background .15s', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <Sliders size={15} color="#a78bfa" /> Preferences
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '4px 0' }} />

              <div
                className="profile-item"
                onClick={handleSignOut}
                style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#ef4444', cursor: 'pointer', transition: 'background .15s', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <LogOut size={15} color="#ef4444" /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════ CONTENT ════════════════════ */}
      <div className="content" style={{ padding: '28px 32px' }}>
        {renderDashboardByRole()}
      </div>

      {/* ── PROFILE SETTINGS MODAL ── */}
      {profileModal === 'profile' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0B1220', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', width: '100%', maxWidth: '520px', padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(23, 230, 161, 0.15)', color: '#17E6A1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Profile Settings</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage your personal profile details</span>
                </div>
              </div>
              <button onClick={() => setProfileModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <input
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                  <input
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Role</label>
                  <input
                    disabled
                    value={profileForm.role}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: '#17E6A1', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setProfileModal(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Profile settings saved successfully!');
                  setProfileModal(null);
                }}
                style={{ flex: 1, background: 'linear-gradient(135deg,#00D084,#17E6A1)', color: '#000', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT SECURITY MODAL ── */}
      {profileModal === 'security' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0B1220', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', width: '100%', maxWidth: '520px', padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Account Security</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Password change & 2FA security controls</span>
                </div>
              </div>
              <button onClick={() => setProfileModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={securityForm.currentPass}
                  onChange={e => setSecurityForm({ ...securityForm, currentPass: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={securityForm.newPass}
                    onChange={e => setSecurityForm({ ...securityForm, newPass: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={securityForm.confirmPass}
                    onChange={e => setSecurityForm({ ...securityForm, confirmPass: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Require TOTP code on login</div>
                </div>
                <input
                  type="checkbox"
                  checked={securityForm.tfaEnabled}
                  onChange={e => setSecurityForm({ ...securityForm, tfaEnabled: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#00D084', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setProfileModal(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Security credentials updated successfully!');
                  setProfileModal(null);
                }}
                style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                Update Security
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREFERENCES MODAL ── */}
      {profileModal === 'preferences' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0B1220', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', width: '100%', maxWidth: '520px', padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>System Preferences</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure portal layout & alert settings</span>
                </div>
              </div>
              <button onClick={() => setProfileModal(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Default Currency Display</label>
                <select
                  value={prefForm.currency}
                  onChange={e => setPrefForm({ ...prefForm, currency: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                >
                  <option value="INR (₹)">INR (₹ Lakhs & Crores)</option>
                  <option value="USD ($)">USD ($ Millions)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Data Auto-Sync Frequency</label>
                <select
                  value={prefForm.autoSync}
                  onChange={e => setPrefForm({ ...prefForm, autoSync: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                >
                  <option value="15s">Every 15 Seconds (High Realtime)</option>
                  <option value="30s">Every 30 Seconds (Balanced)</option>
                  <option value="60s">Every 60 Seconds (Low Network Bandwidth)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Email Activity Notifications</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Send daily digest for new claims & audit reports</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefForm.emailAlerts}
                  onChange={e => setPrefForm({ ...prefForm, emailAlerts: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#00D084', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setProfileModal(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Preferences saved!');
                  setProfileModal(null);
                }}
                style={{ flex: 1, background: '#a78bfa', color: '#000', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

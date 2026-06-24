import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Bell, 
  Shield, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Upload, 
  MessageSquare, 
  Folder, 
  Clock, 
  Info, 
  UserCircle,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import ClientServiceHub from './ClientServiceHub';

const CL = {
  bg: '#000000',               // Pure black background
  card: 'rgba(11, 17, 32, 0.65)', // Glassmorphism sidebar card background
  cardSoft: 'rgba(15, 23, 42, 0.8)',
  border: 'rgba(255, 255, 255, 0.08)', // Glass border from sidebar
  text: '#F8FAFC',              // Light primary text
  textMuted: '#94A3B8',         // Muted secondary text
  accent: '#10B981',            // Green accent from sidebar
  accentSoft: 'rgba(16, 185, 129, 0.15)',
  green: '#10B981',
  greenSoft: 'rgba(16, 185, 129, 0.08)'
};

const CircularProgress = ({ percent = 72, size = 110, stroke = 10 }) => {
  const angle = Math.min(100, Math.max(0, percent)) * 3.6;
  const wrapper = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    position: 'relative',
  };
  const ring = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: `conic-gradient(${CL.accent} ${angle}deg, rgba(255,255,255,0.05) ${angle}deg)`,
    display: 'grid',
    placeItems: 'center'
  };
  const inner = {
    width: `calc(100% - ${stroke}px)`,
    height: `calc(100% - ${stroke}px)`,
    borderRadius: '50%',
    background: '#0B1120', // Dark card inner bg
    display: 'grid',
    placeItems: 'center'
  };
  return (
    <div style={wrapper}>
      <div style={ring}>
        <div style={inner}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: CL.text }}>{percent}%</div>
            <div style={{ fontSize: 8, color: CL.textMuted, marginTop: 1, fontWeight: 700, letterSpacing: '0.05em' }}>OVERALL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, valueColor }) => (
  <div style={{ 
    flex: '1 1 150px', 
    background: CL.card, 
    border: `1px solid ${CL.border}`, 
    borderRadius: 14, 
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: 24, fontWeight: 900, color: valueColor || CL.text }}>{value}</div>
    <div style={{ color: CL.textMuted, fontSize: 10, marginTop: 6, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</div>
  </div>
);

const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)' };
    case 'in progress':
    case 'in_progress':
      return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)' };
    case 'docs pending':
    case 'docs_pending':
    case 'pending':
      return { color: '#A855F7', bg: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.15)' };
    default:
      return { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.15)' };
  }
};

const ClientDashboard = ({ user }) => {
  const location = useLocation();
  const navigate  = useNavigate();

  // Derive service-hub visibility from URL query param (?tab=service-hub)
  const urlTab = new URLSearchParams(location.search).get('tab');
  const showServiceHub = urlTab === 'service-hub';

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All Companies');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.token) { setLoading(false); return; }
      try {
        setLoading(true);
        const { data } = await axios.get('https://myclaimportal.onrender.com/api/dashboard/client', { headers: { Authorization: `Bearer ${user.token}` } });
        setDashboard(data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchDashboard();
  }, [user]);

  const overview = dashboard?.overview || { totalClaims: 3, inProgress: 2, completed: 1, needAction: 2 };
  
  const claims = (dashboard?.claims || [
    { name: 'TATA STEEL', category: 'Mutual Fund Claim', status: 'Active', progress: 80, folio: 'TWD004589', shares: 120, isin: 'INE081A01020' },
    { name: 'L&T LIMITED', category: 'Dividend Collection', status: 'In Progress', progress: 60, folio: 'LT098765', shares: 50, isin: 'INE018A01030' },
    { name: 'WIPRO LTD', category: 'Recovery Support', status: 'Docs Pending', progress: 45, folio: 'WP234112', shares: 410, isin: 'INE075A01022' }
  ]).map(c => {
    if (c.name === 'TATA STEEL') return { ...c, shares: c.shares || 120, isin: c.isin || 'INE081A01020' };
    if (c.name === 'L&T LIMITED') return { ...c, shares: c.shares || 50, isin: c.isin || 'INE018A01030' };
    if (c.name === 'WIPRO LTD') return { ...c, shares: c.shares || 410, isin: c.isin || 'INE075A01022' };
    return { ...c, shares: c.shares || 100, isin: c.isin || 'INE000A01000' };
  });

  const filteredClaims = claims.filter((claim) => {
    if (activeTab === 'All Companies') return true;
    if (activeTab === 'Active') return claim.status.toLowerCase() === 'active';
    if (activeTab === 'Pending') return claim.status.toLowerCase().includes('pending');
    return true;
  });

  const pending = [
    { title: 'Upload Documents', subtitle: '2 documents pending' },
    { title: 'Verify Identity', subtitle: 'Pending verification' }
  ];

  const userInitials = (user?.name || 'Ramesh Patel')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (loading) return (
    <div style={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.textMuted }}>
      <Clock size={36} style={{ color: CL.accent }} />
    </div>
  );

  if (showServiceHub) return <ClientServiceHub user={user} onBack={() => { navigate('/'); setActiveTab('All Companies'); }} />;

  return (
    <main style={{ minHeight: '100%', padding: '24px', background: CL.bg, color: CL.text }}>
      
      {/* 1. Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: CL.text, margin: 0, letterSpacing: '-0.5px' }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{ 
            background: CL.cardSoft, 
            border: `1px solid ${CL.border}`, 
            padding: 10, 
            borderRadius: '50%',
            color: CL.text,
            cursor: 'pointer',
            position: 'relative',
            display: 'grid',
            placeItems: 'center'
          }}>
            <Bell size={16} />
            <div style={{ 
              position: 'absolute', 
              top: 2, 
              right: 2, 
              width: 6, 
              height: 6, 
              background: CL.accent, 
              borderRadius: '50%' 
            }} />
          </button>
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: 10, 
            background: CL.accent, 
            display: 'grid', 
            placeItems: 'center', 
            color: '#050B14', 
            fontWeight: 800,
            fontSize: 13
          }}>
            {userInitials}
          </div>
        </div>
      </div>

      {/* 2. Welcome back card */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(11,17,32,0.85) 0%, rgba(5,11,20,0.95) 100%)', 
        border: `1px solid ${CL.border}`, 
        borderRadius: 16, 
        padding: '24px', 
        marginBottom: 24, 
        boxShadow: '0 16px 40px rgba(0,0,0,0.3)' 
      }}>
        <div>
          <div style={{ color: CL.textMuted, fontSize: 12 }}>Welcome back,</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: CL.text }}>
              {user?.name || 'Ramesh Patel'} <span style={{ marginLeft: 2 }}>👋</span>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 5, 
              alignItems: 'center',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '4px 10px',
              borderRadius: 999
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: CL.accent }} />
              <span style={{ color: CL.accent, fontSize: 10, fontWeight: 800 }}>Active Client</span>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', color: CL.textMuted, fontSize: 11 }}>
            <div>{user?.client_id_ref || 'CRN-2891'}</div>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: CL.textMuted }} />
            <div>Member since Jan 2026</div>
          </div>
        </div>
        <div style={{ marginTop: 16, color: CL.textMuted, fontSize: 13, lineHeight: 1.5 }}>
          Your claim recovery is in progress — 2 documents pending upload
        </div>
      </div>

      {/* 3. Overview stats section */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, marginBottom: 14 }}>Overview</h2>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <StatCard title="Total Claims" value={overview.totalClaims} valueColor="#60A5FA" />
          <StatCard title="In Progress" value={overview.inProgress} valueColor="#F8FAFC" />
          <StatCard title="Completed" value={overview.completed} valueColor="#10B981" />
          <StatCard title="Need Action" value={overview.needAction} valueColor="#F59E0B" />
          <StatCard title="Total Services" value="₹3.45L" valueColor="#38BDF8" />
        </section>
      </div>

      {/* 4. Overall Claim Progress timeline card */}
      <div style={{ 
        background: CL.card, 
        border: `1px solid ${CL.border}`, 
        borderRadius: 16, 
        padding: '24px', 
        marginBottom: 24 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, margin: 0 }}>Overall Claim Progress</h2>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.12)', 
            color: '#10B981', 
            fontSize: 10, 
            fontWeight: 800, 
            padding: '4px 10px', 
            borderRadius: 999 
          }}>
            3 Companies
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {/* Left progress circle */}
          <div style={{ display: 'flex', justifyContent: 'center', minWidth: 120 }}>
            <CircularProgress percent={72} />
          </div>
          {/* Right vertical timeline */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 6 }}>
            <div style={{ 
              position: 'absolute', 
              left: 17, 
              top: 12, 
              bottom: 12, 
              width: 2, 
              background: 'rgba(255, 255, 255, 0.06)' 
            }} />
            {[
              { label: 'Documents Collected', date: 'Mar 2, 2026', complete: true },
              { label: 'Verification', date: 'Mar 5, 2026', complete: true },
              { label: 'Application Filed', date: 'Mar 10, 2026', complete: true },
              { label: 'Authority Review', date: 'Submitted to IEPF Authority', active: true },
              { label: 'Claim Approved', date: '', pending: true },
              { label: 'Shares Credited', date: '', pending: true }
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: step.complete ? CL.accent : step.active ? '#0B1120' : 'transparent',
                  border: step.complete ? 'none' : step.active ? `2px solid ${CL.accent}` : '2px solid rgba(255,255,255,0.06)',
                  display: 'grid',
                  placeItems: 'center',
                  color: step.complete ? '#050B14' : step.active ? CL.accent : '#94A3B8',
                  flexShrink: 0
                }}>
                  {step.complete ? <CheckCircle2 size={12} color="#050B14" /> : step.active ? <Clock size={12} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 800, color: step.pending ? '#94A3B8' : '#F8FAFC', fontSize: 12 }}>{step.label}</div>
                    {step.active && (
                      <span style={{ 
                        background: 'rgba(16, 185, 129, 0.12)', 
                        color: CL.accent, 
                        padding: '1px 6px', 
                        borderRadius: 999, 
                        fontSize: 9, 
                        fontWeight: 800 
                      }}>Active</span>
                    )}
                  </div>
                  {step.date && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{step.date}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. My Claims Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, margin: 0 }}>My Claims</h2>
          <button style={{ 
            background: 'none', 
            border: 'none', 
            color: '#94A3B8', 
            fontSize: 11, 
            fontWeight: 700, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 3
          }}>
            View All <ArrowRight size={12} />
          </button>
        </div>

        {/* Custom Tab selector */}
        <style>{`
          @keyframes tabFlash {
            0%   { background: rgba(16,185,129,0.18); }
            60%  { background: rgba(16,185,129,0.08); }
            100% { background: none; }
          }
          .claim-tab { position: relative; overflow: hidden; }
          .claim-tab:active { transform: scale(0.95); }
          .claim-tab.tab-pressed { animation: tabFlash 0.35s ease forwards; }
        `}</style>
        <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20, paddingBottom: 2 }}>
  {['All Companies', 'Active', 'Pending', 'Service Hub'].map((tab) => {
    const isActive = activeTab === tab;
    const isServiceHub = tab === 'Service Hub';
    const handleClick = () => {
      setActiveTab(tab);
      if (isServiceHub) {
        // brief visual delay so user sees the green flash before navigating
        setTimeout(() => navigate('/?tab=service-hub'), 220);
      }
    };
    return (
      <button
        key={tab}
        onClick={handleClick}
        className={`claim-tab${isActive ? ' tab-pressed' : ''}`}
        style={{
          background: 'none',
          border: 'none',
          padding: '10px 6px',
          color: isActive
            ? (isServiceHub ? '#10B981' : '#F8FAFC')
            : '#94A3B8',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          position: 'relative',
          borderBottom: isActive
            ? `2px solid ${isServiceHub ? '#10B981' : '#F8FAFC'}`
            : '2px solid transparent',
          borderRadius: '4px 4px 0 0',
          transition: 'color 0.18s, border-color 0.18s, transform 0.12s',
        }}
      >
        {tab}
        {isServiceHub && (
          <span style={{
            display: 'inline-block',
            width: 5, height: 5,
            borderRadius: '50%',
            background: '#10B981',
            marginLeft: 5,
            verticalAlign: 'middle',
            boxShadow: '0 0 6px #10B981',
            opacity: isActive ? 1 : 0.5,
          }} />
        )}
      </button>
    );
  })}
</div>

        {/* Grid of Company Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {filteredClaims.map((claim) => {
            const badgeStyle = getStatusBadgeStyle(claim.status);
            return (
              <div key={claim.name} style={{ background: CL.card, border: `1px solid ${CL.border}`, borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.08)',
                      color: '#10B981',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: 12,
                      flexShrink: 0
                    }}>
                      {claim.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: 13 }}>{claim.name}</div>
                      <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>{claim.isin}</div>
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: badgeStyle.border,
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    {claim.status}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#F8FAFC' }}>{claim.shares}</div>
                    <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Shares</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#F8FAFC' }}>{claim.folio}</div>
                    <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Folio No.</div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: '#94A3B8' }}>Progress</span>
                    <span style={{ fontWeight: 800, color: '#10B981' }}>{claim.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${claim.progress}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #059669)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Pending Actions Section */}
      <div style={{ 
        background: CL.card, 
        border: `1px solid ${CL.border}`, 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 24 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={16} color={CL.accent} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, margin: 0 }}>Pending Actions</h2>
          </div>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.12)', 
            color: CL.accent, 
            fontWeight: 800, 
            padding: '4px 10px', 
            borderRadius: 999, 
            fontSize: 10 
          }}>
            2 Actions
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {pending.map((item) => (
            <div key={item.title} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: 12, 
              padding: '12px 16px', 
              borderRadius: 12, 
              background: 'rgba(16, 185, 129, 0.02)', 
              border: `1px solid rgba(16, 185, 129, 0.12)`,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ 
                  width: 38, 
                  height: 38, 
                  borderRadius: 10, 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  display: 'grid', 
                  placeItems: 'center', 
                  color: CL.accent,
                  flexShrink: 0
                }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#F8FAFC' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{item.subtitle}</div>
                </div>
              </div>
              <button style={{ 
                background: CL.accent, 
                border: 'none', 
                color: '#050B14', 
                padding: '8px 16px', 
                borderRadius: 10, 
                fontWeight: 800,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                Upload
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Quick Actions Section */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: CL.text, marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          {[
            { label: 'Upload Document', icon: Upload },
            { label: 'Support', icon: MessageSquare },
            { label: 'Investment Store', icon: ShoppingBag },
            { label: 'Document Hub', icon: Folder }
          ].map((a) => (
            <div key={a.label} style={{
              background: CL.card,
              border: `1px solid ${CL.border}`,
              borderRadius: 14,
              padding: '20px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'grid',
                placeItems: 'center',
                color: CL.accent,
                marginBottom: 12
              }}>
                <a.icon size={18} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Refer and Earn Banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(16,185,129,0.06), rgba(5,11,20,0.3))',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 14,
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'grid',
            placeItems: 'center',
            color: CL.accent,
            flexShrink: 0
          }}>
            <RefreshCw size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: 14 }}>Refer a Friend & Earn ₹5,000</div>
            <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>For every friend who completes their claim recovery through RM Legal</div>
          </div>
        </div>
        <button style={{
          background: CL.accent,
          border: 'none',
          color: '#050B14',
          padding: '10px 20px',
          borderRadius: 10,
          fontWeight: 800,
          fontSize: 12,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          Refer Now
        </button>
      </div>

    </main>
  );
};

export default ClientDashboard;

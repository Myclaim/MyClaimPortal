import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, TrendingUp, Users, CheckCircle, AlertTriangle,
  Plus, FileText, BarChart2, ShieldCheck, Building2,
  ArrowUpRight, Activity, Clock, Target, Layers,
  X, Search, Filter, Check, Download, Sparkles
} from 'lucide-react';

/* ── tiny sparkline ── */
const Sparkline = ({ data = [], color = '#00D084' }) => {
  const w = 80, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── area chart ── */
const AreaChart = ({ data, labels }) => {
  const w = 100, h = 100;
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  const area = `0,${h} ` + pts + ` ${w},${h}`;
  const [hover, setHover] = useState(null);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ width: '100%', height: '160px' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D084" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00D084" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline points={pts} fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00D084" />
            <stop offset="100%" stopColor="#17E6A1" />
          </linearGradient>
        </defs>
        {data.map((v, i) => {
          const cx = (i / (data.length - 1)) * 100;
          const cy = h - (v / max) * h;
          return (
            <circle key={i} cx={cx} cy={cy} r="1.5" fill="#17E6A1"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      {hover !== null && (
        <div style={{
          position: 'absolute', top: 8, left: `${(hover / (data.length - 1)) * 90}%`,
          background: 'rgba(0,0,0,0.85)', color: '#17E6A1', fontSize: 11,
          fontWeight: 700, padding: '4px 8px', borderRadius: 6, pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>₹{data[hover]}L</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {labels.map(l => <span key={l} style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>{l}</span>)}
      </div>
    </div>
  );
};

/* ── status chip ── */
const Chip = ({ dot, label, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 800,
    letterSpacing: '0.05em', textTransform: 'uppercase',
    background: `${color}18`, color, border: `1px solid ${color}40`
  }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
    {label}
  </span>
);

/* ── enhanced stat card ── */
const EnhancedStatCard = ({ label, value, sub, icon, color, sparkData, badge, delay = 0 }) => (
  <div style={{
    background: '#0D1526', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 18, padding: '20px 22px', position: 'relative', overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s',
    animation: `fadeInScale 0.5s ${delay}s both`,
    cursor: 'default'
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      {badge && <Chip dot color={badge.color} label={badge.label} />}
    </div>
    <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text)', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
    {sub && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#17E6A1', fontWeight: 600 }}>
        <ArrowUpRight size={13} />{sub}
      </div>
    )}
    {sparkData && (
      <div style={{ marginTop: 10 }}>
        <Sparkline data={sparkData} color={color} />
      </div>
    )}
    <div style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.04 }}>
      {React.cloneElement(icon, { size: 72 })}
    </div>
  </div>
);

const RECENT_ACTIVITY_PREVIEW = [
  { icon: <Building2 size={14} />, color: '#17E6A1', label: 'New Organization Added', time: '2 mins ago' },
  { icon: <CheckCircle size={14} />, color: '#3b82f6', label: 'Claim Batch Approved', time: '5 mins ago' },
  { icon: <Users size={14} />, color: '#a78bfa', label: 'Manager Logged In', time: '8 mins ago' },
  { icon: <Target size={14} />, color: '#f59e0b', label: 'Recovery Prediction Updated', time: '15 mins ago' },
  { icon: <ShieldCheck size={14} />, color: '#00D084', label: 'System-wide Audit Passed', time: '22 mins ago' },
];

const FULL_ACTIVITY_LOGS = [
  { id: 1, icon: <Building2 size={16} />, color: '#17E6A1', label: 'New Organization Added', desc: 'Apex Financial Technologies LLC onboarded with 250 enterprise seats.', category: 'Organizations', time: '2 mins ago', date: 'Today, 14:12', user: 'SuperAdmin' },
  { id: 2, icon: <CheckCircle size={16} />, color: '#3b82f6', label: 'Claim Batch Approved', desc: 'Batch #MC-8842 with 48 claims (Total ₹18.4L) approved for disbursement.', category: 'Claims', time: '5 mins ago', date: 'Today, 14:09', user: 'Claims Desk' },
  { id: 3, icon: <Users size={16} />, color: '#a78bfa', label: 'Manager Logged In', desc: 'Regional Partner Vikramaditya Singhania authenticated from Mumbai terminal.', category: 'Users', time: '8 mins ago', date: 'Today, 14:06', user: 'Partner Node' },
  { id: 4, icon: <Target size={16} />, color: '#f59e0b', label: 'Recovery Prediction Updated', desc: 'AI engine recalculated recovery index to 92.4% prediction confidence.', category: 'Audit', time: '15 mins ago', date: 'Today, 13:59', user: 'Giliza AI Bot' },
  { id: 5, icon: <ShieldCheck size={16} />, color: '#00D084', label: 'System-wide Audit Passed', desc: 'Automated SOC2 compliance check completed without security anomalies.', category: 'Audit', time: '22 mins ago', date: 'Today, 13:52', user: 'Security Bot' },
  { id: 6, icon: <Building2 size={16} />, color: '#17E6A1', label: 'Organization Quota Expanded', desc: 'Shriram Finance transaction quota expanded to 10,000 monthly operations.', category: 'Organizations', time: '1 hour ago', date: 'Today, 13:10', user: 'SuperAdmin' },
  { id: 7, icon: <CheckCircle size={16} />, color: '#3b82f6', label: 'Commission Brokerage Settled', desc: 'Partner monthly payout of ₹14.5L credited via automated banking gateway.', category: 'Claims', time: '2 hours ago', date: 'Today, 12:15', user: 'Finance Engine' },
  { id: 8, icon: <Users size={16} />, color: '#a78bfa', label: 'New Manager Created', desc: 'Provisioned manager profile for Rajesh Verma (Northeast Region).', category: 'Users', time: '3 hours ago', date: 'Today, 11:30', user: 'SuperAdmin' },
  { id: 9, icon: <AlertTriangle size={16} />, color: '#ef4444', label: 'High Volatility Alert', desc: 'Nifty VIX threshold spike triggered risk rebalancing alert.', category: 'System', time: '5 hours ago', date: 'Today, 09:20', user: 'System Guard' },
  { id: 10, icon: <ShieldCheck size={16} />, color: '#00D084', label: 'Daily Database Snapshot', desc: 'Encrypted MongoDB backup snapshot synced to AWS S3 Mumbai vault.', category: 'System', time: '8 hours ago', date: 'Today, 06:00', user: 'Db Cron Job' }
];

const QUICK_ACTIONS = [
  { id: 'org', icon: <Building2 size={16} />, label: '+ Add Organization', color: '#00D084' },
  { id: 'mgr', icon: <Users size={16} />, label: '+ Create Manager', color: '#3b82f6' },
  { id: 'rpt', icon: <FileText size={16} />, label: '+ Generate Report', color: '#a78bfa' },
  { id: 'audit', icon: <ShieldCheck size={16} />, label: '+ Run AI Audit', color: '#f59e0b' },
];

const RECOVERY_DATA_THIS_YEAR = [
  { month: 'Jan', value: 45, displayVal: '₹45.0 Lakhs', growth: '+8.2%' },
  { month: 'Feb', value: 75, displayVal: '₹75.0 Lakhs', growth: '+12.4%' },
  { month: 'Mar', value: 55, displayVal: '₹55.0 Lakhs', growth: '+5.1%' },
  { month: 'Apr', value: 95, displayVal: '₹95.0 Lakhs', growth: '+18.6%' },
  { month: 'May', value: 70, displayVal: '₹70.0 Lakhs', growth: '+11.2%' },
  { month: 'Jun', value: 110, displayVal: '₹1.10 Cr', growth: '+22.4%' },
  { month: 'Jul', value: 88, displayVal: '₹88.0 Lakhs', growth: '+14.8%' },
  { month: 'Aug', value: 120, displayVal: '₹1.20 Cr', growth: '+25.1%' },
  { month: 'Sep', value: 98, displayVal: '₹98.0 Lakhs', growth: '+16.3%' },
  { month: 'Oct', value: 115, displayVal: '₹1.15 Cr', growth: '+21.5%' },
  { month: 'Nov', value: 105, displayVal: '₹1.05 Cr', growth: '+19.2%' },
  { month: 'Dec', value: 124, displayVal: '₹1.24 Cr', growth: '+28.4%' }
];

const RECOVERY_DATA_LAST_YEAR = [
  { month: 'Jan', value: 38, displayVal: '₹38.0 Lakhs', growth: '+6.2%' },
  { month: 'Feb', value: 60, displayVal: '₹60.0 Lakhs', growth: '+9.4%' },
  { month: 'Mar', value: 48, displayVal: '₹48.0 Lakhs', growth: '+4.1%' },
  { month: 'Apr', value: 80, displayVal: '₹80.0 Lakhs', growth: '+14.2%' },
  { month: 'May', value: 62, displayVal: '₹62.0 Lakhs', growth: '+8.8%' },
  { month: 'Jun', value: 92, displayVal: '₹92.0 Lakhs', growth: '+17.1%' },
  { month: 'Jul', value: 76, displayVal: '₹76.0 Lakhs', growth: '+11.5%' },
  { month: 'Aug', value: 102, displayVal: '₹1.02 Cr', growth: '+19.8%' },
  { month: 'Sep', value: 85, displayVal: '₹85.0 Lakhs', growth: '+13.4%' },
  { month: 'Oct', value: 98, displayVal: '₹98.0 Lakhs', growth: '+16.2%' },
  { month: 'Nov', value: 90, displayVal: '₹90.0 Lakhs', growth: '+14.9%' },
  { month: 'Dec', value: 108, displayVal: '₹1.08 Cr', growth: '+21.0%' }
];

const SuperAdminDashboard = ({ stats, loading }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Year');
  const [hoveredBarIndex, setHoveredBarIndex] = useState(11); // default active index (Dec)

  // Recent Activity Modal state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategory, setActivityCategory] = useState('All');

  // Quick Action Modal state
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  const currentDataset = selectedTimeframe === 'This Year' ? RECOVERY_DATA_THIS_YEAR : RECOVERY_DATA_LAST_YEAR;
  const activeItem = currentDataset[hoveredBarIndex !== null ? hoveredBarIndex : 11] || currentDataset[11];

  // Filtered Activity List for View All Modal
  const filteredActivities = FULL_ACTIVITY_LOGS.filter((act) => {
    const matchesCat = activityCategory === 'All' || act.category === activityCategory;
    const q = activitySearch.toLowerCase();
    const matchesSearch = !q || act.label.toLowerCase().includes(q) || act.desc.toLowerCase().includes(q) || act.user.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <style>{`
        @keyframes fadeInScale { from { opacity:0; transform:translateY(16px) scale(.97); } to { opacity:1; transform:none; } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        .sa-card { background:#0D1526; border:1px solid rgba(255,255,255,.06); border-radius:18px; transition:transform .3s,box-shadow .3s; }
        .sa-card:hover { transform:translateY(-3px); box-shadow:0 15px 35px rgba(0,0,0,.3); }
        .qa-btn:hover { background:rgba(255,255,255,.07) !important; transform:translateY(-1px); }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #070e1b 0%, #0d1a30 50%, #070e1b 100%)',
        border: '1px solid rgba(255,255,255,.09)',
        borderRadius: 22,
        padding: '32px 36px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        animation: 'fadeInScale .6s both'
      }}>
        {/* Animated background radial mesh grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 2px 2px, #17E6A1 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div style={{
          position: 'absolute', top: '-40%', right: '-5%', width: '450px', height: '450px',
          background: 'radial-gradient(circle, rgba(23,230,161,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(50px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.1fr', gap: 28, alignItems: 'center' }}>

          {/* Column 1: Enterprise Forecast Heading & Recovery Total */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Chip color="#00D084" label="🟢 LIVE" />
              <Chip color="#3b82f6" label="🔵 AI GENERATED" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-light)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
              ENTERPRISE FORECAST
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#17E6A1', letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>
              ₹4.2 Cr
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Projected Recovery</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#00D084', background: 'rgba(0, 208, 132, 0.15)', padding: '2px 8px', borderRadius: 6 }}>
                +18% vs Last Month
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                className="topbar-btn"
                onClick={() => setActiveQuickAction({ title: 'Enterprise Audit', icon: 'ShieldAlert', color: '#00D084', fields: ['Target Region', 'Audit Depth'] })}
                style={{
                  padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 800,
                  background: 'linear-gradient(135deg,#00D084,#17E6A1)', color: '#000',
                  border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,208,132,.35)',
                  transition: 'transform 0.2s'
                }}
              >
                Enterprise Audit
              </button>
              <button
                className="topbar-btn secondary"
                onClick={() => setActiveQuickAction({ title: 'Node Projections', icon: 'Zap', color: '#3b82f6', fields: ['Node Identifier', 'Simulation Scale'] })}
                style={{
                  padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                Node Projections
              </button>
            </div>
          </div>

          {/* Column 2: Key Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                92%
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 6 }}>
                Prediction Confidence
              </div>
              <div style={{ fontSize: 10, color: '#17E6A1', marginTop: 4, fontWeight: 700 }}>
                High Accuracy
              </div>
            </div>

            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                {loading ? '...' : stats?.leads?.total ?? 34}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 6 }}>
                Open Claims
              </div>
              <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 4, fontWeight: 700 }}>
                Active Processing
              </div>
            </div>
          </div>

          {/* Column 3: Interactive Dynamic Area Chart */}
          <div style={{
            background: 'rgba(7, 13, 24, 0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Recovery Trend</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#17E6A1', background: 'rgba(23,230,161,0.1)', padding: '1px 6px', borderRadius: 4 }}>Real-Time</span>
            </div>
            <AreaChart data={[32, 55, 42, 78, 61, 90, 74, 95, 83, 110]} labels={['Jan','Mar','May','Jul','Sep','Nov']} />
          </div>

        </div>
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="stats-row cols-4" style={{ marginBottom: 32 }}>
        <EnhancedStatCard
          label="Enterprise Nodes" value={loading ? '...' : `0${stats?.leads?.total ?? 34}`}
          sub="+12% vs last month" icon={<Zap size={20} strokeWidth={2} />} color="#00D084"
          sparkData={[20,35,28,45,38,52,44,60,55,70,65,80]}
          badge={{ color: '#00D084', label: 'Healthy' }} delay={0.05}
        />
        <EnhancedStatCard
          label="Active Managers" value={loading ? '...' : stats?.claims?.total ?? 18}
          sub="18 Managers Active" icon={<Users size={20} strokeWidth={2} />} color="#3b82f6"
          sparkData={[10,14,12,18,15,20,17,22,19,24,21,18]}
          badge={{ color: '#3b82f6', label: 'Online' }} delay={0.1}
        />
        <EnhancedStatCard
          label="Total Personnel" value={loading ? '...' : stats?.users?.employee ?? 142}
          sub="Across all departments" icon={<Layers size={20} strokeWidth={2} />} color="#a78bfa"
          sparkData={[100,112,108,120,115,130,125,138,132,142,138,142]}
          badge={{ color: '#a78bfa', label: 'Active' }} delay={0.15}
        />
        <EnhancedStatCard
          label="Pending Reviews" value={loading ? '...' : stats?.proposals?.total ?? 7}
          sub="Needs attention" icon={<AlertTriangle size={20} strokeWidth={2} />} color="#f59e0b"
          sparkData={[3,5,4,8,6,9,7,11,8,10,9,7]}
          badge={{ color: '#f59e0b', label: 'Pending' }} delay={0.2}
        />
      </div>

      {/* ── BOTTOM GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

        {/* Global Recovery Growth Interactive Chart */}
        <div className="sa-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Global Recovery Growth</div>
                <Chip color="#17E6A1" label="🟢 LIVE" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly fee collection trend</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Dynamic Output Indicator Box */}
              <div style={{
                background: 'rgba(23, 230, 161, 0.08)',
                border: '1px solid rgba(23, 230, 161, 0.25)',
                borderRadius: 10,
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
                  {activeItem.month}:
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#17E6A1' }}>
                  {activeItem.displayVal}
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#00D084', background: 'rgba(0, 208, 132, 0.2)', padding: '1px 5px', borderRadius: 4 }}>
                  {activeItem.growth}
                </span>
              </div>

              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 10,
                  color: 'var(--text)',
                  fontSize: 12,
                  padding: '6px 12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="This Year">This Year</option>
                <option value="Last Year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Interactive Bar Chart Area */}
          <div
            style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 170, position: 'relative', paddingTop: 30 }}
            onMouseLeave={() => setHoveredBarIndex(11)}
          >
            {currentDataset.map((item, i) => {
              const isHovered = hoveredBarIndex === i;
              const barHeightPct = (item.value / 124) * 100;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredBarIndex(i)}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Floating tooltip above hovered bar */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: `calc(${barHeightPct}% + 10px)`,
                      background: '#070d18',
                      border: '1px solid #17E6A1',
                      color: '#17E6A1',
                      padding: '4px 8px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 8px 20px rgba(0,208,132,0.4)',
                      pointerEvents: 'none',
                      zIndex: 10,
                      transform: 'translateX(-50%)',
                      left: '50%',
                      animation: 'fadeInScale 0.15s ease-out'
                    }}>
                      {item.displayVal}
                    </div>
                  )}

                  {/* Bar element */}
                  <div style={{
                    width: '100%',
                    height: `${barHeightPct}%`,
                    background: isHovered
                      ? 'linear-gradient(to top, #00D084, #17E6A1)'
                      : 'rgba(0, 208, 132, 0.18)',
                    borderRadius: '6px 6px 3px 3px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isHovered ? '1px solid #17E6A1' : '1px solid rgba(0,208,132,.1)',
                    boxShadow: isHovered ? '0 0 20px rgba(23, 230, 161, 0.5)' : 'none',
                    transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                    transformOrigin: 'bottom'
                  }} />
                </div>
              );
            })}
          </div>

          {/* Month Labels Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            {currentDataset.map((item, i) => {
              const isHovered = hoveredBarIndex === i;
              return (
                <span
                  key={item.month}
                  onMouseEnter={() => setHoveredBarIndex(i)}
                  style={{
                    fontSize: 10,
                    color: isHovered ? '#17E6A1' : 'var(--text-light)',
                    fontWeight: isHovered ? 900 : 700,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    textAlign: 'center',
                    flex: 1
                  }}
                >
                  {item.month}
                </span>
              );
            })}
          </div>

          {/* Legend Strip */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            {[
              { label: "Today's Recovery", color: '#17E6A1' },
              { label: 'Yesterday', color: 'rgba(0,208,132,.35)' },
              { label: 'Forecast', color: '#3b82f6' }
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Activity + Quick Actions stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recent Activity */}
          <div className="sa-card" style={{ padding: 24, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Recent Activity</div>
              <button
                onClick={() => setShowActivityModal(true)}
                style={{
                  background: 'rgba(23, 230, 161, 0.1)',
                  border: '1px solid rgba(23, 230, 161, 0.25)',
                  color: '#17E6A1',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#17E6A1'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(23, 230, 161, 0.1)'; e.currentTarget.style.color = '#17E6A1'; }}
              >
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {RECENT_ACTIVITY_PREVIEW.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: `${a.color}18`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} />{a.time}
                    </div>
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, animation: 'pulse-dot 2s infinite', animationDelay: `${i * 0.3}s` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sa-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveQuickAction(a)}
                  className="qa-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 12, color: 'var(--text)', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all .2s', textAlign: 'left'
                  }}
                >
                  <span style={{ color: a.color }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY FULL AUDIT LOG MODAL ── */}
      {showActivityModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0B1220', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', width: '100%', maxWidth: '780px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff' }}>Enterprise Activity Log</h3>
                  <Chip color="#17E6A1" label="Live Real-Time" />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Complete historical trail of enterprise actions, system audits, and user events
                </p>
              </div>
              <button
                onClick={() => setShowActivityModal(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#070D18', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 14px', borderRadius: '12px', flex: 1, minWidth: '220px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  placeholder="Search activity by title, user, description..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {['All', 'Organizations', 'Claims', 'Users', 'Audit', 'System'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivityCategory(cat)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
                      border: activityCategory === cat ? '1px solid #17E6A1' : '1px solid rgba(255,255,255,0.08)',
                      background: activityCategory === cat ? 'rgba(23, 230, 161, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: activityCategory === cat ? '#17E6A1' : 'var(--text-muted)',
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity List */}
            <div style={{ padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {filteredActivities.length > 0 ? filteredActivities.map((act) => (
                <div key={act.id} style={{
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                  padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px'
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${act.color}18`, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {act.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{act.label}</span>
                      <span style={{ fontSize: '11px', color: '#17E6A1', fontWeight: 700 }}>{act.time}</span>
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{act.desc}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-light)', flexWrap: 'wrap' }}>
                      <span>User: <strong style={{ color: '#fff' }}>{act.user}</strong></span>
                      <span>•</span>
                      <span>Timestamp: <strong>{act.date}</strong></span>
                      <span>•</span>
                      <span style={{ color: act.color, fontWeight: 700 }}>{act.category}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No activities found matching your search.
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#070D18', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing {filteredActivities.length} of {FULL_ACTIVITY_LOGS.length} records</span>
              <button
                onClick={() => setShowActivityModal(false)}
                style={{ background: 'linear-gradient(135deg,#00D084,#17E6A1)', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK ACTION MODAL DIALOG ── */}
      {activeQuickAction && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0B1220', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${activeQuickAction.color}20`, color: activeQuickAction.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeQuickAction.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>{activeQuickAction.label.replace('+ ', '')}</h3>
              </div>
              <button
                onClick={() => setActiveQuickAction(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Trigger direct administrative action for <strong>{activeQuickAction.label.replace('+ ', '')}</strong> across the enterprise portal.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <input
                placeholder="Enter Name / Title..."
                style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <textarea
                placeholder="Operational notes or comments..."
                rows={3}
                style={{ width: '100%', padding: '10px 14px', background: '#070D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setActiveQuickAction(null)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`${activeQuickAction.label.replace('+ ', '')} executed successfully!`);
                  setActiveQuickAction(null);
                }}
                style={{ flex: 1, background: activeQuickAction.color, color: '#000', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                Execute Action
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperAdminDashboard;

import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, TrendingUp, Users, CheckCircle, AlertTriangle,
  Plus, FileText, BarChart2, ShieldCheck, Building2,
  ArrowUpRight, Activity, Clock, Target, Layers
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

const ACTIVITY = [
  { icon: <Building2 size={14} />, color: '#17E6A1', label: 'New Organization Added', time: '2 mins ago' },
  { icon: <CheckCircle size={14} />, color: '#3b82f6', label: 'Claim Batch Approved', time: '5 mins ago' },
  { icon: <Users size={14} />, color: '#a78bfa', label: 'Manager Logged In', time: '8 mins ago' },
  { icon: <Target size={14} />, color: '#f59e0b', label: 'Recovery Prediction Updated', time: '15 mins ago' },
  { icon: <ShieldCheck size={14} />, color: '#00D084', label: 'System-wide Audit Passed', time: '22 mins ago' },
];

const QUICK_ACTIONS = [
  { icon: <Building2 size={16} />, label: '+ Add Organization', color: '#00D084' },
  { icon: <Users size={16} />, label: '+ Create Manager', color: '#3b82f6' },
  { icon: <FileText size={16} />, label: '+ Generate Report', color: '#a78bfa' },
  { icon: <ShieldCheck size={16} />, label: '+ Run AI Audit', color: '#f59e0b' },
];

const SuperAdminDashboard = ({ stats, loading }) => {
  const chartData = [32, 55, 42, 78, 61, 90, 74, 95, 83, 110, 98, 124];
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <style>{`
        @keyframes fadeInScale { from { opacity:0; transform:translateY(16px) scale(.97); } to { opacity:1; transform:none; } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        .sa-card { background:#0D1526; border:1px solid rgba(255,255,255,.06); border-radius:18px; transition:transform .3s,box-shadow .3s; }
        .sa-card:hover { transform:translateY(-3px); box-shadow:0 15px 35px rgba(0,0,0,.3); }
        .qa-btn:hover { background:rgba(255,255,255,.07) !important; transform:translateY(-1px); }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0f1f3d 60%, #091420 100%)',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 18,
        padding: '36px 40px', marginBottom: 32, position: 'relative', overflow: 'hidden',
        animation: 'fadeInScale .6s both'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'radial-gradient(circle at 2px 2px, #00D084 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
          <AreaChart data={[32, 55, 42, 78, 61, 90, 74, 95, 83, 110]} labels={['Jan','Mar','May','Jul','Sep','Nov']} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '52%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Chip color="#00D084" label="🟢 LIVE" />
            <Chip color="#3b82f6" label="🔵 AI Generated" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>Enterprise Forecast</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 42, fontWeight: 800, color: '#17E6A1', letterSpacing: '-2px', lineHeight: 1 }}>₹4.2 Cr</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Projected Recovery</div>
            </div>
            <div>
              <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--text)', letterSpacing: '-2px', lineHeight: 1 }}>92%</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Prediction Confidence</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#17E6A1', letterSpacing: '-1px', lineHeight: 1 }}>+18%</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>vs Last Month</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-1px', lineHeight: 1 }}>{loading ? '...' : stats?.leads?.total ?? 124}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Open Claims</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="topbar-btn" style={{ padding: '11px 22px', borderRadius: 14, background: 'linear-gradient(135deg,#00D084,#17E6A1)', boxShadow: '0 4px 20px rgba(0,208,132,.35)' }}>
              Enterprise Audit
            </button>
            <button className="topbar-btn secondary" style={{ padding: '11px 22px', borderRadius: 14 }}>
              Node Projections
            </button>
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

        {/* Revenue chart */}
        <div className="sa-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Global Recovery Growth</div>
                <Chip color="#17E6A1" label="🟢 Live" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly fee collection trend</div>
            </div>
            <select style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: 'var(--text)', fontSize: 12, padding: '6px 12px', outline: 'none' }}>
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
            {[45,75,55,95,70,110,88,120,98,115,105,124].map((h, i) => (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%', height: `${(h / 124) * 100}%`,
                  background: i === 11 ? 'linear-gradient(to top,#00D084,#17E6A1)' : 'rgba(0,208,132,.18)',
                  borderRadius: '5px 5px 3px 3px', transition: 'height .6s ease',
                  border: i === 11 ? '1px solid #00D084' : '1px solid rgba(0,208,132,.1)'
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            {chartLabels.map(m => <span key={m} style={{ fontSize: 9, color: 'var(--text-light)', fontWeight: 700 }}>{m}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            {[{ label: "Today's Recovery", color: '#17E6A1' }, { label: 'Yesterday', color: 'rgba(0,208,132,.35)' }, { label: 'Forecast', color: '#3b82f6' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />{l.label}
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
              <span style={{ fontSize: 11, color: '#17E6A1', fontWeight: 700, cursor: 'pointer' }}>View All</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ACTIVITY.map((a, i) => (
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
              {QUICK_ACTIONS.map((a, i) => (
                <button key={i} className="qa-btn" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 12, color: 'var(--text)', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all .2s', textAlign: 'left'
                }}>
                  <span style={{ color: a.color }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;

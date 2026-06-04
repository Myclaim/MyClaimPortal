import { Zap, Folder, TrendingUp, Link, FileUp, Plus, CheckCircle, Users } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';

const SuperAdminDashboard = ({ stats, loading, setActiveModal, user }) => {
  return (
    <>
      {/* 🚀 AI Forecast Hero */}
      <div className="card animate-slide-up" style={{ 
        background: 'var(--banner-bg)', 
        border: '1px solid var(--banner-border)',
        padding: '40px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Grid/Lines for futuristic feel */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, var(--green) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div className="custom-badge" style={{ background: 'var(--banner-badge-bg)', color: 'var(--banner-badge-text)', border: '1px solid var(--banner-border)', marginBottom: '16px' }}>
            <TrendingUp size={12} style={{ marginRight: 6 }} /> ENTERPRISE FORECAST
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--banner-text)', marginBottom: '16px', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Projected recovery: <span style={{ color: 'var(--green)' }}>₹4.2 Cr</span> this month.
          </h2>
          <p style={{ color: 'var(--banner-subtext)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
            Comprehensive oversight across all nodes. Our predictive engine identifies a 92% success probability for the current open claim batch across all partners.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="topbar-btn" style={{ padding: '12px 24px' }}>Enterprise Audit</button>
            <button className="topbar-btn secondary" style={{ background: 'var(--banner-btn-secondary)', borderColor: 'var(--banner-border)', color: 'var(--banner-btn-text)', padding: '12px 24px' }}>Node Projections</button>
          </div>
        </div>

        {/* Abstract Chart Background Element */}
        <div style={{ position: 'absolute', right: '40px', bottom: '40px', width: '300px', height: '150px', opacity: 0.3, background: 'linear-gradient(to top, var(--green) 0%, transparent 80%)', clipPath: 'polygon(0 100%, 10% 80%, 20% 90%, 30% 60%, 40% 75%, 50% 40%, 60% 55%, 70% 20%, 80% 45%, 90% 10%, 100% 30%, 100% 100%)' }}></div>
      </div>

      <div className="stats-row cols-3" style={{ marginBottom: '32px' }}>
        <StatCard label="Total Enterprise Oversight" value={`0${stats.leads.total}`} icon={<Zap size={20} strokeWidth={2.5} />} trend="Full access" color="#15803d" delay={0.1} />
        <StatCard label="Operational Managers" value={stats.claims.total} icon={<Folder size={20} strokeWidth={2.5} />} trend="18 Managers Active" color="#3b82f6" delay={0.2} />
        <StatCard label="Total Personnel" value={stats.users.employee || 142} icon={<TrendingUp size={20} strokeWidth={2.5} />} trend="Across all departments" color="#10b981" delay={0.3} />
      </div>

      <div className="grid-2">
        <div className="card animate-slide-up" style={{ padding: '32px' }}>
          <div className="card-header" style={{ marginBottom: '32px', border: 'none', padding: 0 }}>
            <div>
              <div className="card-title" style={{ fontSize: '18px' }}>Global Revenue Growth</div>
              <div className="card-sub">Collective fee collection trend</div>
            </div>
          </div>
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '200px', padding: '0 10px' }}>
              {[45, 75, 55, 95, 70].map((h, i) => (
                <div key={i} style={{ flex: 1, height: '100%', background: 'rgba(31, 41, 55, 0.05)', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
                   <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${h}%`, background: 'var(--green)', borderRadius: '4px', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '0 10px' }}>
               {['MAY', 'JUN', 'JUL', 'AUG', 'SEP'].map(m => <div key={m} style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{m}</div>)}
            </div>
          </div>
        </div>
        
        <div className="card animate-slide-up" style={{ padding: '32px' }}>
          <div className="card-header" style={{ marginBottom: '24px', border: 'none', padding: 0 }}>
            <div className="card-title" style={{ fontSize: '18px' }}>Global Network Activity</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            {[
              { title: 'System-wide Audit Completed', time: '5 MINS AGO', desc: 'Enterprise data integrity verified.', icon: <CheckCircle size={14} />, color: '#22c55e' },
              { title: 'New Regional Admin Added', time: '1 HOUR AGO', desc: 'Admin "Rajesh K" authorized for Delhi node.', icon: <Users size={14} />, color: '#3b82f6' },
              { title: 'Security Alert', time: '3 HOURS AGO', desc: 'Multiple login attempts detected from unrecognized IP.', icon: <Zap size={14} />, color: '#f59e0b' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${item.color}20`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   {item.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{item.title}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.desc}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 700 }}>{item.time}</div>
                </div>
              </div>
            ))}
            <button className="topbar-btn secondary" style={{ width: '100%', marginTop: '8px' }}>View Master Audit Logs</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;

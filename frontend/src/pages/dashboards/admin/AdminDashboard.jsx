import { useState, useEffect } from 'react';
import { Ticket, Loader, CheckCircle2, FileText, Users, Activity, ArrowRight, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const AdminDashboard = ({ stats, loading: parentLoading, setActiveModal, user }) => {
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setAdminStats(data);
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const cards = [
    {
      label: 'Active Tickets',
      value: adminStats?.activeTickets ?? 0,
      icon: <Ticket size={22} strokeWidth={2.5} />,
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)',
      border: 'rgba(245,158,11,0.25)',
      trend: 'Awaiting action',
      onClick: () => navigate('/task-board-main'),
    },
    {
      label: 'In Process Tickets',
      value: adminStats?.inProcessTickets ?? 0,
      icon: <Loader size={22} strokeWidth={2.5} />,
      color: '#3b82f6',
      bg: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 100%)',
      border: 'rgba(59,130,246,0.25)',
      trend: 'Currently being worked on',
      onClick: () => navigate('/task-board-main'),
    },
    {
      label: 'Completed Tickets',
      value: adminStats?.completedTickets ?? 0,
      icon: <CheckCircle2 size={22} strokeWidth={2.5} />,
      color: '#22c55e',
      bg: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)',
      border: 'rgba(34,197,94,0.25)',
      trend: 'Successfully resolved',
      onClick: () => navigate('/task-board-main'),
    },
    {
      label: 'Pending Documents',
      value: adminStats?.pendingDocs ?? 0,
      icon: <FileText size={22} strokeWidth={2.5} />,
      color: '#ef4444',
      bg: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)',
      border: 'rgba(239,68,68,0.25)',
      trend: 'Require review',
      onClick: () => navigate('/operations/documents'),
    },
    {
      label: 'Assigned Employees',
      value: adminStats?.assignedEmployees ?? 0,
      icon: <Users size={22} strokeWidth={2.5} />,
      color: '#8b5cf6',
      bg: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.04) 100%)',
      border: 'rgba(139,92,246,0.25)',
      trend: 'In your vertical',
      onClick: () => navigate('/employee-list'),
    },
    {
      label: 'Overdue Tickets',
      value: adminStats?.overdueTickets ?? 0,
      icon: <AlertOctagon size={22} strokeWidth={2.5} />,
      color: '#db2777', // pink/rose
      bg: 'linear-gradient(135deg, rgba(219,39,119,0.12) 0%, rgba(219,39,119,0.04) 100%)',
      border: 'rgba(219,39,119,0.25)',
      trend: 'Past due date',
      onClick: () => navigate('/admin-tickets'),
    },
  ];

  return (
    <>
      <style>{`
        .admin-card {
          position: relative;
          border-radius: 16px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .admin-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }
        .admin-card:hover .admin-card-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .admin-card-arrow {
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.3s ease;
        }
        .admin-card-icon-bg {
          position: absolute;
          right: -12px;
          bottom: -12px;
          opacity: 0.06;
          pointer-events: none;
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-stat-value {
          animation: countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Hero Banner */}
      <div className="card animate-slide-up" style={{
        background: 'var(--banner-bg)',
        border: '1px solid var(--banner-border)',
        padding: '40px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div className="custom-badge" style={{ background: 'var(--banner-badge-bg)', color: 'var(--banner-badge-text)', border: '1px solid var(--banner-border)', marginBottom: '16px' }}>
            <Activity size={12} style={{ marginRight: 6 }} /> OPERATIONS CENTER
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--banner-text)', marginBottom: '16px', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Your <span style={{ color: 'var(--blue)' }}>Operational Metrics</span> at a glance.
          </h2>
          <p style={{ color: 'var(--banner-subtext)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
            {loading ? 'Loading your dashboard...' : (
              <>You have <strong style={{ color: 'var(--blue)' }}>{adminStats?.activeTickets || 0} active</strong> and <strong style={{ color: '#f59e0b' }}>{adminStats?.inProcessTickets || 0} in-process</strong> tickets requiring attention.</>
            )}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="topbar-btn" style={{ padding: '12px 24px' }} onClick={() => navigate('/task-board-main')}>View Task Board</button>
            <button className="topbar-btn secondary" style={{ background: 'var(--banner-btn-secondary)', borderColor: 'var(--banner-border)', color: 'var(--banner-btn-text)', padding: '12px 24px' }} onClick={() => navigate('/employee-list')}>Manage Team</button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '40px', bottom: '40px', width: '300px', height: '150px', opacity: 0.1, background: 'linear-gradient(to top, var(--blue) 0%, transparent 80%)', clipPath: 'polygon(0 100%, 10% 80%, 20% 90%, 30% 60%, 40% 75%, 50% 40%, 60% 55%, 70% 20%, 80% 45%, 90% 10%, 100% 30%, 100% 100%)' }}></div>
      </div>

      {/* 5 Operational Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="admin-card"
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              animationDelay: `${i * 0.08}s`,
              animation: `fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s both`,
            }}
            onClick={card.onClick}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${card.color}18`, color: card.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.icon}
              </div>
              <div className="admin-card-arrow" style={{ color: card.color }}>
                <ArrowRight size={18} />
              </div>
            </div>
            <div className="admin-stat-value" style={{
              fontSize: '32px', fontWeight: 850, color: card.color,
              letterSpacing: '-1px', lineHeight: 1, marginBottom: '6px',
              animationDelay: `${i * 0.08 + 0.2}s`,
            }}>
              {loading ? '...' : card.value}
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {card.trend}
            </div>
            <div className="admin-card-icon-bg">
              {typeof card.icon === 'object' ? 
                <card.icon.type size={90} strokeWidth={1.5} /> : null
              }
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid-2">
        <div className="card animate-slide-up" style={{ padding: '32px', gridColumn: '1 / -1' }}>
          <div className="card-header" style={{ marginBottom: '24px', border: 'none', padding: 0 }}>
            <div className="card-title" style={{ fontSize: '18px' }}>Recent Activity</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            {adminStats?.activity && adminStats.activity.length > 0 ? adminStats.activity.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{item.user ? item.user.name : 'System'}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>{item.action}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )) : <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent activity.</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

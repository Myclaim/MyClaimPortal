import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, Loader2, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get('/reports/admin');
        setReportData(data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 size={32} className="spin" color="var(--blue)" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Failed to load reports.</div>
      </div>
    );
  }

  const { timeframes, statusDistribution, employeePerformance } = reportData;

  const totalStatus = Object.values(statusDistribution).reduce((a, b) => a + b, 0) || 1; // Prevent division by zero

  return (
    <div className="page active" style={{ display: 'block', overflowY: 'auto' }}>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Operational Reports</div>
          <div className="topbar-subtitle">Real-time performance and ticket metrics</div>
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'New Tickets (Today)', value: timeframes.daily, icon: <Clock size={20} />, color: '#3b82f6' },
            { label: 'New Tickets (This Week)', value: timeframes.weekly, icon: <TrendingUp size={20} />, color: '#f59e0b' },
            { label: 'New Tickets (This Month)', value: timeframes.monthly, icon: <BarChart3 size={20} />, color: '#8b5cf6' },
          ].map((c, i) => (
            <div key={i} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${c.color}15`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* Ticket Status Distribution */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '24px', borderBottom: 'none' }}>
              <div className="card-title">Ticket Status Distribution</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'active', label: 'Active', color: '#f59e0b' },
                { key: 'in_process', label: 'In Process', color: '#3b82f6' },
                { key: 'completed', label: 'Completed', color: '#22c55e' },
                { key: 'closed', label: 'Closed', color: '#64748b' },
              ].map(stat => {
                const count = statusDistribution[stat.key] || 0;
                const percentage = Math.round((count / totalStatus) * 100);
                return (
                  <div key={stat.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{stat.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>({percentage}%)</span></span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: stat.color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Employee Performance */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '24px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Employee Performance</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Completed</th>
                    <th>Active/In Process</th>
                    <th>Total Load</th>
                  </tr>
                </thead>
                <tbody>
                  {employeePerformance.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No employees found.</td></tr>
                  ) : (
                    employeePerformance.map(emp => (
                      <tr key={emp.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{emp.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{emp.department || 'General'}</div>
                        </td>
                        <td>
                          <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                            {emp.completed}
                          </span>
                        </td>
                        <td>
                          <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                            {emp.active}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{emp.total}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReports;

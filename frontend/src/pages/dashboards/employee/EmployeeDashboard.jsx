import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle, Clock, AlertCircle, FileText, Activity, Target, TrendingUp, Upload, Bell, Calendar as CalendarIcon, Zap } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import api from '../../../services/api';
import EmployeeTasks from './EmployeeTasks';
import EmployeeTickets from './EmployeeTickets';
import EmployeeTicketDetail from './EmployeeTicketDetail';
import EmployeeDocuments from './EmployeeDocuments';
import EmployeeActivity from './EmployeeActivity';
import EmployeeProfile from './EmployeeProfile';
import EmployeeNotifications from './EmployeeNotifications';
import EmployeeCalendar from './EmployeeCalendar';

// ============================================================
// EMPLOYEE DASHBOARD
// Role: Employee
// Scope: View & update only tickets assigned to them.
// DO NOT modify this file when editing other role dashboards.
// ============================================================

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        const { data } = await api.get('/dashboard/employee');
        setStats(data);
      } catch (err) {
        console.error('Error fetching employee dashboard stats:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading workspace...</div>;
  }

  if (error) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  }

  if (currentTab === 'tasks') {
    return <EmployeeTasks />;
  }

  if (currentTab === 'tickets') {
    return <EmployeeTickets />;
  }

  if (currentTab === 'ticket-detail') {
    return <EmployeeTicketDetail ticketId={searchParams.get('id')} />;
  }

  if (currentTab === 'docs') {
    return <EmployeeDocuments />;
  }

  if (currentTab === 'activity') {
    return <EmployeeActivity />;
  }

  if (currentTab === 'profile') {
    return <EmployeeProfile />;
  }

  if (currentTab === 'notifications') {
    return <EmployeeNotifications />;
  }

  if (currentTab === 'calendar') {
    return <EmployeeCalendar />;
  }

  const completionPercentage = stats?.assignedTickets 
    ? Math.round((stats.completedTasks / stats.assignedTickets) * 100) 
    : 0;

  return (
    <>
      {/* Hero Banner */}
      <div className="card animate-slide-up" style={{ 
        background: 'var(--banner-bg)', 
        border: '1px solid var(--banner-border)',
        padding: '40px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 2px 2px, var(--green) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div className="custom-badge" style={{ background: 'var(--banner-badge-bg)', color: 'var(--banner-badge-text)', border: '1px solid var(--banner-border)', marginBottom: '16px' }}>
            <ClipboardList size={12} style={{ marginRight: 6 }} /> EMPLOYEE WORKSPACE
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--banner-text)', marginBottom: '16px', letterSpacing: '-1px', lineHeight: 1.1 }}>
            You have <span style={{ color: 'var(--green)' }}>{stats?.pendingTasks || 0}</span> pending tasks.
          </h2>
          <p style={{ color: 'var(--banner-subtext)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
            Focus on your assigned tasks, upload required documents, and keep your progress updated for your admin and clients.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="topbar-btn" onClick={() => navigate('/?tab=tasks')} style={{ padding: '12px 24px' }}>View My Tasks</button>
            <button className="topbar-btn secondary" onClick={() => navigate('/?tab=docs')} style={{ background: 'var(--banner-btn-secondary)', borderColor: 'var(--banner-border)', color: 'var(--banner-btn-text)', padding: '12px 24px' }}>Upload Documents</button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '40px', bottom: '40px', width: '300px', height: '150px', opacity: 0.25, background: 'linear-gradient(to top, var(--green) 0%, transparent 80%)', clipPath: 'polygon(0 100%, 10% 80%, 20% 90%, 30% 60%, 40% 75%, 50% 40%, 60% 55%, 70% 20%, 80% 45%, 90% 10%, 100% 30%, 100% 100%)' }}></div>
      </div>

      {/* Quick Actions */}
      <div className="card animate-slide-up" style={{ padding: '24px', marginBottom: '32px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="#eab308" /> Quick Actions
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="topbar-btn secondary" onClick={() => navigate('/?tab=tasks')} style={{ flex: 1, minWidth: '150px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#3b82f6" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Pending Tasks</span>
          </button>
          <button className="topbar-btn secondary" onClick={() => navigate('/?tab=docs')} style={{ flex: 1, minWidth: '150px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} color="#8b5cf6" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Upload Document</span>
          </button>
          <button className="topbar-btn secondary" onClick={() => navigate('/?tab=tickets')} style={{ flex: 1, minWidth: '150px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} color="#10b981" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Assigned Tickets</span>
          </button>
          <button className="topbar-btn secondary" onClick={() => navigate('/?tab=notifications')} style={{ flex: 1, minWidth: '150px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color="#f59e0b" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Notifications</span>
          </button>
          <button className="topbar-btn secondary" onClick={() => navigate('/?tab=calendar')} style={{ flex: 1, minWidth: '150px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={20} color="#ec4899" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Today&apos;s Tasks</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row cols-4" style={{ marginBottom: '32px' }}>
        <StatCard label="Assigned Tickets" value={stats?.assignedTickets || 0} icon={<ClipboardList size={20} />} trend="Total assigned" color="#15803d" delay={0.1} />
        <StatCard label="Pending Tasks" value={stats?.pendingTasks || 0} icon={<Clock size={20} />} trend="Needs action" color="#3b82f6" delay={0.2} />
        <StatCard label="Completed Tasks" value={stats?.completedTasks || 0} icon={<CheckCircle size={20} />} trend="All time" color="#10b981" delay={0.3} />
        <StatCard label="Overdue Tasks" value={stats?.overdueTasks || 0} icon={<AlertCircle size={20} />} trend={stats?.overdueTasks > 0 ? 'Requires attention' : "You're on track 🎉"} color={stats?.overdueTasks > 0 ? '#ef4444' : '#22c55e'} delay={0.4} />
      </div>

      {/* Employee Productivity Section */}
      <div className="card animate-slide-up" style={{ padding: '32px', marginBottom: '32px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
            <Target size={20} color="var(--accent-green)" /> Productivity Overview
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Overall Completion: <span style={{ color: 'var(--accent-green)' }}>{completionPercentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', marginBottom: '28px', overflow: 'hidden' }}>
          <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Completed Today</div>
            <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--text)' }}>{stats?.completedToday || 0}</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Completed This Week</div>
            <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--text)' }}>{stats?.completedThisWeek || 0}</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Tasks</div>
            <div style={{ fontSize: '28px', fontWeight: 850, color: '#3b82f6' }}>{stats?.pendingTasks || 0}</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Performance</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: completionPercentage >= 50 ? '#10b981' : '#f59e0b', marginTop: '8px' }}>
              <TrendingUp size={16} />
              {completionPercentage >= 80 ? 'Excellent' : completionPercentage >= 50 ? 'On Track' : 'Needs Focus'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Pending Tasks List */}
        <div className="card animate-slide-up" style={{ padding: '32px' }}>
          <div className="card-header" style={{ marginBottom: '24px', border: 'none', padding: 0 }}>
            <div className="card-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--blue)" /> Pending Tasks List
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.pendingTasksList?.length > 0 ? stats.pendingTasksList.map((ticket, i) => {
              const statusColor = ticket.status === 'in_process' ? '#3b82f6' : '#f59e0b';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                        {ticket.subject || ticket._id.substring(ticket._id.length - 8).toUpperCase()} — {ticket.client?.name || 'Unknown Client'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '12px' }}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{ticket.service}</div>
                  </div>
                </div>
              );
            }) : (
               <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No pending tasks at the moment.</div>
            )}
          </div>
        </div>

        {/* Recent Assigned Tickets */}
        <div className="card animate-slide-up" style={{ padding: '32px' }}>
          <div className="card-header" style={{ marginBottom: '24px', border: 'none', padding: 0 }}>
            <div className="card-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--green)" /> Recent Assigned Tickets
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.recentAssignedTickets?.length > 0 ? stats.recentAssignedTickets.map((ticket, i) => {
               let statusColor = '#3b82f6';
               if (ticket.status === 'completed') statusColor = '#10b981';
               if (ticket.status === 'active') statusColor = '#f59e0b';
               
               return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                        {ticket.subject || ticket._id.substring(ticket._id.length - 8).toUpperCase()} — {ticket.client?.name || 'Unknown Client'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '12px' }}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{ticket.service}</div>
                  </div>
                </div>
              );
            }) : (
               <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tickets assigned yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Full Width */}
      <div className="card animate-slide-up" style={{ padding: '32px', marginTop: '24px' }}>
          <div className="card-header" style={{ marginBottom: '24px', border: 'none', padding: 0 }}>
            <div className="card-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--blue)" /> Recent Activity
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((act, i) => (
              <div key={i} style={{ padding: '14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{act.action}</div>
                   <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(act.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent activity.</div>
            )}
          </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;

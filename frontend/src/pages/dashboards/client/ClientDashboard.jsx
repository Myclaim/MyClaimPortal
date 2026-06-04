import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Clock, CheckCircle2, AlertCircle, Eye, 
  ChevronRight, ArrowUpRight, Plus, Box, Shield, 
  FileText, Download, User, Briefcase, Info, 
  Search, Filter, ShoppingBag, ClipboardList,
  History, MessageSquare, ExternalLink, TrendingUp, Activity,
  UserCircle, Bell, Lock, Camera, ShieldCheck
} from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

// ─── Design Tokens ─────────────────────────────────────────────
const CL = {
  primary: '#15803d',          // green
  primaryLight: 'rgba(21,128,61,0.12)',
  secondary: '#0f766e',        // teal
  secondaryLight: 'rgba(15,118,110,0.12)',
  accent: '#22c55e',           // light green
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradientPrimary: 'linear-gradient(135deg, #0f766e 0%, #22c55e 100%)',
};

// ─── Status Mapping ───────────────────────────────────────────
const STATUS_MAP = {
  'active':     { label: 'Active',      color: CL.primary, bg: CL.primaryLight },
  'in_process': { label: 'In Process',  color: '#3b82f6',  bg: 'rgba(59,130,246,0.12)' },
  'completed':  { label: 'Completed',   color: CL.success, bg: 'rgba(16,185,129,0.12)' },
  'closed':     { label: 'Closed',      color: '#64748b',  bg: 'rgba(100,116,139,0.12)' },
  'pending':    { label: 'Pending',     color: CL.warning, bg: 'rgba(245,158,11,0.12)' },
};

// ─── Shared UI Components ─────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
  return (
    <span style={{ 
      fontSize: '11px', fontWeight: 700, padding: '3px 10px', 
      borderRadius: '20px', color: s.color, background: s.bg,
      border: `1px solid ${s.color}30`
    }}>
      {s.label}
    </span>
  );
};

const ClientDashboard = ({ user }) => {
  const [searchParams] = useSearchParams();
  const [activePage, setActivePage] = useState('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActivePage(tab);
      setSelectedTicket(null); // Ensure any opened ticket view is closed when switching tabs
    }
  }, [searchParams]);

  const [tickets, setTickets] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // ─── Fetch Data ─────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      // We fetch both tickets (for the services tab) and dashboard stats
      const [ticketRes, dashboardRes] = await Promise.all([
        axios.get('https://myclaimportal.onrender.com/api/tickets', config),
        axios.get('https://myclaimportal.onrender.com/api/dashboard/client', config)
      ]);
      setTickets(ticketRes.data);
      setDashboardData(dashboardRes.data);
    } catch (err) {
      console.error('Failed to fetch client dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchData();
  }, [user]);

  // ─── Tab Content Components ───────────────────────────────
  
  // 1. OVERVIEW
  const OverviewTab = () => (
    <div className="animate-slide-up">
      {/* 🚀 Client Self-Service Hero */}
      <div className="card" style={{ 
        background: 'var(--banner-bg)', 
        border: '1px solid var(--banner-border)',
        padding: '40px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px'
      }}>
        {/* Animated Background Elements */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, var(--green) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px' }}>
          <div className="custom-badge" style={{ background: 'var(--banner-badge-bg)', color: 'var(--banner-badge-text)', border: '1px solid var(--banner-border)', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={12} /> SECURE CLIENT PORTAL
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: 850, color: 'var(--banner-text)', marginBottom: '16px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Your <span style={{ color: 'var(--green)' }}>Asset Recovery</span> at a glance.
          </h2>
          <p style={{ color: 'var(--banner-subtext)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.6, maxWidth: '500px' }}>
            Welcome to your unified command center. Monitor your claim statuses, manage essential KYC documents, and explore new recovery services in real-time.
          </p>
          <div style={{ display: 'flex', gap: '14px' }}>
            <button className="topbar-btn" onClick={() => setActivePage('track-progress')} style={{ padding: '12px 28px', borderRadius: '12px' }}>Track Progress</button>
            <button className="topbar-btn secondary" onClick={() => setActivePage('support')} style={{ background: 'var(--banner-btn-secondary)', borderColor: 'var(--banner-border)', color: 'var(--banner-btn-text)', padding: '12px 28px', borderRadius: '12px' }}>Contact Support</button>
          </div>
        </div>

        {/* Abstract Trend Element */}
        <div style={{ position: 'absolute', right: '40px', bottom: '20px', width: '280px', height: '120px', opacity: 0.2, background: 'linear-gradient(to top, var(--green) 0%, transparent 80%)', clipPath: 'polygon(0 100%, 15% 70%, 30% 85%, 45% 40%, 60% 60%, 75% 20%, 85% 50%, 100% 10%, 100% 100%)' }}></div>
      </div>

      <div className="stats-row cols-4" style={{ marginBottom: '32px' }}>
        <StatCard label="Active Services" value={dashboardData?.activeServices || 0} icon={<Box size={22} />} trend="In Service Hub" color={CL.primary} delay={0.1} />
        <StatCard label="Active Tickets" value={dashboardData?.activeTickets || 0} icon={<Briefcase size={22} />} trend="In Claim Hub" color={CL.secondary} delay={0.2} />
        <StatCard label="Completed Services" value={dashboardData?.completedServices || 0} icon={<CheckCircle2 size={22} />} trend="Fully recovered" color={CL.success} delay={0.3} />
        <StatCard label="Pending Documents" value={dashboardData?.pendingDocuments || 0} icon={<FileText size={22} />} trend="Needs verification" color={CL.warning} delay={0.4} />
      </div>

      <div className="grid-2">
        {/* Recent Tickets Pipeline Card */}
        <div className="card card-hover" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 850, color: 'var(--text)' }}>Recent Tickets</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Your latest submitted requests</div>
            </div>
            <button onClick={() => setActivePage('services')} style={{ fontSize: '12px', color: CL.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, background: CL.primaryLight, padding: '8px 16px', borderRadius: '10px', border: 'none' }}>
              Detailed View <ChevronRight size={14} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {dashboardData?.recentTickets && dashboardData.recentTickets.length > 0 ? dashboardData.recentTickets.map((t, idx) => (
              <div key={idx} style={{ position: 'relative', paddingLeft: '24px' }}>
                 <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: STATUS_MAP[t.status || 'active']?.color || CL.primary, borderRadius: '4px' }}></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>{t.service || 'Service Request'}</div>
                    <Badge status={t.status || 'active'} />
                 </div>
                 <div style={{ height: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', overflow: 'hidden', margin: '12px 0' }}>
                    <div style={{ 
                      width: t.status === 'completed' ? '100%' : (t.status === 'in_process' ? '65%' : (t.status === 'pending' ? '15%' : '40%')), 
                      height: '100%', 
                      background: STATUS_MAP[t.status || 'active']?.color || CL.primary,
                      borderRadius: '10px',
                      transition: 'width 1s ease-in-out'
                    }} />
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', fontWeight: 700 }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Updated {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</span>
                    <span>{t.status === 'completed' ? 'Success' : `Phase: ${t.status?.replace('_', ' ')}`}</span>
                 </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                 <Box size={32} style={{ color: 'var(--text-light)', marginBottom: '16px', opacity: 0.5 }} />
                 <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>No active claims detected.</div>
                 <button onClick={() => setActivePage('catalog')} style={{ marginTop: '16px', fontSize: '12px', color: CL.primary, fontWeight: 700, border: 'none', background: 'none', textDecoration: 'underline' }}>Contact Support</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Updates & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent Updates */}
          <div className="card card-hover" style={{ padding: '32px', borderRadius: '24px', flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 850, color: 'var(--text)', marginBottom: '24px' }}>Recent Updates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map((activity, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: i !== dashboardData.recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CL.primary, marginTop: '6px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{activity.action}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(activity.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent activity.</div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="card card-hover" style={{ padding: '32px', borderRadius: '24px', flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 850, color: 'var(--text)', marginBottom: '24px' }}>Recent Notifications</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dashboardData?.recentNotifications && dashboardData.recentNotifications.length > 0 ? dashboardData.recentNotifications.map((notif, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: i !== dashboardData.recentNotifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: CL.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.primary }}>
                    <MessageSquare size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{notif.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notif.message}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No new notifications.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. MY SERVICES (TICKET LIST)
  const ServicesTab = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const serviceTickets = tickets.filter(t => {
      if (t.hubType === 'Support Hub') return false;
      const matchSearch = String(t._id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.service && t.service.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter ? t.status === statusFilter : true;
      return matchSearch && matchStatus;
    });

    return (
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: 800 }}>My Services</h2>
           <div style={{ display: 'flex', gap: 12 }}>
             <div className="search-input" style={{ width: '300px', display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px' }}>
               <Search size={16} style={{ color: 'var(--text-muted)' }} /> 
               <input 
                 placeholder="Search services..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '8px', flex: 1, fontSize: '13px' }} 
               />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '13px', fontWeight: 600, outline: 'none' }}
             >
               <option value="">All Statuses</option>
               <option value="active">Active</option>
               <option value="in_process">In Process</option>
               <option value="completed">Completed</option>
               <option value="closed">Closed</option>
             </select>
           </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
                Loading your services...
             </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--danger, #ef4444)' }}>
             <AlertCircle size={30} style={{ color: 'var(--danger, #ef4444)', margin: '0 auto 20px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>Failed to load services</h3>
             <p style={{ color: '#64748b', fontSize: '14px' }}>{error}</p>
             <button onClick={fetchData} className="topbar-btn" style={{ marginTop: 24, padding: '10px 24px' }}>Retry</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {serviceTickets.map((t, idx) => (
              <div key={idx} className="card card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: CL.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.primary }}>
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 0.5 }}>#{String(t._id).substring(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, marginTop: 4, color: 'var(--text)' }}>{t.service || 'Service Request'}</div>
                      </div>
                    </div>
                    <Badge status={t.status || 'active'} />
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Service Category</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{t.hubType || 'Claim Hub'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Service Type</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{t.mappedStore || t.vertical || 'Standard'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Current Status</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{(t.status || 'active').replace('_', ' ')}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Created Date</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Last Updated</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</div>
                   </div>
                 </div>

                 <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                   <button onClick={() => setSelectedTicket(t)} className="topbar-btn" style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '8px' }}>
                     <Eye size={16} style={{ marginRight: '6px' }} /> View Details
                   </button>
                   <button onClick={() => setSelectedTicket(t)} className="topbar-btn secondary" style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '8px', background: 'var(--bg)' }}>
                     <Activity size={16} style={{ marginRight: '6px' }} /> Track Progress
                   </button>
                   <button onClick={() => setActivePage('documents')} className="topbar-btn secondary" style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '8px' }}>
                     <FileText size={16} style={{ marginRight: '6px' }} /> View Documents
                   </button>
                 </div>
              </div>
            ))}
            {serviceTickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                 <div style={{ width: 60, height: 60, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                   <Info size={30} style={{ color: '#94a3b8' }} />
                 </div>
                 <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>No services found</h3>
                 <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 300, margin: '0 auto' }}>You haven't requested any services yet or none match your filter.</p>
                 <button onClick={() => setActivePage('support')} style={{ marginTop: 24, padding: '12px 24px', background: CL.gradientPrimary, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700 }}>Contact Support</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 2.5 MY TICKETS (SUPPORT/ALL TICKETS)
  const TicketsTab = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredTickets = tickets.filter(t => {
      const matchSearch = String(t._id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.service && t.service.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter ? t.status === statusFilter : true;
      return matchSearch && matchStatus;
    });

    return (
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: 800 }}>My Tickets</h2>
           <div style={{ display: 'flex', gap: 12 }}>
             <div className="search-input" style={{ width: '300px', display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px' }}>
               <Search size={16} style={{ color: 'var(--text-muted)' }} /> 
               <input 
                 placeholder="Search by ID or Service Name..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '8px', flex: 1, fontSize: '13px' }} 
               />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '13px', fontWeight: 600, outline: 'none' }}
             >
               <option value="">All Statuses</option>
               <option value="active">Active</option>
               <option value="in_process">In Process</option>
               <option value="completed">Completed</option>
               <option value="closed">Closed</option>
             </select>
           </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
                Loading your tickets...
             </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--danger, #ef4444)' }}>
             <AlertCircle size={30} style={{ color: 'var(--danger, #ef4444)', margin: '0 auto 20px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>Failed to load tickets</h3>
             <p style={{ color: '#64748b', fontSize: '14px' }}>{error}</p>
             <button onClick={fetchData} className="topbar-btn" style={{ marginTop: 24, padding: '10px 24px' }}>Retry</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredTickets.map((t, idx) => (
              <div key={idx} className="card card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: CL.secondaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.secondary }}>
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 0.5 }}>#{String(t._id).substring(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, marginTop: 4, color: 'var(--text)' }}>{t.service || t.subject || 'Ticket'}</div>
                      </div>
                    </div>
                    <Badge status={t.status || 'active'} />
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Priority</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: t.priority === 'urgent' ? CL.danger : t.priority === 'high' ? CL.warning : CL.primary, textTransform: 'capitalize' }}>{t.priority || 'Medium'}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{(t.status || 'active').replace('_', ' ')}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Created Date</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Last Updated</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</div>
                   </div>
                 </div>

                 <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                   <button onClick={() => setSelectedTicket(t)} className="topbar-btn" style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '8px', background: CL.secondary, color: '#fff', border: 'none' }}>
                     <Eye size={16} style={{ marginRight: '6px' }} /> View Details
                   </button>
                 </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                 <div style={{ width: 60, height: 60, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                   <Info size={30} style={{ color: '#94a3b8' }} />
                 </div>
                 <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>No tickets found</h3>
                 <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 300, margin: '0 auto' }}>You have no tickets matching this search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 6. NOTIFICATIONS TAB
  const NotificationsTab = () => {
    const [notifs, setNotifs] = useState([]);
    const [loadingNotifs, setLoadingNotifs] = useState(true);
    const [errorNotifs, setErrorNotifs] = useState(null);

    useEffect(() => {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // Polling for real-time updates
      return () => clearInterval(interval);
    }, []);

    const fetchNotifs = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('https://myclaimportal.onrender.com/api/notifications', config);
        setNotifs(data.notifications || data || []);
        setErrorNotifs(null);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
        if (notifs.length === 0) setErrorNotifs('Failed to load notifications. Please try again later.');
      } finally {
        setLoadingNotifs(false);
      }
    };

    const handleMarkAsRead = async (id) => {
      try {
        setNotifs(notifs.map(n => n._id === id ? { ...n, isRead: true } : n)); // Optimistic UI
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.patch(`https://myclaimportal.onrender.com/api/notifications/${id}/read`, {}, config);
      } catch (err) {
        console.error(err);
      }
    };

    const handleMarkAll = async () => {
      try {
        setNotifs(notifs.map(n => ({ ...n, isRead: true }))); // Optimistic UI
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.patch('https://myclaimportal.onrender.com/api/notifications/read-all', {}, config);
      } catch (err) {
        console.error(err);
      }
    };

    const getIconForNotif = (title = '') => {
      const t = title.toLowerCase();
      if (t.includes('approved') || t.includes('verified') || t.includes('success')) return { icon: Shield, color: CL.success };
      if (t.includes('rejected') || t.includes('reupload') || t.includes('alert')) return { icon: AlertCircle, color: CL.danger };
      if (t.includes('completed')) return { icon: CheckCircle2, color: CL.success };
      if (t.includes('document')) return { icon: FileText, color: CL.primary };
      if (t.includes('status') || t.includes('progress')) return { icon: Activity, color: CL.warning };
      return { icon: MessageSquare, color: CL.primary };
    };

    if (loadingNotifs) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
              Syncing notifications...
           </div>
        </div>
      );
    }

    if (errorNotifs) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--danger, #ef4444)' }}>
           <AlertCircle size={30} style={{ color: 'var(--danger, #ef4444)', margin: '0 auto 20px' }} />
           <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>Failed to load</h3>
           <p style={{ color: '#64748b', fontSize: '14px' }}>{errorNotifs}</p>
           <button onClick={() => { setLoadingNotifs(true); fetchNotifs(); }} className="topbar-btn" style={{ marginTop: 24, padding: '10px 24px' }}>Retry</button>
        </div>
      );
    }

    const unreadCount = notifs.filter(n => !n.isRead).length;

    return (
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <div>
             <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Notifications</h2>
             <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.</p>
           </div>
           {unreadCount > 0 && (
             <button onClick={handleMarkAll} className="topbar-btn secondary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
               <CheckCircle2 size={16} /> Mark All as Read
             </button>
           )}
        </div>

        <div className="card" style={{ padding: '24px' }}>
           {notifs.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ width: 60, height: 60, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Bell size={30} style={{ color: '#94a3b8' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>No Notifications</h3>
                <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 300, margin: '0 auto' }}>You're all caught up! Important updates about your services will appear here.</p>
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {notifs.map(notif => {
                 const { icon: NIcon, color: nColor } = getIconForNotif(notif.title);
                 return (
                   <div key={notif._id} style={{ 
                     display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', 
                     padding: '16px', background: notif.isRead ? 'var(--bg)' : `${nColor}0A`, 
                     borderRadius: '12px', border: `1px solid ${notif.isRead ? 'var(--border)' : `${nColor}30`}` 
                   }}>
                     <div style={{ display: 'flex', gap: '16px' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: notif.isRead ? 'var(--border)' : nColor, color: notif.isRead ? 'var(--text-muted)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         <NIcon size={18} />
                       </div>
                       <div>
                         <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{notif.title}</div>
                         <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{notif.message}</div>
                         <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600, marginTop: '8px' }}>
                           {new Date(notif.createdAt).toLocaleString()}
                         </div>
                       </div>
                     </div>
                     {!notif.isRead && (
                       <button onClick={() => handleMarkAsRead(notif._id)} style={{ background: 'none', border: 'none', color: CL.primary, fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '8px' }}>
                         Mark as Read
                       </button>
                     )}
                   </div>
                 );
               })}
             </div>
           )}
        </div>
      </div>
    );
  };

  // 7. PROFILE TAB
  const ProfileTab = () => {
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [errorProfile, setErrorProfile] = useState(null);
    
    // Edit modes
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
    
    // Forms
    const [personalForm, setPersonalForm] = useState({ name: '', email: '', phone: '', alternatePhone: '', address: '', city: '', state: '', pincode: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    const [submittingPersonal, setSubmittingPersonal] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);
    const [uploadingPic, setUploadingPic] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
      fetchProfile();
    }, []);

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setErrorProfile(null);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('https://myclaimportal.onrender.com/api/users/client/profile', config);
        setProfile(data);
        setPersonalForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          alternatePhone: data.alternatePhone || '',
          address: data.permanentAddress || data.address?.permanentAddress || '',
          city: data.city || data.address?.city || '',
          state: data.state || data.address?.state || '',
          pincode: data.pincode || data.address?.pincode || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
        setErrorProfile('Failed to load profile details.');
      } finally {
        setLoadingProfile(false);
      }
    };

    const handlePersonalUpdate = async (e) => {
      e.preventDefault();
      try {
        setSubmittingPersonal(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.patch('https://myclaimportal.onrender.com/api/users/client/profile', personalForm, config);
        alert('Personal information updated successfully!');
        setIsEditingPersonalInfo(false);
        fetchProfile(); // Refresh
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update personal info');
      } finally {
        setSubmittingPersonal(false);
      }
    };

    const handlePasswordUpdate = async (e) => {
      e.preventDefault();
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert("New passwords do not match!");
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      try {
        setSubmittingPassword(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.patch('https://myclaimportal.onrender.com/api/users/client/profile', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }, config);
        alert('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update password');
      } finally {
        setSubmittingPassword(false);
      }
    };

    const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("Only JPG, PNG, and WEBP formats are supported.");
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        setUploadingPic(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data' } };
        await axios.patch('https://myclaimportal.onrender.com/api/users/client/profile', formData, config);
        alert('Profile picture updated!');
        fetchProfile();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to upload photo');
      } finally {
        setUploadingPic(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    if (loadingProfile) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
              Loading profile data...
           </div>
        </div>
      );
    }
    
    if (errorProfile) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--danger, #ef4444)' }}>
           <AlertCircle size={30} style={{ color: 'var(--danger, #ef4444)', margin: '0 auto 20px' }} />
           <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>Failed to load</h3>
           <p style={{ color: '#64748b', fontSize: '14px' }}>{errorProfile}</p>
           <button onClick={fetchProfile} className="topbar-btn" style={{ marginTop: 24, padding: '10px 24px' }}>Retry</button>
        </div>
      );
    }

    const isVerified = profile.status === 'verified' || profile.kyc_status === 'verified' || (profile.kyc_data && profile.kyc_data.pan);

    return (
      <div className="animate-slide-up">
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Profile Management</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Profile Overview */}
            <div className="card" style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 16px' }}>
                 <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: CL.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.primary, fontSize: '40px', fontWeight: 800, overflow: 'hidden', border: `4px solid var(--bg)` }}>
                    {profile.profilePicture ? (
                      <img src={`https://myclaimportal.onrender.com${profile.profilePicture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      profile.name?.substring(0,2).toUpperCase() || <UserCircle size={48} />
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                 <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPic} style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: '50%', background: CL.primary, color: '#fff', border: '4px solid var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={16} />
                 </button>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{profile.name}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 700 }}>Client ID: {profile.client_id_ref || profile._id?.substring(0,8).toUpperCase()}</div>
              
              <div style={{ display: 'inline-block', padding: '6px 12px', background: profile.is_active !== false ? `${CL.success}15` : `${CL.danger}15`, color: profile.is_active !== false ? CL.success : CL.danger, borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                Account Status: {profile.is_active !== false ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Account Information */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}><UserCircle size={18} color={CL.primary} /> Account Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Username</div>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{profile.username || 'Not set'}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Registration Date</div>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{new Date(profile.createdAt).toLocaleString()}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Last Login Time</div>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{new Date().toLocaleString()} (Current)</div>
                 </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="card" style={{ padding: '24px', border: `1px dashed ${CL.primary}50`, background: `${CL.primary}05` }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} color={CL.primary} /> Security Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Active Session Info</div>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Token Valid (Local Session)</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Last Login Device</div>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{navigator.userAgent.substring(0, 40)}...</div>
                 </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Personal Information */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Personal Information</h3>
                 {!isEditingPersonalInfo && (
                   <button onClick={() => setIsEditingPersonalInfo(true)} className="topbar-btn secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                     Edit Profile
                   </button>
                 )}
              </div>
              
              <form onSubmit={handlePersonalUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Full Name</label>
                    <input type="text" value={personalForm.name} onChange={e => setPersonalForm({...personalForm, name: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Email Address</label>
                    <input type="email" value={personalForm.email} onChange={e => setPersonalForm({...personalForm, email: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Mobile Number</label>
                    <input type="text" value={personalForm.phone} onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Alternate Mobile Number</label>
                    <input type="text" value={personalForm.alternatePhone} onChange={e => setPersonalForm({...personalForm, alternatePhone: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Address</label>
                    <input type="text" value={personalForm.address} onChange={e => setPersonalForm({...personalForm, address: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>City</label>
                    <input type="text" value={personalForm.city} onChange={e => setPersonalForm({...personalForm, city: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>State</label>
                    <input type="text" value={personalForm.state} onChange={e => setPersonalForm({...personalForm, state: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>PIN Code</label>
                    <input type="text" value={personalForm.pincode} onChange={e => setPersonalForm({...personalForm, pincode: e.target.value})} disabled={!isEditingPersonalInfo} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEditingPersonalInfo ? 'var(--bg)' : 'transparent', color: isEditingPersonalInfo ? 'var(--text)' : 'var(--text-muted)' }} />
                  </div>
                </div>
                
                {isEditingPersonalInfo && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" onClick={() => { setIsEditingPersonalInfo(false); setPersonalForm({ name: profile.name || '', email: profile.email || '', phone: profile.phone || '', alternatePhone: profile.alternatePhone || '', address: profile.permanentAddress || profile.address?.permanentAddress || '', city: profile.city || profile.address?.city || '', state: profile.state || profile.address?.state || '', pincode: profile.pincode || profile.address?.pincode || '' }); }} className="topbar-btn secondary" style={{ padding: '12px 24px' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={submittingPersonal} className="topbar-btn" style={{ padding: '12px 24px' }}>
                      {submittingPersonal ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* KYC Information */}
            <div className="card" style={{ padding: '32px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} color={isVerified ? CL.success : CL.warning} /> KYC Information</h3>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>PAN Number</div>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{profile.kyc_data?.pan ? profile.kyc_data.pan.replace(/.(?=.{4})/g, '*') : 'Not Provided'}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Aadhaar Number</div>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{profile.kyc_data?.aadhaar ? profile.kyc_data.aadhaar.replace(/.(?=.{4})/g, '*') : 'Not Provided'}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>KYC Status</div>
                   <div style={{ display: 'inline-block', padding: '4px 10px', background: isVerified ? `${CL.success}15` : `${CL.warning}15`, color: isVerified ? CL.success : CL.warning, borderRadius: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                     {isVerified ? 'Verified' : 'Pending'}
                   </div>
                 </div>
                 {isVerified && (
                   <div>
                     <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Verification Date</div>
                     <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{new Date(profile.updatedAt).toLocaleDateString()}</div>
                   </div>
                 )}
               </div>
            </div>

            {/* Password Management */}
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={20} color={CL.primary} /> Change Password</h3>
              
              <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Current Password</label>
                    <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }} required />
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>Password must be at least 6 characters.</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }} required />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="submit" disabled={submittingPassword} className="topbar-btn" style={{ padding: '12px 24px' }}>
                    {submittingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // 8. SUPPORT TAB
  const SupportTab = () => {
    const [supportTickets, setSupportTickets] = useState([]);
    const [loadingSupport, setLoadingSupport] = useState(true);
    const [errorSupport, setErrorSupport] = useState(null);
    const [supportModal, setSupportModal] = useState({ open: false, subject: '', notes: '' });
    const [submittingSupport, setSubmittingSupport] = useState(false);

    useEffect(() => {
      fetchSupport();
    }, []);

    const fetchSupport = async () => {
      try {
        setLoadingSupport(true);
        setErrorSupport(null);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        // Fetch tickets with hubType = Support Hub
        const { data } = await axios.get('https://myclaimportal.onrender.com/api/tickets?hubType=Support Hub', config);
        setSupportTickets(data);
      } catch (err) {
        console.error('Failed to fetch support tickets', err);
        setErrorSupport('Failed to load your support requests.');
      } finally {
        setLoadingSupport(false);
      }
    };

    const handleCreateSupport = async (e) => {
      e.preventDefault();
      try {
        setSubmittingSupport(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.post('https://myclaimportal.onrender.com/api/tickets', {
          clientId: user?._id,
          hubType: 'Support Hub',
          subject: supportModal.subject,
          service: 'General Support',
          notes: supportModal.notes
        }, config);
        alert('Support request submitted successfully!');
        setSupportModal({ open: false, subject: '', notes: '' });
        fetchSupport();
      } catch (err) {
        console.error('Failed to create support ticket', err);
        alert('Failed to submit request.');
      } finally {
        setSubmittingSupport(false);
      }
    };

    return (
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Support Requests</h2>
           <button onClick={() => setSupportModal({ ...supportModal, open: true })} className="topbar-btn" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, background: CL.gradientPrimary, color: '#fff', border: 'none', borderRadius: '12px' }}>
             <Plus size={16} /> Raise Support Ticket
           </button>
        </div>

        {loadingSupport ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
                Loading support history...
             </div>
          </div>
        ) : errorSupport ? (
          <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--danger, #ef4444)' }}>
             <AlertCircle size={30} style={{ color: 'var(--danger, #ef4444)', margin: '0 auto 20px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>Failed to load</h3>
             <p style={{ color: '#64748b', fontSize: '14px' }}>{errorSupport}</p>
             <button onClick={fetchSupport} className="topbar-btn" style={{ marginTop: 24, padding: '10px 24px' }}>Retry</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {supportTickets.map(t => (
              <div key={t._id} className="card card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${CL.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.primary }}>
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 0.5 }}>#{String(t._id).substring(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, marginTop: 4, color: 'var(--text)' }}>{t.subject || t.service}</div>
                      </div>
                    </div>
                    <Badge status={t.status || 'open'} />
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Created On</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Last Updated</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                     <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{(t.status || 'open').replace('_', ' ')}</div>
                   </div>
                 </div>

                 {t.notes && (
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, padding: '0 8px' }}>
                     <strong>Description:</strong> {t.notes}
                   </div>
                 )}

                 <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                   <button onClick={() => setSelectedTicket(t)} className="topbar-btn" style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                     <Eye size={16} style={{ marginRight: '6px' }} /> View Full Details & Timeline
                   </button>
                 </div>
              </div>
            ))}
            
            {supportTickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                 <div style={{ width: 60, height: 60, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                   <MessageSquare size={30} style={{ color: '#94a3b8' }} />
                 </div>
                 <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>No support requests</h3>
                 <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 300, margin: '0 auto' }}>You haven't raised any support tickets yet. Click the button above to get help.</p>
              </div>
            )}
          </div>
        )}

        {supportModal.open && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
            <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={20} color={CL.primary} /> Raise Support Ticket</h3>
              </div>
              
              <form onSubmit={handleCreateSupport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
                  <input type="text" required value={supportModal.subject} onChange={e => setSupportModal({...supportModal, subject: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '14px' }} placeholder="E.g. Issue with uploading documents" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>Description</label>
                  <textarea required value={supportModal.notes} onChange={e => setSupportModal({...supportModal, notes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', minHeight: '120px', resize: 'vertical', fontSize: '14px' }} placeholder="Provide details about your issue..." />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setSupportModal({ open: false, subject: '', notes: '' })} disabled={submittingSupport} className="topbar-btn secondary" style={{ padding: '12px 24px' }}>Cancel</button>
                  <button type="submit" disabled={submittingSupport} className="topbar-btn" style={{ padding: '12px 24px', background: CL.gradientPrimary, color: '#fff', border: 'none' }}>
                    {submittingSupport ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 5. DOCUMENTS TAB
  const DocumentsTab = () => {
    const [docs, setDocs] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [errorDocs, setErrorDocs] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
      fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
      try {
        setLoadingDocs(true);
        setErrorDocs(null);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('https://myclaimportal.onrender.com/api/documents', config);
        setDocs(data);
      } catch (err) {
        console.error('Failed to fetch documents', err);
        setErrorDocs('Failed to load your documents. Please try again later.');
      } finally {
        setLoadingDocs(false);
      }
    };

    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('linked_to', 'client');
      formData.append('client_id', user?._id);
      formData.append('name', file.name);

      try {
        setUploading(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data' } };
        await axios.post('https://myclaimportal.onrender.com/api/documents/upload', formData, config);
        alert('Document uploaded successfully!');
        fetchDocuments();
      } catch (err) {
        console.error('Upload failed', err);
        alert('Failed to upload document.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    return (
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: 800 }}>My Documents</h2>
           <div>
             <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleFileUpload} />
             <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="topbar-btn" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, background: CL.primary, color: '#fff' }}>
               <Plus size={16} /> {uploading ? 'Uploading...' : 'Upload Document'}
             </button>
           </div>
        </div>

        {loadingDocs ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
                Loading your documents...
             </div>
          </div>
        ) : errorDocs ? (
          <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--danger, #ef4444)' }}>
             <AlertCircle size={30} style={{ color: 'var(--danger, #ef4444)', margin: '0 auto 20px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 10 }}>Error</h3>
             <p style={{ color: '#64748b', fontSize: '14px' }}>{errorDocs}</p>
             <button onClick={fetchDocuments} className="topbar-btn" style={{ marginTop: 24, padding: '10px 24px' }}>Retry</button>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Name</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Upload Date</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verification Status</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remarks</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => {
                  const isRejected = doc.verification_status === 'rejected';
                  const statusColor = doc.verification_status === 'verified' ? CL.success : isRejected ? CL.danger : CL.warning;
                  const statusText = isRejected ? 'Reupload Required' : doc.verification_status || 'Pending';
                  
                  // Fix document URL path to include the backend host
                  const rawUrl = doc.fileUrl || doc.file_url || '';
                  const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://myclaimportal.onrender.com${rawUrl}`;
                  
                  return (
                    <tr key={doc._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CL.primary }}>
                            <FileText size={16} />
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{doc.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ padding: '6px 12px', background: `${statusColor}15`, color: statusColor, borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {statusText}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>{doc.verification_notes || '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <a href={fullUrl} target="_blank" rel="noreferrer" style={{ padding: '8px', background: 'var(--bg)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer' }} title="View">
                            <Eye size={16} />
                          </a>
                          <a href={fullUrl} download target="_blank" rel="noreferrer" style={{ padding: '8px', background: 'var(--bg)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer' }} title="Download">
                            <Download size={16} />
                          </a>
                          {isRejected && (
                            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px', background: `${CL.danger}15`, border: 'none', borderRadius: '8px', color: CL.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 700 }} title="Upload Additional Requested Documents">
                              <Upload size={14} /> Reupload
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {docs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', padding: '20px', background: 'var(--bg)', borderRadius: '50%', color: 'var(--text-muted)', marginBottom: 16 }}>
                        <FileText size={32} />
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>No documents found</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 8 }}>Upload documents to get started.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // 4. TICKET DETAILS PAGE
  const TicketDetails = ({ ticketInfo, onBack }) => {
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
      const fetchDetails = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user?.token}` } };
          const { data } = await axios.get(`https://myclaimportal.onrender.com/api/tickets/${ticketInfo._id}`, config);
          setDetails(data);
        } catch (err) {
          console.error('Failed to fetch details', err);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchDetails();
    }, [ticketInfo._id]);

    if (loadingDetails) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-muted)' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
              Loading ticket details...
           </div>
        </div>
      );
    }

    const { ticket, documents, activities } = details || {};
    
    if (!ticket) {
      return (
        <div className="animate-slide-up">
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: CL.primary, fontWeight: 700, cursor: 'pointer', marginBottom: '24px' }}>
            <ArrowUpRight size={16} style={{ transform: 'rotate(-90deg)' }} /> Back to List
          </button>
          <div style={{ padding: '60px', textAlign: 'center', background: 'var(--card)', borderRadius: '24px' }}>
             <AlertCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
             <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 8 }}>Ticket Details Unavailable</h3>
             <p style={{ color: 'var(--text-muted)' }}>We could not load the details for this ticket. It may have been deleted or you do not have permission to view it.</p>
          </div>
        </div>
      );
    }

    // Determine Timeline Progress
    // Logic: Look at ticket status and activities to light up steps
    const stages = [
      { id: 'created', label: 'Ticket Created', icon: Plus, active: true },
      { id: 'documents', label: 'Documents Uploaded', icon: FileText, active: documents?.length > 0 },
      { id: 'verified', label: 'Verification Completed', icon: Shield, active: ticket?.status === 'in_process' || ticket?.status === 'completed' || ticket?.status === 'closed' },
      { id: 'processing', label: 'Processing Started', icon: Activity, active: ticket?.status === 'in_process' || ticket?.status === 'completed' || ticket?.status === 'closed' },
      { id: 'submitted', label: 'Application Submitted', icon: ClipboardList, active: ticket?.status === 'completed' || ticket?.status === 'closed' },
      { id: 'completed', label: 'Completed', icon: CheckCircle2, active: ticket?.status === 'completed' || ticket?.status === 'closed' }
    ];

    return (
      <div className="animate-slide-up">
         <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: CL.primary, fontWeight: 700, cursor: 'pointer', marginBottom: '24px' }}>
           <ArrowUpRight size={16} style={{ transform: 'rotate(-90deg)' }} /> Back to List
         </button>
         
         <div className="grid-2" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Service Details Card */}
              <div className="card" style={{ padding: '32px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                   <div>
                     <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>TICKET #{String(ticket._id).substring(0, 8).toUpperCase()}</div>
                     <h2 style={{ fontSize: '24px', fontWeight: 850, color: 'var(--text)' }}>{ticket.service || ticket.subject || 'Service Detail'}</h2>
                   </div>
                   <Badge status={ticket.status || 'active'} />
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
                    <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Created On</div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Priority</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize' }}>{ticket.priority || 'Medium'}</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Category</div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{ticket.hubType || ticket.vertical || 'Claim Hub'}</div>
                    </div>
                 </div>

                 <div style={{ marginTop: '32px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>Description & Updates</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {ticket.notes || "No description provided for this service."}
                    </p>
                 </div>
              </div>

              {/* Progress Timeline */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={18} /> Service Progress
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                   {/* Track Line */}
                   <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', height: '4px', background: 'var(--border)', zIndex: 1, borderRadius: '4px' }} />
                   
                   {stages.map((stage, i) => {
                      const SIcon = stage.icon;
                      return (
                        <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, flex: 1 }}>
                          <div style={{ 
                            width: '48px', height: '48px', borderRadius: '50%', 
                            background: stage.active ? CL.primary : 'var(--bg)', 
                            color: stage.active ? '#fff' : 'var(--text-muted)',
                            border: `4px solid var(--card)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}>
                            <SIcon size={20} />
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, textAlign: 'center', color: stage.active ? 'var(--text)' : 'var(--text-muted)', maxWidth: '70px', lineHeight: 1.3 }}>
                            {stage.label}
                          </div>
                        </div>
                      )
                   })}
                </div>
              </div>

            </div>

            {/* Sidebar Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               
               {/* Activities List */}
               <div className="card" style={{ padding: '24px' }}>
                 <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <History size={16} /> Activity Logs
                 </div>
                 <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                    {activities && activities.length > 0 ? activities.map((act) => (
                      <div key={act._id || Math.random()} style={{ position: 'relative', marginBottom: '24px' }}>
                        <div style={{ position: 'absolute', left: -24, top: 2, width: 10, height: 10, borderRadius: '50%', background: CL.primary, border: '2px solid var(--card)', zIndex: 1 }} />
                        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>{act.action}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(act.createdAt).toLocaleString()}</div>
                      </div>
                    )) : (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No activities recorded yet.</div>
                    )}
                 </div>
               </div>

               {/* Attached Documents */}
               <div className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} /> Attached Documents
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {documents && documents.length > 0 ? documents.map(doc => {
                       const rawUrl = doc.fileUrl || doc.file_url || '';
                       const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://myclaimportal.onrender.com${rawUrl}`;
                       return (
                       <div key={doc._id} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                           <FileText size={16} style={{ color: CL.primary, minWidth: 16 }} />
                           <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
                         </div>
                         <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: CL.primary, display: 'flex' }}>
                           <Download size={14} style={{ cursor: 'pointer' }} />
                         </a>
                       </div>
                     )}) : (
                       <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No documents uploaded.</div>
                     )}
                  </div>
               </div>

               <div className="card" style={{ padding: '24px', background: 'rgba(21, 128, 61, 0.05)', border: `1px dashed ${CL.primary}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: CL.primary, marginBottom: 12 }}>
                    <MessageSquare size={18} />
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>Need Assistance?</div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 16 }}>If you have questions about this ticket, please contact support.</p>
                  <button style={{ width: '100%', padding: '10px', background: CL.primary, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}>Contact Support</button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  // 9. TRACK PROGRESS TAB
  const TrackProgressTab = () => {
    const activeTickets = tickets.filter(t => t.status !== 'completed' && t.status !== 'closed' && t.hubType !== 'Support Hub');
    const [progressData, setProgressData] = useState({});
    const [loadingProgress, setLoadingProgress] = useState(true);

    useEffect(() => {
      if (activeTickets.length === 0) {
        setLoadingProgress(false);
        return;
      }
      
      const fetchProgress = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user?.token}` } };
          const promises = activeTickets.map(t => axios.get(`https://myclaimportal.onrender.com/api/tickets/${t._id}`, config));
          const results = await Promise.all(promises);
          
          const newProgressData = {};
          results.forEach(res => {
             const data = res.data;
             if (data.ticket) newProgressData[data.ticket._id] = data;
          });
          setProgressData(newProgressData);
        } catch (err) {
          console.error("Failed to fetch tracking data", err);
        } finally {
          setLoadingProgress(false);
        }
      };
      fetchProgress();
      
      // Auto-update every 30 seconds
      const interval = setInterval(fetchProgress, 30000);
      return () => clearInterval(interval);
    }, [tickets]);

    if (loadingProgress) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
              Loading progress tracker...
           </div>
        </div>
      );
    }

    return (
      <div className="animate-slide-up">
        <div style={{ marginBottom: '24px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Track Progress</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Monitor the real-time timeline of your active services.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeTickets.length === 0 ? (
            <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
               <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', margin: '0 auto 16px' }}>
                 <Activity size={32} />
               </div>
               <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>No active tracking available</h3>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>You do not have any in-progress services to track right now.</p>
            </div>
          ) : (
            activeTickets.map((t) => {
              const details = progressData[t._id];
              if (!details) return null;

              const { ticket, documents, activities } = details;
              const hasDocs = documents && documents.length > 0;
              const isVerified = ticket.status === 'in_process' || ticket.status === 'completed' || ticket.status === 'closed';
              const hasProcessing = activities?.some(a => a.action.toLowerCase().includes('process'));
              const hasSubmitted = activities?.some(a => a.action.toLowerCase().includes('submit'));
              
              const stages = [
                { id: 'created', label: 'Ticket Created', icon: Plus, active: true },
                { id: 'documents', label: 'Documents Uploaded', icon: FileText, active: hasDocs },
                { id: 'verified', label: 'Documents Verified', icon: Shield, active: isVerified },
                { id: 'processing', label: 'Processing Started', icon: Activity, active: hasProcessing || isVerified },
                { id: 'submitted', label: 'Application Submitted', icon: ClipboardList, active: hasSubmitted || ticket.status === 'completed' },
                { id: 'completed', label: 'Completed', icon: CheckCircle2, active: ticket.status === 'completed' || ticket.status === 'closed' }
              ];

              const completedStages = stages.filter(s => s.active).length;
              const percentage = Math.round((completedStages / stages.length) * 100);
              const currentStage = stages.slice().reverse().find(s => s.active)?.label || 'Ticket Created';

              return (
                <div key={t._id} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>TICKET #{String(t._id).substring(0, 8).toUpperCase()}</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{t.service || 'Service Request'}</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 850, color: CL.primary }}>{percentage}%</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complete</div>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Current Stage</div>
                       <div style={{ fontSize: '14px', fontWeight: 700, color: CL.primary }}>{currentStage}</div>
                     </div>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Last Updated</div>
                       <div style={{ fontSize: '14px', fontWeight: 700 }}>{new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</div>
                     </div>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Assigned Admin</div>
                       <div style={{ fontSize: '14px', fontWeight: 700 }}>{ticket.assigned_to?.name || ticket.assigned_to || 'Unassigned'}</div>
                     </div>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                       <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize' }}>{(t.status || 'active').replace('_', ' ')}</div>
                     </div>
                   </div>

                   <div style={{ marginTop: '16px', position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', height: '4px', background: 'var(--border)', zIndex: 1, borderRadius: '4px' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', width: `${percentage > 0 ? ((completedStages - 1) / (stages.length - 1)) * 100 : 0}%`, height: '4px', background: CL.primary, zIndex: 2, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      
                      {stages.map((stage) => {
                         const SIcon = stage.icon;
                         return (
                           <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 3, flex: 1 }}>
                             <div style={{ 
                               width: '48px', height: '48px', borderRadius: '50%', 
                               background: stage.active ? CL.primary : 'var(--bg)', 
                               color: stage.active ? '#fff' : 'var(--text-muted)',
                               border: `4px solid var(--card)`,
                               display: 'flex', alignItems: 'center', justifyContent: 'center',
                               transition: 'all 0.3s ease',
                               boxShadow: stage.active ? `0 4px 12px ${CL.primary}40` : 'none'
                             }}>
                               <SIcon size={20} />
                             </div>
                             <div style={{ fontSize: '11px', fontWeight: 700, textAlign: 'center', color: stage.active ? 'var(--text)' : 'var(--text-muted)', maxWidth: '80px', lineHeight: 1.3 }}>
                               {stage.label}
                             </div>
                           </div>
                         )
                      })}
                   </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ─── Main Render ───────────────────────────────────────────
  return (
    <div style={{ height: '100%' }}>
      {loading && activePage === 'overview' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-muted)' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Clock size={40} className="animate-pulse" style={{ opacity: 0.3 }} />
              Synchronizing your workspace...
           </div>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: 'var(--card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <AlertCircle size={48} style={{ color: 'var(--danger, #ef4444)' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Failed to sync workspace</h3>
              <p style={{ color: 'var(--text-muted)' }}>{error}</p>
              <button onClick={fetchData} className="topbar-btn" style={{ marginTop: 12, padding: '10px 24px' }}>Retry</button>
           </div>
        </div>
      ) : (
        <div style={{ paddingBottom: '60px' }}>
          {selectedTicket ? (
            <TicketDetails ticketInfo={selectedTicket} onBack={() => setSelectedTicket(null)} />
          ) : (
            <>
              {activePage === 'overview' && <OverviewTab />}
              {(activePage === 'services' || activePage === 'client-services') && <ServicesTab />}
              {(activePage === 'tickets' || activePage === 'client-tickets') && <TicketsTab />}
              {(activePage === 'documents' || activePage === 'client-docs') && <DocumentsTab />}
              {activePage === 'notifications' && <NotificationsTab />}
              {activePage === 'profile' && <ProfileTab />}
              {activePage === 'support' && <SupportTab />}
              {activePage === 'track-progress' && <TrackProgressTab />}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;

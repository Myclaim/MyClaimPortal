import React, { useState } from 'react';
import {
  Users, ClipboardCheck, TrendingUp, Plus, Search,
  Eye, CheckCircle2, BarChart3,
  Zap, Target, RefreshCw, AlertCircle,
  ChevronRight, Briefcase,
  UserPlus, Send, Star,
  LogOut, LayoutDashboard, Network, Bell, Ticket, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../../components/ui/StatCard';
import useAuth from '../../../hooks/useAuth';
import api from '../../../services/api';
import CreateTicketModal from '../../../components/forms/CreateTicketModal';

/* ─── Inline badge styles (avoids missing CSS-var errors) ────── */
const BADGE_STYLES = {
  'New':           { bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8', dot: '#3b82f6'  },
  'In Discussion': { bg: 'rgba(245,158,11,0.12)',  color: '#b45309', dot: '#f59e0b'  },
  'Not Interested':{ bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c', dot: '#ef4444'  },
  'Converted':     { bg: 'rgba(34,197,94,0.12)',   color: '#15803d', dot: '#22c55e'  },
  'Active':        { bg: 'rgba(34,197,94,0.12)',   color: '#15803d', dot: '#22c55e'  },
  'In Process':    { bg: 'rgba(245,158,11,0.12)',  color: '#b45309', dot: '#f59e0b'  },
  'Completed':     { bg: 'rgba(100,116,139,0.12)', color: '#475569', dot: '#94a3b8'  },
};
const VERTICAL_STYLES = {
  claim:   { label: 'Claim Hub',   color: '#6d28d9', bg: 'rgba(109,40,217,0.1)'  },
  service: { label: 'Service Hub', color: '#0369a1', bg: 'rgba(3,105,161,0.1)'   },
  store:   { label: 'Store',       color: '#b45309', bg: 'rgba(180,83,9,0.1)'    },
};

const StatusBadge = ({ status }) => {
  const s = BADGE_STYLES[status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  );
};

const ServiceBadge = ({ vertical }) => {
  const v = VERTICAL_STYLES[vertical] || { label: vertical, color: '#475569', bg: '#f1f5f9' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 20, background: v.bg, color: v.color,
      textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      {v.label}
    </span>
  );
};

/* ─── Mock data (scoped to this Partner only) ──────────────── */
const MOCK_LEADS = [
  { id: 'LD-001', name: 'Ramesh Agarwal', phone: '+91 98765 00001', service: 'IEPF Claim',    status: 'Converted',      date: '12 Apr 2026' },
  { id: 'LD-002', name: 'Sunita Mehta',   phone: '+91 98765 00002', service: 'GST Filing',    status: 'In Discussion',  date: '13 Apr 2026' },
  { id: 'LD-003', name: 'Vikram Singh',   phone: '+91 98765 00003', service: 'Pre-IPO',       status: 'New',            date: '14 Apr 2026' },
  { id: 'LD-004', name: 'Pooja Desai',    phone: '+91 98765 00004', service: 'Share Recovery', status: 'Not Interested', date: '10 Apr 2026' },
  { id: 'LD-005', name: 'Aniket Joshi',   phone: '+91 98765 00005', service: 'Company Reg.',  status: 'Converted',      date: '09 Apr 2026' },
  { id: 'LD-006', name: 'Kavita Nair',    phone: '+91 98765 00006', service: 'IEPF Claim',    status: 'In Discussion',  date: '08 Apr 2026' },
];

const MOCK_CLIENTS = [
  { id: 'CL-101', name: 'Ramesh Agarwal', company: 'Agarwal Traders', services: 2, tickets: 3, status: 'Active', since: 'Apr 2026' },
  { id: 'CL-102', name: 'Aniket Joshi',   company: 'Joshi & Co.',     services: 1, tickets: 1, status: 'Active', since: 'Apr 2026' },
  { id: 'CL-103', name: 'Meera Gupta',    company: 'Self',            services: 1, tickets: 2, status: 'Active', since: 'Mar 2026' },
  { id: 'CL-104', name: 'Suresh Patil',   company: 'Patil Exports',   services: 3, tickets: 4, status: 'Active', since: 'Feb 2026' },
];

const MOCK_TICKETS = [
  { id: 'TK-501', client: 'Ramesh Agarwal', service: 'IEPF Claim',    vertical: 'claim',   status: 'In Process', created: '12 Apr 2026', lastUpdate: '2 hours ago'  },
  { id: 'TK-502', client: 'Aniket Joshi',   service: 'Company Reg.',  vertical: 'service', status: 'Active',     created: '09 Apr 2026', lastUpdate: '1 day ago'    },
  { id: 'TK-503', client: 'Meera Gupta',    service: 'GST Filing',    vertical: 'service', status: 'Completed',  created: '01 Apr 2026', lastUpdate: '5 days ago'   },
  { id: 'TK-504', client: 'Suresh Patil',   service: 'Pre-IPO Buy',   vertical: 'store',   status: 'In Process', created: '05 Apr 2026', lastUpdate: '3 hours ago'  },
  { id: 'TK-505', client: 'Ramesh Agarwal', service: 'Dup. Share',    vertical: 'claim',   status: 'Active',     created: '15 Apr 2026', lastUpdate: 'Just now'     },
  { id: 'TK-506', client: 'Suresh Patil',   service: 'GST Filing',    vertical: 'service', status: 'Completed',  created: '20 Mar 2026', lastUpdate: '2 weeks ago'  },
];

const ACTIVITY_FEED = [
  { Icon: CheckCircle2, color: '#22c55e', text: 'Lead "Vikram Singh" marked as New by Super Admin', time: '30 MIN AGO' },
  { Icon: RefreshCw,    color: '#3b82f6', text: 'Ticket TK-501 moved to "In Process"',              time: '2 HRS AGO'  },
  { Icon: UserPlus,     color: '#7c3aed', text: 'Lead "Ramesh Agarwal" converted to client',        time: '1 DAY AGO'  },
  { Icon: AlertCircle,  color: '#f59e0b', text: 'Lead "Pooja Desai" marked Not Interested',         time: '2 DAYS AGO' },
  { Icon: CheckCircle2, color: '#22c55e', text: 'Ticket TK-503 completed by admin team',            time: '5 DAYS AGO' },
];

/* ─── Inline SVG for Home icon ─────────────────────────────── */
function HomeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/* ─── Avatar helper ─────────────────────────────────────────── */
function Avatar({ name, size = 36, gradient = ['#1d4ed8', '#3b82f6'], fontSize = 13 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.27),
      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize, flexShrink: 0,
    }}>
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: OVERVIEW
════════════════════════════════════════════════════════════════ */
function OverviewTab({ onNavigate, stats, recentLeads }) {
  return (
    <>
      {/* Hero Banner */}
      <div style={{
        background: 'var(--banner-bg)', border: '1px solid var(--banner-border)',
        borderRadius: 20, padding: '36px 40px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: 'radial-gradient(circle at 2px 2px, var(--green) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 580 }}>
          <div className="custom-badge badge-green" style={{ marginBottom: 14 }}>
            <Star size={11} /> PARTNER PORTAL — PHASE 1
          </div>
          <h2 style={{
            fontSize: 30, fontWeight: 800, color: 'var(--banner-text)',
            marginBottom: 12, letterSpacing: '-0.5px', lineHeight: 1.2, margin: '0 0 12px',
          }}>
            Grow your network.{' '}
            <span style={{ color: 'var(--green)' }}>Track every opportunity.</span>
          </h2>
          <p style={{ color: 'var(--banner-subtext)', fontSize: 14, lineHeight: 1.65, margin: '0 0 22px' }}>
            Create leads, monitor conversions, and track service tickets — all within your partner scope.
            Every action here is isolated to your data only.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="topbar-btn" style={{ padding: '11px 22px', fontSize: 13 }} onClick={() => onNavigate('leads')}>
              <UserPlus size={14} /> Add New Lead
            </button>
            <button className="topbar-btn secondary" style={{ padding: '11px 22px', fontSize: 13 }} onClick={() => onNavigate('tickets')}>
              <ClipboardCheck size={14} /> View Tickets
            </button>
          </div>
        </div>
        <div style={{
          position: 'absolute', right: 40, bottom: 30, width: 260, height: 120,
          opacity: 0.2, background: 'linear-gradient(to top, var(--green) 0%, transparent 80%)',
          clipPath: 'polygon(0 100%,8% 70%,18% 85%,28% 50%,40% 65%,52% 30%,62% 45%,74% 10%,84% 35%,94% 5%,100% 20%,100% 100%)',
        }} />
      </div>

      {/* Stat Cards */}
      <div className="stats-row cols-4" style={{ marginBottom: 28 }}>
        <StatCard label="My Leads"     value={stats.leads} icon={<Target size={20} />}       trend="Total Captured"        color="#3b82f6" delay={0.05} />
        <StatCard label="Converted"    value={stats.converted} icon={<UserPlus size={20} />}     trend="Success Rate"        color="#22c55e" delay={0.1} />
        <StatCard label="My Clients"   value={stats.clients} icon={<Users size={20} />}        trend="Active network"      color="#7c3aed" delay={0.15} />
        <StatCard label="Open Tickets" value={stats.tickets} icon={<ClipboardCheck size={20} />} trend="Global Support" color="#f59e0b" delay={0.2} />
      </div>

      {/* Two-col: Recent Leads + Activity Feed */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recent Leads */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>Recent Leads</div>
              <div className="card-sub">Your latest network updates</div>
            </div>
            <button className="topbar-btn secondary" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => onNavigate('leads')}>
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentLeads.length > 0 ? recentLeads.map(lead => (
              <div key={lead.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--bg)', border: '1px solid var(--border)',
              }}>
                <Avatar name={lead.name} size={36} gradient={['#1d4ed8', '#3b82f6']} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.service}</div>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            )) : <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No leads yet.</div>}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ fontSize: 16 }}>Activity Feed</div>
            <div className="card-sub">Real-time updates on your data</div>
          </div>
          <div>
            {ACTIVITY_FEED.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 0', borderBottom: i < ACTIVITY_FEED.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: `${item.color}18`, color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <item.Icon size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 700 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: 28 }}>
        <div className="card-title" style={{ fontSize: 16, marginBottom: 18 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { Icon: UserPlus,      label: 'Create New Lead',  sub: 'Add a prospect to the system',   color: '#3b82f6', tab: 'leads'     },
            { Icon: ClipboardCheck,label: 'Raise a Ticket',   sub: 'Initiate a service request',     color: '#7c3aed', tab: 'tickets'   },
            { Icon: Users,         label: 'View My Clients',  sub: 'Browse your client portfolio',   color: '#22c55e', tab: 'clients'   },
            { Icon: BarChart3,     label: 'My Analytics',     sub: 'Review performance metrics',     color: '#f59e0b', tab: 'analytics' },
          ].map(({ Icon, label, sub, color, tab }, i) => (
            <button key={i} type="button" onClick={() => onNavigate(tab)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'all 0.2s', width: '100%',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 6px 18px ${color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: ADD LEAD
════════════════════════════════════════════════════════════════ */
const SERVICE_LIST = [
  'IEPF Claim', 'Share Recovery', 'Duplicate Share Issuance',
  'GST Filing', 'Company Registration', 'Legal Documentation',
  'Pre-IPO Buy', 'Pre-IPO Sell', 'Other',
];

function AddLeadModal({ onClose, onAdd }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', service: '', company: '', notes: '' });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.service) return;
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone,
        serviceInterest: form.service,
        notes: `[Company: ${form.company || 'N/A'}]\n\n${form.notes}`,
      };
      const { data } = await api.post('/leads', payload);
      
      onAdd({
        id: String(data._id).substring(0, 6).toUpperCase(),
        name: data.name,
        phone: data.phone,
        service: data.serviceInterest || 'N/A',
        status: 'New',
        date: new Date(data.createdAt).toLocaleDateString('en-GB')
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to submit lead.');
    }
  };

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Add New Lead</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Capture a new prospect for the system</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Ramesh Agarwal" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} required />
              </div>
            </div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Service Interest *</label>
                <select className="form-select" value={form.service} onChange={set('service')} required>
                  <option value="">Select service…</option>
                  {SERVICE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Company / Organisation</label>
                <input className="form-input" placeholder="Optional" value={form.company} onChange={set('company')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-input" rows={3} placeholder="Context or requirements…" style={{ resize: 'vertical' }} value={form.notes} onChange={set('notes')} />
            </div>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '12px 16px', marginTop: 10, display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <AlertCircle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Once submitted, the lead will appear in the Super Admin's Lead Centre for qualification.
                Conversion to a client is handled centrally.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="topbar-btn secondary" style={{ padding: '10px 20px' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="topbar-btn" style={{ padding: '10px 22px' }}>
              <Send size={13} /> Submit Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: MY LEADS
════════════════════════════════════════════════════════════════ */
const STATUS_FILTERS_LEAD = ['All', 'New', 'In Discussion', 'Converted', 'Not Interested'];

function LeadsTab() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await api.get('/leads');
        
        // Filter to only this partner's leads:
        const myLeads = data.filter(l => l.sourceUserId?._id === user?._id);
        
        const formatted = myLeads.map(l => ({
          id: String(l._id).substring(0, 6).toUpperCase(),
          name: l.name,
          phone: l.phone,
          email: l.email || '—',
          service: l.serviceInterest || 'N/A',
          status: l.status === 'in_discussion' ? 'In Discussion' :
                  l.status === 'converted' ? 'Converted' :
                  l.status === 'not_interested' ? 'Not Interested' : 'New',
          source: l.source || '—',
          category: l.category || '—',
          notes: l.notes || 'No additional notes.',
          date: new Date(l.createdAt).toLocaleDateString('en-GB'),
        }));
        
        setLeads(formatted);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoadingLeads(false);
      }
    };
    if (user?.token) fetchLeads();
  }, [user]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    return (l.name.toLowerCase().includes(q) || l.service.toLowerCase().includes(q))
      && (filterStatus === 'All' || l.status === filterStatus);
  });

  const counts = STATUS_FILTERS_LEAD.slice(1).reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length;
    return acc;
  }, {});

  const statColors = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'];

  return (
    <>
      {/* Info bar */}
      <InfoBanner
        color="#3b82f6"
        title="My Lead Pipeline"
        body="You can create and view leads here. Conversion to clients is handled exclusively by the Super Admin to ensure compliance & KYC standards."
        Icon={Target}
      />

      {/* Mini stats */}
      <div className="stats-row cols-4" style={{ marginBottom: 20 }}>
        {Object.entries(counts).map(([s, c], i) => (
          <StatCard key={s} label={s} value={c} icon={<Target size={18} />} color={statColors[i]} delay={i * 0.05} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search by name or service…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS_LEAD.map(s => (
            <button key={s} type="button" onClick={() => setFilterStatus(s)} style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 600,
              border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit',
              background: filterStatus === s ? 'linear-gradient(135deg,#0f766e,#22c55e)' : 'var(--card)',
              color: filterStatus === s ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
            }}>{s}</button>
          ))}
        </div>
        <button type="button" className="topbar-btn" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Lead
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Lead ID</th><th>Name</th><th>Contact</th>
              <th>Service Interest</th><th>Status</th><th>Date Added</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingLeads ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>Loading leads...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No leads found.</td></tr>
            ) : filtered.map(lead => (
              <tr key={lead.id}>
                <td><span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'monospace' }}>{lead.id}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={lead.name} size={32} gradient={['#1d4ed8', '#3b82f6']} fontSize={11} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{lead.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lead.phone}</td>
                <td style={{ fontSize: 13, color: 'var(--text)' }}>{lead.service}</td>
                <td><StatusBadge status={lead.status} /></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.date}</td>
                <td>
                  <div className="action-icons">
                    <button
                      type="button"
                      className="action-icon"
                      title="View"
                      onClick={() => setSelectedLead(lead)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onAdd={lead => setLeads(prev => [lead, ...prev])}
        />
      )}

      {selectedLead && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setSelectedLead(null); }}>
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '980px', width: '95%', background: 'transparent', padding: 0, boxShadow: 'none' }} onClick={e => e.stopPropagation()}>
            <style>{`
              .lead-view-wrap { padding: 34px 38px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.96)); border-radius: 28px; display: flex; flex-direction: column; box-shadow: 0 28px 70px rgba(15, 23, 42, 0.35); border: 1px solid rgba(148, 163, 184, 0.15); }
              .lead-view-grid { display: grid; grid-template-columns: 280px 1fr; gap: 36px; }
              .lead-view-section { margin-bottom: 28px; }
              .lead-view-title { font-size: 11px; font-weight: 800; color: rgba(226, 232, 240, 0.75); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 14px; border-bottom: 1px solid rgba(148, 163, 184, 0.16); padding-bottom: 10px; }
              .lead-view-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.12); }
              .lead-view-row:last-child { border-bottom: none; }
              .lead-view-label { color: #94a3b8; font-size: 13px; font-weight: 700; }
              .lead-view-value { color: #f8fafc; font-weight: 800; font-size: 13px; text-align: right; }
              .lead-view-value.blue { color: #93c5fd; }
              .lead-view-pill { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 999px; font-size: 12px; font-weight: 800; white-space: nowrap; }
              .lead-view-pill.green-light { background: rgba(16, 185, 129, 0.15); color: #86efac; }
              .lead-view-pill.yellow-light { background: rgba(245, 158, 11, 0.16); color: #facc15; }
              .lead-view-pill.red-light { background: rgba(239, 68, 68, 0.16); color: #fecaca; }
              .lead-view-body { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
              .lead-view-note { margin-top: 16px; padding: 18px 20px; background: rgba(148, 163, 184, 0.12); border-radius: 18px; font-size: 13px; color: #cbd5e1; line-height: 1.7; }
              .lead-view-footer { display: flex; justify-content: flex-end; margin-top: 26px; gap: 12px; }
              .lead-view-btn { padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; border: none; font-family: inherit; }
              .lead-view-btn.gray { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(148, 163, 184, 0.25); color: #f8fafc; }
              .lead-view-btn.gray:hover { background: rgba(255, 255, 255, 0.12); }
            `}</style>

            <div className="lead-view-wrap" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26, gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div className="modal-title" style={{ fontSize: 22, marginBottom: 8 }}>Lead Details — {selectedLead.id}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{selectedLead.name}</div>
                </div>
                <button type="button" className="modal-close" onClick={() => setSelectedLead(null)} style={{ marginTop: 2 }} aria-label="Close">
                  ✕
                </button>
              </div>
              <div className="lead-view-grid">
                <div>
                  <div className="lead-view-section">
                    <div className="lead-view-title">Contact Information</div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Phone</span>
                      <span className="lead-view-value">{selectedLead.phone}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Email</span>
                      <span className="lead-view-value blue">{selectedLead.email}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Category</span>
                      <span className="lead-view-value">{selectedLead.category}</span>
                    </div>
                    <div className="lead-view-row" style={{ alignItems: 'flex-start' }}>
                      <span className="lead-view-label">Notes</span>
                      <span className="lead-view-value" style={{ width: '58%', textAlign: 'right', fontWeight: 500, color: '#334155' }}>{selectedLead.notes}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="lead-view-section">
                    <div className="lead-view-title">Lead Status</div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Status</span>
                      <span className={`lead-view-pill ${selectedLead.status === 'Converted' ? 'green-light' : selectedLead.status === 'Not Interested' ? 'red-light' : selectedLead.status === 'In Discussion' ? 'yellow-light' : 'green-light'}`}>{selectedLead.status}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Service</span>
                      <span className="lead-view-value">{selectedLead.service}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Source</span>
                      <span className="lead-view-value">{selectedLead.source}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Added</span>
                      <span className="lead-view-value">{selectedLead.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lead-view-footer">
                <button type="button" className="lead-view-btn gray" onClick={() => setSelectedLead(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: MY CLIENTS
════════════════════════════════════════════════════════════════ */
function ClientsTab() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/users');

        // Ensure isolation: only clients tied to this specific partner
        const myClients = data.filter(u => 
          u.role === 'client' && 
          u.parent_id && 
          String(u.parent_id) === String(user?._id)
        );
        
        const formatted = myClients.map(c => ({
          id: String(c._id).substring(0, 8).toUpperCase(),
          name: c.name,
          company: c.client_id_ref || 'Personal Account',
          status: c.is_active === false ? 'Inactive' : 'Active',
          since: new Date(c.createdAt).toLocaleDateString('en-GB'),
          services: 0,
          tickets: 0,
        }));
        
        setClients(formatted);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchClients();
  }, [user]);

  const q = search.toLowerCase();
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
  );

  return (
    <>
      <InfoBanner
        color="#7c3aed"
        title="My Client Portfolio"
        body="Clients originated from your converted leads or assigned by the Super Admin. KYC and profile data are read-only — changes must go through the Super Admin."
        Icon={Users}
      />

      <div className="stats-row cols-3" style={{ marginBottom: 20 }}>
        <StatCard label="Total Clients"  value={loading ? '-' : clients.length} icon={<Users size={18} />}        trend="All active"         color="#7c3aed" delay={0.05} />
        <StatCard label="Total Services" value={loading ? '-' : clients.reduce((acc, c) => acc + c.services, 0)}                   icon={<Briefcase size={18} />}    trend="Subscribed scopes" color="#0891b2" delay={0.1}  />
        <StatCard label="Open Tickets"   value="0"                   icon={<ClipboardCheck size={18} />} trend="2 in process"     color="#f59e0b" delay={0.15} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-input" style={{ flex: 1 }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {filtered.map(client => (
          <div key={client.id} className="card" style={{ padding: 24, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px -6px rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <Avatar name={client.name} size={48} gradient={['#6d28d9', '#7c3aed']} fontSize={16} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{client.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{client.company}</div>
              </div>
              <StatusBadge status={client.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Client ID', val: client.id },
                { label: 'Since',     val: client.since },
                { label: 'Services',  val: `${client.services} enrolled` },
                { label: 'Tickets',   val: `${client.tickets} total` },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '9px 12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{val}</div>
                </div>
              ))}
            </div>

            <button type="button" className="topbar-btn secondary" style={{ width: '100%', padding: 10, fontSize: 12 }}>
              <Eye size={13} /> View Client Details
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: RAISE TICKET
════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════
   TAB: MY TICKETS
════════════════════════════════════════════════════════════════ */
const STATUS_FILTERS_TICKET = ['All', 'Active', 'In Process', 'Completed'];

function TicketsTab({ tickets: initialTickets = [], clients = [] }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const dbClients = clients;

  const normalizeClientId = client => {
    if (!client) return '';
    if (typeof client === 'string') return client;
    if (typeof client === 'object') {
      return String(client._id || client.id || client?.toString() || '');
    }
    return String(client);
  };

  const resolveClientName = client => {
    if (!client) return undefined;
    if (typeof client === 'object') {
      if (client.name) return client.name;
      const first = client.firstName || client.first_name || '';
      const last = client.lastName || client.last_name || '';
      if (first || last) return `${first} ${last}`.trim();
      if (client.username) return client.username;
      if (client.email) return client.email;
    }
    return undefined;
  };

  React.useEffect(() => {
    // Process initial tickets from props
    setTickets(initialTickets.map(t => {
      const clientId = normalizeClientId(t.client);
      const nameFromClient = resolveClientName(t.client);
      const clientName = nameFromClient || clients.find(c => String(c._id) === clientId)?.name;

      return {
        id: String(t._id).substring(0, 6).toUpperCase(),
        clientId,
        client: clientName || 'Unknown',
        service: t.service,
        vertical: 'service', // default
        status: t.status === 'in_process' ? 'In Process' : t.status === 'completed' ? 'Completed' : 'Active',
        created: new Date(t.createdAt).toLocaleDateString('en-GB'),
        lastUpdate: 'Recently updated'
      };
    }));
  }, [initialTickets, clients]);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const clientLabel = String(t.client || 'Unknown').toLowerCase();
    return (clientLabel.includes(q) || t.service.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      && (filterStatus === 'All' || t.status === filterStatus);
  });

  const ticketCounts = {
    All: tickets.length,
    Active: tickets.filter(t => t.status === 'Active').length,
    'In Process': tickets.filter(t => t.status === 'In Process').length,
    Completed: tickets.filter(t => t.status === 'Completed').length,
  };

  // Resolve any tickets where client name is missing by fetching user by id
  React.useEffect(() => {
    const unresolved = tickets.filter(t => (t.client === '' || t.client === 'Unknown') && t.clientId);
    if (unresolved.length === 0) return;

    unresolved.forEach(async (tk) => {
      try {
        const { data } = await api.get(`/users/${tk.clientId}`);
        if (data && data.name) {
          setTickets(prev => prev.map(p => p.clientId === tk.clientId ? { ...p, client: data.name } : p));
        } else {
          setTickets(prev => prev.map(p => p.clientId === tk.clientId ? { ...p, client: 'Unknown' } : p));
        }
      } catch (err) {
        setTickets(prev => prev.map(p => p.clientId === tk.clientId ? { ...p, client: 'Unknown' } : p));
      }
    });
  }, [tickets]);

  React.useEffect(() => {
    if (!selectedTicket) return;
    const updated = tickets.find(t => t.id === selectedTicket.id);
    if (updated && updated.client && updated.client !== selectedTicket.client) {
      setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket]);

  return (
    <>
      <InfoBanner
        color="#f59e0b"
        title="My Service Tickets"
        body="You can create and view tickets here. After submission, all processing and status updates are managed by the Super Admin. Tickets are strictly read-only post-creation."
        Icon={ClipboardCheck}
      />

      <div className="stats-row cols-3" style={{ marginBottom: 20 }}>
        <StatCard label="Active"     value={tickets.filter(t => t.status === 'Active').length}     icon={<Zap size={18} />}           trend="Awaiting processing" color="#3b82f6" delay={0.05} />
        <StatCard label="In Process" value={tickets.filter(t => t.status === 'In Process').length} icon={<RefreshCw size={18} />}     trend="Work underway"       color="#f59e0b" delay={0.1}  />
        <StatCard label="Completed"  value={tickets.filter(t => t.status === 'Completed').length}  icon={<CheckCircle2 size={18} />}  trend="Fully delivered"     color="#22c55e" delay={0.15} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search by client, service, or ticket ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS_TICKET.map(s => (
            <button key={s} type="button" onClick={() => setFilterStatus(s)} style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 700,
              border: filterStatus === s ? '1px solid #60a5fa' : '1px solid var(--border)', borderRadius: 10, fontFamily: 'inherit',
              background: filterStatus === s ? 'rgba(96,165,250,0.12)' : 'var(--card)',
              color: filterStatus === s ? '#2563eb' : 'var(--text)', cursor: 'pointer', transition: 'all 0.15s', display:'inline-flex', alignItems:'center', gap:8
            }}>
              <span>{s}</span>
              <span style={{background: filterStatus === s ? '#2563eb' : 'rgba(255,255,255,0.08)', color: filterStatus === s ? '#fff' : 'var(--text)', borderRadius: 999, padding: '2px 8px', fontSize:12, fontWeight:800}}>{ticketCounts[s] || 0}</span>
            </button>
          ))}
        </div>
        <button type="button" className="topbar-btn" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Ticket
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th><th>Client</th><th>Service</th>
              <th>Vertical</th><th>Status</th><th>Created</th><th>Last Update</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No tickets found.</td></tr>
            ) : filtered.map(ticket => (
              <tr key={ticket.id}>
                <td><span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ticket.id}</span></td>
                <td>
                  {(() => {
                    const clientText = ticket.client || 'Unknown';
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Avatar name={clientText} size={30} gradient={['#d97706', '#f59e0b']} fontSize={10} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{clientText}</span>
                      </div>
                    );
                  })()}
                </td>
                <td style={{ fontSize: 13, color: 'var(--text)' }}>{ticket.service}</td>
                <td><ServiceBadge vertical={ticket.vertical} /></td>
                <td><StatusBadge status={ticket.status} /></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.created}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.lastUpdate}</td>
                <td>
                  <div className="action-icons">
                    <button type="button" className="action-icon" title="View" onClick={() => setSelectedTicket(ticket)} style={{ cursor: 'pointer' }}>
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onSuccess={data => setTickets(prev => [{
             id: String(data._id).substring(0, 6).toUpperCase(),
             clientId: data.client?._id || data.clientId,
             client: data.client?.name || dbClients.find(c => String(c._id) === String(data.clientId))?.name || 'Client',
             service: data.service,
             vertical: 'service',
             status: data.status || 'Active',
             created: new Date(data.createdAt).toLocaleDateString('en-GB'),
             lastUpdate: 'Just now'
          }, ...prev])}
          initialClients={dbClients}
        />
      )}

      {selectedTicket && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setSelectedTicket(null); }}>
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '900px', width: '95%', background: 'transparent', padding: 0, boxShadow: 'none' }} onClick={e => e.stopPropagation()}>
            <style>{`
              .lead-view-wrap { padding: 34px 38px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.96)); border-radius: 28px; display: flex; flex-direction: column; box-shadow: 0 28px 70px rgba(15, 23, 42, 0.35); border: 1px solid rgba(148, 163, 184, 0.15); }
              .lead-view-grid { display: grid; grid-template-columns: 280px 1fr; gap: 36px; }
              .lead-view-section { margin-bottom: 28px; }
              .lead-view-title { font-size: 11px; font-weight: 800; color: rgba(226, 232, 240, 0.75); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 14px; border-bottom: 1px solid rgba(148, 163, 184, 0.16); padding-bottom: 10px; }
              .lead-view-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.12); }
              .lead-view-row:last-child { border-bottom: none; }
              .lead-view-label { color: #94a3b8; font-size: 13px; font-weight: 700; }
              .lead-view-value { color: #f8fafc; font-weight: 800; font-size: 13px; text-align: right; }
              .lead-view-value.blue { color: #93c5fd; }
              .lead-view-pill { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 999px; font-size: 12px; font-weight: 800; white-space: nowrap; }
              .lead-view-pill.green-light { background: rgba(16, 185, 129, 0.15); color: #86efac; }
              .lead-view-pill.yellow-light { background: rgba(245, 158, 11, 0.16); color: #facc15; }
              .lead-view-pill.red-light { background: rgba(239, 68, 68, 0.16); color: #fecaca; }
              .lead-view-body { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
              .lead-view-note { margin-top: 16px; padding: 18px 20px; background: rgba(148, 163, 184, 0.12); border-radius: 18px; font-size: 13px; color: #cbd5e1; line-height: 1.7; }
              .lead-view-footer { display: flex; justify-content: flex-end; margin-top: 26px; gap: 12px; }
              .lead-view-btn { padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; border: none; font-family: inherit; }
              .lead-view-btn.gray { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(148, 163, 184, 0.25); color: #f8fafc; }
              .lead-view-btn.gray:hover { background: rgba(255, 255, 255, 0.12); }
            `}</style>

            <div className="lead-view-wrap" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26, gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div className="modal-title" style={{ fontSize: 22, marginBottom: 8 }}>Ticket Details — {selectedTicket.id}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{selectedTicket.client || 'Unknown'}</div>
                </div>
                <button type="button" className="modal-close" onClick={() => setSelectedTicket(null)} style={{ marginTop: 2 }} aria-label="Close">✕</button>
              </div>
              <div className="lead-view-grid">
                <div>
                  <div className="lead-view-section">
                    <div className="lead-view-title">Ticket Info</div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Service</span>
                      <span className="lead-view-value">{selectedTicket.service}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Vertical</span>
                      <span className="lead-view-value">{selectedTicket.vertical}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Created</span>
                      <span className="lead-view-value">{selectedTicket.created}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="lead-view-section">
                    <div className="lead-view-title">Status</div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Status</span>
                      <span className={`lead-view-pill ${selectedTicket.status === 'Completed' ? 'green-light' : selectedTicket.status === 'In Process' ? 'yellow-light' : ''}`}>{selectedTicket.status}</span>
                    </div>
                    <div className="lead-view-row">
                      <span className="lead-view-label">Last Update</span>
                      <span className="lead-view-value">{selectedTicket.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <div className="lead-view-title">Notes</div>
                <div className="lead-view-note">{selectedTicket.notes || 'No notes available.'}</div>
              </div>
              <div className="lead-view-footer">
                <button type="button" className="lead-view-btn gray" onClick={() => setSelectedTicket(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: ANALYTICS
════════════════════════════════════════════════════════════════ */
function AnalyticsTab({ leads = [], tickets = [] }) {
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  
  const funnelData = [
    { label: 'New',            val: leads.filter(l => l.status === 'new' || !l.status).length, color: '#3b82f6' },
    { label: 'In Discussion',  val: leads.filter(l => l.status === 'in_discussion').length, color: '#f59e0b' },
    { label: 'Converted',      val: convertedLeads, color: '#22c55e' },
    { label: 'Not Interested', val: leads.filter(l => l.status === 'not_interested').length, color: '#ef4444' },
  ];

  const verticalData = [
    { label: 'Claim Hub',  tickets: 3, color: '#7c3aed' },
    { label: 'Service Hub',tickets: 2, color: '#0891b2' },
    { label: 'Store',      tickets: 1, color: '#d97706' },
  ];

  const monthly = [
    { month: 'FEB', val: 1 },
    { month: 'MAR', val: 2 },
    { month: 'APR', val: 3 },
  ];
  const maxVal = Math.max(...monthly.map(m => m.val));

  return (
    <>
      <InfoBanner
        color="#22c55e"
        title="Partner Analytics"
        body="All metrics are strictly scoped to your partner data only. No cross-partner visibility."
        Icon={BarChart3}
      />

      <div className="stats-row cols-4" style={{ marginBottom: 28 }}>
        <StatCard label="Total Leads"       value={MOCK_LEADS.length}   icon={<Target size={18} />}        trend="↑ 3 this month"       color="#3b82f6" delay={0.05} />
        <StatCard label="Conversion Rate"   value={`${conversionRate}%`} icon={<TrendingUp size={18} />}  trend="2 of 6 leads"         color="#22c55e" delay={0.1}  />
        <StatCard label="Total Tickets"     value={total}                icon={<ClipboardCheck size={18} />} trend="3 verticals"        color="#7c3aed" delay={0.15} />
        <StatCard label="Completed Tickets" value="2"                    icon={<CheckCircle2 size={18} />} trend="33% completion rate"  color="#f59e0b" delay={0.2}  />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Lead Funnel */}
        <div className="card" style={{ padding: 28 }}>
          <div className="card-title" style={{ fontSize: 16, marginBottom: 6 }}>Lead Status Breakdown</div>
          <div className="card-sub" style={{ marginBottom: 24 }}>Distribution across pipeline stages</div>
          {funnelData.map(({ label, val, color }) => (
            <div key={label} className="chart-bar-row">
              <div className="chart-bar-label" style={{ width: 130 }}>{label}</div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${(val / MOCK_LEADS.length) * 100}%`, background: `linear-gradient(90deg,${color}90,${color})` }} />
              </div>
              <div className="chart-bar-val">{val}</div>
            </div>
          ))}
        </div>

        {/* Vertical Breakdown */}
        <div className="card" style={{ padding: 28 }}>
          <div className="card-title" style={{ fontSize: 16, marginBottom: 6 }}>Tickets by Vertical</div>
          <div className="card-sub" style={{ marginBottom: 24 }}>Which services drive most business</div>
          {verticalData.map(({ label, tickets, color }) => (
            <div key={label} className="chart-bar-row">
              <div className="chart-bar-label">{label}</div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: `${(tickets / total) * 100}%`, background: `linear-gradient(90deg,${color}90,${color})` }} />
              </div>
              <div className="chart-bar-val">{tickets}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20 }}>
            {verticalData.map(v => (
              <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly lead volume */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div className="card-title" style={{ fontSize: 16 }}>Monthly Lead Volume</div>
            <div className="card-sub">Leads generated per month (your scope)</div>
          </div>
          <span style={{ padding: '6px 14px', background: 'rgba(34,197,94,0.12)', color: '#15803d', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            ↑ 50% growth
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 160 }}>
          {monthly.map(({ month, val }) => (
            <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>{val}</div>
              <div style={{
                width: '100%', borderRadius: '8px 8px 0 0', position: 'relative', overflow: 'hidden',
                height: `${(val / maxVal) * 130}px`,
                background: 'linear-gradient(to top, #166534, #22c55e)',
              }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{month}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Shared Info Banner ────────────────────────────────────── */
function InfoBanner({ color, title, body, Icon }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}10 0%, ${color}06 100%)`,
      border: `1px solid ${color}30`,
      borderRadius: 14, padding: '18px 22px', marginBottom: 24,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{body}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   SIDEBAR & TOPBAR FOR PARTNER
════════════════════════════════════════════════════════════════ */
const getNavItems = (stats) => [
  { id: 'overview',  label: 'Overview',   icon: LayoutDashboard, section: 'MAIN' },
  { id: 'leads',     label: 'My Leads',   icon: Target,          section: 'NETWORK', badge: stats?.leads },
  { id: 'clients',   label: 'My Clients', icon: Users,           section: 'NETWORK', badge: stats?.clients },
  { id: 'tickets',   label: 'My Tickets', icon: ClipboardCheck,  section: 'NETWORK', badge: stats?.tickets },
  { id: 'analytics', label: 'Analytics',  icon: BarChart3,       section: 'INSIGHTS' },
];

const PartnerSidebar = ({ activePage, setPage, user, onLogout, stats }) => {
  const navItems = getNavItems(stats);
  const sections = [...new Set(navItems.map(i => i.section))];

  return (
    <nav style={{
      width: '240px', flexShrink: 0, height: '100vh', overflowY: 'auto',
      background: 'var(--sidebar)', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)', position: 'relative', zIndex: 100,
    }}>
      <style>{`
        .p-nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 16px; width: calc(100% - 32px); margin: 2px 16px; border: none; border-radius: 12px; background: transparent; color: var(--text-muted); font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .p-nav-item:hover { background: var(--sidebar-hover); color: var(--text); }
        .p-nav-item.active { background: rgba(21,128,61,0.12); color: #15803d; border: 1px solid rgba(21,128,61,0.2); box-shadow: 0 4px 12px rgba(21,128,61,0.15); }
        .dark .p-nav-item.active { color: #22c55e; background: transparent; box-shadow: none; border-color: transparent;}
      `}</style>

      {/* Logo */}
      <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid var(--border)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(21,128,61,0.3)' }}>
            <Network size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px' }}>MyClaim</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>Partner Portal</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        {sections.map(sec => {
          const items = navItems.filter(i => i.section === sec);
          return (
            <div key={sec} style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-light)', padding: '12px 24px 6px', textTransform: 'uppercase', opacity: 0.6 }}>{sec}</div>
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button key={item.id} className={`p-nav-item${isActive ? ' active' : ''}`} onClick={() => setPage(item.id)}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="badge" style={{ fontSize: '10px', fontWeight: 700, background: isActive ? 'rgba(34,197,94,0.1)' : 'var(--bg)', color: isActive ? '#15803d' : 'var(--text-muted)', border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, padding: '2px 7px', borderRadius: '12px', minWidth: '24px', textAlign: 'center' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--card)', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
          onClick={onLogout}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
            {(user?.name || 'PT').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{user?.name || 'Partner'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>partner</div>
          </div>
          <LogOut size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </nav>
  );
};

const PAGE_META = {
  overview:  { title: 'Dashboard', sub: 'Your frontline originations overview' },
  leads:     { title: 'My Leads', sub: 'Manage your direct pipeline' },
  clients:   { title: 'My Clients', sub: 'Your scoped converted accounts' },
  tickets:   { title: 'My Tickets', sub: 'Service updates inside your scope' },
  analytics: { title: 'Analytics', sub: 'Conversion and volume trends' },
};

const PartnerTopbar = ({ page }) => {
  const meta = PAGE_META[page] || PAGE_META.overview;
  return (
    <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', boxSizing: 'border-box' }}>
      <div>
        {page === 'overview' ? (
          <div className="animate-slide-up">
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 800, 
              color: '#475569', 
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
            Welcome back, <span style={{ color: '#22c55e', fontWeight: 800 }}>
              {useAuth().user?.name ? (useAuth().user.name.toLowerCase().includes('partner') ? useAuth().user.name : useAuth().user.name.split(' ')[0]) : 'Partner'}
            </span> <span className="wave" style={{ fontSize: '24px', display: 'inline-block', animation: 'wave 2.5s infinite', transformOrigin: '70% 70%' }}>👋</span>
            </div>
            <div style={{ 
              color: '#64748b', 
              fontSize: '14px', 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '2px'
            }}>
              Here's your <span style={{ fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>PARTNER</span> command center.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>{meta.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{meta.sub}</div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--banner-badge-bg)', color: 'var(--banner-badge-text)', border: '1px solid var(--banner-border)', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 700 }}>
          <Star size={13} />Phase 1 Scope
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <Bell size={16} style={{ color: 'var(--text-muted)' }} />
          <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#15803d', border: '2px solid var(--card)' }} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function PartnerDashboard() {
  const [page, setPage] = useState(() => sessionStorage.getItem('MyClaim_PartnerTab') || 'overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dbData, setDbData] = useState({
    leads: [],
    clients: [],
    tickets: [],
    loading: true
  });

  React.useEffect(() => {
    sessionStorage.setItem('MyClaim_PartnerTab', page);
  }, [page]);

  React.useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.token) return;
      try {
        const [leadsRes, usersRes, ticketsRes] = await Promise.all([
          api.get('/leads'),
          api.get('/users'),
          api.get('/tickets')
        ]);

        const myLeads = leadsRes.data.filter(l => String(l.sourceUserId?._id || l.sourceUserId) === String(user._id));
        const myClients = usersRes.data;
        const myTickets = ticketsRes.data; // Filtered by backend already based on role logic updated

        setDbData({
          leads: myLeads,
          clients: myClients,
          tickets: myTickets,
          loading: false
        });
      } catch (err) {
        console.error('PartnerDashboard Fetch Error:', err);
        setDbData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchAllData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardStats = {
    leads: dbData.leads.length,
    converted: dbData.leads.filter(l => l.status === 'converted').length,
    clients: dbData.clients.length,
    tickets: dbData.tickets.length
  };

  const recentLeadsFormatted = dbData.leads.slice(0, 4).map(l => ({
    id: l._id,
    name: l.name,
    service: l.serviceInterest || 'N/A',
    status: l.status === 'converted' ? 'Converted' : l.status === 'in_discussion' ? 'In Discussion' : 'New'
  }));

  const renderPage = () => {
    if (dbData.loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing dashboard data...</div>;

    switch (page) {
      case 'overview':  return <OverviewTab onNavigate={setPage} stats={dashboardStats} recentLeads={recentLeadsFormatted} />;
      case 'leads':     return <LeadsTab />;
      case 'clients':   return <ClientsTab />;
      case 'tickets':
        return <TicketsTab 
          tickets={dbData.tickets} 
          clients={dbData.clients}
        />;
      case 'analytics': return <AnalyticsTab leads={dbData.leads} tickets={dbData.tickets} />;
      default:          return <OverviewTab onNavigate={setPage} stats={dashboardStats} recentLeads={recentLeadsFormatted} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wave { 0%, 100%, 60% { transform: rotate(0deg) } 10%, 30% { transform: rotate(14deg) } 20% { transform: rotate(-8deg) } 40% { transform: rotate(-4deg) } 50% { transform: rotate(10deg) } }
        .animate-slide-up { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .wave { display: inline-block; animation: wave 2.5s infinite; transform-origin: 70% 70%; }
      `}</style>
      {/* ← Dedicated Partner Sidebar (replaces shared Sidebar for this role) */}
      <PartnerSidebar activePage={page} setPage={setPage} user={user} onLogout={handleLogout} stats={dashboardStats} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <PartnerTopbar page={page} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}

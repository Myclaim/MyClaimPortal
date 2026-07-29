import React, { useState } from 'react';
import {
  LayoutDashboard, Users, UserCircle, Ticket, Activity, Plus, Search,
  Filter, Download, Eye, TrendingUp, Network, Award,
  FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight, X,
  BarChart3, Briefcase, Phone, Mail, MapPin, Lock, Shield,
  Settings, LogOut, Bell, ChevronRight, Star, Zap, Users2,
  PieChart, LineChart, RefreshCw, UserCheck, Layers, Loader
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../../services/api';
import CreateTicketModal from '../../../components/forms/CreateTicketModal';
import { downloadCSV } from '../../../utils/exportUtils';

// ============================================================
// SUPER PARTNER DASHBOARD — STANDALONE LAYOUT
// Role: super_partner | Scope: own network only
// This component renders its OWN sidebar. Do NOT use shared Sidebar.
// ============================================================
// ─── Mock Data ────────────────────────────────────────────────
const MOCK_PARTNERS = [];



const MOCK_CLIENTS = [
  { id: 'C001', name: 'Suresh Nair', partner: 'Rahul Mehta', service: 'IEPF Claim', activeTickets: 2, status: 'Active', phone: '9971234560', email: 'suresh@mail.com' },
  { id: 'C002', name: 'Meera Singh', partner: 'Rahul Mehta', service: 'GST Filing', activeTickets: 1, status: 'Active', phone: '9811223344', email: 'meera@mail.com' },
  { id: 'C003', name: 'Vijay Reddy', partner: 'Sneha Patel', service: 'Duplicate Share', activeTickets: 1, status: 'Active', phone: '9900112233', email: 'vijay@mail.com' },
  { id: 'C004', name: 'Anita Kapoor', partner: 'Sneha Patel', service: 'Pre-IPO Shares', activeTickets: 0, status: 'Completed', phone: '8811223344', email: 'anita@mail.com' },
  { id: 'C005', name: 'Ravi Tiwari', partner: 'Amit Sharma', service: 'Company Inc.', activeTickets: 1, status: 'Active', phone: '9711223344', email: 'ravi@mail.com' },
];

const MOCK_TICKETS = [
  { id: 'TKT-441', client: 'Suresh Nair', partner: 'Rahul Mehta', service: 'IEPF Claim', status: 'In Process', date: '12 Apr 2026', createdDate: '1 Apr 2026' },
  { id: 'TKT-438', client: 'Meera Singh', partner: 'Rahul Mehta', service: 'GST Filing', status: 'Active', date: '11 Apr 2026', createdDate: '5 Apr 2026' },
  { id: 'TKT-421', client: 'Vijay Reddy', partner: 'Sneha Patel', service: 'Duplicate Share', status: 'In Process', date: '10 Apr 2026', createdDate: '3 Apr 2026' },
  { id: 'TKT-415', client: 'Anita Kapoor', partner: 'Sneha Patel', service: 'Pre-IPO', status: 'Completed', date: '5 Apr 2026', createdDate: '15 Mar 2026' },
  { id: 'TKT-408', client: 'Ravi Tiwari', partner: 'Amit Sharma', service: 'Company Inc.', status: 'Active', date: '3 Apr 2026', createdDate: '20 Mar 2026' },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'lead', text: 'New lead Deepak Gupta added by you', time: '2 hours ago', icon: BarChart3, color: '#6366f1' },
  { id: 2, type: 'ticket', text: 'Ticket TKT-441 status updated to In Process', time: '4 hours ago', icon: Ticket, color: '#8b5cf6' },
  { id: 3, type: 'client', text: 'New client Suresh Nair onboarded via Super Admin', time: '1 day ago', icon: UserCheck, color: '#10b981' },
  { id: 4, type: 'lead', text: 'Lead Ritika Joshi status changed to In Discussion', time: '1 day ago', icon: TrendingUp, color: '#f59e0b' },
  { id: 5, type: 'partner', text: 'Partner Rahul Mehta submitted 3 new leads', time: '2 days ago', icon: Users, color: '#6366f1' },
  { id: 6, type: 'ticket', text: 'Ticket TKT-415 marked as Completed', time: '2 days ago', icon: CheckCircle, color: '#22c55e' },
  { id: 7, type: 'lead', text: 'Lead Kavitha Iyer marked Not Interested by Super Admin', time: '4 days ago', icon: AlertCircle, color: '#ef4444' },
  { id: 8, type: 'partner', text: 'New partner Amit Sharma joined the network', time: '5 days ago', icon: Users2, color: '#6366f1' },
];

// ─── Design Tokens (distinct from Super Admin) ────────────────
const SP = {
  primary: '#15803d',          // green
  primaryLight: 'rgba(21,128,61,0.12)',
  secondary: '#0f766e',        // teal
  secondaryLight: 'rgba(15,118,110,0.12)',
  accent: '#22c55e',           // light green
  accentLight: 'rgba(34,197,94,0.12)',
  success: '#10b981',
  successLight: 'rgba(16,185,129,0.12)',
  warning: '#f59e0b',
  warningLight: 'rgba(245,158,11,0.12)',
  danger: '#ef4444',
  dangerLight: 'rgba(239,68,68,0.12)',
  gradientPrimary: 'linear-gradient(135deg, #0f766e 0%, #22c55e 100%)',
  gradientHero: 'var(--banner-bg)',
  sidebarBg: 'var(--sidebar)',
  sidebarActiveBg: 'var(--sidebar-active)',
  sidebarActiveText: '#ffffff',
  sidebarText: 'var(--text-muted)',
  sidebarHover: 'var(--sidebar-hover)',
};

// ─── Status Config ─────────────────────────────────────────────
const STATUS_MAP = {
  'New': { color: SP.primary, bg: SP.primaryLight },
  'In Discussion': { color: SP.warning, bg: SP.warningLight },
  'Converted': { color: SP.success, bg: SP.successLight },
  'Not Interested': { color: SP.danger, bg: SP.dangerLight },
  'Active': { color: SP.success, bg: SP.successLight },
  'In Process': { color: SP.accent, bg: SP.accentLight },
  'Completed': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'Inactive': { color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  'active': { color: SP.success, bg: SP.successLight },
  'in_process': { color: SP.accent, bg: SP.accentLight },
  'completed': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'closed': { color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
};

const STATUS_API_TO_UI = {
  new: 'New',
  in_discussion: 'In Discussion',
  converted: 'Converted',
  not_interested: 'Not Interested',
};

function parseLeadNotes(notes = '') {
  const extract = (label) => {
    const m = notes.match(new RegExp(`\\[${label}:\\s*([^\\]]*)\\]`));
    return m ? m[1].trim() : '';
  };
  const altPhone = extract('Alt Phone');
  const city = extract('City');
  const category = extract('Category');
  const source = extract('Source');
  const priority = extract('Priority') || 'Medium';
  const superPartner = extract('Super Partner');
  const partner = extract('Partner');
  let freeform = '';
  const idx = notes.indexOf('\n\n');
  if (idx >= 0) freeform = notes.slice(idx + 2).trim();
  return { altPhone, city, category, source, priority, superPartner, partner, freeform };
}

// ─── Shared UI Components ─────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { color: '#64748b', bg: '#f1f5f9' };
  return (
    <span style={{
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px',
      color: s.color, background: s.bg,
      padding: '3px 10px', borderRadius: '20px',
      border: `1px solid ${s.color}30`,
    }}>{status}</span>
  );
};

const TypeBadge = ({ type }) => {
  const map = {
    lead: { color: SP.primary, label: 'LEAD' },
    ticket: { color: SP.secondary, label: 'TICKET' },
    client: { color: SP.success, label: 'CLIENT' },
    partner: { color: SP.accent, label: 'PARTNER' },
  };
  const t = map[type] || { color: '#64748b', label: type.toUpperCase() };
  return (
    <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1px', color: t.color, background: `${t.color}15`, padding: '2px 8px', borderRadius: '12px' }}>
      {t.label}
    </span>
  );
};

const InfoBanner = ({ icon: Icon, color, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '12px', marginBottom: '20px' }}>
    <Icon size={16} style={{ color, flexShrink: 0 }} />
    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
      <strong style={{ color: 'var(--text)' }}>{title}</strong> {subtitle}
    </span>
  </div>
);

const SectionHeader = ({ sub, onAction, actionLabel }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
    {sub && <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{sub}</div>}
    {onAction && (
      <button onClick={onAction} style={{
        display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px',
        background: SP.gradientPrimary, color: '#fff', border: 'none', borderRadius: '10px',
        fontSize: '13px', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
        boxShadow: `0 4px 14px ${SP.primaryLight}`,
        transition: 'all 0.2s',
      }}>
        <Plus size={15} /> {actionLabel}
      </button>
    )}
  </div>
);

const SearchBar = ({ search, setSearch, placeholder = 'Search...' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', flex: 1, minWidth: '220px' }}>
    <Search size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
    <input
      placeholder={placeholder}
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={{ border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text)', background: 'transparent', width: '100%', fontFamily: 'inherit' }}
    />
  </div>
);

const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ padding: '10px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
    <option value="all">{placeholder}: All</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const ExportBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: '13px', color: '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.2s' }}>
    <Download size={14} />Export
  </button>
);

const ActionBtn = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
    <Icon size={13} />{label}
  </button>
);

// ─── Modal ─────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, width = '520px' }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{title}</div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
      </div>
      <div style={{ padding: '28px' }}>{children}</div>
    </div>
  </div>
);

const FG = ({ label, required, children }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.7px', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>{label}{required && <span style={{ color: SP.primary }}> *</span>}</label>
    {children}
  </div>
);

const FInput = (props) => (
  <input {...props} style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', background: 'var(--card)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
    onFocus={e => e.target.style.borderColor = SP.primary}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
  />
);

const FSelect = ({ children, ...props }) => (
  <select {...props} style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', background: 'var(--card)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}>
    {children}
  </select>
);

const SubmitRow = ({ label, onCancel, onSubmit }) => (
  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
    <button onClick={onSubmit} style={{ flex: 1, padding: '13px', background: SP.gradientPrimary, color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${SP.primaryLight}` }}>{label}</button>
    <button onClick={onCancel} style={{ flex: 1, padding: '13px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
  </div>
);

// ════════════════════════════════════════════════════════════════
// MODULE 1: Dashboard / Overview
// ════════════════════════════════════════════════════════════════
const OverviewModule = ({ setPage }) => {
  const [data, setData] = useState({
    leads: [],
    clients: [],
    tickets: [],
    partners: [],
    activities: [],
    loading: true
  });
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const [leadsRes, usersRes, ticketsRes, activityRes] = await Promise.all([
          axios.get('https://myclaimportal.onrender.com/api/leads', config),
          axios.get('https://myclaimportal.onrender.com/api/users', config),
          axios.get('https://myclaimportal.onrender.com/api/tickets', config),
          axios.get('https://myclaimportal.onrender.com/api/activity', config)
        ]);

        const allUsers = usersRes.data;
        const allLeads = leadsRes.data;
        const allTickets = ticketsRes.data;
        const allActivity = activityRes.data;

        // Resolve network IDs
        const myPartners = allUsers.filter(u => u.role === 'partner' && u.parent_id === user?._id);
        const partnerIds = myPartners.map(p => p._id);
        const myNetworkIds = [user?._id, ...partnerIds];

        const myClients = allUsers.filter(u => u.role === 'client' && myNetworkIds.includes(u.parent_id));
        const clientIds = myClients.map(c => c._id);
        const fullNetworkIds = [...myNetworkIds, ...clientIds];

        // Filter network leads
        const myLeads = allLeads.filter(l => fullNetworkIds.includes(l.sourceUserId?._id || l.sourceUserId));

        // Filter network tickets
        const myTickets = allTickets.filter(t => clientIds.includes(t.client?._id || t.client));

        // Filter network activities
        const myActivities = allActivity.filter(act => {
          const actUserId = String(act.user?._id || act.user);
          return fullNetworkIds.some(nid => String(nid) === actUserId);
        }).map(act => {
          let type = 'other';
          let icon = Activity;
          let color = '#6366f1';
          const actionText = act.action.toLowerCase();
          
          if (actionText.includes('ticket')) {
            type = 'ticket';
            icon = Ticket;
            color = '#8b5cf6';
          } else if (actionText.includes('lead')) {
            type = 'lead';
            icon = BarChart3;
            color = '#6366f1';
          } else if (actionText.includes('client')) {
            type = 'client';
            icon = UserCheck;
            color = '#10b981';
          } else if (actionText.includes('partner')) {
            type = 'partner';
            icon = Users;
            color = '#6366f1';
          }

          return {
            id: act._id,
            type,
            text: act.action,
            time: new Date(act.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
            icon,
            color
          };
        });

        // Format partner performance list
        const formattedPartners = myPartners.map(p => {
          const pLeads = allLeads.filter(l => String(l.sourceUserId?._id || l.sourceUserId) === String(p._id));
          const pClients = allUsers.filter(u => u.role === 'client' && String(u.parent_id) === String(p._id));
          const pClientIds = pClients.map(c => c._id);
          const pTickets = allTickets.filter(t => pClientIds.includes(t.client?._id || t.client));

          return {
            id: p._id,
            name: p.name,
            city: p.city || 'N/A',
            status: p.is_active !== false ? 'Active' : 'Inactive',
            leads: pLeads.length,
            clients: pClients.length,
            tickets: pTickets.length
          };
        });

        setData({
          leads: myLeads,
          clients: myClients,
          tickets: myTickets,
          partners: formattedPartners,
          activities: myActivities,
          loading: false
        });
      } catch (err) {
        console.error('Failed to load Overview data:', err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    if (user?.token) fetchData();
  }, [user]);

  const kpis = [
    { label: 'Total Leads', value: data.leads.length, icon: BarChart3, trend: 'In Network', color: SP.primary, delay: 0.05 },
    { label: 'Converted', value: data.leads.filter(l => l.status === 'converted').length, icon: CheckCircle, trend: 'Conversions', color: SP.success, delay: 0.1 },
    { label: 'Total Clients', value: data.clients.length, icon: UserCircle, trend: 'Customers', color: SP.accent, delay: 0.15 },
    { label: 'Active Tickets', value: data.tickets.filter(t => t.status === 'active' || t.status === 'in_process').length, icon: Ticket, trend: 'In execution', color: SP.warning, delay: 0.2 },
    { label: 'Completed', value: data.tickets.filter(t => t.status === 'completed' || t.status === 'closed').length, icon: Award, trend: 'Delivered', color: '#22c55e', delay: 0.25 },
  ];

  return (
    <>
      {/* Hero Banner */}
      <div style={{
        background: SP.gradientHero, borderRadius: '20px', padding: '40px 44px',
        marginBottom: '28px', position: 'relative', overflow: 'hidden', border: '1px solid var(--banner-border)'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, var(--green) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '580px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--banner-badge-bg)', color: 'var(--banner-badge-text)', border: '1px solid var(--banner-border)', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', marginBottom: '18px' }}>
            <Network size={12} /> SUPER PARTNER NETWORK
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--banner-text)', marginBottom: '12px', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
            Super Partner Network Overview
          </h2>
          <p style={{ color: 'var(--banner-subtext)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
            {data.partners.length} active partners · {data.leads.length} leads · {data.clients.length} clients in active service delivery
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setPage('leads')} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: SP.gradientPrimary, color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 18px rgba(34,197,94,0.3)' }}>
              <Plus size={15} />New Lead
            </button>
            <button onClick={() => setPage('partners')} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: 'var(--banner-btn-secondary)', color: 'var(--banner-btn-text)', border: '1px solid var(--banner-border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              View Partners <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '40px', bottom: '40px', width: '280px', height: '140px', opacity: 0.25, background: 'linear-gradient(to top, var(--green) 0%, transparent 80%)', clipPath: 'polygon(0 100%, 10% 80%, 20% 90%, 30% 60%, 40% 75%, 50% 40%, 60% 55%, 70% 20%, 80% 45%, 90% 10%, 100% 30%, 100% 100%)' }}></div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px',
              padding: '22px', position: 'relative', overflow: 'hidden',
              animation: `fadeInScale 0.5s cubic-bezier(0.16,1,0.3,1) ${k.delay}s both`,
              transition: 'all 0.25s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = k.color; e.currentTarget.style.boxShadow = `0 12px 30px ${k.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${k.color}, ${k.color}80)`, borderRadius: '16px 16px 0 0' }} />
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color, marginBottom: '14px' }}>
                <Icon size={20} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>{k.label}</div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-1px', lineHeight: 1.1 }}>{data.loading ? '...' : k.value}</div>
              <div style={{ fontSize: '11px', color: k.color, fontWeight: 600, marginTop: '6px' }}>{k.trend}</div>
              <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.05 }}><Icon size={72} /></div>
            </div>
          );
        })}
      </div>

      {/* Partner Performance + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* Partner Performance */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Partner Performance</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Network overview</div>
            </div>
            <button onClick={() => setPage('partners')} style={{ fontSize: '12px', fontWeight: 700, color: SP.primary, background: SP.primaryLight, border: `1px solid ${SP.primary}30`, borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>Manage</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.partners.map((p) => (
              <div key={p.id} style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: SP.gradientPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>{p.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.city}</div>
                    </div>
                  </div>
                  <Badge status={p.status} />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {[{ l: 'Leads', v: p.leads, c: SP.primary }, { l: 'Clients', v: p.clients, c: SP.accent }, { l: 'Tickets', v: p.tickets, c: SP.warning }].map(m => (
                    <div key={m.l}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px', height: '5px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((p.leads / 16) * 100, 100)}%`, height: '100%', background: SP.gradientPrimary, borderRadius: '10px' }} />
                </div>
              </div>
            ))}
            {data.partners.length === 0 && !data.loading && (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No partners in network yet.</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Recent Activity</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Latest updates</div>
            </div>
            <button onClick={() => setPage('activity')} style={{ fontSize: '12px', fontWeight: 700, color: SP.primary, background: SP.primaryLight, border: `1px solid ${SP.primary}30`, borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {data.activities.slice(0, 6).map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: i < Math.min(data.activities.length, 6) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} style={{ color: item.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{item.text}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{item.time}</span>
                      <TypeBadge type={item.type} />
                    </div>
                  </div>
                </div>
              );
            })}
            {data.activities.length === 0 && !data.loading && (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No activities logged yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MODULE 2: Leads
// ════════════════════════════════════════════════════════════════
const LeadsModule = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    password: '',
    name: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    oldName: '',
    newName: '',
    citizenship: '',
    phone: '',
    email: '',
    state: '',
    city: '',
    pincode: '',
    permanentAddress: '',
    stateOld: '',
    cityOld: '',
    pincodeOld: '',
    oldAddress: '',
    otherDocsDesc: '',
    relation: 'Direct',
    relationWithHolder: '',
    reference: 'Indirect',
    referenceName: '',
    referenceMobileNo: '',
    // Nominee details
    nomineeAge: '', nomineeName: '', nomineeDob: '', nomineeRelation: '',
    nomineeAadharPath: '', nomineePanPath: '', nomineeNocPath: '', nomineeOtherDocsPath: '',
    // Preference & Status
    preference: '', status: 'new',
    serviceRequest: '',
    category: '',
    priority: 'Medium',
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const [realLeads, setRealLeads] = useState([]);

  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('https://myclaimportal.onrender.com/api/leads', config);
        setRealLeads(data);
      } catch (error) {
        console.error('Failed to fetch leads', error);
      }
    };
    if (user && user.token) fetchLeads();
  }, [user]);

  const apiLeadsFormatted = realLeads.map(l => {
    let uiStatus = 'New';
    if (l.status === 'in_discussion') uiStatus = 'In Discussion';
    else if (l.status === 'converted') uiStatus = 'Converted';
    else if (l.status === 'not_interested') uiStatus = 'Not Interested';

    let partnerName = l.sourceUserId?.name || 'Self';
    if (l.sourceUserId?._id === user?._id) partnerName = 'Self';

    return {
      id: String(l._id).substring(0, 6).toUpperCase(),
      name: l.name,
      phone: l.phone,
      email: l.email || '',
      service: l.serviceInterest || 'N/A',
      createdBy: partnerName,
      status: uiStatus,
      date: new Date(l.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      raw: l,
    };
  });

  const allLeads = apiLeadsFormatted;

  const filtered = allLeads.filter(l => {
    const q = search.toLowerCase();
    const matchS = l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.service.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchPartner = partnerFilter === 'all' || l.createdBy === partnerFilter;
    return matchS && matchStatus && matchPartner;
  });

  const statuses = ['New', 'In Discussion', 'Converted', 'Not Interested'];
  const partners = ['Self', ...MOCK_PARTNERS.map(p => p.name), ...Array.from(new Set(apiLeadsFormatted.map(l => l.createdBy).filter(n => n !== 'Self')))];

  const selectedLeadParsed = viewLead ? parseLeadNotes(viewLead.notes || '') : null;
  const selectedLeadStatus = viewLead ? (STATUS_API_TO_UI[viewLead.status] || viewLead.status || 'New') : 'New';
  const selectedLeadCreatedBy = viewLead ? (viewLead.sourceUserId?.name || 'Self') : 'Self';
  const selectedLeadAddedOn = viewLead ? new Date(viewLead.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const selectedLeadId = viewLead ? String(viewLead._id).substring(0, 6).toUpperCase() : '';
  const normalizeParsedValue = (value, fallback = '—') => (value && value !== 'N/A' ? value : fallback);
  const selectedLeadAltPhone = normalizeParsedValue(selectedLeadParsed?.altPhone);
  const selectedLeadCity = normalizeParsedValue(selectedLeadParsed?.city);
  const selectedLeadCategory = normalizeParsedValue(selectedLeadParsed?.category);
  const selectedLeadSource = normalizeParsedValue(selectedLeadParsed?.source);
  const selectedLeadPriority = normalizeParsedValue(selectedLeadParsed?.priority, 'Medium');
  const selectedLeadPartner = selectedLeadParsed ? normalizeParsedValue(selectedLeadParsed.partner, viewLead?.sourceUserId?.role === 'partner' ? viewLead.sourceUserId.name : '—') : '—';
  const selectedLeadSuperPartner = selectedLeadParsed ? normalizeParsedValue(selectedLeadParsed.superPartner, viewLead?.sourceUserId?.role === 'super_partner' ? viewLead.sourceUserId.name : '—') : viewLead?.sourceUserId?.role === 'super_partner' ? viewLead.sourceUserId.name : '—';

  return (
    <>
      <SectionHeader title="Leads" sub={`${filtered.length} of ${allLeads.length} leads`} onAction={() => setShowModal(true)} actionLabel="New Lead" />

      <InfoBanner icon={Lock} color={SP.warning} title="Lead conversion is restricted." subtitle="Only Super Admin can convert leads to clients. You can create and monitor leads." />

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <SearchBar search={search} setSearch={setSearch} placeholder="Search by name, phone, service…" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="Status" />
        <FilterSelect value={partnerFilter} onChange={setPartnerFilter} options={partners} placeholder="Source" />
        <ExportBtn />
      </div>

      {/* Status Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', ...statuses].map(s => {
          const count = s === 'all' ? allLeads.length : allLeads.filter(l => l.status === s).length;
          const active = statusFilter === s;
          const c = STATUS_MAP[s];
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '7px 16px', fontSize: '12px', fontWeight: 700, borderRadius: '20px',
              border: `1px solid ${active ? (c?.color || SP.primary) : 'var(--border)'}`,
              background: active ? `${c?.color || SP.primary}15` : 'var(--card)',
              color: active ? (c?.color || SP.primary) : 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
              {s === 'all' ? 'All' : s} ({count})
            </button>
          );
        })}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Phone</th><th>Service</th><th>Created By</th><th>Date</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id}>
                <td style={{ fontSize: '12px', color: SP.primary, fontWeight: 700 }}>{lead.id}</td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{lead.name}</div>
                  {lead.email && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.email}</div>}
                </td>
                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lead.phone}</td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '3px 10px' }}>{lead.service}</span>
                </td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: lead.createdBy === 'Self' ? SP.primary : 'var(--text-muted)', background: lead.createdBy === 'Self' ? SP.primaryLight : 'var(--bg)', padding: '3px 10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    {lead.createdBy}
                  </span>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.date}</td>
                <td><Badge status={lead.status} /></td>
                <td><ActionBtn icon={Eye} label="View" onClick={() => setViewLead(lead.raw)} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No leads found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewLead && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setViewLead(null); }} style={{ zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal" style={{ maxWidth: '760px', width: '100%', padding: '24px', animation: 'fadeInScale 0.25s forwards' }}>
            <div className="modal-header" style={{ alignItems: 'center' }}>
              <div>
                <div className="modal-title" style={{ fontSize: '20px' }}>Lead Details</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Lead ID: LD-{selectedLeadId}</div>
              </div>
              <button className="modal-close" onClick={() => setViewLead(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '20px 0', display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px' }}>
                {[
                  { label: 'Name', value: viewLead.name || '—' },
                  { label: 'Phone', value: viewLead.phone || '—' },
                  { label: 'Email', value: viewLead.email || '—' },
                  { label: 'Status', value: <Badge status={selectedLeadStatus} /> },
                  { label: 'Service', value: viewLead.serviceInterest || '—' },
                  { label: 'Created By', value: selectedLeadCreatedBy },
                  { label: 'Alt Phone', value: selectedLeadAltPhone },
                  { label: 'City', value: selectedLeadCity },
                  { label: 'Priority', value: selectedLeadPriority },
                  { label: 'Category', value: selectedLeadCategory },
                  { label: 'Source', value: selectedLeadSource },
                  { label: 'Partner', value: selectedLeadPartner },
                  { label: 'Super Partner', value: selectedLeadSuperPartner },
                  { label: 'Added On', value: selectedLeadAddedOn },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Notes</div>
                <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{selectedLeadParsed?.freeform || '—'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button type="button" className="lead-view-btn gray" onClick={() => setViewLead(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div 
        className={`modal-overlay ${showModal ? 'open' : ''}`} 
        onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowModal(false); }}
        style={{ zIndex: 9999, display: showModal ? 'flex' : 'none' }}
      >
        {showModal && (
          <div className="modal form-modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '850px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize: '20px' }}>Add New Lead — Step {currentStep} of 8</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '32px', background: 'var(--card)' }}>
              {currentStep === 1 && (
                <div className="form-section">
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">FIRST NAME</span>
                      <input type="text" className="form-input" placeholder="Enter First Name" value={form.firstName} onChange={e => set('firstName')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">MIDDLE NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Middle Name" value={form.middleName} onChange={e => set('middleName')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">LAST NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Last Name" value={form.lastName} onChange={e => set('lastName')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">USER NAME</span>
                      <input type="text" className="form-input" placeholder="Enter User Name" value={form.username} onChange={e => set('username')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-section">
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Name" value={form.name} onChange={e => set('name')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">DATE OF BIRTH</span>
                      <input type="date" className="form-input" value={form.dob} onChange={e => set('dob')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">GENDER</span>
                      <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                        {['Male', 'Female', 'Others'].map(g => (
                          <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color:'var(--text)' }}>
                            <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={e => set('gender')(e.target.value)} />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="form-section">
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">PHONE</span>
                      <input type="tel" className="form-input" value={form.phone} onChange={e => set('phone')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">EMAIL</span>
                      <input type="email" className="form-input" value={form.email} onChange={e => set('email')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep > 3 && currentStep < 6 && (
                <div style={{ color: 'var(--text)', textAlign: 'center', padding: '40px' }}>
                  Additional onboarding steps for Documents, Relationships and References as per schema expansion.
                </div>
              )}

              {currentStep === 6 && (
                <div className="form-section">
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">SERVICE REQUEST</span>
                      <input type="text" className="form-input" value={form.serviceRequest} onChange={e => set('serviceRequest')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">PRIORITY</span>
                      <select className="form-select" value={form.priority} onChange={e => set('priority')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--text)' }}>7. Nominee Details</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">NOMINEE NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Nominee Name" value={form.nomineeName} onChange={e => set('nomineeName')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">NOMINEE AGE AS PER CLIENT MASTER</span>
                      <input type="text" className="form-input" placeholder="Enter Nominee Age" value={form.nomineeAge} onChange={e => set('nomineeAge')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">DATE OF BIRTH</span>
                      <input type="date" className="form-input" value={form.nomineeDob} onChange={e => set('nomineeDob')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">NOMINEE RELATION</span>
                      <input type="text" className="form-input" placeholder="Enter Nominee Relation" value={form.nomineeRelation} onChange={e => set('nomineeRelation')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 8 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--text)' }}>8. Preference & Status</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">PREFERENCE</span>
                      <select className="form-select" value={form.preference} onChange={e => set('preference')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                        <option value="">Select Preference</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="Call">Call</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">STATUS</span>
                      <select className="form-select" value={form.status} onChange={e => set('status')(e.target.value)} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color: 'var(--text)'}}>
                        <option value="new">New</option>
                        <option value="in_discussion">In Discussion</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ background: 'var(--card)', display: 'flex', justifyContent: 'space-between', padding: '24px' }}>
              <button className="topbar-btn secondary" onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowModal(false)}>{currentStep > 1 ? 'Previous' : 'Cancel'}</button>
              {currentStep < 8 ? (
                <button className="topbar-btn" onClick={() => setCurrentStep(currentStep + 1)}>Next Step</button>
              ) : (
                <button className="topbar-btn" onClick={async () => {
                  if (!form.firstName || !form.phone || !form.serviceRequest) {
                    alert("Please fill required fields (First Name, Phone, Service).");
                    return;
                  }
                  try {
                    const payload = {
                      ...form,
                      name: `${form.firstName} ${form.lastName}`.trim(),
                      serviceInterest: form.serviceRequest,
                      source: 'Super Partner'
                    };
                    const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                    const { data } = await axios.post('https://myclaimportal.onrender.com/api/leads', payload, config);
                    alert('Lead submitted successfully!');
                    setShowModal(false);
                    setForm({ priority: 'Medium' });
                    setRealLeads(prev => [data, ...prev]);
                  } catch (error) {
                    console.error('Failed to submit lead', error.response?.data || error.message || error);
                    alert(`Failed to submit lead: ${error.response?.data?.message || error.message || 'Unknown error'}`);
                  }
                }} style={{ background: SP.gradientPrimary, color: '#fff', border: 'none' }}>Submit Lead</button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MODULE 3: Partners
// ════════════════════════════════════════════════════════════════
const PartnersModule = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', username: '', password: '', permissions: ['Create Leads', 'Assign Tasks', 'View Reports', 'Approve Agreements', 'Upload Documents'] });
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameTimer, setUsernameTimer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [realPartners, setRealPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [partnerLeads, setPartnerLeads] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    const fetchPartners = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const [usersRes, leadsRes] = await Promise.all([
          axios.get('https://myclaimportal.onrender.com/api/users', config),
          axios.get('https://myclaimportal.onrender.com/api/leads', config)
        ]);
        
        const allPartners = usersRes.data.filter(u => u.role === 'partner' && u.parent_id === user?._id);
        const allLeads = leadsRes.data;
        
        const formatted = allPartners.map(p => ({
          ...p,
          id: p._id,
          city: p.city || 'N/A',
          joined: new Date(p.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          status: p.is_active !== false ? 'Active' : 'Inactive',
          leads: allLeads.filter(l => (l.sourceUserId?._id || l.sourceUserId) === p._id).length,
          clients: p.clientCount || 0,
          tickets: 0,
        }));
        
        setRealPartners(formatted);
      } catch (err) {
        console.error('Failed to fetch partners:', err);
      } finally {
        setLoadingPartners(false);
      }
    };
    if (user?.token) fetchPartners();
  }, [user]);

  const handleUsernameChange = (value) => {
    set('username')(value);
    setUsernameStatus(null);
    if (usernameTimer) clearTimeout(usernameTimer);
    if (!value.trim()) return;
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('https://myclaimportal.onrender.com/api/users', config);
        const taken = data.some(u => u.username && u.username.toLowerCase() === value.trim().toLowerCase());
        setUsernameStatus(taken ? 'taken' : 'available');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
    setUsernameTimer(timer);
  };

  const handleCreatePartner = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!form.name || !form.email || !form.password) {
      setErrorMsg('Please fill in Name, Email and Password — they are required.');
      return;
    }
    if (usernameStatus === 'taken') {
      setErrorMsg(`Username "${form.username}" is already taken. Please choose another.`);
      return;
    }
    if (usernameStatus === 'checking') {
      setErrorMsg('Please wait while we check username availability.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        username: form.username || undefined,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'partner',
        parent_id: user?._id,
        permissions: form.permissions || []
      };
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.post('https://myclaimportal.onrender.com/api/users', payload, config);
      setSuccessMsg(`✅ Partner "${data.name}" created successfully!`);
      const newPartnerFormatted = {
        ...data,
        id: data._id,
        city: form.city || 'N/A',
        joined: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        status: 'Active',
        leads: 0, clients: 0, tickets: 0
      };
      setRealPartners(prev => [newPartnerFormatted, ...prev]);
      setForm({ name: '', phone: '', email: '', city: '', username: '', password: '', permissions: ['Create Leads', 'Assign Tasks', 'View Reports', 'Approve Agreements', 'Upload Documents'] });
      setUsernameStatus(null);
      setTimeout(() => {
        setSuccessMsg('');
        setShowModal(false);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = realPartners.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (selected) {
      setLoadingDetails(true);
      const fetchDetails = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user?.token}` } };
          const { data } = await axios.get('https://myclaimportal.onrender.com/api/leads', config);
          const filtered = data.filter(l => l.sourceUserId?._id === selected._id);
          setPartnerLeads(filtered.map(l => ({
            id: String(l._id).substring(0, 6).toUpperCase(),
            name: l.name,
            service: l.serviceInterest || 'N/A',
            status: l.status === 'converted' ? 'Converted' : l.status === 'in_discussion' ? 'In Discussion' : l.status === 'not_interested' ? 'Not Interested' : 'New'
          })));
        } catch(err) {
          console.error(err);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchDetails();
    }
  }, [selected, user]);

  if (selected) {
    const partnerClients = []; // Replaced later with real linked clients
    const partnerTickets = []; // Replaced later with real linked tickets

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            ← Back
          </button>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>Partner: {selected.name}</div>
          <Badge status={selected.status} />
        </div>

        {/* Partner Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[{ l: 'Leads', v: partnerLeads.length, c: SP.primary, i: BarChart3 }, { l: 'Clients', v: selected.clients, c: SP.accent, i: UserCircle }, { l: 'Tickets', v: selected.tickets, c: SP.warning, i: Ticket }].map(m => {
            const Icon = m.i;
            return (
              <div key={m.l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${m.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.c, margin: '0 auto 12px' }}>
                  <Icon size={20} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: m.c }}>{m.v}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{m.l}</div>
              </div>
            );
          })}
        </div>

        {/* Contact Info */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>Contact Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[{ icon: Phone, l: 'Phone', v: selected.phone }, { icon: Mail, l: 'Email', v: selected.email }, { icon: MapPin, l: 'City', v: selected.city }, { icon: UserCircle, l: 'Joined', v: selected.joined }].map((info, i) => {
              const Icon = info.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <Icon size={15} style={{ color: SP.primary }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{info.l}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{info.v}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Partner Leads */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>Leads by {selected.name}</div>
          {loadingDetails ? <div style={{ color: 'var(--text-muted)' }}>Loading leads...</div> : partnerLeads.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {partnerLeads.map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{l.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.service}</div>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))}
            </div>
          ) : <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No leads yet.</div>}
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeader title="My Partners" sub={loadingPartners ? 'Loading...' : `${realPartners.length} partners in your network`} onAction={() => setShowModal(true)} actionLabel="Add Partner" />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <SearchBar search={search} setSearch={setSearch} placeholder="Search by name or city…" />
        <ExportBtn />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.map(p => (
          <div key={p.id} onClick={() => setSelected(p)}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = SP.primary; e.currentTarget.style.boxShadow = `0 12px 30px ${SP.primaryLight}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: SP.gradientPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px' }}>{p.name.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '15px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.city} · Joined {p.joined}</div>
                </div>
              </div>
              <Badge status={p.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Phone size={11} />{p.phone}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {[{ l: 'Leads', v: p.leads, c: SP.primary }, { l: 'Clients', v: p.clients, c: SP.accent }, { l: 'Tickets', v: p.tickets, c: SP.warning }].map(m => (
                <div key={m.l} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: m.c }}>{m.v}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: SP.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Detail <ArrowUpRight size={12} />
            </div>
          </div>
        ))}
      </div>

      <div 
        className={`modal-overlay ${showModal ? 'open' : ''}`} 
        onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowModal(false); }}
        style={{ zIndex: 9999, display: showModal ? 'flex' : 'none' }}
      >
        {showModal && (
          <div className="modal form-modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '850px' }}>
            <div className="modal-header">
              <div>
                <div className="modal-title" style={{ fontSize: '22px' }}>Create New Partner — Partner</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Fill in details to onboard a new partner. Username must be unique.</div>
              </div>
              <button className="modal-close" onClick={() => { setShowModal(false); setErrorMsg(''); setSuccessMsg(''); setUsernameStatus(null); }}><X size={20} /></button>
            </div>

            <div className="modal-body" style={{ padding: '24px', background: 'var(--card)' }}>
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '13px' }}>
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}
              {successMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#16a34a', fontSize: '13px' }}>
                  <CheckCircle size={16} /> {successMsg}
                </div>
              )}

              <div className="section-label">BASIC INFORMATION</div>
              <div className="form-row cols-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <span className="form-label text-gray" style={{ color: 'var(--text)' }}>FULL NAME <span style={{ color: '#ef4444' }}>*</span></span>
                  <input type="text" className="form-input" placeholder="Enter full name" value={form.name} onChange={e => set('name')(e.target.value)} style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
                <div className="form-group">
                  <span className="form-label text-gray" style={{ color: 'var(--text)' }}>CITY</span>
                  <input type="text" className="form-input" placeholder="e.g. Surat" value={form.city} onChange={e => set('city')(e.target.value)} style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
              </div>

              <div className="form-row cols-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <span className="form-label text-gray" style={{ color: 'var(--text)' }}>EMAIL ADDRESS <span style={{ color: '#ef4444' }}>*</span></span>
                  <input type="email" className="form-input" placeholder="partner@example.com" value={form.email} onChange={e => set('email')(e.target.value)} style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
                <div className="form-group">
                  <span className="form-label text-gray" style={{ color: 'var(--text)' }}>PHONE NUMBER</span>
                  <input type="tel" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone')(e.target.value)} style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
              </div>

              <div className="section-label" style={{ marginTop: '32px' }}>LOGIN CREDENTIALS</div>
              <div className="form-row cols-2" style={{ marginBottom: '24px' }}>
                <div className="form-group">
                  <span className="form-label text-gray" style={{ color: 'var(--text)' }}>USERNAME (must be unique)</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. partner.name"
                      value={form.username}
                      onChange={e => handleUsernameChange(e.target.value)}
                      style={{
                        background: 'var(--card)',
                        color: 'var(--text)',
                        paddingRight: '36px',
                        borderColor: usernameStatus === 'taken' ? '#ef4444' : usernameStatus === 'available' ? '#10b981' : 'var(--border)'
                      }}
                    />
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      {usernameStatus === 'checking' && <Loader size={14} color="#94a3b8" className="spin" />}
                      {usernameStatus === 'available' && <CheckCircle size={14} color="#10b981" />}
                      {usernameStatus === 'taken' && <AlertCircle size={14} color="#ef4444" />}
                    </div>
                  </div>
                  {usernameStatus === 'taken' && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>❌ Username already taken!</div>}
                  {usernameStatus === 'available' && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>✅ Username is available</div>}
                </div>
                <div className="form-group">
                  <span className="form-label text-gray" style={{ color: 'var(--text)' }}>TEMPORARY PASSWORD <span style={{ color: '#ef4444' }}>*</span></span>
                  <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={e => set('password')(e.target.value)} style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                  <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>User will be asked to change on first login</div>
                </div>
              </div>

              <div className="section-label" style={{ marginTop: '32px' }}>PERMISSIONS</div>
              <div className="permission-grid cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {['Create Leads', 'Assign Tasks', 'View Reports', 'Approve Agreements', 'Upload Documents', 'Manage Commission', 'Access Billing', 'View All Clients', 'System Settings'].map((perm) => (
                  <div 
                    key={perm} 
                    className="permission-item"
                    onClick={() => {
                      setForm(p => ({
                        ...p,
                        permissions: p.permissions?.includes(perm)
                          ? p.permissions.filter(pName => pName !== perm)
                          : [...(p.permissions || []), perm]
                      }));
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="permission-name" style={{ color: 'var(--text)' }}>{perm}</span>
                    <div className={`toggle ${form.permissions?.includes(perm) ? 'on' : ''}`}></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '24px', paddingTop: '16px' }}>
              <button className="topbar-btn secondary" onClick={() => { setShowModal(false); setErrorMsg(''); setSuccessMsg(''); setUsernameStatus(null); }} style={{ borderRadius: '8px', padding: '12px 24px', background: 'transparent', borderColor: 'var(--border)', color: 'var(--text)' }}>Cancel</button>
              <button className="topbar-btn" onClick={handleCreatePartner} disabled={submitting || usernameStatus === 'taken' || usernameStatus === 'checking'} style={{ background: submitting ? '#93c5fd' : '#2563eb', borderRadius: '8px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', border: 'none' }}>
                {submitting ? <><Loader size={14} className="spin" /> Creating...</> : 'Create Partner & Send Credentials'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MODULE 4: Clients
// ════════════════════════════════════════════════════════════════
const ClientsModule = () => {
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [realClients, setRealClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const [usersRes, ticketsRes] = await Promise.all([
          axios.get('https://myclaimportal.onrender.com/api/users', config),
          axios.get('https://myclaimportal.onrender.com/api/tickets', config)
        ]);
        
        const data = usersRes.data;
        const tickets = ticketsRes.data;

        // Find all partners under this Super Partner
        const partnerIds = data.filter(u => u.role === 'partner' && u.parent_id === user?._id).map(u => u._id);
        const myNetworkIds = [user?._id, ...partnerIds];
        
        // Filter clients who belong to ANY member of this Super Partner's network
        const clients = data.filter(u => u.role === 'client' && myNetworkIds.includes(u.parent_id));
        
        const formattedClients = clients.map(c => {
          // Identify which partner owns this client
          const originatingPartner = data.find(p => p._id === c.parent_id);
          const partnerName = originatingPartner?._id === user?._id ? 'Direct' : originatingPartner?.name || 'Unknown';
          
          // Get client tickets
          const clientTickets = tickets.filter(t => String(t.client?._id || t.client) === String(c._id));
          const activeCount = clientTickets.filter(t => t.status !== 'completed' && t.status !== 'closed').length;
          
          // Primary service is the service of the first ticket or N/A
          const primaryService = clientTickets.length > 0 ? clientTickets[0].service : 'N/A';

          return {
            ...c,
            id: c._id,
            partner: partnerName,
            service: primaryService,
            activeTickets: activeCount,
            status: c.is_active !== false ? 'Active' : 'Inactive',
            tickets: clientTickets.map(t => ({
              ...t,
              id: `#${t.ticketNo || new Date(t.createdAt).getTime()}`,
              status: t.status === 'active' ? 'Active' : t.status === 'in_process' ? 'In Process' : t.status === 'completed' ? 'Completed' : t.status === 'closed' ? 'Closed' : t.status
            }))
          };
        });
        setRealClients(formattedClients);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchData();
  }, [user]);

  const filtered = realClients.filter(c => {
    const matchS = c.name?.toLowerCase().includes(search.toLowerCase());
    const matchP = partnerFilter === 'all' || c.partner === partnerFilter;
    return matchS && matchP;
  });

  const uniquePartners = Array.from(new Set(realClients.map(c => c.partner).filter(p => p !== 'Direct' && p !== 'Unknown')));

  if (selected) {
    const clientTickets = selected.tickets || [];
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Back</button>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{selected.name}</div>
          <Badge status={selected.status} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>Client Info</div>
            {[{ icon: Phone, l: 'Phone', v: selected.phone || 'N/A' }, { icon: Mail, l: 'Email', v: selected.email || 'N/A' }, { icon: UserCircle, l: 'Partner', v: selected.partner }, { icon: Briefcase, l: 'Service', v: selected.service }].map((info, i) => {
              const Icon = info.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <Icon size={14} style={{ color: SP.primary }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{info.l}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{info.v}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>Tickets ({clientTickets.length})</div>
            {clientTickets.length > 0 ? clientTickets.map(t => (
              <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: SP.primary }}>{t.id}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.service}</div>
                </div>
                <Badge status={t.status} />
              </div>
            )) : <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No tickets.</div>}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeader title="Network Clients" sub={loading ? 'Loading...' : `${filtered.length} clients in your network`} />
      <InfoBanner icon={Lock} color={SP.accent} title="Read-only access." subtitle="Client KYC and account management are handled by Super Admin." />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <SearchBar search={search} setSearch={setSearch} placeholder="Search clients…" />
        <FilterSelect value={partnerFilter} onChange={setPartnerFilter} options={uniquePartners} placeholder="Partner" />
        <ExportBtn />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>#</th><th>Client Name</th><th>Assigned Partner</th><th>Service</th><th>Active Tickets</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontSize: '12px', color: SP.primary, fontWeight: 700 }}>{c.id.substring(c.id.length - 6).toUpperCase()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `linear-gradient(135deg, ${SP.primary}, ${SP.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>{c.name?.charAt(0)}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
                  </div>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.partner}</td>
                <td style={{ fontSize: '13px', color: 'var(--text)' }}>{c.service}</td>
                <td>
                  <span style={{ fontWeight: 800, color: c.activeTickets > 0 ? SP.warning : 'var(--text-muted)', fontSize: '14px' }}>{c.activeTickets}</span>
                </td>
                <td><Badge status={c.status} /></td>
                <td><button onClick={() => setSelected(c)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}><Eye size={13} />View</button></td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No clients found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MODULE 5: Tickets
// ════════════════════════════════════════════════════════════════
const TicketsModule = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: '', service: '', notes: '' });
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTicketsData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      const [usersRes, ticketsRes] = await Promise.all([
        axios.get('https://myclaimportal.onrender.com/api/users', config),
        axios.get('https://myclaimportal.onrender.com/api/tickets', config)
      ]);

      const allUsers = usersRes.data;
      
      const myPartners = allUsers.filter(u => u.role === 'partner' && u.parent_id === user?._id);
      setPartners(myPartners);
      
      const partnerIds = myPartners.map(p => p._id);
      const myNetworkIds = [user?._id, ...partnerIds];
      
      const myClients = allUsers.filter(u => u.role === 'client' && myNetworkIds.includes(u.parent_id));
      setClients(myClients);

      const mappedTickets = ticketsRes.data.map(t => {
        const clientObj = t.client;
        const parentId = clientObj?.parent_id || allUsers.find(u => u._id === clientObj?._id)?.parent_id;
        const partnerObj = allUsers.find(u => u._id === parentId);
        const partnerName = partnerObj?._id === user?._id ? 'Direct' : partnerObj?.name || 'Unknown';
        
        return {
          ...t,
          clientName: clientObj?.name || 'Unknown Client',
          partnerName,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          createdDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
        };
      });

      setTickets(mappedTickets);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.token) fetchTicketsData();
  }, [user]);

  const handleCreateTicket = async () => {
    if (!form.client || !form.service) {
      alert('Client and Service are required');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const verticalMap = {
        'IEPF Claim': 'Claim Hub',
        'Duplicate Share': 'Claim Hub',
        'GST Filing': 'Service Hub',
        'Company Incorporation': 'Service Hub',
        'Pre-IPO Shares': 'Store Hub',
      };
      const hubType = verticalMap[form.service] || 'Service Hub';

      const payload = {
        clientId: form.client,
        service: form.service,
        hubType,
        notes: form.notes,
      };

      await axios.post('https://myclaimportal.onrender.com/api/tickets', payload, config);
      setShowModal(false);
      setForm({ client: '', service: '', notes: '' });
      fetchTicketsData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const statuses = ['Active', 'In Process', 'Completed', 'Closed'];

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchS = t.clientName.toLowerCase().includes(q) || t._id.toLowerCase().includes(q) || t.service.toLowerCase().includes(q);
    
    const normalizedStatus = t.status === 'active' ? 'Active' : t.status === 'in_process' ? 'In Process' : t.status === 'completed' ? 'Completed' : t.status === 'closed' ? 'Closed' : t.status;
    const matchStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
    
    const matchP = partnerFilter === 'all' || t.partnerName === partnerFilter;
    return matchS && matchStatus && matchP;
  });

  const handleExport = () => {
    if (!filtered || filtered.length === 0) return alert('No tickets to export.');
    const exportData = filtered.map(t => ({
      'Ticket ID': t._id,
      'Client Name': t.clientName,
      'Partner Name': t.partnerName,
      'Service': t.service,
      'Status': t.status,
      'Date': t.date,
      'Created Date': t.createdDate
    }));
    downloadCSV(exportData, `Network_Tickets_Export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (selected) {
    const normalizedStatus = selected.status === 'active' ? 'Active' : selected.status === 'in_process' ? 'In Process' : selected.status === 'completed' ? 'Completed' : selected.status === 'closed' ? 'Closed' : selected.status;
    const timeline = [
      { label: 'Ticket Created', desc: 'Ticket opened and assigned', date: selected.createdDate, color: SP.primary },
      { label: 'Under Review', desc: 'Documents collected', date: selected.createdDate, color: SP.secondary },
      { label: 'In Process', desc: 'Active processing started', date: selected.date, color: SP.accent },
    ];
    if (normalizedStatus === 'Completed') timeline.push({ label: 'Completed', desc: 'Service delivered', date: selected.date, color: SP.success });

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Back</button>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>#{selected._id.slice(-6).toUpperCase()}</div>
          <Badge status={selected.status} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>Ticket Details</div>
            {[{ l: 'Client', v: selected.clientName }, { l: 'Partner', v: selected.partnerName }, { l: 'Service', v: selected.service }, { l: 'Status', v: selected.status }, { l: 'Created', v: selected.createdDate }, { l: 'Updated', v: selected.date }].map((info, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{info.l}</span>
                {info.l === 'Status' ? <Badge status={info.v} /> : <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{info.v}</span>}
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>Activity Timeline</div>
            <div style={{ position: 'relative' }}>
              {timeline.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: step.color, boxShadow: `0 0 8px ${step.color}`, flexShrink: 0, marginTop: '2px' }} />
                    {i < timeline.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < timeline.length - 1 ? '12px' : 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{step.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.desc}</div>
                    <div style={{ fontSize: '11px', color: step.color, fontWeight: 600, marginTop: '2px' }}>{step.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <InfoBanner icon={Shield} color={SP.secondary} title="Employee assignment restricted." subtitle="Only Admins can assign employees and manage execution workflows." />
      </>
    );
  }

  return (
    <>
      <SectionHeader title="Network Tickets" sub={loading ? 'Loading...' : `${filtered.length} of ${tickets.length} tickets`} onAction={() => setShowModal(true)} actionLabel="New Ticket" />

      <InfoBanner icon={Shield} color={SP.secondary} title="Observational access." subtitle="Ticket assignment and employee workflows are handled by Admins. You can create and track tickets." />

      {/* Status Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', ...statuses].map(s => {
          const count = s === 'all' ? tickets.length : tickets.filter(t => {
            const normalizedStatus = t.status === 'active' ? 'Active' : t.status === 'in_process' ? 'In Process' : t.status === 'completed' ? 'Completed' : t.status === 'closed' ? 'Closed' : t.status;
            return normalizedStatus === s;
          }).length;
          const active = statusFilter === s;
          const c = STATUS_MAP[s];
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '8px 18px', fontSize: '12px', fontWeight: 700, borderRadius: '20px',
              border: `1px solid ${active ? (c?.color || SP.primary) : 'var(--border)'}`,
              background: active ? `${c?.color || SP.primary}15` : 'var(--card)',
              color: active ? (c?.color || SP.primary) : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
              {s === 'all' ? 'All' : s} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <SearchBar search={search} setSearch={setSearch} placeholder="Search by client, ticket ID, service…" />
        <FilterSelect value={partnerFilter} onChange={setPartnerFilter} options={partners.map(p => p.name)} placeholder="Partner" />
        <ExportBtn onClick={handleExport} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Ticket ID</th><th>Client</th><th>Partner</th><th>Service</th><th>Date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id}>
                <td style={{ fontWeight: 700, color: SP.primary, fontSize: '13px' }}>#{t.ticketNo || new Date(t.createdAt).getTime()}</td>
                <td style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{t.clientName}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.partnerName}</td>
                <td><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '3px 10px' }}>{t.service}</span></td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.date}</td>
                <td><Badge status={t.status} /></td>
                <td><button onClick={() => setSelected(t)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}><Eye size={13} />Details</button></td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tickets found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchTicketsData}
        />
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MODULE 6: Activity
// ════════════════════════════════════════════════════════════════
const ActivityModule = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        
        const [activityRes, usersRes] = await Promise.all([
          axios.get('https://myclaimportal.onrender.com/api/activity', config),
          axios.get('https://myclaimportal.onrender.com/api/users', config)
        ]);

        const allUsers = usersRes.data;
        const allActivity = activityRes.data;

        const myPartners = allUsers.filter(u => u.role === 'partner' && u.parent_id === user?._id);
        const partnerIds = myPartners.map(p => p._id);
        const myNetworkIds = [user?._id, ...partnerIds];
        
        const myClients = allUsers.filter(u => u.role === 'client' && myNetworkIds.includes(u.parent_id));
        const clientIds = myClients.map(c => c._id);
        const fullNetworkIds = [...myNetworkIds, ...clientIds];

        const networkActivities = allActivity.filter(act => {
          const actUserId = String(act.user?._id || act.user);
          return fullNetworkIds.some(nid => String(nid) === actUserId);
        });

        const mapped = networkActivities.map(act => {
          let type = 'other';
          let icon = Activity;
          let color = '#6366f1';
          const actionText = act.action.toLowerCase();
          
          if (actionText.includes('ticket')) {
            type = 'ticket';
            icon = Ticket;
            color = '#8b5cf6';
          } else if (actionText.includes('lead')) {
            type = 'lead';
            icon = BarChart3;
            color = '#6366f1';
          } else if (actionText.includes('client')) {
            type = 'client';
            icon = UserCheck;
            color = '#10b981';
          } else if (actionText.includes('partner')) {
            type = 'partner';
            icon = Users;
            color = '#6366f1';
          }

          return {
            id: act._id,
            type,
            text: act.action,
            time: new Date(act.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
            icon,
            color
          };
        });

        setActivities(mapped);
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchActivity();
  }, [user]);

  const types = ['all', 'lead', 'ticket', 'client', 'partner'];
  const filtered = typeFilter === 'all' ? activities : activities.filter(a => a.type === typeFilter);

  return (
    <>
      <SectionHeader title="Network Activity Feed" sub={loading ? 'Loading...' : 'Chronological log of all network events'} />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {types.map(t => {
          const active = typeFilter === t;
          return (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '8px 18px', fontSize: '12px', fontWeight: 700, borderRadius: '20px',
              border: `1px solid ${active ? SP.primary : 'var(--border)'}`,
              background: active ? SP.gradientPrimary : 'var(--card)',
              color: active ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.2s',
              boxShadow: active ? `0 4px 14px ${SP.primaryLight}` : 'none',
            }}>
              {t === 'all' ? 'All Activity' : t}
            </button>
          );
        })}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
        {filtered.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '18px 24px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', lineHeight: 1.4 }}>{item.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>{item.time}</span>
                  <TypeBadge type={item.type} />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loading && <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No activity found.</div>}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MODULE 7: Profile / Settings
// ════════════════════════════════════════════════════════════════
const ProfileModule = ({ user, onLogout }) => {
  const [showPassModal, setShowPassModal] = useState(false);
  const [pass, setPass] = useState({ current: '', newPass: '', confirm: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Super Partner',
    email: user?.email || 'superpartner@myclaim.in',
    phone: user?.phone || '+91 99999 00000',
    city: 'Mumbai, India'
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // You can wire this up to an API endpoint later
    alert('Profile updated successfully!');
  };

  return (
    <>
      <SectionHeader title="Profile & Settings" sub="Manage your account and preferences" />

      {/* Editable Profile Card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', marginBottom: '24px', maxWidth: '600px' }}>
        
        {/* Photo Upload Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', boxShadow: `0 8px 24px ${SP.primaryLight}` }} />
            ) : (
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: SP.gradientPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '32px', boxShadow: `0 8px 24px ${SP.primaryLight}` }}>
                {(profileData.name || 'SP').substring(0, 2).toUpperCase()}
              </div>
            )}
            
            {isEditing && (
              <label style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: '#fff', border: `1px solid ${SP.primary}`, color: SP.primary, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <Plus size={16} />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', background: SP.primaryLight, color: SP.primary, border: `1px solid ${SP.primary}30`, borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: 700 }}>
            <Shield size={12} /> Super Partner
          </div>
        </div>

        {/* Profile Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
            {isEditing ? (
              <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
            ) : (
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', padding: '10px 14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid transparent' }}>{profileData.name}</div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
              {isEditing ? (
                <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
              ) : (
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', padding: '10px 14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid transparent' }}>{profileData.email}</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</label>
              {isEditing ? (
                <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
              ) : (
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', padding: '10px 14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid transparent' }}>{profileData.phone}</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>City / Location</label>
            {isEditing ? (
              <input type="text" value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
            ) : (
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', padding: '10px 14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid transparent' }}>{profileData.city}</div>
            )}
          </div>
        </div>

        {/* Edit / Save Actions */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleSaveProfile} style={{ padding: '10px 24px', background: SP.gradientPrimary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 12px ${SP.primaryLight}` }}>Save Changes</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{ padding: '10px 24px', background: `${SP.primary}15`, color: SP.primary, border: `1px solid ${SP.primary}30`, borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Edit Profile</button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowPassModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: SP.gradientPrimary, color: '#fff', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${SP.primaryLight}` }}>
          <Lock size={15} />Change Password
        </button>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: `${SP.danger}15`, color: SP.danger, border: `1px solid ${SP.danger}30`, borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          <LogOut size={15} />Logout
        </button>
      </div>

      {showPassModal && (
        <Modal title="Change Password" onClose={() => setShowPassModal(false)}>
          <FG label="Current Password" required><FInput type="password" placeholder="Enter current password" value={pass.current} onChange={e => setPass(p => ({ ...p, current: e.target.value }))} /></FG>
          <FG label="New Password" required><FInput type="password" placeholder="Enter new password" value={pass.newPass} onChange={e => setPass(p => ({ ...p, newPass: e.target.value }))} /></FG>
          <FG label="Confirm New Password" required><FInput type="password" placeholder="Confirm new password" value={pass.confirm} onChange={e => setPass(p => ({ ...p, confirm: e.target.value }))} /></FG>
          <SubmitRow label="Update Password →" onCancel={() => setShowPassModal(false)} />
        </Modal>
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// SIDEBAR — Dedicated Super Partner Sidebar
// ════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
  { id: 'leads', label: 'Leads', icon: BarChart3, section: 'NETWORK', badge: 38 },
  { id: 'partners', label: 'Partners', icon: Users, section: 'NETWORK', badge: 3 },
  { id: 'clients', label: 'Clients', icon: UserCircle, section: 'NETWORK', badge: 17 },
  { id: 'tickets', label: 'Tickets', icon: Ticket, section: 'NETWORK', badge: 8 },
  { id: 'activity', label: 'Activity', icon: Activity, section: 'INSIGHTS' },
  { id: 'profile', label: 'Profile', icon: Settings, section: 'ACCOUNT' },
];

const SPSidebar = ({ activePage, setPage, user, onLogout }) => {
  const sections = [...new Set(NAV_ITEMS.map(i => i.section))];

  return (
    <nav style={{
      width: '240px', flexShrink: 0, height: '100vh', overflowY: 'auto',
      background: SP.sidebarBg, display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)', position: 'relative', zIndex: 100,
    }}>
      {/* Custom scrollbar */}
      <style>{`
        .sp-sidebar::-webkit-scrollbar { width: 4px; }
        .sp-sidebar::-webkit-scrollbar-track { background: transparent; }
        .sp-sidebar::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.2); border-radius: 2px; }
        .sp-nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 16px; width: calc(100% - 32px); margin: 2px 16px; border: none; border-radius: 12px; background: transparent; color: ${SP.sidebarText}; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .sp-nav-item:hover { background: ${SP.sidebarHover}; color: var(--blue); }
        .sp-nav-item.active { background: ${SP.sidebarActiveBg}; color: ${SP.sidebarActiveText}; border: 1px solid rgba(34,197,94,0.2); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25); }
        .dark .sp-nav-item.active { color: var(--blue); background: transparent; box-shadow: none; border-color: transparent;}
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Logo */}
      <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid var(--border)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: SP.gradientPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${SP.primaryLight}` }}>
            <Network size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px' }}>MyClaim</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>Super Partner</div>
          </div>
        </div>
      </div>

      {/* Nav Items grouped by section */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        {sections.map(sec => {
          const items = NAV_ITEMS.filter(i => i.section === sec);
          return (
            <div key={sec} style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-light)', padding: '12px 24px 6px', textTransform: 'uppercase', opacity: 0.6 }}>{sec}</div>
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button key={item.id} className={`sp-nav-item${isActive ? ' active' : ''}`} onClick={() => setPage(item.id)}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {item.badge && (
                      <span className="badge" style={{ fontSize: '10px', fontWeight: 700, background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(34, 197, 94, 0.1)', color: isActive ? '#fff' : '#166534', border: `1px solid ${isActive ? 'rgba(255,255,255,0.4)' : 'rgba(34, 197, 94, 0.2)'}`, padding: '2px 7px', borderRadius: '12px', minWidth: '24px', textAlign: 'center' }}>
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

      {/* Footer - User Info */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--card)', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={onLogout}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: SP.gradientPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
            {(user?.name || 'SP').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{user?.name || 'Super Partner'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>super_partner</div>
          </div>
          <LogOut size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </nav>
  );
};

// ════════════════════════════════════════════════════════════════
// TOP BAR — Super Partner Topbar
// ════════════════════════════════════════════════════════════════
const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: 'Network overview & performance metrics' },
  leads: { title: 'Leads', sub: 'Manage and track your network leads' },
  partners: { title: 'Partners', sub: 'Your partner network' },
  clients: { title: 'Clients', sub: 'Client accounts in your network' },
  tickets: { title: 'Tickets', sub: 'Service tickets and status tracking' },
  activity: { title: 'Activity', sub: 'Chronological activity feed' },
  profile: { title: 'Profile & Settings', sub: 'Manage your account' },
};

const SPTopbar = ({ page, user }) => {
  const meta = PAGE_META[page] || PAGE_META.dashboard;
  return (
    <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', boxSizing: 'border-box' }}>
      <div>
        {page === 'dashboard' ? (
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
              {user?.name ? (user.name.toLowerCase().includes('partner') ? user.name : user.name.split(' ')[0]) : 'Super Partner'}
            </span> <span className="wave" style={{ fontSize: '24px' }}>👋</span>
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
              Here's your <span style={{ fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>SUPER PARTNER</span> command center.
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
        {/* Network badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: SP.primaryLight, color: SP.primary, border: `1px solid ${SP.primary}30`, borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 700 }}>
          <Network size={13} />My Network
        </div>
        {/* Bell */}
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <Bell size={16} style={{ color: 'var(--text-muted)' }} />
          <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: SP.primary, border: '2px solid var(--card)' }} />
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// ROOT: SuperPartnerDashboard
// ════════════════════════════════════════════════════════════════
const SuperPartnerDashboard = () => {
  const [page, setPage] = useState(() => sessionStorage.getItem('MyClaim_SPTab') || 'dashboard');
  
  React.useEffect(() => {
    sessionStorage.setItem('MyClaim_SPTab', page);
  }, [page]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <OverviewModule setPage={setPage} />;
      case 'leads': return <LeadsModule />;
      case 'partners': return <PartnersModule />;
      case 'clients': return <ClientsModule />;
      case 'tickets': return <TicketsModule />;
      case 'activity': return <ActivityModule />;
      case 'profile': return <ProfileModule user={user} onLogout={handleLogout} />;
      default: return <OverviewModule setPage={setPage} />;
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
      {/* ← Dedicated SP Sidebar (replaces shared Sidebar for this role) */}
      <SPSidebar activePage={page} setPage={setPage} user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <SPTopbar page={page} user={user} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperPartnerDashboard;

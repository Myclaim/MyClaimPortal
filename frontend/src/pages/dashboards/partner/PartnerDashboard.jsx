import React, { useState } from 'react';
import {
  Users, User, ClipboardCheck, TrendingUp, Plus, Search,
  Eye, CheckCircle2, BarChart3,
  Zap, Target, RefreshCw, AlertCircle,
  ChevronRight, ChevronLeft, Briefcase, Download, Edit, Check, Clock,
  UserPlus, Send, Star, MoreVertical, Shield,
  LogOut, LayoutDashboard, Network, Bell, Ticket, Settings,
  Home, Layout, Activity, ShoppingBag, CheckSquare, Calendar, 
  FileText, Folder, GitMerge, Calculator, Monitor, BookOpen, Box, ArrowRight, Scale
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../../components/ui/StatCard';
import useAuth from '../../../hooks/useAuth';
import ClientProfile from '../../clients/ClientProfile';
import api from '../../../services/api';
import CreateTicketModal from '../../../components/forms/CreateTicketModal';
import ServiceStore from '../../store/ServiceStore';

/* ─── Inline badge styles (avoids missing CSS-var errors) ────── */
const BADGE_STYLES = {
  'New':           { bg: 'rgba(34, 197, 94,0.12)',  color: '#15803d', dot: '#22c55e'  },
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
  { Icon: RefreshCw,    color: '#22c55e', text: 'Ticket TK-501 moved to "In Process"',              time: '2 HRS AGO'  },
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
function Avatar({ name, size = 36, gradient = ['#15803d', '#22c55e'], fontSize = 13 }) {
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
  const KpiCard = ({ title, value, icon: Icon, trend, iconBg, trendBg, trendColor }) => (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px',
      padding: '24px 20px', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: trendColor, marginBottom: '24px' }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px', lineHeight: 1 }}>{value}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', background: trendBg, color: trendColor, fontSize: '11px', fontWeight: 700 }}>
          {trend}
        </div>
      </div>
    </div>
  );

  const ActionBtn = ({ label, icon: Icon, color, onClick }) => (
    <button onClick={onClick} style={{
      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px',
      padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        <Icon size={18} />
      </div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{label}</div>
    </button>
  );

  return (
    <>
      {/* Top Row: Banner & KPI Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Banner */}
        <div style={{
          flex: '1.2', background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '36px 40px', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, var(--green) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, marginBottom: '20px' }}>
              Partner · Since 2023
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Welcome back, Partner!
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>
              RM LEGAL Associates - Partner Dashboard
            </div>
            
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#22c55e', lineHeight: 1, marginBottom: '8px' }}>
              ₹1,24,500
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '24px' }}>
              Total Commission Earned
            </div>
            
            <button style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
              View Commission
            </button>
          </div>
          
          {/* Circular Chart Overlay */}
          <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '10px solid #22c55e', borderLeftColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>75%</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Target</div>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div style={{ flex: '2', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignSelf: 'center' }}>
           <KpiCard title="Active Clients" value={stats.clients || '248'} icon={Users} trend="↑ 12%" iconBg="rgba(34,197,94,0.1)" trendBg="rgba(34,197,94,0.15)" trendColor="#22c55e" />
           <KpiCard title="Active Services" value="47" icon={Zap} trend="↑ 8%" iconBg="rgba(34,197,94,0.1)" trendBg="rgba(34,197,94,0.15)" trendColor="#22c55e" />
           <KpiCard title="New Leads" value={stats.leads || '47'} icon={UserPlus} trend="↑ 24.5%" iconBg="rgba(34,197,94,0.1)" trendBg="rgba(34,197,94,0.15)" trendColor="#22c55e" />
           <KpiCard title="Leads Enrolled" value={stats.converted || '45'} icon={CheckSquare} trend="↑ 24.5%" iconBg="rgba(34,197,94,0.1)" trendBg="rgba(34,197,94,0.15)" trendColor="#22c55e" />
        </div>
      </div>

      {/* Second Row: Actions, Leads, Tickets */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
        {/* Quick Actions */}
        <div style={{ flex: '1', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Quick Actions</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Shortcuts to common tasks</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <ActionBtn label="New Lead" icon={Plus} color="#8b5cf6" onClick={() => onNavigate('leads')} />
            <ActionBtn label="My Clients" icon={Users} color="#22c55e" onClick={() => onNavigate('clients')} />
            <ActionBtn label="Invoice" icon={FileText} color="#22c55e" onClick={() => {}} />
            <ActionBtn label="New Task" icon={CheckSquare} color="#f59e0b" onClick={() => {}} />
          </div>
        </div>

        {/* Stats Group (Leads & Tickets) */}
        <div style={{ flex: '2.4', display: 'flex', gap: '20px', alignItems: 'stretch' }}>
          {/* Generated Leads */}
          <div style={{ flex: '1', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Generated Leads</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Quarterly Report</div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div>
                <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: '12px' }}>
                  {stats.leads !== undefined ? stats.leads : '4,350'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '13px', fontWeight: 700 }}>
                  <span>↑ 15.8%</span>
                </div>
              </div>

              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '8px solid #22c55e', borderTopColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}></div>
            </div>
          </div>

          {/* Ticket Tracker */}
          <div style={{ flex: '1', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Ticket Tracker</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>Last 7 Days</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: 'auto' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: '6px' }}>164</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Total Tickets</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>142</span> New Tickets
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>28</span> Open Tickets
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>1 Day</span> Resp. Time
                  </div>
                </div>
              </div>

              <div style={{ marginLeft: 'auto', marginRight: '20px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '8px solid #8b5cf6', borderBottomColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>85%</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Client Progress, Service Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px', alignItems: 'start' }}>
        
        {/* Client Progress */}
        <div style={{ flex: '1', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Client Progress</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>Average 72% Completed</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Priya Mehta', id: 'CL-000', progress: 65, color: '#f97316' },
              { name: 'Amit Patel', id: 'CL-001', progress: 86, color: '#8b5cf6' },
              { name: 'Suresh Kumar', id: 'CL-002', progress: 90, color: '#22c55e' },
              { name: 'Neha Gupta', id: 'CL-003', progress: 37, color: '#06b6d4' },
              { name: 'Vikram Joshi', id: 'CL-004', progress: 55, color: '#f97316' },
            ].map((client, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: client.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800 }}>
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{client.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.id}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', width: '80px' }}>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${client.progress}%`, height: '100%', background: client.color, borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: client.color }}>{client.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Hub */}
        <div style={{ flex: '1', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '16px 20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>Service Hub</div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginBottom: '2px' }}>12</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginBottom: '2px' }}>5</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>SERVICE</th>
                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>CLIENT</th>
                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>DATE</th>
                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: 'Lost Shares', c: 'Priya M.', d: '10 Dec', st: 'Active', bg: 'rgba(34,197,94,0.15)', co: '#22c55e' },
                { s: 'GST Reg.', c: 'Amit P.', d: '16 Nov', st: 'Active', bg: 'rgba(34,197,94,0.15)', co: '#22c55e' },
                { s: 'Trademark', c: 'Suresh K.', d: '8 Aug', st: 'On Hold', bg: 'rgba(239,68,68,0.15)', co: '#ef4444' },
                { s: 'ITR Filing', c: 'Neha G.', d: '8 Jan', st: 'Pending', bg: 'rgba(245,158,11,0.15)', co: '#f59e0b' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--text)', fontWeight: 600 }}>{row.s}</td>
                  <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{row.c}</td>
                  <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{row.d}</td>
                  <td style={{ padding: '8px 0' }}>
                    <span style={{ background: row.bg, color: row.co, padding: '3px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>{row.st}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          
      {/* Footer */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '24px 0', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' 
      }}>
        <div>© 2026, made with <span style={{ color: '#ef4444' }}>❤️</span> by RM LEGAL</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>License</a>
          <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>Documentation</a>
          <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>Support</a>
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
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', altPhone: '', category: '', serviceRequest: '', notes: '' });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone) return;
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        serviceInterest: form.serviceRequest || form.category || 'N/A',
        notes: `[Alt Phone: ${form.altPhone || 'N/A'}]\n[Category: ${form.category}]\n\n${form.notes}`,
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
      <div className="modal" style={{ maxWidth: 640, background: 'var(--card)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="modal-header" style={{ flexShrink: 0, borderBottom: 'none', padding: '24px 32px 16px' }}>
          <div className="modal-title" style={{ fontSize: '20px', fontWeight: 800 }}>Add New Lead</div>
          <button className="modal-close" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="modal-body" style={{ overflowY: 'auto', padding: '16px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>FIRST NAME <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="Enter first name" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>LAST NAME <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="Enter last name" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>CONTACT NUMBER <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>ALTERNATE NUMBER</label>
                <input className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="+91 98765 43210" value={form.altPhone} onChange={set('altPhone')} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>SERVICE CATEGORY</label>
                <select className="form-select" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px', color: 'var(--text)' }} value={form.category} onChange={set('category')}>
                  <option value="">Select category...</option>
                  <option value="Physical Shares">Physical Shares</option>
                  <option value="Company Compliance">Company Compliance</option>
                  <option value="Taxation">Taxation</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>SERVICE REQUEST</label>
                <select className="form-select" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px', color: 'var(--text)' }} value={form.serviceRequest} onChange={set('serviceRequest')}>
                  <option value="">Select service...</option>
                  {SERVICE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>NOTES (OPTIONAL)</label>
              <textarea className="form-input" rows={4} style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px', resize: 'vertical' }} placeholder="Add any additional notes..." value={form.notes} onChange={set('notes')} />
            </div>

          </div>
          
          <div className="modal-footer" style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 32px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '12px 24px', background: '#22c55e', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)' }}>Submit Lead</button>
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
    const fetchProposals = async () => {
      try {
        const { data: propData } = await api.get('/proposals');
        console.log('Fetched Proposals:', propData, 'Current User:', user);
        
        const userName = user?.name ? user.name.toLowerCase().trim() : '';
        const myProposals = propData.filter(p => {
          if (!userName) return false;
          const pPartner = p.partner ? p.partner.toLowerCase().trim() : '';
          const pAssign = p.assignUserName ? p.assignUserName.toLowerCase().trim() : '';
          return pPartner === userName || pAssign === userName || String(p.assignedTo?._id || p.assignedTo) === String(user?._id);
        });
        
        const formattedProps = myProposals.map(p => ({
          id: String(p._id).substring(String(p._id).length - 6).toUpperCase(),
          client: p.clientName || 'Unknown',
          initials: (p.clientName || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
          color: ['#f97316', '#06b6d4', '#22c55e', '#8b5cf6'][Math.floor(Math.random() * 4)],
          service: p.serviceRequest || 'N/A',
          amount: '—',
          date: new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: p.status || 'Draft',
          statusBg: p.status === 'Accepted' ? 'rgba(16,185,129,0.1)' : (p.status === 'Sent' || p.status === 'Active') ? 'rgba(6,182,212,0.1)' : 'rgba(245,158,11,0.1)',
          statusCol: p.status === 'Accepted' ? '#10b981' : (p.status === 'Sent' || p.status === 'Active') ? '#06b6d4' : '#f59e0b',
          attachment: p.attachmentPath ? p.attachmentPath.split('/').pop() : '+ Attach',
          isAttach: !p.attachmentPath
        }));
        
        setProposals(formattedProps);
      } catch (err) {
        console.error('Error fetching proposals:', err);
      }
    };

    if (user?.token) {
      fetchLeads();
      fetchProposals();
    }
  }, [user]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('proposals');

  const [proposals, setProposals] = useState([]);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    return (l.name.toLowerCase().includes(q) || l.service.toLowerCase().includes(q))
      && (filterStatus === 'All' || l.status === filterStatus);
  });

  return (
    <>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Lead Centre</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage leads and proposals</p>
        </div>
        <button className="topbar-btn" style={{ background: '#22c55e', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <User size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Leads</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', lineHeight: 1 }}>{leads.length}</div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>↑ 18%</span>
          </div>
        </div>
        
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
            <UserPlus size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>New Leads</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', lineHeight: 1 }}>{leads.filter(l => l.status === 'New').length}</div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>↑ 24.5%</span>
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Open Leads</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', lineHeight: 1 }}>{leads.filter(l => l.status === 'In Discussion').length}</div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>Awaiting</span>
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Proposals Sent</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', lineHeight: 1 }}>{proposals.length}</div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>↑ 12%</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setActiveSubTab('leads')} style={{ padding: '8px 16px', background: activeSubTab === 'leads' ? '#22c55e' : 'var(--card)', border: activeSubTab === 'leads' ? 'none' : '1px solid var(--border)', borderRadius: '8px', color: activeSubTab === 'leads' ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <FileText size={16} /> View Leads <span style={{ background: activeSubTab === 'leads' ? 'rgba(255,255,255,0.2)' : 'var(--bg)', padding: '2px 6px', borderRadius: '10px', fontSize: '11px' }}>{leads.length}</span>
        </button>
        <button onClick={() => setActiveSubTab('proposals')} style={{ padding: '8px 16px', background: activeSubTab === 'proposals' ? '#22c55e' : 'var(--card)', border: activeSubTab === 'proposals' ? 'none' : '1px solid var(--border)', borderRadius: '8px', color: activeSubTab === 'proposals' ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <FileText size={16} /> Proposals <span style={{ background: activeSubTab === 'proposals' ? 'rgba(255,255,255,0.2)' : 'var(--bg)', padding: '2px 6px', borderRadius: '10px', fontSize: '11px' }}>{proposals.length}</span>
        </button>
      </div>

      {activeSubTab === 'proposals' && (
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
            Proposal List
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>PROPOSAL ID</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>CLIENT</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>SERVICE</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>AMOUNT</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>DATE</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>ATTACHMENT</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', background: 'rgba(34, 197, 94,0.1)', padding: '4px 8px', borderRadius: '4px' }}>{row.id}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: row.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                        {row.initials}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{row.client}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text)' }}>{row.service}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{row.amount}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{row.date}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ background: row.statusBg, color: row.statusCol, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button style={{ 
                      background: row.isAttach ? 'transparent' : 'rgba(255,255,255,0.03)', 
                      border: row.isAttach ? '1px dashed var(--border)' : '1px solid var(--border)', 
                      color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' 
                    }}>
                      {row.isAttach ? null : <span style={{ fontSize: '14px' }}>📎</span>} {row.attachment}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'leads' && (
        <>
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
          </div>

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
                        <Avatar name={lead.name} size={32} gradient={['#15803d', '#22c55e']} fontSize={11} />
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
        </>
      )}

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
function ClientsTab({ onNavigateToClient }) {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

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
        
        // Mock data if actual DB data is sparse for demonstration
        const mockCategories = ['Physical Shares & Documents', 'Taxation & Compliance', 'Licenses & Registrations', 'Agreements & Contracts', 'Company Changes'];
        const mockServices = ['IEPF Claim', 'Income Tax Return Filing', 'GST Registration', 'NDA, Legal Notice', 'Appointment of a Director'];
        const mockStatuses = ['Active', 'Active', 'In Progress', 'Active', 'Doc Verification'];

        const formatted = myClients.map((c, i) => ({
          id: `CL-00${i}`,
          dbId: c._id,
          name: c.name,
          email: c.email || `${c.name.toLowerCase().replace(' ', '.')}@email.com`,
          phone: c.phone || `98${Math.floor(10000000 + Math.random() * 90000000)}`,
          category: mockCategories[i % mockCategories.length],
          services: mockServices[i % mockServices.length],
          status: mockStatuses[i % mockStatuses.length],
          since: new Date(c.createdAt || Date.now() - i * 864000000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        }));
        
        setClients(formatted.length > 0 ? formatted : [
          { id: 'CL-000', dbId: '0', name: 'Priya Mehta', email: 'priya.mehta@email.com', phone: '9876543210', category: 'Physical Shares & Documents', services: 'IEPF Claim', status: 'Active', since: '12 Jan 2025' },
          { id: 'CL-001', dbId: '1', name: 'Amit Patel', email: 'amit.patel@email.com', phone: '9845612378', category: 'Taxation & Compliance', services: 'Income Tax Return Filing', status: 'Active', since: '16 Nov 2024' },
          { id: 'CL-002', dbId: '2', name: 'Suresh Kumar', email: 'suresh.kumar@email.com', phone: '9734521890', category: 'Licenses & Registrations', services: 'GST Registration', status: 'In Progress', since: '08 Aug 2024' },
          { id: 'CL-003', dbId: '3', name: 'Neha Gupta', email: 'neha.g@email.com', phone: '9812345678', category: 'Agreements & Contracts', services: 'NDA, Legal Notice', status: 'Active', since: '08 Jan 2025' },
          { id: 'CL-004', dbId: '4', name: 'Vikram Joshi', email: 'vikram.j@email.com', phone: '9654321087', category: 'Company Changes', services: 'Appointment of a Director', status: 'Doc Verification', since: '17 Feb 2025' },
        ]);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, [user]);

  const q = search.toLowerCase();
  const filtered = clients.filter(c =>
    (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) &&
    (filter === 'All' || c.status === filter || (filter === 'Enrolled' && c.status === 'Active'))
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>My Clients</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All enrolled clients — auto-populated when super admin enrolls</p>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
          {['All', 'Active', 'In Progress', 'Enrolled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', background: filter === f ? 'rgba(34, 197, 94,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: filter === f ? '#fff' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(34, 197, 94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
            <User size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Clients</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{clients.length}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px' }}>↑ 8%</span>
            </div>
          </div>
        </div>
        
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Check size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Active</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{clients.filter(c => c.status === 'Active').length}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px' }}>↑ 12%</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(34, 197, 94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>In Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{clients.filter(c => c.status === 'In Progress' || c.status === 'Doc Verification').length}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', background: 'rgba(148,163,184,0.1)', padding: '4px 8px', borderRadius: '6px' }}>Running</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
            <UserPlus size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>New This Month</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{clients.filter(c => c.dbId && c.dbId.length === 24).length}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px' }}>↑ 19%</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', display: 'flex', gap: '24px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>Client Directory</h3>
          <div style={{ flex: 1, maxWidth: '300px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', width: '100%', outline: 'none', fontSize: '13px' }} />
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CLIENT ID</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CLIENT NAME</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CONTACT</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CATEGORY</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SERVICES</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STATUS</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>JOIN DATE</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No clients found.</td></tr>
            ) : filtered.map((client, idx) => (
              <tr key={client.id} style={{ borderBottom: '1px solid var(--border)', background: 'transparent', transition: '0.2s' }}>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ background: 'rgba(34, 197, 94,0.1)', color: '#4ade80', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>{client.id}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={client.name} size={36} gradient={idx % 2 === 0 ? ['#86efac', '#22c55e'] : ['#4ade80', '#16a34a']} fontSize={13} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{client.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {client.phone}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ background: 'rgba(34, 197, 94,0.1)', color: '#4ade80', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{client.category}</span>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {client.services}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ background: client.status === 'Active' ? 'rgba(34,197,94,0.1)' : client.status === 'In Progress' ? 'rgba(14,165,233,0.1)' : 'rgba(249,115,22,0.1)', color: client.status === 'Active' ? '#4ade80' : client.status === 'In Progress' ? '#38bdf8' : '#fb923c', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    {client.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {client.since}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => client.dbId !== '0' && onNavigateToClient(client.dbId)} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => client.dbId !== '0' && onNavigateToClient(client.dbId)} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Edit size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: RAISE TICKET
════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════
   TAB: SERVICE HUB
════════════════════════════════════════════════════════════════ */
function ServiceHubTab() {
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  React.useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await api.get('/department-services');
        // Only active services, including store type
        setServices(res.data.filter(s => s.status !== false));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const popularServices = services.slice(0, 6);
  const dbCategories = [...new Set(services.map(s => s.category).filter(Boolean))];
  const tabs = ['Popular', ...dbCategories];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>Service Hub</h2>
        
        {/* Promo Banner */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎉 New Year Offer
          </span>
          <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.3)', display: 'inline-flex', alignItems: 'center' }}>
            <Check size={12} style={{ marginRight: 4 }} /> Additional 10% Off
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '0px', marginBottom: '32px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveCategory(tab)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: activeCategory === tab ? '#fff' : 'var(--text-muted)', 
              fontSize: '13px', 
              fontWeight: activeCategory === tab ? 700 : 600, 
              cursor: 'pointer', 
              padding: '0 0 12px 0',
              marginBottom: '-1px',
              borderBottom: activeCategory === tab ? '2px solid #22c55e' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading services from Super Admin Service Hub...
        </div>
      ) : activeCategory === 'Popular' ? (
        <>
          {/* Popular Services */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⭐ Most Popular Services
            </h3>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
              {popularServices.map(srv => (
                <div key={srv._id} style={{ flexShrink: 0, width: '240px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(34, 197, 94, 1)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>POPULAR</div>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', marginBottom: '20px', marginTop: '16px' }}>
                    <FileText size={24} />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.4, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {srv.name}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', marginBottom: '16px' }}>
                    ₹{srv.price?.toLocaleString('en-IN') || 0}
                  </div>
                  <button onClick={() => setSelectedService(srv)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View Details →
                  </button>
                </div>
              ))}
              {popularServices.length === 0 && (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>No active services found.</div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' }}>
              Browse by Category
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {dbCategories.map(cat => {
                const count = services.filter(s => s.category === cat).length;
                return (
                  <div key={cat} onClick={() => setActiveCategory(cat)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34, 197, 94,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', marginBottom: '16px' }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {cat}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {count} services
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Services under Category */
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' }}>
            {activeCategory} Services
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {services.filter(s => s.category === activeCategory).map(srv => (
              <div key={srv._id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>{srv.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '12px' }}>{srv.code}</div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>{srv.description || 'No description available.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Base Price</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#22c55e' }}>₹{srv.price?.toLocaleString('en-IN') || 0}</div>
                  </div>
                  <button onClick={() => setSelectedService(srv)} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div className="modal-overlay open" onClick={() => setSelectedService(null)}>
          <div className="modal" style={{ maxWidth: 540, background: 'var(--card)', border: '1px solid rgba(255,255,255,0.05)', animation: 'scaleIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', padding: '24px 32px 16px' }}>
              <div className="modal-title" style={{ fontSize: '20px', fontWeight: 800 }}>Service Details</div>
              <button className="modal-close" onClick={() => setSelectedService(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '16px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
                  ⚖️
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>{selectedService.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedService.code}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Category</span>
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{selectedService.category}</span>
                </div>
                {selectedService.subCategory && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sub Category</span>
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{selectedService.subCategory}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Base Price</span>
                  <span style={{ fontSize: '14px', color: '#22c55e', fontWeight: 800 }}>₹{selectedService.price?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Description</span>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{selectedService.description || 'No description available.'}</p>
                </div>
              </div>

              {selectedService.tracking && selectedService.tracking.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>TRACKING STAGES</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedService.tracking.map((stage, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 32px' }}>
              <button onClick={() => setSelectedService(null)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: COMING SOON / LOADING
════════════════════════════════════════════════════════════════ */
function ComingSoonTab({ title = 'Module Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid rgba(34, 197, 94, 0.1)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }}></div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '13px' }}>This feature is currently under development.</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: MY ACADEMY
════════════════════════════════════════════════════════════════ */
function AcademyTab() {
  const EVENTS = [
    { title: 'Platform Training: Navigation & Onboarding', time: '5:00 PM | Saturday | Zoom', bg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', emoji: '🎓' },
    { title: 'Complete SIF Exam Training - 4 Days', time: '16th Mar | 7:00 PM | Zoom', bg: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', emoji: '📚' },
    { title: 'Big Business Opportunity - Financial Product Distribution', time: 'Every Tue & Fri | 6:00 PM | Zoom', bg: 'linear-gradient(135deg, #fb923c, #ef4444)', emoji: '🚀' },
  ];

  const CR_CLUB = [
    { title: 'Inside ₹100 Cr+ AUM Management', dur: '45 min' },
    { title: 'Exponential Growth Strategies', dur: '38 min' },
    { title: 'Client Acquisition Masterclass', dur: '52 min' },
  ];

  const MASTERCLASS = [
    { title: 'Compliance 101 for Partners', dur: '30 min' },
    { title: 'Tax Optimization Strategies', dur: '42 min' },
  ];

  const VideoCard = ({ title, dur }) => (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(34, 197, 94,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <div style={{ height: '160px', background: 'rgba(34, 197, 94, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" color="#fff" style={{ marginLeft: '4px' }}>
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dur}</div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>My Academy</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Learning resources & training</p>
      </div>

      {/* Upcoming Events */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' }}>Upcoming Events</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {EVENTS.map((ev, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ height: '180px', background: ev.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>
                {ev.emoji}
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.4, minHeight: '40px' }}>{ev.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>{ev.time}</div>
                <button style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.5px' }}>REGISTER</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Playlists - 100 Cr Club */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Video Playlists</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>100 Cr Club</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {CR_CLUB.map((vid, i) => <VideoCard key={i} title={vid.title} dur={vid.dur} />)}
        </div>
      </div>

      {/* Video Playlists - Master Class */}
      <div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '24px' }}>Master Class</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {MASTERCLASS.map((vid, i) => <VideoCard key={i} title={vid.title} dur={vid.dur} />)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: CALCULATORS
════════════════════════════════════════════════════════════════ */
function CalculatorTab() {
  const [activeCalc, setActiveCalc] = useState(null);
  const [monthlyInvest, setMonthlyInvest] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const CALCULATORS = [
    { title: 'SIP & Step-Up SIP', desc: 'Invest monthly to grow your wealth steadily.', bg: 'rgba(34, 197, 94, 0.15)' },
    { title: 'Lumpsum', desc: 'Invest once, watch it grow over time.', bg: 'rgba(234, 179, 8, 0.15)' },
    { title: 'SWP', desc: 'Withdraw monthly to meet cash flow needs.', bg: 'rgba(168, 85, 247, 0.15)' },
    { title: 'SIP + SWP', desc: 'Invest regularly, withdraw smartly.', bg: 'rgba(236, 72, 153, 0.15)' },
    { title: 'Goal Planning', desc: 'Plan and invest to achieve financial goals.', bg: 'rgba(239, 68, 68, 0.15)' },
  ];

  const n = timePeriod * 12;
  const r = expectedReturn / 12 / 100;
  const invested = monthlyInvest * n;
  
  let fv = 0;
  if (r > 0) {
    fv = monthlyInvest * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  } else {
    fv = invested;
  }
  
  const estReturns = fv - invested;
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (activeCalc) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Calculators</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Financial planning tools</p>
        </div>
        
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', gap: '40px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{activeCalc === 'SIP & Step-Up SIP' ? 'SIP Calculator' : `${activeCalc} Calculator`}</h3>
              <button onClick={() => setActiveCalc(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                &larr; Back
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Monthly Investment (₹)</label>
                <input type="number" value={monthlyInvest} onChange={e => setMonthlyInvest(Number(e.target.value))} style={{ width: '100%', background: '#050B14', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Expected Return (% p.a.)</label>
                <input type="number" value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))} style={{ width: '100%', background: '#050B14', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Time Period (Years)</label>
                <input type="number" value={timePeriod} onChange={e => setTimePeriod(Number(e.target.value))} style={{ width: '100%', background: '#050B14', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
          </div>
          
          <div style={{ width: '380px', background: '#050B14', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>Results</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>Invested</span>
              <span style={{ fontSize: '14px', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(invested)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>Est. Returns</span>
              <span style={{ fontSize: '14px', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(estReturns)}</span>
            </div>
            
            <div style={{ height: '1px', background: 'var(--border)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 800 }}>Total Value</span>
              <span style={{ fontSize: '18px', color: '#22c55e', fontWeight: 800 }}>{formatCurrency(fv)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Calculators</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Financial planning tools</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {CALCULATORS.map((calc, i) => (
          <div key={i} onClick={() => setActiveCalc(calc.title)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px 24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(34, 197, 94,0.5)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: calc.bg, zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex' }}>
                {i === 0 && <TrendingUp size={22} color="#93c5fd" />}
                {i === 1 && <Briefcase size={22} color="#fde047" />}
                {i === 2 && <Home size={22} color="#d8b4fe" />}
                {i === 3 && <BarChart3 size={22} color="#f9a8d4" />}
                {i === 4 && <Target size={22} color="#fca5a5" />}
              </div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>{calc.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{calc.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: DOCUMENTS
════════════════════════════════════════════════════════════════ */
function DocumentTab() {
  const AGREEMENTS = [
    { title: 'NDA', desc: 'Protect confidential info' },
    { title: 'Master Service Agreement', desc: 'Flexible contract for services' },
    { title: 'Franchise Agreement', desc: 'Formalize a franchise' },
  ];

  const FOLDERS = [
    { title: 'RM Legal Docs' },
    { title: 'My Documents' },
    { title: 'Legal Documents', active: true },
  ];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Documents</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your compliance documents, bills, and legal files</p>
      </div>

      {/* Promo Banner */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px 32px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <FileText size={16} color="#94a3b8" />
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Need a legal agreement?</span> Protect your business with our expert-drafted contracts
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
          {AGREEMENTS.map((agr, i) => (
            <div key={i} style={{ flexShrink: 0, width: '280px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{agr.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{agr.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        <button style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #22c55e', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '0 0 12px 0', cursor: 'pointer' }}>
          Documents
        </button>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, padding: '0 0 12px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Legal doc generator
          <span style={{ background: '#22c55e', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>NEW</span>
        </button>
      </div>

      {/* Folders Section */}
      <div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Select a folder to view your compliance documents, bills, and related files</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {FOLDERS.map((f, i) => (
            <div key={i} style={{ background: 'var(--card)', border: `1px solid ${f.active ? '#22c55e' : 'var(--border)'}`, borderRadius: '16px', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ color: '#22c55e', marginBottom: '16px' }}>
                <Folder size={48} strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{f.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: CALENDAR
════════════════════════════════════════════════════════════════ */
function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(2); // March
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState(15);

  const [deadlines, setDeadlines] = useState([
    { date: '2026-03-07', type: 'M', title: '24Q TDS Challan Payment', sub: 'asup - Goa', status: 'needs_action' },
    { date: '2026-03-11', type: 'M', title: 'GSTR-1 Filing - February', sub: 'asup - Goa', status: 'needs_action' },
    { date: '2026-03-15', type: 'M', title: 'PF Return Filings', sub: 'asup - Goa', status: 'needs_action' },
    { date: '2026-03-15', type: 'M', title: 'ESI Filings', sub: 'asup - Goa', status: 'needs_action' },
    { date: '2026-03-20', type: 'M', title: 'GSTR-3B Filing', sub: 'asup - Goa', status: 'needs_action' },
    { date: '2026-03-31', type: 'M', title: 'Annual Returns Filing', sub: 'asup - Goa', status: 'needs_action' },
  ]);

  const [activeLeftTab, setActiveLeftTab] = useState('needs_action');

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } 
    else { setCurrentMonth(currentMonth - 1); }
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } 
    else { setCurrentMonth(currentMonth + 1); }
    setSelectedDate(1);
  };

  const currentMonthDeadlines = deadlines.filter(d => {
    const [y, m] = d.date.split('-');
    return parseInt(y) === currentYear && parseInt(m) === currentMonth + 1;
  });

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const DATES = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  const EVENT_DATES = currentMonthDeadlines.map(d => parseInt(d.date.split('-')[2]));
  const displayedDeadlines = currentMonthDeadlines.filter(d => d.status === activeLeftTab);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Calendar</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Compliance deadlines & schedules</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Panel - Tasks */}
        <div style={{ width: '380px', flexShrink: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: '700px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button onClick={() => setActiveLeftTab('needs_action')} style={{ flex: 1, padding: '10px 12px', background: activeLeftTab === 'needs_action' ? '#22c55e' : 'rgba(255,255,255,0.03)', color: activeLeftTab === 'needs_action' ? '#fff' : 'var(--text-muted)', border: activeLeftTab === 'needs_action' ? 'none' : '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: activeLeftTab === 'needs_action' ? 700 : 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              Needs action
              <span style={{ fontSize: '11px', fontWeight: activeLeftTab === 'needs_action' ? 600 : 500 }}>{currentMonthDeadlines.filter(d => d.status === 'needs_action').length}</span>
            </button>
            <button onClick={() => setActiveLeftTab('pending')} style={{ flex: 1, padding: '10px 12px', background: activeLeftTab === 'pending' ? '#22c55e' : 'rgba(255,255,255,0.03)', color: activeLeftTab === 'pending' ? '#fff' : 'var(--text-muted)', border: activeLeftTab === 'pending' ? 'none' : '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: activeLeftTab === 'pending' ? 700 : 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              Pending
              <span style={{ fontSize: '11px', fontWeight: activeLeftTab === 'pending' ? 600 : 500 }}>{currentMonthDeadlines.filter(d => d.status === 'pending').length}</span>
            </button>
            <button onClick={() => setActiveLeftTab('upcoming')} style={{ flex: 1, padding: '10px 12px', background: activeLeftTab === 'upcoming' ? '#22c55e' : 'rgba(255,255,255,0.03)', color: activeLeftTab === 'upcoming' ? '#fff' : 'var(--text-muted)', border: activeLeftTab === 'upcoming' ? 'none' : '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: activeLeftTab === 'upcoming' ? 700 : 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              Upcoming
              <span style={{ fontSize: '11px', fontWeight: activeLeftTab === 'upcoming' ? 600 : 500 }}>{currentMonthDeadlines.filter(d => d.status === 'upcoming').length}</span>
            </button>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            {displayedDeadlines.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No deadlines in this category.</div>
            ) : displayedDeadlines.map((d, i) => {
              const isEventDay = parseInt(d.date.split('-')[2]) === selectedDate;
              return (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: `3px solid ${isEventDay ? '#ea580c' : '#22c55e'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s', boxShadow: isEventDay ? '0 4px 12px rgba(0,0,0,0.2)' : 'none' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34, 197, 94,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor = isEventDay ? '#ea580c' : 'var(--border)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>Last date: {d.date}</span>
                    <span style={{ background: '#ea580c', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{d.type}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', lineHeight: 1.3 }}>{d.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Calendar Grid */}
        <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePrevMonth} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronRight size={16} />
              </button>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{monthNames[currentMonth]} {currentYear}</div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px' }}>
            {/* Days Header */}
            {DAYS.map(day => (
              <div key={day} style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', paddingBottom: '20px' }}>
                {day}
              </div>
            ))}
            
            {/* Empty Slots */}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Dates */}
            {DATES.map(date => {
              const isSelected = date === selectedDate;
              const hasEvent = EVENT_DATES.includes(date);
              
              return (
                <div key={date} onClick={() => setSelectedDate(date)} style={{ 
                  aspectRatio: '1.2', 
                  borderRadius: '12px',
                  background: isSelected ? '#22c55e' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--text)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                >
                  {date}
                  {hasEvent && (
                    <div style={{ position: 'absolute', bottom: '16px', width: '4px', height: '4px', borderRadius: '50%', background: '#ea580c' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: TASK MANAGER
════════════════════════════════════════════════════════════════ */
function TaskTab() {
  const [kanban, setKanban] = useState([
    {
      title: 'To Do',
      count: 4,
      color: '#0ea5e9', // Blue
      tasks: [
        { title: 'Review Priya equity docs', priority: 'High', init: 'RS', name: 'Ravi S.' },
        { title: 'Follow up Amit loan', priority: 'Medium', init: 'AD', name: 'Anjali D.' },
        { title: 'Submit PM Kisan enrollment', priority: 'High', init: 'RK', name: 'Rahul K.' },
        { title: 'Generate invoices Q1', priority: 'Low', init: 'MS', name: 'Meera S.' },
      ]
    },
    {
      title: 'In Progress',
      count: 3,
      color: '#8b5cf6', // Purple
      tasks: [
        { title: 'Team standup prep', priority: 'Medium', init: 'VJ', name: 'Vikram J.' },
        { title: 'Update client KYC records', priority: 'High', init: 'PM', name: 'Priya M.' },
        { title: 'Send commission report', priority: 'Low', init: 'DV', name: 'Deepak V.' },
      ]
    },
    {
      title: 'Review',
      count: 2,
      color: '#eab308', // Yellow
      tasks: [
        { title: 'Review agreements', priority: 'Medium', init: 'NG', name: 'Neha G.' },
        { title: 'Call new leads', priority: 'High', init: 'AP', name: 'Amit P.' },
      ]
    },
    {
      title: 'Done',
      count: 2,
      color: '#22c55e', // Green
      tasks: [
        { title: 'Quarterly report done', priority: 'Low', init: 'SK', name: 'Suresh K.' },
        { title: 'CRM pipeline updated', priority: 'Medium', init: 'KR', name: 'Kavya R.' },
      ]
    }
  ]);

  const getPriorityColor = (p) => {
    if (p === 'High') return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    if (p === 'Medium') return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
  };

  const getAvatarColor = (init) => {
    const sum = init.charCodeAt(0) + (init.charCodeAt(1) || 0);
    const colors = ['#22c55e', '#f97316', '#22c55e', '#06b6d4', '#d946ef'];
    return colors[sum % colors.length];
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Task Manager</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Kanban board — drag tasks between columns</p>
        </div>
        <button onClick={() => {
          const title = window.prompt("Task title:");
          if (title) {
            setKanban(prev => {
              const updated = [...prev];
              updated[0] = { ...updated[0], tasks: [{ title, priority: 'High', init: 'ME', name: 'You' }, ...updated[0].tasks] };
              updated[0].count = updated[0].tasks.length;
              return updated;
            });
          }
        }} style={{ padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', minHeight: '600px', alignItems: 'flex-start' }}>
        {kanban.map(col => (
          <div key={col.title} style={{ width: '320px', flexShrink: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: col.color }}>{col.title}</div>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text)' }}>
                {col.count}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {col.tasks.map((task, i) => {
                const pColor = getPriorityColor(task.priority);
                const aColor = getAvatarColor(task.init);
                return (
                  <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', cursor: 'grab', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px', lineHeight: 1.4 }}>{task.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', background: pColor.bg, color: pColor.color, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>
                        {task.priority}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: aColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff' }}>
                          {task.init}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.name}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: STORE
════════════════════════════════════════════════════════════════ */
function StoreTab() {
  const [activeCategory, setActiveCategory] = useState('Home');
  const PORTFOLIOS = [
    { id: 1, title: 'Aggressive Mutual Fund Basket', badge: 'Top Choice for SIP', risk: 'High', duration: '5+ Years', return: 'High', iconBg: '#fecaca', iconColor: '#ef4444' },
    { id: 2, title: 'Moderate Mutual Fund Basket', badge: null, risk: 'Moderately High', duration: '5+ Years', return: 'Moderately High', iconBg: '#fef08a', iconColor: '#eab308', active: true },
    { id: 3, title: 'Conservative Mutual Fund Basket', badge: null, risk: 'Moderate', duration: '3+ Years', return: 'Moderate', iconBg: '#bbf7d0', iconColor: '#22c55e' },
  ];

  const PRODUCTS = [
    { id: 1, title: 'ShriRam Finance Fixed Deposit', sub: 'Earn up to 9.40% p.a. with minimum ₹5,000 inv...', avatar: 'SF', bg: '#fef08a', color: '#854d0e' },
    { id: 2, title: 'Bajaj Finance Fixed Deposit', sub: 'Earn up to 8.85% p.a. with minimum ₹15,000 in...', avatar: 'BF', bg: '#e0f2fe', color: '#0369a1' },
    { id: 3, title: 'Term Life Insurance', sub: 'Coverage from ₹1 Cr with affordable premiums ...', avatar: 'TL', bg: '#f3e8ff', color: '#7e22ce' },
  ];

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Search Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))', borderRadius: '24px', padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '150px', height: '150px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '250px', height: '250px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '50%' }}></div>
        
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '24px', position: 'relative', zIndex: 1 }}>Zolvit Store</h2>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '600px', position: 'relative', zIndex: 1 }}>
          <Search size={18} color="rgba(255,255,255,0.4)" />
          <input placeholder="Search products, mutual funds, insurance..." style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '15px' }} />
        </div>
      </div>

      {/* Navigation Pills */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '32px' }}>
        <button onClick={() => setActiveCategory('Home')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: activeCategory === 'Home' ? 'rgba(34, 197, 94, 0.1)' : 'transparent', border: `1px solid ${activeCategory === 'Home' ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, borderRadius: '24px', color: activeCategory === 'Home' ? '#4ade80' : 'var(--text-muted)', fontSize: '13px', fontWeight: activeCategory === 'Home' ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <Home size={16} /> Home
        </button>
        {['Mutual Funds', 'Insurance', 'Pre IPOs', 'Debentures', 'PMS', 'Fixed Deposits', 'Demat', 'SIF'].map((tab, i) => {
          const isActive = activeCategory === tab;
          return (
            <button key={i} onClick={() => setActiveCategory(tab)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent', border: `1px solid ${isActive ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, borderRadius: '24px', color: isActive ? '#4ade80' : 'var(--text-muted)', fontSize: '13px', fontWeight: isActive ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {tab === 'Mutual Funds' ? <TrendingUp size={14} /> : tab === 'Insurance' ? <Shield size={14} /> : tab === 'Pre IPOs' ? <BarChart3 size={14} /> : tab === 'Debentures' ? <Briefcase size={14} /> : tab === 'PMS' ? <CheckCircle2 size={14} /> : tab === 'Fixed Deposits' ? <Layout size={14} /> : tab === 'Demat' ? <FileText size={14} /> : <CheckSquare size={14} />} {tab}
            </button>
          );
        })}
      </div>

      {activeCategory === 'Home' ? (
        <>

      {/* Portfolios Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Zolvit Portfolios</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Expert-curated investment portfolios</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {PORTFOLIOS.map(port => (
            <div key={port.id} style={{ background: 'var(--card)', border: `1px solid ${port.active ? '#22c55e' : 'var(--border)'}`, borderRadius: '16px', padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: port.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: port.iconColor, flexShrink: 0 }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', lineHeight: 1.3 }}>{port.title}</div>
                  {port.badge && <span style={{ display: 'inline-block', background: '#fff', color: '#1e3a8a', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}>{port.badge}</span>}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Risk</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>{port.risk}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Duration</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>{port.duration}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Return</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>{port.return}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Products */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Popular Products</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Top products from Zolvit Store</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {PRODUCTS.map(prod => (
            <div key={prod.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: prod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: prod.color, fontSize: '16px', fontWeight: 800, flexShrink: 0 }}>
                {prod.avatar}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', lineHeight: 1.3 }}>{prod.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{prod.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📦</div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>{activeCategory} Catalog</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>We are currently curating the best {activeCategory.toLowerCase()} for you and your clients.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: MY EMPLOYEES
════════════════════════════════════════════════════════════════ */
const MOCK_EMPLOYEES = [
  { id: 'EMP-100', name: 'Priya Mehta', email: 'priyamehta@company.com', role: 'Operations Mgr', dept: 'Support', status: 'Active', joined: '11 Feb 2026' },
  { id: 'EMP-101', name: 'Amit Patel', email: 'amitpatel@company.com', role: 'Service Exec', dept: 'Sales', status: 'On Leave', joined: '1 Nov 2026' },
  { id: 'EMP-102', name: 'Suresh Kumar', email: 'sureshkumar@company.com', role: 'Accounts Exec', dept: 'Operations', status: 'Active', joined: '1 Jul 2026' },
  { id: 'EMP-103', name: 'Neha Gupta', email: 'nehagupta@company.com', role: 'Client Relations', dept: 'Support', status: 'On Leave', joined: '17 Aug 2026' },
];

function AddEmployeeModal({ onClose, onAdd, clients = [] }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Operations Mgr', department: 'Operations', aadhar: '', parent_id: '' });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    
    try {
      const res = await api.post('/users', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: 'Password123!',
        role: 'employee',
        department: form.department,
        designation: form.role,
        parent_id: form.parent_id || undefined
      });

      if (res.status === 201 || res.status === 200) {
        onAdd(); // Refresh list from server
        onClose();
      } else {
        alert('Failed to add employee');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error while adding employee');
    }
  };

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640, background: 'var(--card)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="modal-header" style={{ flexShrink: 0, borderBottom: 'none', padding: '24px 32px 16px' }}>
          <div className="modal-title" style={{ fontSize: '20px', fontWeight: 800 }}>Add New Employee</div>
          <button className="modal-close" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="modal-body" style={{ overflowY: 'auto', padding: '16px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>FULL NAME <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="Enter full name" value={form.name} onChange={set('name')} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>EMAIL <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="email" className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="employee@company.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>PHONE <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>ROLE</label>
                <select className="form-select" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px', color: 'var(--text)' }} value={form.role} onChange={set('role')}>
                  <option value="Operations Mgr">Operations Mgr</option>
                  <option value="Service Exec">Service Exec</option>
                  <option value="Accounts Exec">Accounts Exec</option>
                  <option value="Client Relations">Client Relations</option>
                  <option value="Field Agent">Field Agent</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>DEPARTMENT</label>
                <select className="form-select" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px', color: 'var(--text)' }} value={form.department} onChange={set('department')}>
                  <option value="Operations">Operations</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Support">Support</option>
                  <option value="Sales">Sales</option>
                  <option value="Legal">Legal</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>AADHAR NUMBER</label>
                <input className="form-input" style={{ background: '#050B14', border: 'none', borderRadius: '10px', padding: '14px 16px' }} placeholder="XXXX XXXX XXXX" value={form.aadhar} onChange={set('aadhar')} />
              </div>
            </div>

          </div>
          
          <div className="modal-footer" style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 32px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '12px 24px', background: '#22c55e', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)' }}>Submit for Approval</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeesTab({ clients = [] }) {
  const [filterStatus, setFilterStatus] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [employees, setEmployees] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [hoveredRow, setHoveredRow] = React.useState(null);
  const [selectedEmp, setSelectedEmp] = React.useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users');
      const data = res.data;
      const emps = data.filter(u => u.role === 'employee');
      
      const formatted = emps.map((emp, i) => ({
        id: emp.id || `EMP-${Math.floor(100 + i)}`,
        dbId: emp._id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone || '—',
        role: emp.designation || emp.role || 'Employee',
        status: emp.is_active !== false ? 'Active' : 'On Leave',
        joined: new Date(emp.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        clientName: emp.clientName || '',
        department: emp.department || '—',
        specialization: emp.specialization || '—',
        skills: emp.skills || ''
      }));
      
      setEmployees(formatted.length > 0 ? formatted : MOCK_EMPLOYEES);
    } catch (err) {
      console.error(err);
      setEmployees(MOCK_EMPLOYEES);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchesSearch = e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.phone.includes(q);
    const matchesFilter = filterStatus === 'All' || e.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>My Employees</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage your team members and their roles</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#22c55e', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { title: 'Total Employees', value: employees.length, icon: Users, color: '#22c55e', bg: 'rgba(34, 197, 94,0.1)' },
          { title: 'Active', value: employees.filter(e => e.status === 'Active').length, icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { title: 'Pending Onboarding', value: employees.filter(e => e.status === 'Pending').length, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { title: 'On Leave', value: employees.filter(e => e.status === 'On Leave').length, icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', transition: '0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(34, 197, 94,0.5)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.title}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', display: 'flex', gap: '24px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 1, maxWidth: '300px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', width: '100%', outline: 'none', fontSize: '13px' }} />
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
            {['All', 'Active', 'Pending', 'On Leave'].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)} style={{ padding: '8px 16px', background: filterStatus === f ? 'rgba(34, 197, 94,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: filterStatus === f ? '#fff' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>EMPLOYEE ID</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>EMPLOYEE</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>ROLE</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>CONTACT</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>JOINED</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>No employees found.</td></tr>
            ) : filtered.map((emp) => (
              <tr 
                key={emp.id} 
                onMouseEnter={() => setHoveredRow(emp.id)} 
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => setSelectedEmp(emp)}
                style={{ 
                  borderBottom: '1px solid var(--border)', 
                  background: hoveredRow === emp.id ? 'rgba(255,255,255,0.03)' : 'transparent', 
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', background: 'rgba(34, 197, 94,0.1)', padding: '4px 8px', borderRadius: '4px' }}>{emp.id}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800 }}>
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{emp.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {emp.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text)' }}>{emp.role}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text)' }}>{emp.phone}</td>
                <td style={{ padding: '16px 24px' }}>
                  <StatusBadge status={emp.status} />
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{emp.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddEmployeeModal clients={clients} onClose={() => setShowModal(false)} onAdd={fetchEmployees} />
      )}

      {selectedEmp && (
        <div className="modal-overlay open" onClick={() => setSelectedEmp(null)}>
          <div className="modal" style={{ maxWidth: 520, background: 'var(--card)', border: '1px solid rgba(255,255,255,0.05)', animation: 'scaleIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', padding: '24px 32px 16px' }}>
              <div className="modal-title" style={{ fontSize: '20px', fontWeight: 800 }}>Employee Details</div>
              <button className="modal-close" onClick={() => setSelectedEmp(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '16px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Profile Header Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #15803d, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 800 }}>
                  {selectedEmp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>{selectedEmp.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedEmp.email}</div>
                </div>
              </div>

              {/* Grid Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  ['Employee ID', selectedEmp.id],
                  ['Access Role', selectedEmp.role],
                  ['Department', selectedEmp.department],
                  ['Contact Phone', selectedEmp.phone],
                  ['Specialization', selectedEmp.specialization],
                  ['Date Joined', selectedEmp.joined],
                  ['Status', selectedEmp.status]
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifycontent: 'space-between', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: '13px', color: label === 'Status' ? (value === 'Active' ? '#22c55e' : '#f59e0b') : 'var(--text)', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Skills Tags */}
              {selectedEmp.skills && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>SKILLS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedEmp.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                      <span key={skill} style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 32px' }}>
              <button onClick={() => setSelectedEmp(null)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%' }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   TAB: MY TICKETS
════════════════════════════════════════════════════════════════ */
const STATUS_FILTERS_TICKET = ['All', 'Active', 'In Process', 'Completed'];

function TicketsTab({ tickets: initialTickets = [], clients = [], onNavigate }) {
  const [hoveredRow, setHoveredRow] = React.useState(null);
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
        progress: t.progress || 0,
        created: new Date(t.createdAt).toLocaleDateString('en-GB'),
        lastUpdate: 'Recently updated',
        rawTicket: t
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Activity Log</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All service tickets and investments</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="topbar-btn secondary" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card)' }}>
            <Download size={16} /> Export
          </button>
          <button className="topbar-btn" style={{ background: '#22c55e', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate ? onNavigate('tickets') : setShowModal(true)}>
            <Plus size={16} /> New Ticket
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <FileText size={20} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: '#fff', padding: '4px 8px', borderRadius: '20px' }}>+12%</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', lineHeight: 1 }}>{tickets.length > 0 ? tickets.length : 15}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Tickets</div>
        </div>
        
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Activity size={20} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: '#fff', padding: '4px 8px', borderRadius: '20px' }}>+8%</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', lineHeight: 1 }}>{ticketCounts['Active'] || 5}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active</div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', background: '#fff', padding: '4px 8px', borderRadius: '20px' }}>-3%</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', lineHeight: 1 }}>{ticketCounts['In Process'] || 5}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pending</div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <CheckCircle2 size={20} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: '#fff', padding: '4px 8px', borderRadius: '20px' }}>+5%</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', lineHeight: 1 }}>{ticketCounts['Completed'] || 3}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Completed</div>
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
          <button style={{ padding: '20px 0', background: 'transparent', border: 'none', borderBottom: '2px solid #22c55e', color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Home size={16} /> All <span style={{ background: 'rgba(34, 197, 94,0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{tickets.length}</span>
          </button>
          <button style={{ padding: '20px 0', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Clock size={16} /> Service Hub <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{tickets.length}</span>
          </button>
          <button style={{ padding: '20px 0', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <ShoppingBag size={16} /> Store <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>0</span>
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search ticket, client, service..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', width: '100%', outline: 'none', fontSize: '13px' }} />
          </div>
          <button style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 24px', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            All
          </button>
        </div>

        <div style={{ padding: '0 24px', display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)' }}>
          {STATUS_FILTERS_TICKET.map(s => {
             const isActive = filterStatus === s;
             return (
               <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '16px 0', background: 'transparent', border: 'none', borderBottom: isActive ? '2px solid #22c55e' : '2px solid transparent', color: isActive ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: isActive ? 700 : 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                 {s} <span style={{ background: isActive ? 'rgba(34, 197, 94,0.2)' : 'rgba(255,255,255,0.05)', color: isActive ? '#4ade80' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{ticketCounts[s] || 0}</span>
               </button>
             );
          })}
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TICKET ID</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CLIENT</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SERVICE</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STATUS</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CREATED BY</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DATE</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>LAST ACTIVITY</th>
              <th style={{ padding: '16px 24px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>
                  No tickets found. <span style={{ color: '#22c55e', cursor: 'pointer' }} onClick={() => setShowModal(true)}>Create one</span>
                </td>
              </tr>
            ) : filtered.map((ticket) => {
              const isHovered = hoveredRow === ticket.id;
              return (
                <tr 
                  key={ticket.id} 
                  onMouseEnter={() => setHoveredRow(ticket.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ 
                    borderBottom: '1px solid var(--border)', 
                    background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent', 
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>#{ticket.id}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar name={ticket.client} size={36} gradient={ticket.status === 'Active' ? ['#22c55e', '#16a34a'] : ['#22c55e', '#16a34a']} fontSize={13} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{ticket.client}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ticket.client.toLowerCase().replace(' ','')}@email.com</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{ticket.service}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ticket.vertical === 'service' ? 'Licenses & Registrations' : 'New Business / Closure'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: ticket.status === 'Active' ? 'rgba(34, 197, 94,0.1)' : 'rgba(254, 243, 199, 0.1)', color: ticket.status === 'Active' ? '#22c55e' : '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ticket.status === 'Active' ? '#22c55e' : '#f59e0b' }} />
                      {ticket.status === 'In Process' ? 'Pending' : ticket.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      Partner
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{ticket.created}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>10:34 AM</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{ticket.lastUpdate}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2:15 PM</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
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
  const total = tickets.length || 0;
  
  const funnelData = [
    { label: 'New',            val: leads.filter(l => l.status === 'new' || !l.status).length, color: '#22c55e' },
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
        <StatCard label="Total Leads"       value={MOCK_LEADS.length}   icon={<Target size={18} />}        trend="↑ 3 this month"       color="#22c55e" delay={0.05} />
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
  { id: 'overview',   label: 'Home',         icon: Home,          section: 'DASHBOARD', badge: 5 },
  { id: 'leads',      label: 'Lead Centre',  icon: Layout,        section: 'DASHBOARD' },
  { id: 'activity',   label: 'Activity Log', icon: Activity,      section: 'DASHBOARD' },

  { id: 'clients',    label: 'My Client',    icon: Users,         section: 'PEOPLE',    badge: stats?.clients !== undefined ? stats.clients : 0 },
  { id: 'employees',  label: 'My Employee',  icon: UserPlus,      section: 'PEOPLE',    badge: stats?.employees !== undefined ? stats.employees : 0 },

  { id: 'tickets',    label: 'Service Hub',  icon: Settings,      section: 'OPERATIONS', badge: 5 },
  { id: 'store',      label: 'Store',        icon: ShoppingBag,   section: 'OPERATIONS' },

  { id: 'task',       label: 'Task',         icon: CheckSquare,   section: 'APPS & TOOLS', badge: 8 },
  { id: 'calendar',   label: 'Calendar',     icon: Calendar,      section: 'APPS & TOOLS' },
  { id: 'document',   label: 'Document',     icon: FileText,      section: 'APPS & TOOLS' },
  { id: 'automation', label: 'Automation',   icon: GitMerge,      section: 'APPS & TOOLS', badge: 'Soon', badgeColor: '#facc15', badgeBg: 'rgba(250, 204, 21, 0.15)' },
  { id: 'calculator', label: 'Calculator',   icon: Calculator,    section: 'APPS & TOOLS' },

  { id: 'poster',     label: 'Poster',       icon: Monitor,       section: 'RESOURCE' },
  { id: 'academy',    label: 'My Academy',   icon: BookOpen,      section: 'RESOURCE' },
  { id: 'product',    label: 'Product Deck', icon: Box,           section: 'RESOURCE' },
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
      <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #22c55e, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}>
            <Scale size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: 'var(--text)', fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>RM <span style={{color: '#22c55e'}}>LEGAL</span></div>
          </div>
        </div>
      </div>

      {/* Promo Card */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(34, 197, 94, 0.25)' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShoppingBag size={18} color="#fff" />
          </div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>My Claim Store</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: 1.4, marginBottom: '16px' }}>Explore our diverse range of legal products</div>
          <button style={{ width: '100%', padding: '10px', background: '#fff', color: '#15803d', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            Explore Store <ArrowRight size={14} />
          </button>
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
                    {item.badge !== undefined && (
                      <span className="badge" style={{ fontSize: '10px', fontWeight: 700, background: item.badgeBg || (isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.8)'), color: item.badgeColor || (isActive ? '#22c55e' : '#fff'), border: 'none', padding: '3px 8px', borderRadius: '12px', minWidth: '24px', textAlign: 'center' }}>
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
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '80px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 50, backdropFilter: 'blur(12px)', boxSizing: 'border-box', gap: '16px', flexShrink: 0 }}>
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
              {user?.name ? (user.name.toLowerCase().includes('partner') ? user.name : user.name.split(' ')[0]) : 'Partner'}
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
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
          >
            <div className={showNotifications ? "" : "bell-animate"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#15803d', border: '2px solid var(--card)', animation: 'ringPulse 2s infinite' }} />
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="animate-slide-up" style={{ 
              position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '320px', 
              background: '#0f172a', border: '1px solid var(--border)', borderRadius: '16px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34, 197, 94, 0.05)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>Notifications</div>
                <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700, cursor: 'pointer' }}>Mark all as read</div>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {[
                  { title: 'New Ticket Assigned', desc: 'Ticket TK-501 has been assigned to you.', time: '10 min ago', unread: true },
                  { title: 'Lead Converted', desc: 'Ramesh Agarwal has successfully enrolled.', time: '1 hr ago', unread: true },
                  { title: 'System Update', desc: 'The new dashboard layout is now active.', time: '2 hrs ago', unread: false },
                ].map((notif, i) => (
                  <div key={i} style={{ 
                    padding: '16px 20px', 
                    borderBottom: '1px solid var(--border)', 
                    background: notif.unread ? 'rgba(34, 197, 94, 0.02)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', gap: '12px', alignItems: 'flex-start'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.unread ? '#22c55e' : 'transparent', marginTop: '6px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{notif.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', lineHeight: 1.4 }}>{notif.desc}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{notif.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#22c55e', fontWeight: 700, cursor: 'pointer', borderTop: '1px solid var(--border)' }}>
                View all notifications
              </div>
            </div>
          )}
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
  const [selectedClientId, setSelectedClientId] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dbData, setDbData] = useState({
    leads: [],
    clients: [],
    employees: [],
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
        const myClients = usersRes.data.filter(u => u.role === 'client');
        const myEmployees = usersRes.data.filter(u => u.role === 'employee');
        const myTickets = ticketsRes.data; // Filtered by backend already based on role logic updated

        setDbData({
          leads: myLeads,
          clients: myClients,
          employees: myEmployees,
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
    employees: dbData.employees.length,
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
      case 'clients':   return <ClientsTab onNavigateToClient={(id) => { setSelectedClientId(id); setPage('client_profile'); }} />;
      case 'client_profile': return <ClientProfile idProp={selectedClientId} onClose={() => setPage('clients')} />;
      case 'employees': return <EmployeesTab clients={dbData.clients} />;
      case 'store':     return <StoreTab />;
      case 'task':      return <TaskTab />;
      case 'calendar':  return <CalendarTab />;
      case 'document':  return <DocumentTab />;
      case 'calculator':return <CalculatorTab />;
      case 'academy':   return <AcademyTab />;
      case 'automation':return <ComingSoonTab title="Automation Engine Loading..." />;
      case 'poster':    return <ComingSoonTab title="Poster Generator Loading..." />;
      case 'product':   return <ComingSoonTab title="Product Deck Loading..." />;
      case 'activity':
        return <TicketsTab 
          tickets={dbData.tickets} 
          clients={dbData.clients}
          onNavigate={setPage}
        />;
      case 'tickets':   return <ServiceHubTab />;
      case 'analytics': return <AnalyticsTab leads={dbData.leads} tickets={dbData.tickets} />;
      default:          return <OverviewTab onNavigate={setPage} stats={dashboardStats} recentLeads={recentLeadsFormatted} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wave { 0%, 100%, 60% { transform: rotate(0deg) } 10%, 30% { transform: rotate(14deg) } 20% { transform: rotate(-8deg) } 40% { transform: rotate(-4deg) } 50% { transform: rotate(10deg) } }
        @keyframes particleFloat { 0%{transform:translateY(100vh) rotate(0deg);opacity:0.6} 50%{opacity:0.2} 100%{transform:translateY(-120px) rotate(180deg);opacity:0} }
        @keyframes bellRing { 0%, 100% { transform: rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: rotate(15deg); } 20%, 40%, 60%, 80% { transform: rotate(-15deg); } }
        @keyframes ringPulse { 0% { box-shadow: 0 0 0 0 rgba(21,128,61, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(21,128,61, 0); } 100% { box-shadow: 0 0 0 0 rgba(21,128,61, 0); } }
        .animate-slide-up { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .wave { display: inline-block; animation: wave 2.5s infinite; transform-origin: 70% 70%; }
        .particle { position: absolute; border-radius: 50%; pointer-events: none; animation: particleFloat linear infinite; z-index: 0; }
        .bell-animate { animation: bellRing 3s ease-in-out infinite 2s; transform-origin: top center; }
        .bell-animate:hover { animation: bellRing 1s ease-in-out infinite; }
        .partner-page-wrap { position: relative; overflow: hidden; display: flex; flex: 1; z-index: 1; }
      `}</style>
      
      {/* Background Particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[
          { size: 6, color: 'rgba(34, 197, 94, 0.2)', x: '10%', delay: '0s', dur: '8s' },
          { size: 4, color: 'rgba(34, 197, 94, 0.15)', x: '25%', delay: '1.5s', dur: '10s' },
          { size: 8, color: 'rgba(124, 58, 237, 0.2)', x: '45%', delay: '3s', dur: '7s' },
          { size: 5, color: 'rgba(34, 197, 94, 0.25)', x: '65%', delay: '0.5s', dur: '9s' },
          { size: 3, color: 'rgba(245, 158, 11, 0.15)', x: '80%', delay: '2s', dur: '6s' },
          { size: 7, color: 'rgba(34, 197, 94, 0.2)', x: '90%', delay: '4s', dur: '11s' },
          { size: 9, color: 'rgba(16, 185, 129, 0.15)', x: '15%', delay: '5s', dur: '12s' },
          { size: 5, color: 'rgba(139, 92, 246, 0.2)', x: '55%', delay: '2.5s', dur: '8.5s' },
          { size: 12, color: 'rgba(34, 197, 94, 0.1)', x: '75%', delay: '1s', dur: '14s' }
        ].map((p, i) => (
          <div key={i} className="particle" style={{
            width: p.size * 6, height: p.size * 6, background: p.color,
            left: p.x, bottom: '-10%', animationDelay: p.delay, animationDuration: p.dur,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`
          }} />
        ))}
      </div>

      <div className="partner-page-wrap">
      {/* ← Dedicated Partner Sidebar (replaces shared Sidebar for this role) */}
      <PartnerSidebar activePage={page} setPage={setPage} user={user} onLogout={handleLogout} stats={dashboardStats} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <PartnerTopbar page={page} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'transparent' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            {renderPage()}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../hooks/useSocket';
import {
  Ticket, Search, RefreshCw, X, AlertTriangle,
  CheckCircle2, Loader2, Clock, Upload, MessageSquare, UserCheck,
  Eye, Paperclip, Send, Filter, RotateCcw
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

// ─── Vertical → Hub mapping ───────────────────────────────────────────────────
const DEPT_TO_HUB = {
  claim: 'Claim Hub',
  service: 'Service Hub',
  store: 'Store Hub',
  support: 'Support Hub',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:     { label: 'Active',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  in_process: { label: 'In Process',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: Loader2 },
  completed:  { label: 'Completed',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle2 },
  closed:     { label: 'Closed',      color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: X },
};

const PRIORITY_COLOR = {
  urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const Ic = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      <Ic size={11} strokeWidth={2.5} /> {cfg.label}
    </span>
  );
};

const PriBadge = ({ priority }) => (
  <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${PRIORITY_COLOR[priority] || '#3b82f6'}18`, color: PRIORITY_COLOR[priority] || '#3b82f6', textTransform: 'capitalize' }}>
    {priority}
  </span>
);

// ─── Kanban Column ────────────────────────────────────────────────────────────
const Column = ({ title, color, count, icon: Icon, tickets, onOpen }) => (
  <div style={{ flex: '1 1 0', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 0 }}>
    <div style={{ padding: '16px 20px', borderBottom: `2px solid ${color}`, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{count} ticket{count !== 1 ? 's' : ''}</div>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0', overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
      {tickets.length === 0
        ? <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 10, margin: '0 4px' }}>No tickets</div>
        : tickets.map(t => <TicketCard key={t._id} ticket={t} color={color} onOpen={onOpen} />)
      }
    </div>
  </div>
);

// ─── Ticket Card ──────────────────────────────────────────────────────────────
const TicketCard = ({ ticket: t, color, onOpen }) => (
  <div
    onClick={() => onOpen(t)}
    style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '16px', cursor: 'pointer', margin: '0 4px',
      transition: 'all 0.2s', borderLeft: `3px solid ${color}`,
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
      <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 5 }}>
        #{t.ticketNo || new Date(t.createdAt).getTime()}
      </span>
      <PriBadge priority={t.priority} />
    </div>
    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', marginBottom: 6, lineHeight: 1.35 }}>{t.service}</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
      {t.client?.name || 'Unknown Client'}
      {t.client?.companyName && <span style={{ marginLeft: 4, opacity: 0.6 }}>· {t.client.companyName}</span>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {t.assignedTo
          ? <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t.assignedTo.name}>
              {(t.assignedTo.name || '?').substring(0, 2).toUpperCase()}
            </div>
          : <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Unassigned</div>
        }
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, margin: '0 12px' }}>
        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ width: `${t.progress || 0}%`, height: '100%', background: color, borderRadius: 10 }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} /> {fmt(t.dueDate)}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminTicketManagement = () => {
  const { user: currentUser } = useAuth();
  const dept = (currentUser?.department || '').toLowerCase();
  const hubType = DEPT_TO_HUB[dept] || null;
  const fileInputRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvFilters, setShowAdvFilters] = useState(false);

  const [activePanel, setActivePanel] = useState(null); // selected ticket for side panel
  const [panelTab, setPanelTab] = useState('details'); // 'details' | 'notes' | 'files'
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [assigningEmp, setAssigningEmp] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sectionView, setSectionView] = useState('board'); // 'board' | 'list'

  const [ticketDocs, setTicketDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      const { data } = await api.get('/tickets');
      // Scope to admin's vertical. Super admins see all.
      const scoped = (currentUser?.role === 'admin' && hubType)
        ? data.filter(t => t.hubType === hubType)
        : data;
      setTickets(scoped);
    } catch (e) { console.error(e); }
  }, [currentUser, hubType]);

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      let emps = data.filter(u => u.role !== 'client');
      // Scope employees to admin's department too
      if (currentUser?.role === 'admin' && dept) {
        emps = emps.filter(u => (u.department || '').toLowerCase() === dept);
      }
      setEmployees(emps);
    } catch (e) { console.error(e); }
  }, [currentUser, dept]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTickets(), fetchEmployees()]);
      setLoading(false);
    };
    init();

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('ticket_created', () => fetchTickets());
    socket.on('ticket_updated', () => fetchTickets());

    return () => {
      socket.disconnect();
    };
  }, [fetchTickets, fetchEmployees]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (priorityFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (assignedFilter !== 'all') count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  }, [search, priorityFilter, statusFilter, assignedFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearch('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setAssignedFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = tickets;
    if (priorityFilter !== 'all') list = list.filter(t => t.priority === priorityFilter);
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
    if (assignedFilter === 'unassigned') list = list.filter(t => !t.assignedTo);
    else if (assignedFilter !== 'all') list = list.filter(t => String(t.assignedTo?._id || t.assignedTo) === String(assignedFilter));

    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter(t => new Date(t.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(t => new Date(t.createdAt) <= to);
    }

    const q = search.trim().toLowerCase();
    if (q) list = list.filter(t =>
      (t.service || '').toLowerCase().includes(q) ||
      (t.client?.name || '').toLowerCase().includes(q) ||
      (t.client?.companyName || '').toLowerCase().includes(q) ||
      (t.ticketNo || '').toLowerCase().includes(q) ||
      String(new Date(t.createdAt).getTime()).includes(q)
    );
    return list;
  }, [tickets, search, priorityFilter, statusFilter, assignedFilter, dateFrom, dateTo]);

  const byStatus = (status) => filtered.filter(t => t.status === status);
  const active = byStatus('active');
  const inProcess = byStatus('in_process');
  const completed = byStatus('completed');

  // ── Handlers ──────────────────────────────────────────────────────────────
  const fetchTicketDocs = async (ticketId) => {
    setLoadingDocs(true);
    try {
      const { data } = await api.get(`/documents?ticket_id=${ticketId}`);
      setTicketDocs(data);
    } catch (err) { console.error(err); }
    finally { setLoadingDocs(false); }
  };

  const openPanel = (ticket) => { 
    setActivePanel(ticket); 
    setPanelTab('details'); 
    setNote(''); 
    fetchTicketDocs(ticket._id);
  };
  const closePanel = () => setActivePanel(null);

  const handleStatusChange = async (newStatus) => {
    if (!activePanel || changingStatus) return;
    setChangingStatus(true);
    try {
      const { data } = await api.patch(`/tickets/${activePanel._id}/status`, { status: newStatus });
      setTickets(prev => prev.map(t => t._id === data._id ? { ...t, ...data } : t));
      setActivePanel(prev => ({ ...prev, status: data.status, progress: data.progress }));
    } catch (e) { alert(e.response?.data?.message || 'Failed to change status'); }
    finally { setChangingStatus(false); }
  };

  const handleProgressChange = async (newProgress) => {
    if (!activePanel) return;
    try {
      const { data } = await api.patch(`/tickets/${activePanel._id}/status`, { progress: newProgress });
      setTickets(prev => prev.map(t => t._id === data._id ? { ...t, progress: data.progress } : t));
      setActivePanel(prev => ({ ...prev, progress: data.progress }));
    } catch (e) { alert(e.response?.data?.message || 'Failed to update progress'); }
  };

  const handleAssign = async (empId) => {
    if (!activePanel || !empId) return;
    setAssigningEmp(empId);
    try {
      const { data } = await api.patch(`/tickets/${activePanel._id}/assign`, { userId: empId });
      await fetchTickets(); // refresh for populated assignedTo
      setActivePanel(prev => ({ ...prev, assignedTo: data.assignedTo }));
    } catch (e) { alert(e.response?.data?.message || 'Failed to assign'); }
    finally { setAssigningEmp(''); }
  };

  const handleAddNote = async () => {
    if (!note.trim() || !activePanel || addingNote) return;
    setAddingNote(true);
    try {
      await api.post(`/tickets/${activePanel._id}/comments`, { text: note });
      await fetchTickets();
      // Re-fetch full ticket to get new comment
      const { data } = await api.get('/tickets');
      const updated = data.find(t => t._id === activePanel._id);
      if (updated) setActivePanel(updated);
      setNote('');
    } catch (e) { alert(e.response?.data?.message || 'Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activePanel) return;
    setUploading(true);
    try {
      await Promise.all(Array.from(files).map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('linked_to', 'ticket');
        form.append('ticket_id', activePanel._id);
        if (activePanel.client?._id) form.append('client_id', activePanel.client._id);
        
        return api.post('/documents/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }));
      await fetchTicketDocs(activePanel._id);
    } catch (e) { alert(e.response?.data?.message || 'Failed to upload'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  // ── CSS ────────────────────────────────────────────────────────────────────
  const css = `
    .atm-page { display: block; }
    .atm-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card); display: flex; align-items: center; gap: 16px; flex-wrap: wrap; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
    .atm-body { padding: 28px 32px; }
    .atm-stat { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; gap: 14px; transition: all 0.25s; cursor: pointer; }
    .atm-stat:hover { border-color: var(--accent-green); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
    .atm-stat.selected { border-color: var(--accent-green) !important; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
    .atm-board { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 16px; }
    .atm-panel { position: fixed; top: 0; right: 0; width: 480px; height: 100vh; background: var(--card); border-left: 1px solid var(--border); z-index: 200; display: flex; flex-direction: column; box-shadow: -12px 0 40px rgba(0,0,0,0.15); animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1); }
    @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
    .atm-panel-header { padding: 22px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .atm-panel-tabs { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .atm-panel-tab { flex: 1; padding: 13px; background: none; border: none; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
    .atm-panel-tab.active { color: var(--accent-green); border-bottom: 2px solid var(--accent-green); margin-bottom: -1px; }
    .atm-panel-tab:not(.active) { color: var(--text-muted); border-bottom: 2px solid transparent; }
    .atm-panel-body { flex: 1; overflow-y: auto; padding: 22px 24px; }
    .atm-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--border); }
    .atm-detail-row:last-child { border-bottom: none; }
    .atm-detail-label { font-size: 12.5px; color: var(--text-muted); font-weight: 600; }
    .atm-detail-value { font-size: 13px; color: var(--text); font-weight: 700; text-align: right; }
    .atm-status-btn { padding: 8px 14px; border-radius: 9px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .atm-status-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .atm-status-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .atm-assign-select { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 9px; padding: 9px 13px; color: var(--text); font-size: 13.5px; font-weight: 600; outline: none; cursor: pointer; font-family: inherit; }
    .atm-assign-select:focus { border-color: var(--accent-green); }
    .atm-note-box { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 9px; padding: 10px 13px; color: var(--text); font-size: 13.5px; outline: none; font-family: inherit; resize: vertical; min-height: 80px; }
    .atm-note-box:focus { border-color: var(--accent-green); }
    .atm-btn { padding: 9px 18px; border-radius: 9px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; border: none; transition: all 0.2s; }
    .atm-btn-green { background: linear-gradient(135deg,#059669,#10b981); color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.25); }
    .atm-btn-green:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(16,185,129,0.35); transform: translateY(-1px); }
    .atm-btn-green:disabled { opacity: 0.5; cursor: not-allowed; }
    .atm-btn-outline { background: var(--bg); border: 1px solid var(--border) !important; color: var(--text); }
    .atm-comment { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; }
    .atm-attachment { background: var(--bg); border: 1px solid var(--border); border-radius: 9px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; color: var(--text); font-weight: 600; }
    .atm-section-label { font-size: 10.5px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .atm-overlay { position: fixed; inset: 0; z-index: 199; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); }
    .atm-table { width: 100%; border-collapse: collapse; }
    .atm-table th { padding: 12px 16px; font-size: 10.5px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.7px; background: var(--card); border-bottom: 1px solid var(--border); text-align: left; }
    .atm-table td { padding: 14px 16px; font-size: 13.5px; color: var(--text); border-bottom: 1px solid var(--border); vertical-align: middle; }
    .atm-table tr:hover td { background: rgba(255,255,255,0.02); cursor: pointer; }
    @keyframes fadeInScale { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
  `;

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Active', count: byStatus('active').length, color: '#f59e0b', icon: Clock },
    { label: 'In Process', count: byStatus('in_process').length, color: '#3b82f6', icon: Loader2 },
    { label: 'Completed', count: byStatus('completed').length, color: '#22c55e', icon: CheckCircle2 },
    { label: 'Total', count: filtered.length, color: '#8b5cf6', icon: Ticket },
  ];

  // ── List-view row ──────────────────────────────────────────────────────────
  const ListRow = ({ t }) => (
    <tr onClick={() => openPanel(t)}>
      <td><b style={{ fontFamily: 'monospace', fontSize: 12 }}>#{t.ticketNo || new Date(t.createdAt).getTime()}</b></td>
      <td>
        <div style={{ fontWeight: 700 }}>{t.service}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{t.hubType}</div>
      </td>
      <td>{t.client?.name || '—'}</td>
      <td><StatusBadge status={t.status} /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 40, height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${t.progress || 0}%`, height: '100%', background: 'var(--blue)', borderRadius: 10 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{t.progress || 0}%</span>
        </div>
      </td>
      <td><PriBadge priority={t.priority} /></td>
      <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
        {t.assignedTo?.name || <span style={{ color: '#ef4444', fontWeight: 700 }}>Unassigned</span>}
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(t.dueDate)}</td>
      <td>
        <button className="atm-btn atm-btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={e => { e.stopPropagation(); openPanel(t); }}>
          <Eye size={13} /> View
        </button>
      </td>
    </tr>
  );

  // ── Ticket detail panel ────────────────────────────────────────────────────
  const Panel = () => {
    if (!activePanel) return null;
    const t = activePanel;
    const panelCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.active;

    return (
      <>
        <div className="atm-overlay" onClick={closePanel} />
        <div className="atm-panel">
          {/* Header */}
          <div className="atm-panel-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
                  #{t.ticketNo || new Date(t.createdAt).getTime()}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1.25, marginBottom: 6 }}>{t.service}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <StatusBadge status={t.status} />
                  <PriBadge priority={t.priority} />
                  {t.isEscalated && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                      <AlertTriangle size={10} /> Escalated
                    </span>
                  )}
                </div>
              </div>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={20} /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="atm-panel-tabs">
            {[['details','Details',Eye],['notes','Notes',MessageSquare],['files','Files',Paperclip]].map(([id, label, Ic]) => (
              <button key={id} className={`atm-panel-tab ${panelTab === id ? 'active' : ''}`} onClick={() => setPanelTab(id)}>
                <Ic size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="atm-panel-body">

            {/* ── DETAILS TAB ── */}
            {panelTab === 'details' && (
              <>
                <div className="atm-section-label">TICKET INFO</div>
                {[
                  ['Client', t.client?.name || '—'],
                  ['Company', t.client?.companyName || '—'],
                  ['Hub', t.hubType || '—'],
                  ['Due Date', fmt(t.dueDate)],
                  ['Created', fmt(t.createdAt)],
                  ['Notes', t.notes || '—'],
                ].map(([l, v]) => (
                  <div className="atm-detail-row" key={l}>
                    <span className="atm-detail-label">{l}</span>
                    <span className="atm-detail-value" style={{ maxWidth: 240, textAlign: 'right', lineHeight: 1.4 }}>{v}</span>
                  </div>
                ))}

                {/* Status change */}
                <div style={{ marginTop: 20 }}>
                  <div className="atm-section-label">CHANGE STATUS</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { status: 'active',     label: 'Active',      color: '#f59e0b', Icon: Clock },
                      { status: 'in_process', label: 'In Process',  color: '#3b82f6', Icon: Loader2 },
                      { status: 'completed',  label: 'Completed',   color: '#22c55e', Icon: CheckCircle2 },
                      { status: 'closed',     label: 'Close',       color: '#94a3b8', Icon: X },
                    ].map(({ status, label, color, Icon }) => (
                      <button
                        key={status}
                        className="atm-status-btn"
                        disabled={t.status === status || changingStatus}
                        onClick={() => handleStatusChange(status)}
                        style={t.status === status ? { background: `${color}15`, borderColor: color, color } : {}}
                      >
                        <Icon size={12} /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Update progress */}
                <div style={{ marginTop: 22 }}>
                  <div className="atm-section-label">UPDATE PROGRESS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input 
                      type="range" 
                      min="0" max="100" step="5" 
                      value={t.progress || 0}
                      onChange={e => handleProgressChange(Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--accent-green)' }}
                    />
                    <div style={{ fontSize: 13, fontWeight: 800, width: '40px', textAlign: 'right', color: 'var(--blue)' }}>{t.progress || 0}%</div>
                  </div>
                </div>

                {/* Assign employee */}
                <div style={{ marginTop: 22 }}>
                  <div className="atm-section-label">ASSIGN EMPLOYEE</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select
                      className="atm-assign-select"
                      defaultValue={t.assignedTo?._id || ''}
                      onChange={e => e.target.value && handleAssign(e.target.value)}
                    >
                      <option value="">— Select employee —</option>
                      {employees.map(e => (
                        <option key={e._id} value={e._id}>
                          {e.name} {t.assignedTo && String(t.assignedTo._id) === String(e._id) ? '✓ (current)' : ''}
                        </option>
                      ))}
                    </select>
                    {assigningEmp && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)', flexShrink: 0, marginTop: 10 }} />}
                  </div>
                  {t.assignedTo && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {(t.assignedTo.name || '?').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.assignedTo.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently assigned</div>
                      </div>
                      <UserCheck size={16} color="#22c55e" style={{ marginLeft: 'auto' }} />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── NOTES TAB ── */}
            {panelTab === 'notes' && (
              <>
                <div className="atm-section-label">INTERNAL NOTES ({t.comments?.length || 0})</div>

                {/* Existing comments */}
                {(!t.comments || t.comments.length === 0)
                  ? <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, padding: '16px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 9 }}>No notes yet. Add the first one below.</div>
                  : [...(t.comments || [])].reverse().map((c, i) => (
                    <div className="atm-comment" key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>{c.user?.name || 'Admin'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(c.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>{c.text}</div>
                    </div>
                  ))
                }

                {/* Add note */}
                <div style={{ marginTop: 16 }}>
                  <div className="atm-section-label">ADD NOTE</div>
                  <textarea
                    className="atm-note-box"
                    placeholder="Write an internal note…"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote(); }}
                  />
                  <button
                    className="atm-btn atm-btn-green"
                    style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
                    onClick={handleAddNote}
                    disabled={!note.trim() || addingNote}
                  >
                    {addingNote ? <><Loader2 size={14} /> Saving…</> : <><Send size={14} /> Add Note (Ctrl+Enter)</>}
                  </button>
                </div>
              </>
            )}

            {/* ── FILES TAB ── */}
            {panelTab === 'files' && (
              <>
                <div className="atm-section-label">DOCUMENTS ({ticketDocs?.length || 0})</div>

                {loadingDocs ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}><Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} /></div>
                ) : (!ticketDocs || ticketDocs.length === 0) ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px', border: '1px dashed var(--border)', borderRadius: 9, marginBottom: 20 }}>No documents uploaded yet</div>
                ) : (
                  ticketDocs.map((doc, i) => (
                    <div className="atm-attachment" key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
                        <Paperclip size={14} color="var(--text-muted)" />
                        <div style={{ color: 'var(--text)', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => setPreviewDoc(doc)}>
                          {doc.name}
                        </div>
                        {doc.verification_status === 'verified' && <CheckCircle2 size={14} color="#22c55e" title="Verified" />}
                        {doc.verification_status === 'rejected' && <X size={14} color="#ef4444" title="Rejected" />}
                        {doc.verification_status === 'pending' && <Clock size={14} color="#f59e0b" title="Pending" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', fontSize: 11, color: 'var(--text-muted)', justifyContent: 'space-between' }}>
                         <span>Uploaded by {doc.uploaded_by?.name || 'Unknown'} • {fmt(doc.createdAt)} • {doc.file_type?.toUpperCase()}</span>
                         <div style={{ display: 'flex', gap: 8 }}>
                           <button onClick={() => setPreviewDoc(doc)} style={{ background: 'none', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Preview</button>
                           <a href={`https://myclaimportal.onrender.com${doc.file_url}`} download target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 700 }}>Download</a>
                         </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Upload */}
                <div style={{ marginTop: 16 }}>
                  <div className="atm-section-label">UPLOAD DOCUMENTS</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.csv"
                  />
                  <button
                    className="atm-btn atm-btn-green"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <><Loader2 size={14} /> Uploading…</> : <><Upload size={14} /> Choose Files to Upload</>}
                  </button>
                  <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                    Accepts: PDF, Word, Excel, JPEG, PNG. Up to 5 files.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page active atm-page" style={{ display: 'block' }}>
      <style>{css}</style>

      {/* Topbar */}
      <div className="atm-topbar">
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px' }}>Ticket Management</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {hubType
              ? <><span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{hubType}</span> — your vertical&apos;s tickets</>
              : 'All tickets across verticals'}
          </div>
        </div>

        {/* Search */}
        <div className="search-input" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={16} color="var(--text-light)" />
          <input placeholder="Search by ticket ID, service, client…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Priority filter */}
        <select className="form-select" style={{ width: 140, height: 38, borderRadius: 10 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Filters Toggle Button */}
        <button 
          onClick={() => setShowAdvFilters(prev => !prev)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px',
            borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: showAdvFilters || activeFilterCount > 0 ? 'rgba(0, 208, 132, 0.15)' : 'var(--bg)',
            color: showAdvFilters || activeFilterCount > 0 ? '#00D084' : 'var(--text)',
            border: `1px solid ${showAdvFilters || activeFilterCount > 0 ? 'rgba(0, 208, 132, 0.3)' : 'var(--border)'}`,
            transition: 'all 0.2s ease'
          }}
        >
          <Filter size={15} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span style={{
              background: '#00D084', color: '#091a10', width: 18, height: 18, borderRadius: '50%',
              fontSize: 11, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: 3 }}>
          {[['board','📋 Board'],['list','📊 List']].map(([v, l]) => (
            <button key={v} onClick={() => setSectionView(v)}
              style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 700, background: sectionView === v ? 'var(--card)' : 'transparent', color: sectionView === v ? 'var(--text)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', boxShadow: sectionView === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>

        <button className="topbar-btn secondary" onClick={() => { fetchTickets(); fetchEmployees(); }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {showAdvFilters && (
        <div style={{
          padding: '16px 24px', background: 'var(--card)', borderBottom: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '0 1 210px', minWidth: '170px' }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Status Filter</label>
              <select className="form-select" style={{ width: '100%', height: 38, borderRadius: 8 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="in_process">In Process</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div style={{ flex: '0 1 210px', minWidth: '170px' }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Assigned Employee</label>
              <select className="form-select" style={{ width: '100%', height: 38, borderRadius: 8 }} value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)}>
                <option value="all">All Assignments</option>
                <option value="unassigned">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '0 1 190px', minWidth: '150px' }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Created From</label>
              <input type="date" className="form-input" style={{ width: '100%', height: 38, borderRadius: 8, padding: '0 10px', fontSize: 13 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>

            <div style={{ flex: '0 1 190px', minWidth: '150px' }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Created To</label>
              <input type="date" className="form-input" style={{ width: '100%', height: 38, borderRadius: 8, padding: '0 10px', fontSize: 13 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Filters:</span>
              {priorityFilter !== 'all' && (
                <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Priority: {priorityFilter} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setPriorityFilter('all')} />
                </span>
              )}
              {statusFilter !== 'all' && (
                <span style={{ background: 'rgba(0,208,132,0.15)', color: '#00D084', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Status: {statusFilter} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('all')} />
                </span>
              )}
              {assignedFilter !== 'all' && (
                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Assigned: {assignedFilter === 'unassigned' ? 'Unassigned' : employees.find(e => String(e._id) === String(assignedFilter))?.name || 'Assigned'} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setAssignedFilter('all')} />
                </span>
              )}
              {dateFrom && (
                <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  From: {dateFrom} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setDateFrom('')} />
                </span>
              )}
              {dateTo && (
                <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  To: {dateTo} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setDateTo('')} />
                </span>
              )}
              <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <RotateCcw size={12} /> Clear All
              </button>
            </div>
          )}
        </div>
      )}

      <div className="atm-body">
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="atm-stat" style={{ animation: `fadeInScale 0.5s ease ${i * 0.07}s both` }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <s.icon size={18} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 850, color: s.color, lineHeight: 1 }}>{loading ? '…' : s.count}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)' }} />
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Loading tickets…</div>
          </div>
        ) : sectionView === 'board' ? (
          /* ── BOARD VIEW ──────────────────────────────────────────────── */
          <div className="atm-board">
            <Column title="Active Tickets"     color="#f59e0b" count={active.length}    icon={Clock}         tickets={active}    onOpen={openPanel} />
            <Column title="In Process Tickets" color="#3b82f6" count={inProcess.length} icon={Loader2}       tickets={inProcess} onOpen={openPanel} />
            <Column title="Completed Tickets"  color="#22c55e" count={completed.length} icon={CheckCircle2}  tickets={completed} onOpen={openPanel} />
          </div>
        ) : (
          /* ── LIST VIEW ───────────────────────────────────────────────── */
          <>
            {/* Active section */}
            {[
              { title: 'Active Tickets', color: '#f59e0b', rows: active },
              { title: 'In Process Tickets', color: '#3b82f6', rows: inProcess },
              { title: 'Completed Tickets', color: '#22c55e', rows: completed },
            ].map(sec => (
              <div key={sec.title} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: sec.color }} />
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', margin: 0 }}>{sec.title}</h3>
                  <span style={{ background: `${sec.color}18`, color: sec.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{sec.rows.length}</span>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {sec.rows.length === 0
                    ? <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No {sec.title.toLowerCase()}.</div>
                    : (
                      <table className="atm-table">
                        <thead>
                          <tr>
                            <th>ID</th><th>Service</th><th>Client</th><th>Status</th><th>Progress</th><th>Priority</th><th>Assigned To</th><th>Due</th><th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sec.rows.map(t => <ListRow key={t._id} t={t} />)}
                        </tbody>
                      </table>
                    )
                  }
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Side panel */}
      {activePanel && <Panel />}

      {/* Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', backdropFilter: 'blur(4px)' }}>
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div>
                 <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>{previewDoc.name}</h3>
                 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{previewDoc.file_type?.toUpperCase()}</span>
                 {previewDoc.verification_status && (
                   <span style={{ marginLeft: 12, fontSize: 11, padding: '2px 8px', borderRadius: 12, background: previewDoc.verification_status === 'verified' ? 'rgba(34,197,94,0.1)' : previewDoc.verification_status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: previewDoc.verification_status === 'verified' ? '#22c55e' : previewDoc.verification_status === 'rejected' ? '#ef4444' : '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
                     {previewDoc.verification_status}
                   </span>
                 )}
               </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               {['admin', 'super_admin'].includes(user?.role) && (
                 <>
                   <button 
                     onClick={async () => {
                       try {
                         await api.patch(`/documents/${previewDoc._id}/verify`, { status: 'verified' });
                         setPreviewDoc({ ...previewDoc, verification_status: 'verified' });
                         fetchTickets(); // Refresh tickets to update documents list
                       } catch (e) { alert('Failed to verify document'); }
                     }}
                     style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                   ><CheckCircle2 size={16} /> Verify</button>
                   <button 
                     onClick={async () => {
                       try {
                         await api.patch(`/documents/${previewDoc._id}/verify`, { status: 'rejected' });
                         setPreviewDoc({ ...previewDoc, verification_status: 'rejected' });
                         fetchTickets(); // Refresh tickets to update documents list
                       } catch (e) { alert('Failed to reject document'); }
                     }}
                     style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                   ><X size={16} /> Reject</button>
                 </>
               )}
               <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 16 }}><X size={24} /></button>
             </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto' }}>
            {(() => {
              const url = `${api.defaults.baseURL.replace('/api', '')}${previewDoc.file_url}`;
              if (previewDoc.file_type?.toLowerCase() === 'pdf') {
                return <iframe src={url} style={{ width: '100%', maxWidth: 900, height: '100%', border: 'none', background: '#fff', borderRadius: 12 }} title="PDF Preview" />;
              } else if (['jpg', 'jpeg', 'png', 'webp'].includes((previewDoc.file_type || '').toLowerCase())) {
                return <img src={url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }} />;
              } else {
                return <div style={{ color: '#fff', fontSize: 14 }}>Preview not available for this file type. Please <a href={url} download style={{ color: 'var(--blue)' }}>download</a> to view.</div>;
              }
            })()}
          </div>
        </div>
      )}

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default AdminTicketManagement;

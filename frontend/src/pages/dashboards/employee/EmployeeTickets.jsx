import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, X, Eye, Clock, Loader2, CheckCircle2,
  AlertTriangle, Flag, Calendar, Upload, MessageSquare, Send,
  Paperclip, FileText, ListFilter, Ticket,
} from 'lucide-react';
import api from '../../../services/api';

// ============================================================
// EMPLOYEE ASSIGNED TICKETS
// Role: Employee only
// Scope: View & manage only tickets assigned to the logged-in employee.
// Employee CANNOT: Assign, Reassign, Delete, or Create tickets.
// DO NOT modify this file when editing other role dashboards.
// ============================================================

// ─── Helpers ─────────────────────────────────────────────────
const STATUS_CFG = {
  active:     { label: 'Active',      color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: Clock },
  in_process: { label: 'In Process',  color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', icon: Loader2 },
  completed:  { label: 'Completed',   color: '#22c55e', bg: 'rgba(34,197,94,0.10)',  icon: CheckCircle2 },
  closed:     { label: 'Closed',      color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', icon: X },
};

const PRIORITY_CFG = {
  urgent: { color: '#ef4444', label: 'Urgent' },
  high:   { color: '#f97316', label: 'High' },
  medium: { color: '#f59e0b', label: 'Medium' },
  low:    { color: '#3b82f6', label: 'Low' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtFull = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const isOverdue = (t) => t.dueDate && !['completed','closed'].includes(t.status) && new Date(t.dueDate) < new Date();

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.active;
  const Ic = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      <Ic size={11} strokeWidth={2.5} /> {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CFG[priority] || PRIORITY_CFG.medium;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: `${cfg.color}15`, color: cfg.color }}>
      <Flag size={10} /> {cfg.label}
    </span>
  );
};

// ─── CSS ─────────────────────────────────────────────────────
const CSS = `
  .et-page { display: block; }
  .et-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card);
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
  .et-body { padding: 28px 32px; }

  .et-stat { background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    transition: all 0.25s; cursor: pointer; position: relative; overflow: hidden; }
  .et-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .et-stat.selected { border-color: var(--accent-green) !important; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }

  .et-table { width: 100%; border-collapse: collapse; }
  .et-table th { padding: 14px 16px; font-size: 10.5px; font-weight: 800; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.7px; background: var(--card);
    border-bottom: 1px solid var(--border); text-align: left; }
  .et-table td { padding: 14px 16px; font-size: 13.5px; color: var(--text);
    border-bottom: 1px solid var(--border); vertical-align: middle; }
  .et-table tr { transition: all 0.2s; }
  .et-table tr:hover td { background: rgba(34,197,94,0.02); }

  .et-action-btn { display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .et-action-btn:hover { border-color: var(--accent-green); color: var(--accent-green);
    transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

  .et-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
    border-radius: 9px; font-weight: 700; font-size: 13px; cursor: pointer;
    font-family: inherit; border: none; transition: all 0.2s; }
  .et-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
  .et-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .et-btn-green { background: linear-gradient(135deg,#059669,#10b981); color: #fff; }
  .et-btn-blue { background: linear-gradient(135deg,#2563eb,#3b82f6); color: #fff; }
  .et-btn-outline { background: var(--bg); border: 1px solid var(--border) !important; color: var(--text); }

  .et-chip { padding: 7px 14px; border-radius: 9px; font-weight: 700; font-size: 12px;
    cursor: pointer; font-family: inherit; transition: all 0.2s; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); }
  .et-chip.active { background: var(--accent-green); color: #000; border-color: var(--accent-green); }

  .et-panel { position: fixed; top: 0; right: 0; width: 520px; height: 100vh;
    background: var(--card); border-left: 1px solid var(--border); z-index: 200;
    display: flex; flex-direction: column; box-shadow: -12px 0 40px rgba(0,0,0,0.15);
    animation: etSlideIn 0.3s cubic-bezier(0.16,1,0.3,1); }
  .et-overlay { position: fixed; inset: 0; z-index: 199; background: rgba(0,0,0,0.3);
    backdrop-filter: blur(2px); }
  .et-panel-tabs { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .et-panel-tab { flex: 1; padding: 13px; background: none; border: none; font-weight: 700;
    font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
  .et-panel-tab.active { color: var(--accent-green); border-bottom: 2px solid var(--accent-green); margin-bottom: -1px; }
  .et-panel-tab:not(.active) { color: var(--text-muted); border-bottom: 2px solid transparent; }

  .et-detail-row { display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px dashed var(--border); }
  .et-detail-row:last-child { border-bottom: none; }
  .et-comment { background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
    padding: 12px 14px; margin-bottom: 10px; }

  .et-modal-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.5);
    backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; }
  .et-modal { background: var(--card); border: 1px solid var(--border); border-radius: 18px;
    width: 460px; max-width: 95vw; box-shadow: 0 24px 48px rgba(0,0,0,0.2);
    animation: etSlideUp 0.3s cubic-bezier(0.16,1,0.3,1); }

  .et-section-label { font-size: 10.5px; font-weight: 800; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 12px;
    padding-bottom: 8px; border-bottom: 1px solid var(--border); }

  @keyframes etSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
  @keyframes etSlideUp { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
  @keyframes spin { to { transform: rotate(360deg) } }
`;

// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
const EmployeeTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sort, setSort] = useState('latest');

  // Detail panel
  const [activeTicket, setActiveTicket] = useState(null);
  const [panelTab, setPanelTab] = useState('details');
  const [ticketDocs, setTicketDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Progress modal
  const [progressModal, setProgressModal] = useState({ open: false, ticketId: null, text: '' });
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Upload modal
  const [uploadModal, setUploadModal] = useState({ open: false, ticketId: null });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Data fetching ──────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tickets');
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketDocs = async (ticketId) => {
    setLoadingDocs(true);
    try {
      const { data } = await api.get(`/documents?ticket_id=${ticketId}`);
      setTicketDocs(data);
    } catch (err) { console.error(err); setTicketDocs([]); }
    finally { setLoadingDocs(false); }
  };

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // ── Filtering ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = tickets;
    if (statusFilter === 'active') list = list.filter(t => t.status === 'active');
    else if (statusFilter === 'in_process') list = list.filter(t => t.status === 'in_process');
    else if (statusFilter === 'completed') list = list.filter(t => t.status === 'completed');
    else if (statusFilter === 'overdue') list = list.filter(t => isOverdue(t));

    if (priorityFilter !== 'all') {
      list = list.filter(t => t.priority === priorityFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) list = list.filter(t =>
      (t.ticketId || '').toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q) ||
      (t.service || '').toLowerCase().includes(q) ||
      (t.client?.name || '').toLowerCase().includes(q) ||
      String(t._id).slice(-6).toLowerCase().includes(q)
    );

    // Sort logic
    list = [...list].sort((a, b) => {
      if (sort === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'dueDate') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      }
      if (sort === 'priority') {
        const pOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
        return (pOrder[a.priority] || 99) - (pOrder[b.priority] || 99);
      }
      return 0;
    });

    return list;
  }, [tickets, search, statusFilter, priorityFilter, sort]);

  // ── Counts ─────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all: tickets.length,
    active: tickets.filter(t => t.status === 'active').length,
    in_process: tickets.filter(t => t.status === 'in_process').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    overdue: tickets.filter(t => isOverdue(t)).length,
  }), [tickets]);

  // ── Handlers ───────────────────────────────────────────────
  const openPanel = (ticket) => {
    setActiveTicket(ticket);
    setPanelTab('details');
    fetchTicketDocs(ticket._id);
  };
  const closePanel = () => setActiveTicket(null);

  const handleSubmitProgress = async () => {
    if (!progressModal.text.trim() || submittingProgress) return;
    setSubmittingProgress(true);
    try {
      await api.post(`/tickets/${progressModal.ticketId}/comments`, { text: progressModal.text });
      setProgressModal({ open: false, ticketId: null, text: '' });
      await fetchTickets();
      if (activeTicket && activeTicket._id === progressModal.ticketId) {
        const { data } = await api.get('/tickets');
        const updated = data.find(t => t._id === activeTicket._id);
        if (updated) setActiveTicket(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save progress');
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadModal.ticketId) return;
    setUploading(true);
    try {
      const ticket = tickets.find(t => t._id === uploadModal.ticketId);
      await Promise.all(Array.from(files).map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('linked_to', 'ticket');
        form.append('ticket_id', uploadModal.ticketId);
        if (ticket?.client?._id) form.append('client_id', ticket.client._id);
        return api.post('/documents/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }));
      setUploadModal({ open: false, ticketId: null });
      if (activeTicket && activeTicket._id === uploadModal.ticketId) {
        await fetchTicketDocs(uploadModal.ticketId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Stat cards ─────────────────────────────────────────────
  const statCards = [
    { key: 'all',        label: 'Total Tickets',  count: counts.all,        color: '#8b5cf6', icon: Ticket },
    { key: 'active',     label: 'Active',         count: counts.active,     color: '#f59e0b', icon: Clock },
    { key: 'in_process', label: 'In Process',     count: counts.in_process, color: '#3b82f6', icon: Loader2 },
    { key: 'completed',  label: 'Completed',      count: counts.completed,  color: '#22c55e', icon: CheckCircle2 },
    { key: 'overdue',    label: 'Overdue',         count: counts.overdue,    color: '#ef4444', icon: AlertTriangle },
  ];

  // ── Detail Panel ───────────────────────────────────────────
  const Panel = () => {
    if (!activeTicket) return null;
    const t = activeTicket;
    const overdue = isOverdue(t);

    return (
      <>
        <div className="et-overlay" onClick={closePanel} />
        <div className="et-panel">
          {/* Header */}
          <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
                  #{String(t._id).slice(-6).toUpperCase()}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1.25, marginBottom: 8 }}>
                  {t.subject || t.service || 'Ticket'}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  {overdue && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                      <AlertTriangle size={10} /> Overdue
                    </span>
                  )}
                </div>
              </div>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="et-panel-tabs">
            {[['details', 'Details', Eye], ['progress', 'Progress', MessageSquare], ['files', 'Files', Paperclip]].map(([id, label, Ic]) => (
              <button key={id} className={`et-panel-tab ${panelTab === id ? 'active' : ''}`} onClick={() => setPanelTab(id)}>
                <Ic size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>

            {/* Details Tab */}
            {panelTab === 'details' && (
              <>
                <div className="et-section-label">TICKET INFORMATION</div>
                {[
                  ['Client', t.client?.name || '—'],
                  ['Company', t.client?.companyName || '—'],
                  ['Service', t.service || '—'],
                  ['Hub', t.hubType || '—'],
                  ['Priority', t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1) || '—'],
                  ['Due Date', fmt(t.dueDate)],
                  ['Created', fmt(t.createdAt)],
                ].map(([l, v]) => (
                  <div className="et-detail-row" key={l}>
                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>{l}</span>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, textAlign: 'right', maxWidth: 240 }}>{v}</span>
                  </div>
                ))}

                {t.notes && (
                  <div style={{ marginTop: 18 }}>
                    <div className="et-section-label">INSTRUCTIONS &amp; NOTES</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                      {t.notes}
                    </div>
                  </div>
                )}

                {/* Actions (Employee allowed) */}
                <div style={{ marginTop: 22 }}>
                  <div className="et-section-label">ACTIONS</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="et-btn et-btn-outline" onClick={() => setProgressModal({ open: true, ticketId: t._id, text: '' })}>
                      <MessageSquare size={14} /> Add Progress
                    </button>
                    <button className="et-btn et-btn-blue" onClick={() => setUploadModal({ open: true, ticketId: t._id })}>
                      <Upload size={14} /> Upload Document
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Progress Tab */}
            {panelTab === 'progress' && (
              <>
                <div className="et-section-label">PROGRESS NOTES ({t.comments?.length || 0})</div>
                {(!t.comments || t.comments.length === 0) ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16, border: '1px dashed var(--border)', borderRadius: 9 }}>
                    No progress updates yet. Add the first one below.
                  </div>
                ) : (
                  [...(t.comments || [])].reverse().map((c, i) => (
                    <div className="et-comment" key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>{c.user?.name || 'You'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtFull(c.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>{c.text}</div>
                    </div>
                  ))
                )}
                <div style={{ marginTop: 18 }}>
                  <button className="et-btn et-btn-green" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setProgressModal({ open: true, ticketId: t._id, text: '' })}>
                    <MessageSquare size={14} /> Add Progress Update
                  </button>
                </div>
              </>
            )}

            {/* Files Tab */}
            {panelTab === 'files' && (
              <>
                <div className="et-section-label">DOCUMENTS ({ticketDocs?.length || 0})</div>
                {loadingDocs ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (!ticketDocs || ticketDocs.length === 0) ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16, border: '1px dashed var(--border)', borderRadius: 9, marginBottom: 18 }}>
                    No documents uploaded yet
                  </div>
                ) : (
                  ticketDocs.map((doc, i) => (
                    <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={14} color="var(--text-muted)" />
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                          {doc.name}
                        </div>
                        {doc.verification_status === 'verified' && <CheckCircle2 size={14} color="#22c55e" title="Verified" />}
                        {doc.verification_status === 'rejected' && <X size={14} color="#ef4444" title="Rejected" />}
                        {doc.verification_status === 'pending' && <Clock size={14} color="#f59e0b" title="Pending" />}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{doc.uploaded_by?.name || 'You'} &bull; {fmt(doc.createdAt)} &bull; {doc.file_type?.toUpperCase()}</span>
                        <a href={`https://myclaimportal.onrender.com${doc.file_url}`} download target="_blank" rel="noreferrer" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 700 }}>Download</a>
                      </div>
                    </div>
                  ))
                )}
                <button className="et-btn et-btn-blue" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  onClick={() => setUploadModal({ open: true, ticketId: t._id })}>
                  <Upload size={14} /> Upload Documents
                </button>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="page active et-page" style={{ display: 'block' }}>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="et-topbar">
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px' }}>Assigned Tickets</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            View and manage tickets assigned to you
          </div>
        </div>

        <div className="search-input" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} color="var(--text-light)" />
          <input placeholder="Search by ticket ID, service, client…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="in_process">In Process</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <button className="topbar-btn secondary" onClick={fetchTickets}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="et-body">
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 14, marginBottom: 28 }}>
          {statCards.map((s, i) => (
            <div
              key={s.key}
              className={`et-stat ${statusFilter === s.key ? 'selected' : ''}`}
              onClick={() => setStatusFilter(s.key === statusFilter ? 'all' : s.key)}
              style={{ animation: `fadeInScale 0.5s ease ${i * 0.07}s both` }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <s.icon size={17} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 850, color: s.color, lineHeight: 1 }}>{loading ? '…' : s.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Chips and Advanced Sort/Filter */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Tickets' },
              { key: 'active', label: 'Pending' },
              { key: 'in_process', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'overdue', label: 'Overdue' },
            ].map(f => (
              <button
                key={f.key}
                className={`et-chip ${statusFilter === f.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label} ({counts[f.key] || 0})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Priority:</span>
              <select 
                value={priorityFilter} 
                onChange={e => setPriorityFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12.5, fontWeight: 600, outline: 'none' }}
              >
                <option value="all">All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Sort by:</span>
              <select 
                value={sort} 
                onChange={e => setSort(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12.5, fontWeight: 600, outline: 'none' }}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)' }} />
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Loading your tickets…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, color: 'var(--text-muted)' }}>
            <ListFilter size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>No tickets found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {search ? 'Try adjusting your search query' : 'No tickets match the selected filter'}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="et-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Client Name</th>
                    <th>Service Name</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ticket => {
                    const overdue = isOverdue(ticket);
                    return (
                      <tr key={ticket._id} style={{ borderLeft: overdue ? '3px solid #ef4444' : '3px solid transparent' }}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--text)', background: 'var(--bg)', padding: '3px 8px', borderRadius: 5 }}>
                            #{String(ticket._id).slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ticket.client?.name || 'Unknown'}</div>
                          {ticket.client?.companyName && (
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{ticket.client.companyName}</div>
                          )}
                        </td>
                        <td style={{ fontSize: 13 }}>{ticket.service}</td>
                        <td><StatusBadge status={ticket.status} /></td>
                        <td><PriorityBadge priority={ticket.priority} /></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: overdue ? '#ef4444' : 'var(--text-muted)', fontWeight: overdue ? 700 : 400 }}>
                            <Calendar size={12} /> {fmt(ticket.dueDate)}
                            {overdue && <AlertTriangle size={12} color="#ef4444" />}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="et-action-btn" title="View Ticket" onClick={() => openPanel(ticket)}>
                              <Eye size={14} />
                            </button>
                            <button className="et-action-btn" title="Upload Document" onClick={() => setUploadModal({ open: true, ticketId: ticket._id })}
                              style={{ color: '#3b82f6' }}>
                              <Upload size={14} />
                            </button>
                            <button className="et-action-btn" title="Add Progress Update" onClick={() => setProgressModal({ open: true, ticketId: ticket._id, text: '' })}
                              style={{ color: '#22c55e' }}>
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {activeTicket && <Panel />}

      {/* Progress Modal */}
      {progressModal.open && (
        <div className="et-modal-overlay" onClick={() => setProgressModal({ open: false, ticketId: null, text: '' })}>
          <div className="et-modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Add Progress Update</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Describe what progress you have made on this ticket
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <textarea
                value={progressModal.text}
                onChange={e => setProgressModal(prev => ({ ...prev, text: e.target.value }))}
                placeholder="What was done? Any blockers? Next steps…"
                rows={5}
                style={{
                  width: '100%', padding: 14, borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontSize: 13.5,
                  fontFamily: 'inherit', resize: 'vertical', minHeight: 100,
                }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitProgress(); }}
                autoFocus
              />
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="et-btn et-btn-outline" onClick={() => setProgressModal({ open: false, ticketId: null, text: '' })}>
                Cancel
              </button>
              <button className="et-btn et-btn-green" disabled={!progressModal.text.trim() || submittingProgress} onClick={handleSubmitProgress}>
                {submittingProgress ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Send size={13} /> Save Progress</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal.open && (
        <div className="et-modal-overlay" onClick={() => setUploadModal({ open: false, ticketId: null })}>
          <div className="et-modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Upload Documents</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Attach files to this ticket
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.csv"
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: 14, padding: '40px 20px',
                  textAlign: 'center', cursor: 'pointer', background: 'var(--bg)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-green)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)', marginBottom: 8 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Uploading…</div>
                  </>
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Click to select files</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      PDF, Word, Excel, JPEG, PNG &mdash; up to 5 files
                    </div>
                  </>
                )}
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="et-btn et-btn-outline" onClick={() => setUploadModal({ open: false, ticketId: null })}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTickets;

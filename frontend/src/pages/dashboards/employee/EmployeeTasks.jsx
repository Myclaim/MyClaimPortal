import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Play, CheckCircle, MessageSquare, Clock, Loader2,
  AlertTriangle, RefreshCw, X, Send, Eye,
  Calendar, Flag, ListFilter,
} from 'lucide-react';
import api from '../../../services/api';

// ============================================================
// EMPLOYEE MY TASKS PAGE
// Role: Employee only
// Scope: View & manage only tickets assigned to the logged-in employee.
// DO NOT modify this file when editing other role dashboards.
// ============================================================

// ─── Status helpers ──────────────────────────────────────────
const STATUS_CFG = {
  active:     { label: 'Pending',     color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: Clock },
  in_process: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', icon: Loader2 },
  completed:  { label: 'Completed',   color: '#22c55e', bg: 'rgba(34,197,94,0.10)',  icon: CheckCircle },
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
const isOverdue = (task) => task.dueDate && task.status !== 'completed' && task.status !== 'closed' && new Date(task.dueDate) < new Date();

// ─── Badges ──────────────────────────────────────────────────
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
  .emp-tasks-page { display: block; }
  .emp-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card);
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
  .emp-body { padding: 28px 32px; }
  .emp-stat { background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px 22px; display: flex; align-items: center; gap: 14px;
    transition: all 0.25s; cursor: pointer; position: relative; overflow: hidden; }
  .emp-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .emp-stat.selected { border-color: var(--accent-green) !important; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
  .emp-task-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px 24px; transition: all 0.25s; cursor: pointer; position: relative; }
  .emp-task-card:hover { border-color: var(--accent-green); box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .emp-task-card.overdue { border-left: 3px solid #ef4444; }
  .emp-action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    border-radius: 9px; font-weight: 700; font-size: 12.5px; cursor: pointer;
    font-family: inherit; transition: all 0.2s; border: none; }
  .emp-action-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
  .emp-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .emp-action-btn.primary { background: linear-gradient(135deg,#3b82f6,#2563eb); color: #fff; }
  .emp-action-btn.success { background: linear-gradient(135deg,#059669,#10b981); color: #fff; }
  .emp-action-btn.outline { background: var(--bg); border: 1px solid var(--border) !important; color: var(--text); }
  .emp-filter-chip { padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 12.5px;
    cursor: pointer; font-family: inherit; transition: all 0.2s; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); }
  .emp-filter-chip.active { background: var(--accent-green); color: #000; border-color: var(--accent-green); }
  .emp-modal-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.5);
    backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; }
  .emp-modal { background: var(--card); border: 1px solid var(--border); border-radius: 18px;
    width: 460px; max-width: 95vw; box-shadow: 0 24px 48px rgba(0,0,0,0.2);
    animation: empSlideUp 0.3s cubic-bezier(0.16,1,0.3,1); }
  .emp-detail-panel { position: fixed; top: 0; right: 0; width: 500px; height: 100vh;
    background: var(--card); border-left: 1px solid var(--border); z-index: 200;
    display: flex; flex-direction: column; box-shadow: -12px 0 40px rgba(0,0,0,0.15);
    animation: empSlideInRight 0.3s cubic-bezier(0.16,1,0.3,1); }
  .emp-detail-overlay { position: fixed; inset: 0; z-index: 199; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); }
  .emp-detail-row { display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px dashed var(--border); }
  .emp-detail-row:last-child { border-bottom: none; }
  .emp-comment { background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
    padding: 12px 14px; margin-bottom: 10px; }
  @keyframes empSlideUp { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
  @keyframes empSlideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
  @keyframes spin { to { transform: rotate(360deg) } }
`;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [updatingId, setUpdatingId] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  // Progress modal
  const [progressModal, setProgressModal] = useState({ open: false, taskId: null, text: '' });
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // ── Data fetching ──────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tickets');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Filtering ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = tasks;
    if (statusFilter === 'pending') list = list.filter(t => t.status === 'active');
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
      String(new Date(t.createdAt).getTime()).includes(q)
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
  }, [tasks, search, statusFilter, priorityFilter, sort]);

  // ── Counts ─────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'active').length,
    in_process: tasks.filter(t => t.status === 'in_process').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t)).length,
  }), [tasks]);

  // ── Handlers ───────────────────────────────────────────────
  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      await api.patch(`/tickets/${taskId}/employee-status`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      if (detailTask && detailTask._id === taskId) {
        setDetailTask(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmitProgress = async () => {
    if (!progressModal.text.trim() || submittingProgress) return;
    setSubmittingProgress(true);
    try {
      await api.post(`/tickets/${progressModal.taskId}/comments`, { text: progressModal.text });
      setProgressModal({ open: false, taskId: null, text: '' });
      await fetchTasks();
      // Re-sync detail panel if open
      if (detailTask && detailTask._id === progressModal.taskId) {
        const { data } = await api.get('/tickets');
        const updated = data.find(t => t._id === detailTask._id);
        if (updated) setDetailTask(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save progress');
    } finally {
      setSubmittingProgress(false);
    }
  };

  const openDetail = (task) => setDetailTask(task);
  const closeDetail = () => setDetailTask(null);

  // ── Stat cards config ──────────────────────────────────────
  const statCards = [
    { key: 'all', label: 'All Tasks', count: counts.all, color: '#8b5cf6', icon: ListFilter },
    { key: 'pending', label: 'Pending', count: counts.pending, color: '#f59e0b', icon: Clock },
    { key: 'in_process', label: 'In Progress', count: counts.in_process, color: '#3b82f6', icon: Loader2 },
    { key: 'completed', label: 'Completed', count: counts.completed, color: '#22c55e', icon: CheckCircle },
    { key: 'overdue', label: 'Overdue', count: counts.overdue, color: '#ef4444', icon: AlertTriangle },
  ];

  // ── Task Card ──────────────────────────────────────────────
  const TaskCard = ({ task }) => {
    const overdue = isOverdue(task);
    return (
      <div
        className={`emp-task-card ${overdue ? 'overdue' : ''}`}
        style={{ animation: `fadeInScale 0.4s ease both` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 5 }}>
              #{new Date(task.createdAt).getTime()}
            </span>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {overdue && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                <AlertTriangle size={10} /> Overdue
              </span>
            )}
          </div>
          <button
            className="emp-action-btn outline"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => openDetail(task)}
          >
            <Eye size={13} /> View
          </button>
        </div>

        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4, lineHeight: 1.35 }}>
          {task.subject || task.service || 'Task Assignment'}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
          {task.client?.name || 'Unknown Client'}
          {task.client?.companyName && <span style={{ marginLeft: 4, opacity: 0.6 }}>&middot; {task.client.companyName}</span>}
          <span style={{ marginLeft: 8 }}>&middot;</span>
          <span style={{ marginLeft: 4 }}>{task.service}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          {/* Due date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: overdue ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
            <Calendar size={12} /> Due: {fmt(task.dueDate)}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            {task.status === 'active' && (
              <button
                className="emp-action-btn primary"
                disabled={updatingId === task._id}
                onClick={() => handleStatusChange(task._id, 'in_process')}
              >
                {updatingId === task._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={13} />} Start Task
              </button>
            )}
            {['active', 'in_process'].includes(task.status) && (
              <button
                className="emp-action-btn outline"
                onClick={() => setProgressModal({ open: true, taskId: task._id, text: '' })}
              >
                <MessageSquare size={13} /> Update
              </button>
            )}
            {['active', 'in_process'].includes(task.status) && (
              <button
                className="emp-action-btn success"
                disabled={updatingId === task._id}
                onClick={() => handleStatusChange(task._id, 'completed')}
              >
                {updatingId === task._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />} Complete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Detail Panel ───────────────────────────────────────────
  const DetailPanel = () => {
    if (!detailTask) return null;
    const t = detailTask;
    const overdue = isOverdue(t);

    return (
      <>
        <div className="emp-detail-overlay" onClick={closeDetail} />
        <div className="emp-detail-panel">
          {/* Header */}
          <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
                  #{t.ticketNo || new Date(t.createdAt).getTime()}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1.25, marginBottom: 8 }}>
                  {t.subject || t.service || 'Task Assignment'}
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
              <button onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
            {/* Task Info */}
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
              TASK DETAILS
            </div>
            {[
              ['Client', t.client?.name || '—'],
              ['Company', t.client?.companyName || '—'],
              ['Service', t.service || '—'],
              ['Hub', t.hubType || '—'],
              ['Due Date', fmt(t.dueDate)],
              ['Created', fmt(t.createdAt)],
              ['Notes', t.notes || '—'],
            ].map(([l, v]) => (
              <div className="emp-detail-row" key={l}>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>{l}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, textAlign: 'right', maxWidth: 240, lineHeight: 1.4 }}>{v}</span>
              </div>
            ))}

            {/* Actions */}
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                ACTIONS
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {t.status === 'active' && (
                  <button className="emp-action-btn primary" disabled={updatingId === t._id} onClick={() => handleStatusChange(t._id, 'in_process')}>
                    {updatingId === t._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={13} />} Start Task
                  </button>
                )}
                {['active', 'in_process'].includes(t.status) && (
                  <button className="emp-action-btn outline" onClick={() => setProgressModal({ open: true, taskId: t._id, text: '' })}>
                    <MessageSquare size={13} /> Update Progress
                  </button>
                )}
                {['active', 'in_process'].includes(t.status) && (
                  <button className="emp-action-btn success" disabled={updatingId === t._id} onClick={() => handleStatusChange(t._id, 'completed')}>
                    {updatingId === t._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />} Mark Complete
                  </button>
                )}
                {t.status === 'completed' && (
                  <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', padding: '10px 16px', borderRadius: 10 }}>
                    <CheckCircle size={16} /> This task has been completed
                  </div>
                )}
              </div>
            </div>

            {/* Comments / Progress Notes */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                PROGRESS NOTES ({t.comments?.length || 0})
              </div>
              {(!t.comments || t.comments.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16, border: '1px dashed var(--border)', borderRadius: 9 }}>
                  No progress notes yet
                </div>
              ) : (
                [...(t.comments || [])].reverse().map((c, i) => (
                  <div className="emp-comment" key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>{c.user?.name || 'You'}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtFull(c.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>{c.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="page active emp-tasks-page" style={{ display: 'block' }}>
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="emp-topbar">
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px' }}>My Tasks</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Manage your assigned tickets and track progress
          </div>
        </div>

        {/* Search */}
        <div className="search-input" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} color="var(--text-light)" />
          <input placeholder="Search by ID, service, client…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button className="topbar-btn secondary" onClick={fetchTasks}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="emp-body">
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 14, marginBottom: 28 }}>
          {statCards.map((s, i) => (
            <div
              key={s.key}
              className={`emp-stat ${statusFilter === s.key ? 'selected' : ''}`}
              onClick={() => setStatusFilter(s.key === statusFilter ? 'all' : s.key)}
              style={{ animation: `fadeInScale 0.5s ease ${i * 0.07}s both` }}
            >
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

        {/* Filter Chips and Advanced Sort/Filter */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'pending', label: 'Pending' },
              { key: 'in_process', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'overdue', label: 'Overdue' },
            ].map(f => (
              <button
                key={f.key}
                className={`emp-filter-chip ${statusFilter === f.key ? 'active' : ''}`}
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

        {/* Tasks Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)' }} />
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Loading your tasks…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, color: 'var(--text-muted)' }}>
            <ListFilter size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>No tasks found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {search ? 'Try adjusting your search query' : 'No tasks match the selected filter'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {filtered.map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {detailTask && <DetailPanel />}

      {/* Update Progress Modal */}
      {progressModal.open && (
        <div className="emp-modal-overlay" onClick={() => setProgressModal({ open: false, taskId: null, text: '' })}>
          <div className="emp-modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Update Progress</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Add a note about your progress on this task
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <textarea
                value={progressModal.text}
                onChange={e => setProgressModal(prev => ({ ...prev, text: e.target.value }))}
                placeholder="What progress have you made? Describe what was done, blockers, next steps…"
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
              <button
                className="emp-action-btn outline"
                onClick={() => setProgressModal({ open: false, taskId: null, text: '' })}
              >
                Cancel
              </button>
              <button
                className="emp-action-btn primary"
                disabled={!progressModal.text.trim() || submittingProgress}
                onClick={handleSubmitProgress}
              >
                {submittingProgress ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Send size={13} /> Save Progress</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Search, Download, Eye, Edit2, Trash2, Plus, X, Ticket,
  CheckCircle2, Loader2, Users, Briefcase, RefreshCw, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const ROLE_LABEL = { employee: 'Employee', team: 'Team', staff: 'Staff' };

// ─── Vertical label mapping ──────────────────────────────────────────────────
const DEPT_TO_HUB = {
  claim: 'Claim Hub',
  service: 'Service Hub',
  store: 'Store Hub',
  support: 'Support Hub',
};
const DEPT_LABEL = {
  claim: 'Claim',
  service: 'Service',
  store: 'Store',
  support: 'Support',
};

// ─── Pill badge component ─────────────────────────────────────────────────────
const Badge = ({ children, color = '#3b82f6' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: `${color}18`, color,
  }}>{children}</span>
);

// ─── Workload bar ─────────────────────────────────────────────────────────────
const WorkloadBar = ({ active, completed, total }) => {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
  const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
        <span>{active} active</span>
        <span>{completed} done</span>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: 'var(--border)' }}>
        <div style={{ height: '100%', borderRadius: 6, background: color, width: `${Math.min(pct, 100)}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminEmployeeManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const dept = (currentUser?.department || '').toLowerCase();
  const hubType = DEPT_TO_HUB[dept] || null;
  const deptLabel = DEPT_LABEL[dept] || (currentUser?.role === 'super_admin' ? 'All' : '');

  // ── State ──────────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null); // 'view' | 'edit' | 'assign'
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assignForm, setAssignForm] = useState({ ticketId: '', note: '' });
  const [assigning, setAssigning] = useState(false);

  // ── Fetch employees (vertically scoped) ───────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      let list = data.filter(u => ['employee', 'team', 'staff'].includes(u.role));
      if (currentUser?.role === 'admin' && dept) {
        list = list.filter(u => (u.department || '').toLowerCase() === dept);
      }
      setEmployees(list);
    } catch (e) { console.error(e); }
  }, [currentUser, dept]);

  // ── Fetch tickets scoped to this admin's hub ───────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      const { data } = await api.get('/tickets');
      const scoped = hubType ? data.filter(t => t.hubType === hubType) : data;
      setTickets(scoped);
    } catch (e) { console.error(e); }
  }, [hubType]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchTickets()]);
      setLoading(false);
    };
    init();
  }, [fetchEmployees, fetchTickets]);

  // ── Per-employee ticket stats ──────────────────────────────────────────────
  const ticketsByEmployee = useMemo(() => {
    const map = {};
    tickets.forEach(t => {
      const id = t.assignedTo?._id || t.assignedTo;
      if (!id) return;
      const key = String(id);
      if (!map[key]) map[key] = { active: 0, inProcess: 0, completed: 0 };
      if (t.status === 'active') map[key].active++;
      else if (t.status === 'in_process') map[key].inProcess++;
      else if (t.status === 'completed') map[key].completed++;
    });
    return map;
  }, [tickets]);

  // ── Unassigned hub tickets (for Assign modal) ─────────────────────────────
  const unassignedTickets = useMemo(
    () => tickets.filter(t => !t.assignedTo && t.status !== 'completed' && t.status !== 'closed'),
    [tickets]
  );

  // ── Filtered employees list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = employees;
    if (statusFilter === 'active') list = list.filter(u => u.is_active !== false);
    if (statusFilter === 'inactive') list = list.filter(u => u.is_active === false);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.skills || '').toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q)
    );
  }, [employees, query, statusFilter]);

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const totalActive = employees.filter(e => e.is_active !== false).length;
  const totalInactive = employees.filter(e => e.is_active === false).length;
  const totalTickets = tickets.filter(t => t.status !== 'completed').length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openView = (emp) => { setSelected(emp); setModal('view'); };
  const openEdit = (emp) => {
    setSelected(emp);
    setEditForm({ ...emp, status: emp.is_active === false ? 'inactive' : 'active' });
    setModal('edit');
  };
  const openAssign = (emp) => {
    setSelected(emp);
    setAssignForm({ ticketId: '', note: '' });
    setModal('assign');
  };
  const closeModal = () => { setModal(null); setSelected(null); setEditForm(null); };

  const handleSaveEdit = async () => {
    if (!editForm?._id) return;
    setSaving(true);
    try {
      const { password: _p, status: _s, ...rest } = editForm;
      const { data } = await api.patch(`/users/${editForm._id}`, { ...rest, is_active: editForm.status !== 'inactive' });
      setEmployees(prev => prev.map(e => String(e._id) === String(data._id) ? { ...e, ...data } : e));
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${emp._id}`);
      setEmployees(prev => prev.filter(e => String(e._id) !== String(emp._id)));
      if (modal) closeModal();
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleAssignTicket = async () => {
    if (!assignForm.ticketId || !selected) return;
    setAssigning(true);
    try {
      await api.patch(`/tickets/${assignForm.ticketId}/assign`, { userId: selected._id });
      await fetchTickets();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign ticket');
    } finally { setAssigning(false); }
  };

  const handleExportCSV = () => {
    if (!filtered.length) return alert('No employees to export');
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Designation', 'Status', 'Active Tickets', 'Completed'];
    const rows = filtered.map(u => {
      const s = ticketsByEmployee[String(u._id)] || {};
      return [
        u._id, u.name, u.email, u.phone || '',
        ROLE_LABEL[u.role] || u.role, u.department || '',
        u.designation || '',
        u.is_active === false ? 'Inactive' : 'Active',
        (s.active || 0) + (s.inProcess || 0), s.completed || 0,
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `employees_${dept || 'all'}_${Date.now()}.csv`;
    a.click();
  };

  // ── Employee row ───────────────────────────────────────────────────────────
  const EmpRow = ({ emp }) => {
    const s = ticketsByEmployee[String(emp._id)] || {};
    const activeLoad = (s.active || 0) + (s.inProcess || 0);
    const totalLoad = activeLoad + (s.completed || 0);
    return (
      <tr style={{ cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <td><b style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(emp._id).slice(-6).toUpperCase()}</b></td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
              background: `hsl(${(emp.name?.charCodeAt(0) || 65) * 7 % 360}, 60%, 55%)`, color: '#fff'
            }}>
              {(emp.name || '?').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{emp.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
            </div>
          </div>
        </td>
        <td>
          <Badge color="#8b5cf6">{ROLE_LABEL[emp.role] || emp.role}</Badge>
        </td>
        <td style={{ fontSize: 13 }}>{emp.designation || '—'}</td>
        <td style={{ minWidth: 140 }}>
          <WorkloadBar active={activeLoad} completed={s.completed || 0} total={totalLoad} />
        </td>
        <td>
          {emp.is_active === false
            ? <Badge color="#ef4444">Inactive</Badge>
            : <Badge color="#22c55e">Active</Badge>}
        </td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="action-icon" title="View workload" onClick={() => openView(emp)}><Eye size={14} /></button>
            <button className="action-icon" title="Assign ticket" onClick={() => openAssign(emp)}><Ticket size={14} /></button>
            <button className="action-icon" title="Edit employee" onClick={() => openEdit(emp)}><Edit2 size={14} /></button>
            <button className="action-icon" title="Delete" style={{ color: '#ef4444' }} onClick={() => handleDelete(emp)}><Trash2 size={14} /></button>
          </div>
        </td>
      </tr>
    );
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const css = `
    .emp-stat { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px 24px; display: flex; align-items: center; gap: 16px; transition: all 0.25s; }
    .emp-stat:hover { border-color: var(--accent-green); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
    .emp-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .emp-stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .emp-stat-value { font-size: 28px; font-weight: 850; color: var(--text); line-height: 1; letter-spacing: -0.5px; }
    .emp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.2s ease; }
    .emp-modal { background: var(--card); border: 1px solid var(--border); border-radius: 18px; width: 100%; max-width: 720px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0,0,0,0.3); animation: scaleIn 0.25s cubic-bezier(0.16,1,0.3,1); overflow: hidden; }
    .emp-modal-lg { max-width: 960px; }
    .emp-modal-header { padding: 24px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .emp-modal-body { padding: 28px; overflow-y: auto; flex: 1; }
    .emp-modal-footer { padding: 20px 28px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
    .emp-section-title { font-size: 10.5px; font-weight: 800; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
    .emp-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px dashed var(--border); }
    .emp-detail-row:last-child { border-bottom: none; }
    .emp-detail-label { font-size: 13px; color: var(--text-muted); font-weight: 600; }
    .emp-detail-value { font-size: 13.5px; color: var(--text); font-weight: 700; text-align: right; }
    .emp-ticket-card { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 10px; transition: border-color 0.2s; }
    .emp-ticket-card:hover { border-color: var(--accent-green); }
    .emp-form-label { font-size: 10.5px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px; display: block; }
    .emp-input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 9px 13px; color: var(--text); font-size: 14px; outline: none; font-family: inherit; }
    .emp-input:focus { border-color: var(--accent-green); }
    .emp-select { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 9px 13px; color: var(--text); font-size: 14px; outline: none; font-family: inherit; cursor: pointer; }
    .emp-btn { padding: 10px 22px; border-radius: 9px; font-size: 13.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; font-family: inherit; border: none; }
    .emp-btn-primary { background: linear-gradient(135deg, #059669, #10b981); color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.25); }
    .emp-btn-primary:hover { box-shadow: 0 6px 20px rgba(16,185,129,0.35); transform: translateY(-1px); }
    .emp-btn-secondary { background: var(--bg); border: 1px solid var(--border) !important; color: var(--text); }
    .emp-btn-danger { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2) !important; color: #ef4444; }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
  `;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="page active" style={{ display: 'block' }}>
      <style>{css}</style>

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Employee Management</div>
          <div className="topbar-subtitle">
            {deptLabel ? `${deptLabel} department employees` : 'All employees'}
            {hubType && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: 6 }}>{hubType}</span>}
          </div>
        </div>
        <div className="topbar-spacer" />
        <button className="topbar-btn secondary" onClick={() => { fetchEmployees(); fetchTickets(); }} style={{ marginRight: 8 }}>
          <RefreshCw size={14} /> Refresh
        </button>
        <button className="topbar-btn" onClick={() => navigate('/users/add?role=employee')}
          style={{ background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', border: 'none' }}>
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Employees', value: employees.length, icon: <Users size={20} />, color: '#3b82f6' },
            { label: 'Active', value: totalActive, icon: <CheckCircle2 size={20} />, color: '#22c55e' },
            { label: 'Inactive', value: totalInactive, icon: <Briefcase size={20} />, color: '#94a3b8' },
            { label: 'Open Tickets', value: totalTickets, icon: <Ticket size={20} />, color: '#f59e0b' },
            { label: 'Completed', value: completedTickets, icon: <CheckCircle2 size={20} />, color: '#10b981' },
          ].map((c, i) => (
            <div className="emp-stat" key={i} style={{ animation: `fadeInScale 0.5s ease ${i * 0.07}s both` }}>
              <div className="emp-stat-icon" style={{ background: `${c.color}18`, color: c.color }}>{c.icon}</div>
              <div>
                <div className="emp-stat-label">{c.label}</div>
                <div className="emp-stat-value" style={{ color: c.color }}>{loading ? '…' : c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* toolbar */}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <div className="search-input" style={{ flex: 1, minWidth: 220 }}>
              <Search size={16} color="var(--text-light)" />
              <input type="text" placeholder="Search by name, email, designation, skills…" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="topbar-btn secondary" onClick={handleExportCSV} style={{ padding: '8px 14px', fontSize: 13, borderRadius: 10 }}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Designation</th>
                  <th>Workload</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading…</td></tr>
                  : filtered.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                        {employees.length === 0 ? `No employees found in the ${deptLabel || ''} vertical.` : 'No results match your search.'}
                      </td></tr>
                    : filtered.map(emp => <EmpRow key={emp._id} emp={emp} />)
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          VIEW EMPLOYEE + WORKLOAD MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {modal === 'view' && selected && (() => {
        const s = ticketsByEmployee[String(selected._id)] || {};
        const empTickets = tickets.filter(t => String(t.assignedTo?._id || t.assignedTo) === String(selected._id));
        const active = empTickets.filter(t => t.status === 'active' || t.status === 'in_process');
        const done = empTickets.filter(t => t.status === 'completed');
        return (
          <div className="emp-modal-overlay" onClick={closeModal}>
            <div className="emp-modal emp-modal-lg" onClick={e => e.stopPropagation()}>
              <div className="emp-modal-header">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{selected.email} · {ROLE_LABEL[selected.role]}</div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={closeModal}><X size={20} /></button>
              </div>

              <div className="emp-modal-body" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
                {/* Left — profile */}
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 800, color: '#fff',
                      background: `hsl(${(selected.name?.charCodeAt(0) || 65) * 7 % 360}, 60%, 55%)`
                    }}>
                      {(selected.name || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selected.designation || 'No designation'}</div>
                    <div style={{ marginTop: 8 }}>
                      {selected.is_active === false ? <Badge color="#ef4444">Inactive</Badge> : <Badge color="#22c55e">Active</Badge>}
                    </div>
                  </div>

                  <div className="emp-section-title">PROFILE</div>
                  {[
                    ['Department', selected.department || '—'],
                    ['Phone', selected.phone || '—'],
                    ['Username', selected.username || '—'],
                    ['Specialization', selected.specialization || '—'],
                  ].map(([l, v]) => (
                    <div className="emp-detail-row" key={l}>
                      <span className="emp-detail-label">{l}</span>
                      <span className="emp-detail-value">{v}</span>
                    </div>
                  ))}

                  {selected.skills && (
                    <div style={{ marginTop: 16 }}>
                      <div className="emp-section-title">SKILLS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selected.skills.split(',').map(s => s.trim()).filter(Boolean).map(sk => (
                          <Badge key={sk} color="#3b82f6">{sk}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right — workload */}
                <div>
                  <div className="emp-section-title">WORKLOAD SUMMARY</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                    {[
                      { label: 'Active', value: s.active || 0, color: '#f59e0b' },
                      { label: 'In Process', value: s.inProcess || 0, color: '#3b82f6' },
                      { label: 'Completed', value: s.completed || 0, color: '#22c55e' },
                    ].map(c => (
                      <div key={c.label} style={{ background: `${c.color}10`, border: `1px solid ${c.color}30`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 850, color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Active tickets */}
                  <div className="emp-section-title">ACTIVE TICKETS ({active.length})</div>
                  {active.length === 0
                    ? <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>No active tickets assigned.</div>
                    : active.slice(0, 5).map(t => (
                      <div className="emp-ticket-card" key={t._id}>
                        <Loader2 size={16} color="#f59e0b" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.service}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {t.client?.name || 'Unknown client'} · {t.hubType}
                          </div>
                        </div>
                        <Badge color={t.status === 'in_process' ? '#3b82f6' : '#f59e0b'}>
                          {t.status === 'in_process' ? 'In Process' : 'Active'}
                        </Badge>
                      </div>
                    ))}

                  {/* Completed tickets */}
                  <div className="emp-section-title" style={{ marginTop: 20 }}>COMPLETED TASKS ({done.length})</div>
                  {done.length === 0
                    ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No completed tickets yet.</div>
                    : done.slice(0, 5).map(t => (
                      <div className="emp-ticket-card" key={t._id}>
                        <CheckCircle2 size={16} color="#22c55e" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{t.service}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.client?.name || 'Unknown client'}</div>
                        </div>
                        <Badge color="#22c55e">Done</Badge>
                      </div>
                    ))}
                </div>
              </div>

              <div className="emp-modal-footer">
                <button className="emp-btn emp-btn-danger" onClick={() => handleDelete(selected)}><Trash2 size={14} /> Delete</button>
                <button className="emp-btn emp-btn-secondary" onClick={closeModal}>Close</button>
                <button className="emp-btn emp-btn-primary" onClick={() => { closeModal(); openAssign(selected); }}><Ticket size={14} /> Assign Ticket</button>
                <button className="emp-btn emp-btn-primary" onClick={() => { closeModal(); openEdit(selected); }}><Edit2 size={14} /> Edit</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════════
          ASSIGN TICKET MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {modal === 'assign' && selected && (
        <div className="emp-modal-overlay" onClick={closeModal}>
          <div className="emp-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="emp-modal-header">
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Assign Ticket</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>to {selected.name}</div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="emp-modal-body">
              <div style={{ marginBottom: 20 }}>
                <label className="emp-form-label">Select Unassigned Ticket ({hubType || 'Any Hub'})</label>
                <select
                  className="emp-select"
                  value={assignForm.ticketId}
                  onChange={e => setAssignForm(p => ({ ...p, ticketId: e.target.value }))}
                >
                  <option value="">— Choose a ticket —</option>
                  {unassignedTickets.length === 0
                    ? <option disabled>No unassigned tickets in {hubType || 'your hub'}</option>
                    : unassignedTickets.map(t => (
                      <option key={t._id} value={t._id}>
                        #{t.ticketNo || new Date(t.createdAt).getTime()} · {t.service} · {t.client?.name || 'Unknown'} [{t.priority}]
                      </option>
                    ))}
                </select>
              </div>

              {assignForm.ticketId && (() => {
                const t = unassignedTickets.find(x => x._id === assignForm.ticketId);
                if (!t) return null;
                return (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--text)' }}>{t.service}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Client: <b style={{ color: 'var(--text)' }}>{t.client?.name || '—'}</b></span>
                      <span>Hub: <b style={{ color: 'var(--text)' }}>{t.hubType}</b></span>
                      <span>Priority: <b style={{ color: t.priority === 'urgent' || t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#3b82f6' }}>{t.priority}</b></span>
                      <span>Due: <b style={{ color: 'var(--text)' }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB') : '—'}</b></span>
                    </div>
                  </div>
                );
              })()}

              <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <ChevronRight size={16} color="var(--accent-green)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  This ticket will be assigned to <b style={{ color: 'var(--text)' }}>{selected.name}</b>. Their current workload: {((ticketsByEmployee[String(selected._id)]?.active || 0) + (ticketsByEmployee[String(selected._id)]?.inProcess || 0))} active tickets.
                </div>
              </div>
            </div>
            <div className="emp-modal-footer">
              <button className="emp-btn emp-btn-secondary" onClick={closeModal}>Cancel</button>
              <button
                className="emp-btn emp-btn-primary"
                onClick={handleAssignTicket}
                disabled={!assignForm.ticketId || assigning}
              >
                {assigning ? <><Loader2 size={14} /> Assigning…</> : <><Ticket size={14} /> Assign Ticket</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          EDIT EMPLOYEE MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {modal === 'edit' && editForm && (
        <div className="emp-modal-overlay" onClick={closeModal}>
          <div className="emp-modal" onClick={e => e.stopPropagation()}>
            <div className="emp-modal-header">
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
                Edit — {editForm.name}
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="emp-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['FULL NAME', 'name', 'text'],
                  ['USERNAME', 'username', 'text'],
                  ['EMAIL', 'email', 'email'],
                  ['PHONE', 'phone', 'text'],
                  ['DEPARTMENT', 'department', 'text'],
                  ['DESIGNATION', 'designation', 'text'],
                  ['SPECIALIZATION', 'specialization', 'text'],
                  ['SKILLS (comma-separated)', 'skills', 'text'],
                ].map(([label, field, type]) => (
                  <div key={field} style={field === 'skills' ? { gridColumn: '1/-1' } : {}}>
                    <label className="emp-form-label">{label}</label>
                    <input
                      type={type}
                      className="emp-input"
                      value={editForm[field] || ''}
                      onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="emp-form-label">ACCESS ROLE</label>
                  <select className="emp-select" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="employee">Employee</option>
                    <option value="team">Team</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="emp-form-label">STATUS</label>
                  <select className="emp-select" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="emp-modal-footer">
              <button className="emp-btn emp-btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="emp-btn emp-btn-primary" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeManagement;

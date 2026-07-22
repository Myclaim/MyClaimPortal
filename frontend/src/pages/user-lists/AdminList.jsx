import React, { useEffect, useMemo, useState } from 'react';
import { UserCircle, Search, Download, Eye, Edit2, Trash2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ADMIN_ROLES = ['super_admin', 'admin', 'claim_admin', 'service_admin', 'store_admin', 'team'];

const AdminList = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeModal, setActiveModal] = useState(null);
  const [activeAdmin, setActiveAdmin] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const openViewAdmin = (user) => {
    setActiveAdmin(user);
    setActiveModal('view_admin');
  };

  const openEditAdmin = (user) => {
    setActiveAdmin(user);
    setEditForm({
      ...user,
      _id: user._id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      username: user.username || '',
      department: user.department || '',
      role: user.role || 'admin',
      status: user.is_active === false ? 'inactive' : 'active',
    });
    setActiveModal('edit_admin');
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveAdmin(null);
    setEditForm(null);
  };

  const handleSaveAdmin = async () => {
    if (!editForm?._id) return;
    setSavingEdit(true);
    try {
      const payload = {
        ...editForm,
        is_active: editForm.status !== 'inactive',
      };
      const { data } = await api.patch(`/users/${editForm._id}`, payload);
      setAdmins((prev) => prev.map((a) => (String(a._id) === String(data._id) ? { ...a, ...data } : a)));
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update admin');
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setAdmins(data.filter((u) => ADMIN_ROLES.includes(u.role)));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    let result = admins;
    if (statusFilter === 'active') result = result.filter((u) => u.is_active !== false);
    if (statusFilter === 'inactive') result = result.filter((u) => u.is_active === false);
    const q = query.trim().toLowerCase();
    if (!q) return result;
    return result.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const department = (u.department || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        username.includes(q) ||
        phone.includes(q) ||
        department.includes(q) ||
        role.includes(q) ||
        String(u._id || '').slice(-6).toLowerCase().includes(q)
      );
    });
  }, [admins, query]);

  const handleDeleteAdmin = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      setAdmins((prev) => prev.filter((a) => String(a._id) !== String(user._id)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return alert('No admins to export');
    const headers = ['ID', 'Name', 'Username', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Created'];
    const rows = filtered.map(u => [
      u.client_id_ref || u._id,
      u.name,
      u.username,
      u.email,
      u.phone || '',
      u.department || '',
      u.role,
      u.is_active === false ? 'Inactive' : 'Active',
      new Date(u.createdAt).toLocaleDateString('en-GB')
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admins_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const UserRow = ({ user }) => (
    <tr style={{ cursor: 'pointer' }}>
      <td>
        <b style={{ color: 'var(--blue)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{user.client_id_ref || String(user._id).slice(-6).toUpperCase()}</b>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar">
            {user.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{user.name}</div>
          </div>
        </div>
      </td>
      <td style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 500 }}>
        {user.username || <span style={{ color: 'var(--text-muted)' }}>—</span>}
      </td>
      <td style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '13px' }}>{user.email}</td>
      <td style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{user.phone || '—'}</td>
      <td style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{user.department || '—'}</td>
      <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>{(user.role || '—').replace(/_/g, ' ')}</td>
      <td>
        {user.is_active === false ? (
          <span className="custom-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Inactive</span>
        ) : (
          <span className="custom-badge badge-green badge-dot">Active</span>
        )}
      </td>
      <td style={{ fontSize: '13px', color: 'var(--text-light)' }}>{new Date(user.createdAt).toLocaleDateString('en-GB')}</td>
      <td>
        <div className="action-icons">
          <button type="button" className="action-icon" title="View admin" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openViewAdmin(user); }}>
            <Eye size={16} />
          </button>
          <button type="button" className="action-icon" title="Edit admin" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditAdmin(user); }}>
            <Edit2 size={16} />
          </button>
          <button type="button" className="action-icon" title="Delete admin" style={{ color: '#ef4444' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteAdmin(user); }}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="topbar">
        <div>
          <div className="topbar-title">Admin List</div>
          <div className="topbar-subtitle">View & filter Admin-type users</div>
        </div>
        <div className="topbar-spacer"></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="topbar-btn secondary" onClick={() => navigate('/users/add?role=super_admin')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
             <Plus size={14} /> Add Super Admin
          </button>
          <button className="topbar-btn" onClick={() => navigate('/users/add?role=admin')} style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', border: 'none' }}>
             <Plus size={14} /> Add Admin
          </button>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div className="stats-row cols-3" style={{ marginBottom: '24px' }}>
          <div className="stat-card active-border" style={{ cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}>
              <UserCircle size={22} />
            </div>
            <div className="stat-label">Admins</div>
            <div className="stat-value">{loading ? '...' : admins.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <div className="search-input" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={16} color="var(--text-light)" />
              <input
                type="text"
                placeholder="Search by name, email, username, phone, ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: '130px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button 
              className="topbar-btn secondary" 
              onClick={handleExport}
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 8, height: '38px', borderRadius: '10px' }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Department</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((u) => <UserRow key={u._id} user={u} />)
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      {loading ? 'Loading...' : 'No admins found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Admin Modal */}
      <div
        className={`modal-overlay ${activeModal !== null ? 'open' : ''}`}
        onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal(); }}
      >
        {activeModal === 'view_admin' && activeAdmin && (
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '980px', width: '95%', background: 'transparent', padding: 0, boxShadow: 'none' }} onClick={(e) => e.stopPropagation()}>
            <style>{`
              .va-wrap { padding: 36px 40px; background: #fff; border-radius: 18px; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
              .va-grid { display: grid; grid-template-columns: 280px 1fr; gap: 48px; }
              .va-section-title { font-size: 11.5px; font-weight: 800; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
              .va-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
              .va-row:last-child { border-bottom: none; }
              .va-label { color: #64748b; font-size: 13.5px; font-weight: 600; }
              .va-value { color: #0f172a; font-weight: 800; font-size: 13.5px; text-align: right; }
              .va-value.blue { color: #2563eb; }
              .va-pill { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; white-space: nowrap; }
              .va-pill.blue-light { background: #e0e7ff; color: #3b82f6; }
              .va-pill.green-light { background: #dcfce7; color: #10b981; }
              .va-pill.gray-light { background: #f1f5f9; color: #64748b; }
              
              .va-toggle-wrap { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; transition: box-shadow 0.2s; }
              .va-toggle-wrap:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
              .va-toggle-label { font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.3; }
              .va-toggle { position: relative; width: 44px; height: 26px; appearance: none; background: #e2e8f0; outline: none; border-radius: 20px; transition: 0.3s; cursor: pointer; flex-shrink: 0; margin: 0; }
              .va-toggle:checked { background: #3b82f6; }
              .va-toggle::before { content: ''; position: absolute; width: 20px; height: 20px; border-radius: 50%; top: 3px; left: 3px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: 0.3s; }
              .va-toggle:checked::before { transform: translateX(18px); }
              
              .va-perm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 32px; }
              .va-sidebar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
              
              .va-activity-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
              .va-activity-item { display: flex; gap: 12px; align-items: flex-start; }
              .va-activity-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
              .va-activity-dot.blue { background: #2563eb; }
              .va-activity-dot.green { background: #10b981; }
              .va-activity-text { font-size: 13.5px; color: #334155; font-weight: 500; line-height: 1.4; }
              .va-activity-text a { color: #3b82f6; text-decoration: none; font-weight: 600; }
              .va-activity-time { font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 500; }
              
              .va-footer { display: flex; justify-content: flex-end; align-items: center; gap: 12px; padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 36px; }
              .va-btn { padding: 11px 24px; border-radius: 8px; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; border: none; font-family: inherit; }
              .va-btn.red-outline { background: #fff; border: 1.5px solid #ef4444; color: #ef4444; }
              .va-btn.red-outline:hover { background: #fef2f2; }
              .va-btn.gray-outline { background: #fff; border: 1.5px solid #e2e8f0; color: #0f172a; }
              .va-btn.gray-outline:hover { background: #f8fafc; }
              .va-btn.blue-solid { background: #3b82f6; color: #fff; box-shadow: 0 4px 12px rgba(59,130,246,0.25); }
              .va-btn.blue-solid:hover { background: #2563eb; }
              
              .va-select { padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; font-weight: 700; color: #0f172a; background: #fff; outline: none; cursor: pointer; font-family: inherit; }
              .va-select:focus { border-color: #3b82f6; }
            `}</style>
            
            <div className="va-wrap" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="va-grid">
                
                {/* Left Column */}
                <div>
                  <div className="va-section-title">GENERAL INFORMATION</div>
                  <div style={{ marginBottom: 32 }}>
                    <div className="va-row">
                      <span className="va-label">User ID</span>
                      <span className="va-value">{activeAdmin.client_id_ref || String(activeAdmin._id).slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">User Name</span>
                      <span className="va-value">{activeAdmin.username || activeAdmin.name.split(' ')[0]}</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Email</span>
                      <span className="va-value blue">{activeAdmin.email}</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Phone</span>
                      <span className="va-value">{activeAdmin.phone || '—'}</span>
                    </div>
                    <div className="va-row" style={{ alignItems: 'flex-start', paddingTop: 16 }}>
                      <span className="va-label" style={{ marginTop: 6 }}>User<br/>Category</span>
                      <span className="va-pill blue-light" style={{ textTransform: 'capitalize' }}>
                        {activeAdmin.role?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Department</span>
                      <span className="va-value">{activeAdmin.department || '—'}</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Created Date</span>
                      <span className="va-value">{activeAdmin.createdAt ? new Date(activeAdmin.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                    </div>
                  </div>

                  <div className="va-section-title">ACCOUNT CONTROL</div>
                  <div style={{ marginBottom: 32 }}>
                    <div className="va-row">
                      <span className="va-label">Account<br/>Status</span>
                      <select className="va-select" defaultValue={activeAdmin.is_active !== false ? 'Active' : 'Inactive'}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="va-section-title">LOGIN & SECURITY</div>
                  <div>
                    <div className="va-row" style={{ alignItems: 'flex-start' }}>
                      <span className="va-label" style={{ marginTop: 4 }}>Login<br/>Method</span>
                      <span className="va-value">Password +<br/>OTP</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">2FA Status</span>
                      <span className="va-pill green-light">Enabled</span>
                    </div>
                    <div className="va-row" style={{ alignItems: 'flex-start', paddingTop: 16 }}>
                      <span className="va-label" style={{ marginTop: 4 }}>First Password<br/>Change</span>
                      <span className="va-value">Dec 01,<br/>2023</span>
                    </div>
                    <div className="va-row" style={{ alignItems: 'flex-start' }}>
                      <span className="va-label" style={{ marginTop: 4 }}>Last Password<br/>Change</span>
                      <span className="va-value">Mar 10,<br/>2026</span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                    <div className="va-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>PERMISSIONS</div>
                    <span className="va-pill gray-light" style={{ fontSize: '12px' }}>Role: {activeAdmin.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  
                  <div className="va-perm-grid">
                    {[
                      { label: 'Create Leads', on: true },
                      { label: 'Assign Tasks', on: true },
                      { label: 'View Reports', on: true },
                      { label: 'Approve Agreements', on: true },
                      { label: 'Upload Documents', on: true },
                      { label: 'Manage Commission', on: true },
                      { label: 'Delete Users', on: true },
                      { label: 'System Settings', on: true },
                      { label: 'Access Billing', on: false },
                      { label: 'View All Clients', on: true },
                    ].map((p, i) => (
                      <div className="va-toggle-wrap" key={i}>
                        <span className="va-toggle-label">{p.label.split(' ').map((w, j) => <React.Fragment key={j}>{w}<br/></React.Fragment>)}</span>
                        <input type="checkbox" className="va-toggle" defaultChecked={p.on} />
                      </div>
                    ))}
                  </div>

                  <div className="va-section-title" style={{ marginTop: 40 }}>SIDEBAR ACCESS CONTROLS</div>
                  <div className="va-sidebar-grid">
                    {[
                      { label: 'Dashboard', on: true },
                      { label: 'Lead Centre', on: true },
                      { label: 'Activity Log', on: true },
                      { label: 'Client List', on: true },
                      { label: 'Task Board', on: true },
                      { label: 'Store Hub', on: false },
                    ].map((p, i) => (
                      <div className="va-toggle-wrap" key={i}>
                        <span className="va-toggle-label">{p.label}</span>
                        <input type="checkbox" className="va-toggle" defaultChecked={p.on} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div style={{ marginTop: '24px' }}>
                <div className="va-section-title">RECENT ACTIVITY</div>
                <div className="va-activity-list">
                  <div className="va-activity-item">
                    <div className="va-activity-dot blue"></div>
                    <div>
                      <div className="va-activity-text">Sent agreement to <a href="#">Sharma Enterprises</a></div>
                      <div className="va-activity-time">2 hours ago</div>
                    </div>
                  </div>
                  <div className="va-activity-item">
                    <div className="va-activity-dot blue"></div>
                    <div>
                      <div className="va-activity-text">Uploaded documents for <a href="#">Mehta & Sons</a></div>
                      <div className="va-activity-time">Yesterday, 4:30 PM</div>
                    </div>
                  </div>
                  <div className="va-activity-item">
                    <div className="va-activity-dot green"></div>
                    <div>
                      <div className="va-activity-text">Completed RTA follow-up for <a href="#">Global Tech Solutions</a></div>
                      <div className="va-activity-time">Mar 08, 2:15 PM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="va-footer">
                <button className="va-btn red-outline" onClick={() => { closeModal(); handleDeleteAdmin(activeAdmin); }}>
                  <span style={{ fontSize: 16 }}>⊘</span> Deactivate User
                </button>
                <button className="va-btn gray-outline" onClick={closeModal}>
                  Close
                </button>
                <button className="va-btn blue-solid" onClick={() => { closeModal(); openEditAdmin(activeAdmin); }}>
                  <Edit2 size={15} /> Edit User
                </button>
              </div>

            </div>
          </div>
        )}
        {activeModal === 'edit_admin' && editForm && (
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '760px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize: '20px' }}>
                Edit Admin — {(editForm.client_id_ref || editForm._id || '').toString().slice(-6).toUpperCase()}
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: '16px' }}>PERSONAL DETAILS</div>
              <div className="form-row cols-2">
                <div className="form-group">
                  <span className="form-label text-gray">FULL NAME</span>
                  <input className="form-input" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                </div>
                <div className="form-group">
                  <span className="form-label text-gray">USERNAME</span>
                  <input className="form-input" value={editForm.username} onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                </div>
              </div>
              <div className="form-row cols-2" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <span className="form-label text-gray">EMAIL</span>
                  <input type="email" className="form-input" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                </div>
                <div className="form-group">
                  <span className="form-label text-gray">PHONE</span>
                  <input className="form-input" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                </div>
              </div>
              <div className="form-row cols-2" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <span className="form-label text-gray">DEPARTMENT</span>
                  <input className="form-input" value={editForm.department || ''} onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                </div>
                <div className="form-group">
                  <span className="form-label text-gray">ROLE</span>
                  <select className="form-select" value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="claim_admin">Claim Admin</option>
                    <option value="service_admin">Service Admin</option>
                    <option value="store_admin">Store Admin</option>
                    <option value="team">Team</option>
                  </select>
                </div>
              </div>
              <div className="form-row cols-2" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <span className="form-label text-gray">STATUS</span>
                  <select className="form-select" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ background: 'var(--card)', padding: '20px 24px' }}>
              <button className="topbar-btn secondary" onClick={closeModal} style={{ borderRadius: 8, padding: '10px 22px' }} disabled={savingEdit}>
                Cancel
              </button>
              <button className="topbar-btn" onClick={handleSaveAdmin} style={{ borderRadius: 8, padding: '10px 22px' }} disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminList;


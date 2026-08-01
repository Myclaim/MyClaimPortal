import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, CheckCircle2, FileVideo, Eye, Edit2, Search, X, Loader, ActivitySquare, Ban, Paperclip } from 'lucide-react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const API = import.meta.env.VITE_API_URL || 'https://myclaimportal.onrender.com/api';

// Module-level SWR cache — persists across navigations
let _proposalsCache = null;
let _proposalsCacheTime = 0;
let _usersCache = null;
const PROPOSALS_TTL = 3 * 60 * 1000;

const Proposals = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [activeLeadId, setActiveLeadId] = useState(null); // Reusing ID state
  const [activeTab, setActiveTab] = useState('All Proposals');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('Status');
  const [activePriority, setActivePriority] = useState('Priority');

  const [realProposals, setRealProposals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // File upload ref
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form State for Add Proposal
  const [formData, setFormData] = useState({
    clientName: '',
    serviceRequest: '',
    category: '',
    priority: 'Medium',
    sendToUserType: 'Admin',
    assignedTo: '',
    assignUserName: '',
    superPartner: '',
    partner: '',
    admin: '',
    status: 'Draft',
    notes: ''
  });

  const handleAddProposal = async () => {
    if (!formData.clientName || !formData.serviceRequest) {
      alert('Please fill in the required fields: Client Name and Service Request.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        fd.append(key, formData[key]);
      });
      
      if (selectedFile) {
        fd.append('attachment', selectedFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      const { data } = await axios.post(`${API}/proposals`, fd, config);
      
      setRealProposals([data, ...realProposals]);
      setFormData({ 
        clientName: '', serviceRequest: '', category: '', priority: 'Medium', 
        sendToUserType: 'Admin', assignedTo: '', assignUserName: '', superPartner: '', 
        partner: '', admin: '', status: 'Draft', notes: '' 
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveModal(null);
    } catch (error) {
      console.error('Failed to create proposal:', error.response?.data?.message || error.message);
      alert(`Failed to add proposal: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async (silent = false) => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        if (!_usersCache) {
          const [propsRes, usersRes] = await Promise.all([
            axios.get(`${API}/proposals`, config),
            axios.get(`${API}/users`, config)
          ]);
          _proposalsCache = propsRes.data;
          _proposalsCacheTime = Date.now();
          _usersCache = usersRes.data;
          setRealProposals(propsRes.data);
          setUsers(usersRes.data);
        } else {
          const propsRes = await axios.get(`${API}/proposals`, config);
          _proposalsCache = propsRes.data;
          _proposalsCacheTime = Date.now();
          setRealProposals(propsRes.data);
          setUsers(_usersCache);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    if (user && user.token) {
      if (_proposalsCache && (Date.now() - _proposalsCacheTime) < PROPOSALS_TTL) {
        setRealProposals(_proposalsCache);
        if (_usersCache) setUsers(_usersCache);
        setLoading(false);
        fetchData(true); // background refresh
      } else {
        fetchData(false);
      }
    }
  }, [user]);

  const closeModal = () => {
    setActiveModal(null);
    setActiveLeadId(null);
    setEditForm(null);
    setSelectedFile(null);
  };

  const handleExport = () => {
    if (filteredProposals.length === 0) {
      alert("No proposals to export.");
      return;
    }
    
    const headers = [
      "Proposal ID", "Client Name", "Service", "Category", "Date", 
      "Status", "Assigned To", "Role", "Priority", "Attachment"
    ];
    
    const rows = filteredProposals.map(prop => [
      prop.id,
      prop.clientName,
      prop.serviceRequest,
      prop.category,
      prop.date,
      prop.status,
      prop.sendToName,
      prop.sendTo,
      prop.priority,
      prop.attachment
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `proposals_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAttachment = (path) => {
    if (!path || path === '+ Attach') return;
    try {
      window.open(`${new URL(API).origin}${path}`, '_blank');
    } catch {
      window.open(path, '_blank');
    }
  };

  const openViewProposal = (id) => {
    setActiveLeadId(id);
    setActiveModal('view_proposal');
  };

  const openEditProposal = (id) => {
    const raw = realProposals.find(p => String(p._id) === String(id));
    if (!raw) return;
    setEditForm({
      mongoId: id,
      clientName: raw.clientName,
      serviceRequest: raw.serviceRequest,
      category: raw.category || '',
      priority: raw.priority || 'Medium',
      sendToUserType: raw.sendToUserType || 'Admin',
      assignedTo: raw.assignedTo?._id || '',
      superPartner: raw.superPartner || '',
      partner: raw.partner || '',
      admin: raw.admin || '',
      status: raw.status || 'Draft',
      notes: raw.notes || ''
    });
    setActiveModal('edit_proposal');
  };

  const handleSaveEditProposal = async () => {
    if (!editForm || !user?.token) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(editForm).forEach(key => {
        if (key !== 'mongoId') fd.append(key, editForm[key]);
      });
      if (selectedFile) fd.append('attachment', selectedFile);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      const { data } = await axios.patch(`${API}/proposals/${editForm.mongoId}`, fd, config);
      setRealProposals(prev => prev.map(p => String(p._id) === String(data._id) ? data : p));
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Failed to save proposal');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute Stats from realProposals
  const totalProposals = realProposals.length;
  const activeProposals = realProposals.filter(p => p.status === 'Active').length || 0;
  const convertedProposals = realProposals.filter(p => p.status === 'Converted').length || 0;
  const underReviewProposals = realProposals.filter(p => p.status === 'Under Review').length || 0;
  const deadProposals = realProposals.filter(p => p.status === 'Not Interested').length || 0;

  const proposalsData = realProposals.map((p, index) => ({
    mongoId: p._id,
    id: `PR-${String(p._id).slice(-4).toUpperCase()}`,
    clientName: p.clientName,
    initials: p.clientName.substring(0, 2).toUpperCase(),
    avatarBg: p.status === 'Converted' ? '#10b981' : (p.status === 'Active' ? '#166534' : '#8b5cf6'),
    serviceRequest: p.serviceRequest,
    category: p.category || 'New Business',
    date: new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: p.status,
    sendTo: p.sendToUserType,
    sendToName: p.assignedTo?.name || p.assignUserName || 'Unknown',
    superPartner: p.superPartner || '—',
    partner: p.partner || '—',
    admin: p.admin || '—',
    priority: p.priority || 'Medium',
    attachment: p.attachmentPath ? p.attachmentPath.split('/').pop() : 'No File',
    attachmentPath: p.attachmentPath
  }));

  const getBadgeStyle = (value) => {
    switch(value) {
      case 'Physical Shares': return {background:'rgba(168,85,247,0.15)', color:'#d8b4fe', border:'1px solid rgba(168,85,247,0.3)'};
      case 'New Business': return {background:'rgba(59,130,246,0.15)', color:'#93c5fd', border:'1px solid rgba(59,130,246,0.3)'};
      case 'Taxation': return {background:'rgba(20,184,166,0.15)', color:'#5eead4', border:'1px solid rgba(20,184,166,0.3)'};
      case 'High': return {background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)'};
      case 'Medium': return {background:'rgba(245,158,11,0.15)', color:'#fcd34d', border:'1px solid rgba(245,158,11,0.3)'};
      case 'Low': return {background:'rgba(148,163,184,0.1)', color:'var(--text-muted)', border:'1px solid var(--border)'};
      case 'Active': return {background:'rgba(16,185,129,0.15)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)'};
      case 'Under Review': return {background:'rgba(250,204,21,0.15)', color:'#fde047', border:'1px solid rgba(250,204,21,0.3)'};
      case 'Converted': return {background:'rgba(34,197,94,0.15)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.3)', fontWeight:700};
      default: return {background:'var(--bg)', color:'var(--text-muted)', border:'1px solid var(--border)'};
    }
  };

  const filteredProposals = proposalsData.filter(prop => {
    if (activeStatus !== 'Status' && prop.status !== activeStatus) return false;
    if (activePriority !== 'Priority' && prop.priority !== activePriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!prop.clientName.toLowerCase().includes(q) && !prop.serviceRequest.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectedProposalRaw = activeLeadId ? realProposals.find(p => String(p._id) === String(activeLeadId)) : null;

  return (
    <div className="page active" style={{display:'block'}}>
      <div className="page active" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="topbar" style={{background:'var(--card)', borderBottom:'1px solid var(--border)', height:'auto', minHeight:'72px', padding:'16px 20px', flexWrap:'wrap', gap:'12px'}}>
          <div>
            <div className="topbar-title" style={{color:'var(--text)', fontSize:'20px', fontWeight:700, letterSpacing:'-0.5px'}}>Proposal Centre</div>
            <div className="topbar-subtitle" style={{color:'var(--text-muted)', fontSize:'13px', marginTop:'2px'}}>Create, send & track proposals across all channels</div>
          </div>
          <div className="topbar-spacer"></div>
          <div style={{display:'flex', gap:'8px', flexShrink:0}}>
            <button className="topbar-btn secondary" onClick={handleExport} style={{background:'var(--card)', borderColor:'var(--border)', color:'var(--text)'}} onMouseOver={(e)=>e.currentTarget.style.background='var(--sidebar-hover)'} onMouseOut={(e)=>e.currentTarget.style.background='var(--card)'}>
              <Download size={14} /> <span className="btn-text">Export</span>
            </button>
            <button className="topbar-btn" onClick={() => setActiveModal('add_proposal')} style={{background:'linear-gradient(135deg, #0f766e 0%, #22c55e 100%)', color:'#fff'}}>
              <Plus size={14} /> <span className="btn-text">Create Proposal</span>
            </button>
          </div>
        </div>
        
        <div className="content" style={{padding:'20px 16px', flex:1, overflowY:'auto'}}>
          <div className="stats-row cols-4" style={{marginBottom:'24px'}}>
            <div className="stat-card">
               <ActivitySquare size={24} color="#10b981" />
               <div><div className="text-muted">Active</div><div className="text-primary">{loading ? '...' : activeProposals}</div></div>
            </div>
            <div className="stat-card">
               <CheckCircle2 size={24} color="#f8fafc" />
               <div><div className="text-muted">Converted</div><div className="text-primary">{loading ? '...' : convertedProposals}</div></div>
            </div>
            <div className="stat-card">
               <Eye size={24} color="#fde047" />
               <div><div className="text-muted">Under Review</div><div className="text-primary">{loading ? '...' : underReviewProposals}</div></div>
            </div>
            <div className="stat-card">
               <Ban size={24} color="#ef4444" />
               <div><div className="text-muted">Closed</div><div className="text-primary">{loading ? '...' : deadProposals}</div></div>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
            <div className="search-input" style={{flex:1, background:'var(--card)', border:'1px solid var(--border)'}}>
              <Search size={16} color="#64748b" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{color:'var(--text)', background:'transparent', border:'none', width:'100%'}} />
            </div>
          </div>

          <div className="card" style={{padding:0, background:'var(--card)', border:'1px solid var(--border)'}}>
            <div className="table-wrap" style={{overflowX:'auto'}}>
              <table className="table" style={{minWidth:'1200px'}}>
                <thead>
                  <tr style={{background:'rgba(255,255,255,0.02)'}}>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Proposal ID</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Client</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Service</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Category</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Date</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Status</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Assigned To</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Priority</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>Attachment</th>
                    <th style={{padding:'16px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)', textAlign:'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="10" style={{textAlign:'center', padding:32}}><Loader className="spin" /></td></tr>
                  ) : filteredProposals.map((prop, i) => (
                    <tr key={prop.mongoId} style={{transition:'background 0.2s', borderBottom: i === filteredProposals.length - 1 ? 'none' : '1px solid var(--border)'}} onMouseOver={(e)=>e.currentTarget.style.background='rgba(34, 197, 94, 0.05)'} onMouseOut={(e)=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'16px'}}><span style={{background:'var(--blue-light)', color:'var(--blue)', border:'1px solid var(--border)', padding:'4px 8px', borderRadius:6}}>{prop.id}</span></td>
                      <td><div style={{display:'flex', alignItems:'center', gap:8}}><div className="avatar" style={{background:prop.avatarBg, width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff'}}>{prop.initials}</div>{prop.clientName}</div></td>
                      <td>{prop.serviceRequest}</td>
                      <td><span className="custom-badge" style={getBadgeStyle(prop.category)}>{prop.category}</span></td>
                      <td>{prop.date}</td>
                      <td><span className="custom-badge" style={getBadgeStyle(prop.status)}>{prop.status}</span></td>
                      <td><div>{prop.sendToName}</div><div style={{fontSize:10, color:'#64748b'}}>{prop.sendTo}</div></td>
                      <td><span className="custom-badge" style={getBadgeStyle(prop.priority)}>{prop.priority}</span></td>
                      <td>
                        <div 
                          style={{display:'flex', alignItems:'center', gap:4, color:'#60a5fa', cursor: prop.attachmentPath ? 'pointer' : 'default'}}
                          onClick={() => handleOpenAttachment(prop.attachmentPath)}
                        >
                          <FileVideo size={14} /> {prop.attachment}
                        </div>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-icon" onClick={() => openViewProposal(prop.mongoId)}><Eye size={14}/></button>
                          <button className="action-icon" onClick={() => openEditProposal(prop.mongoId)}><Edit2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <div 
        className={`modal-overlay ${activeModal !== null ? 'open' : ''}`} 
        onClick={(e) => { if(e.target.classList.contains('modal-overlay')) closeModal(); }}
        style={{zIndex: 9999, display: activeModal ? 'flex' : 'none'}}
      >
        {activeModal === 'add_proposal' && (
          <div className="modal" style={{ background: '#fff', maxWidth: '700px', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>Create Proposal</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Fill details to create a new proposal (Super Admin / Admin)</div>
              </div>
              <button 
                onClick={closeModal} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', background: '#fff' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>CLIENT NAME</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter client name"
                    value={formData.clientName} 
                    onChange={e => setFormData({...formData, clientName: e.target.value})} 
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>SERVICE REQUEST</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. IEPF Claim"
                    value={formData.serviceRequest} 
                    onChange={e => setFormData({...formData, serviceRequest: e.target.value})} 
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>SERVICE CATEGORY</label>
                  <select 
                    className="form-select" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="" style={{ color: '#0f172a', background: '#fff' }}>Select Category</option>
                    <option value="Physical Shares" style={{ color: '#0f172a', background: '#fff' }}>Physical Shares</option>
                    <option value="New Business" style={{ color: '#0f172a', background: '#fff' }}>New Business</option>
                    <option value="Taxation" style={{ color: '#0f172a', background: '#fff' }}>Taxation</option>
                    <option value="IEPF Claims" style={{ color: '#0f172a', background: '#fff' }}>IEPF Claims</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>PRIORITY</label>
                  <select 
                    className="form-select" 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="High" style={{ color: '#0f172a', background: '#fff' }}>High</option>
                    <option value="Medium" style={{ color: '#0f172a', background: '#fff' }}>Medium</option>
                    <option value="Low" style={{ color: '#0f172a', background: '#fff' }}>Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>SEND TO (USER TYPE)</label>
                  <select 
                    className="form-select" 
                    value={formData.sendToUserType} 
                    onChange={e => setFormData({...formData, sendToUserType: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="Admin" style={{ color: '#0f172a', background: '#fff' }}>Admin</option>
                    <option value="Partner" style={{ color: '#0f172a', background: '#fff' }}>Partner</option>
                    <option value="Super Partner" style={{ color: '#0f172a', background: '#fff' }}>Super Partner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>ASSIGN USER NAME</label>
                  <select 
                    className="form-select" 
                    value={formData.assignedTo} 
                    onChange={e => {
                      const selectedUserId = e.target.value;
                      const selectedUser = users.find(u => String(u._id) === String(selectedUserId));
                      const selectedName = selectedUser ? selectedUser.name : '';
                      
                      setFormData({
                        ...formData, 
                        assignedTo: selectedUserId,
                        assignUserName: selectedName,
                        partner: formData.sendToUserType === 'Partner' ? selectedName : formData.partner,
                        superPartner: formData.sendToUserType === 'Super Partner' ? selectedName : formData.superPartner,
                        admin: formData.sendToUserType === 'Admin' ? selectedName : formData.admin
                      });
                    }}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="" style={{ color: '#0f172a', background: '#fff' }}>Select user to send proposal</option>
                    {users.map(u => <option key={u._id} value={u._id} style={{ color: '#0f172a', background: '#fff' }}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>SUPER PARTNER (IF APPLICABLE)</label>
                  <select 
                    className="form-select" 
                    value={formData.superPartner} 
                    onChange={e => setFormData({...formData, superPartner: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="" style={{ color: '#0f172a', background: '#fff' }}>—</option>
                    {users.filter(u => u.role === 'super_partner').map(u => <option key={u._id} value={u.name} style={{ color: '#0f172a', background: '#fff' }}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>PARTNER (IF APPLICABLE)</label>
                  <select 
                    className="form-select" 
                    value={formData.partner} 
                    onChange={e => setFormData({...formData, partner: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="" style={{ color: '#0f172a', background: '#fff' }}>—</option>
                    {users.filter(u => u.role === 'partner').map(u => <option key={u._id} value={u.name} style={{ color: '#0f172a', background: '#fff' }}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>ADMIN</label>
                  <select 
                    className="form-select" 
                    value={formData.admin} 
                    onChange={e => setFormData({...formData, admin: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="" style={{ color: '#0f172a', background: '#fff' }}>Select Admin</option>
                    {users.filter(u => ['admin', 'super_admin'].includes(u.role)).map(u => <option key={u._id} value={u.name} style={{ color: '#0f172a', background: '#fff' }}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>STATUS</label>
                  <select 
                    className="form-select" 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="Draft" style={{ color: '#0f172a', background: '#fff' }}>Draft</option>
                    <option value="Sent" style={{ color: '#0f172a', background: '#fff' }}>Sent</option>
                    <option value="Under Review" style={{ color: '#0f172a', background: '#fff' }}>Under Review</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>ATTACHMENT</label>
                <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff' }}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    onChange={e => setSelectedFile(e.target.files[0])} 
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}
                  >
                    Choose file
                  </button>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>NOTES / DESCRIPTION</label>
                <textarea 
                  className="form-input" 
                  placeholder="Proposal notes..."
                  rows="4" 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, resize: 'none', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '24px 32px', background: '#fff', borderTop: '1.5px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={closeModal}
                style={{ padding: '12px 24px', borderRadius: '10px', border: '1.5px solid #edf2f7', background: '#fff', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProposal} 
                disabled={submitting}
                style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
              >
                {submitting ? 'Creating...' : 'Create & Send Proposal'}
              </button>
            </div>
          </div>
        )}

        {activeModal === 'edit_proposal' && editForm && (
          <div className="modal" style={{ background: '#fff', maxWidth: '700px', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>Edit Proposal</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Update existing proposal details</div>
              </div>
              <button 
                onClick={closeModal} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', background: '#fff' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>CLIENT NAME</label>
                  <input 
                    className="form-input" 
                    value={editForm.clientName} 
                    onChange={e => setEditForm({...editForm, clientName: e.target.value})} 
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>SERVICE REQUEST</label>
                  <input 
                    className="form-input" 
                    value={editForm.serviceRequest} 
                    onChange={e => setEditForm({...editForm, serviceRequest: e.target.value})} 
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>STATUS</label>
                  <select 
                    className="form-select" 
                    value={editForm.status} 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="Draft" style={{ color: '#0f172a', background: '#fff' }}>Draft</option>
                    <option value="Active" style={{ color: '#0f172a', background: '#fff' }}>Active</option>
                    <option value="Under Review" style={{ color: '#0f172a', background: '#fff' }}>Under Review</option>
                    <option value="Converted" style={{ color: '#0f172a', background: '#fff' }}>Converted</option>
                    <option value="Sent" style={{ color: '#0f172a', background: '#fff' }}>Sent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>PRIORITY</label>
                  <select 
                    className="form-select" 
                    value={editForm.priority} 
                    onChange={e => setEditForm({...editForm, priority: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="High" style={{ color: '#0f172a', background: '#fff' }}>High</option>
                    <option value="Medium" style={{ color: '#0f172a', background: '#fff' }}>Medium</option>
                    <option value="Low" style={{ color: '#0f172a', background: '#fff' }}>Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>ASSIGNED TO</label>
                  <select 
                    className="form-select" 
                    value={editForm.assignedTo} 
                    onChange={e => setEditForm({...editForm, assignedTo: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="" style={{ color: '#0f172a', background: '#fff' }}>Select User</option>
                    {users.map(u => <option key={u._id} value={u._id} style={{ color: '#0f172a', background: '#fff' }}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>ADMIN</label>
                  <select 
                    className="form-select" 
                    value={editForm.admin} 
                    onChange={e => setEditForm({...editForm, admin: e.target.value})}
                    style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, width: '100%' }}
                  >
                    <option value="" style={{ color: '#0f172a', background: '#fff' }}>Select Admin</option>
                    {users.filter(u => ['admin', 'super_admin'].includes(u.role)).map(u => <option key={u._id} value={u.name} style={{ color: '#0f172a', background: '#fff' }}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>ATTACHMENT</label>
                <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff' }}>
                  <input type="file" ref={fileInputRef} hidden onChange={e => setSelectedFile(e.target.files[0])} />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}
                  >
                    Update file
                  </button>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{selectedFile ? selectedFile.name : 'Choose new file to replace'}</span>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>NOTES / DESCRIPTION</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  value={editForm.notes} 
                  onChange={e => setEditForm({...editForm, notes: e.target.value})}
                  style={{ borderRadius: '10px', padding: '12px 16px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 600, resize: 'none', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '24px 32px', background: '#fff', borderTop: '1.5px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={closeModal}
                style={{ padding: '12px 24px', borderRadius: '10px', border: '1.5px solid #edf2f7', background: '#fff', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEditProposal} 
                disabled={submitting}
                style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeModal === 'view_proposal' && selectedProposalRaw && (
          <div className="modal" style={{background:'var(--card)', maxWidth:600}}>
             <div className="modal-header">
                <div style={{fontSize:18, fontWeight:700}}>Proposal Details</div>
                <button onClick={closeModal}><X size={18} /></button>
             </div>
             <div className="modal-body" style={{padding:24}}>
                <div style={{marginBottom:20}}>
                   <div style={{fontSize:12, color:'#64748b', fontWeight:700}}>CLIENT</div>
                   <div style={{fontSize:18, fontWeight:700}}>{selectedProposalRaw.clientName}</div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
                   <div>
                      <div style={{fontSize:10, color:'#64748b'}}>SERVICE</div>
                      <div>{selectedProposalRaw.serviceRequest}</div>
                   </div>
                   <div>
                      <div style={{fontSize:10, color:'#64748b'}}>CATEGORY</div>
                      <div>{selectedProposalRaw.category}</div>
                   </div>
                   <div>
                      <div style={{fontSize:10, color:'#64748b'}}>STATUS</div>
                      <span className="custom-badge" style={getBadgeStyle(selectedProposalRaw.status)}>{selectedProposalRaw.status}</span>
                   </div>
                   <div>
                      <div style={{fontSize:10, color:'#64748b'}}>ASSIGNED TO</div>
                      <div>{selectedProposalRaw.assignedTo?.name || '—'}</div>
                   </div>
                </div>
                <div style={{marginTop:20}}>
                   <div style={{fontSize:10, color:'#64748b'}}>NOTES</div>
                   <div style={{fontSize:14, color:'#334155', background:'#f8fafc', padding:12, borderRadius:8}}>{selectedProposalRaw.notes || 'No notes.'}</div>
                </div>
             </div>
             <div className="modal-footer">
                <button className="topbar-btn secondary" onClick={closeModal}>Close</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;

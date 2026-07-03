import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit2, Trash2, Download, Plus, X } from 'lucide-react';
import api from '../../services/api';

const getMockData = (idStr) => {
  const hash = idStr.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
  const positiveHash = Math.abs(hash);
  
  const serviceTypes = [
    { label: 'IEPF Claim', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Demat', color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Transmission', color: '#10b981', bg: '#dcfce7' },
    { label: 'GST Reg.', color: '#eab308', bg: '#fef9c3' }
  ];
  
  const categories = [
    { label: 'Physical Shares', color: '#a855f7', bg: '#f3e8ff' },
    { label: 'New Business', color: '#3b82f6', bg: '#eff6ff' }
  ];
  
  const departments = [
    { label: 'Claim', color: '#f97316', bg: '#fff7ed', icon: '✦' },
    { label: 'Service', color: '#0ea5e9', bg: '#e0f2fe', icon: '✦' }
  ];
  
  const assignedTo = [
    { name: 'Amit Kumar', code: 'EM01' },
    { name: 'Priya Sharma', code: 'AD01' },
    { name: 'Akash Verma', code: 'SA01' }
  ];
  
  const superPartners = [
    { name: 'Zerodha Corp', sub: 'Ravi Menon' },
    { name: 'Kapoor Consulting', sub: 'Sunita Kapoor' },
    { name: '—', sub: '' }
  ];
  
  const partners = [
    { name: 'Shah Associates', sub: 'Ankit Shah' },
    { name: 'FinPro Advisory', sub: 'Komal Mehta' },
    { name: '—', sub: '' }
  ];
  
  const createdBys = [
    { label: 'Partner', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Super Partner', color: '#a855f7', bg: '#f3e8ff' },
    { label: 'Direct / SA', color: '#64748b', bg: '#f1f5f9' }
  ];
  
  return {
    serviceType: serviceTypes[positiveHash % serviceTypes.length],
    category: categories[(positiveHash + 1) % categories.length],
    department: departments[(positiveHash + 2) % departments.length],
    assignedTo: assignedTo[(positiveHash + 3) % assignedTo.length],
    superPartner: superPartners[(positiveHash + 4) % superPartners.length],
    partner: partners[(positiveHash + 5) % partners.length],
    createdBy: createdBys[(positiveHash + 6) % createdBys.length],
  };
};

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'direct'
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeModal, setActiveModal] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [formData, setFormData] = useState({
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
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({}); // { docType: File }

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFiles(prev => ({ ...prev, [docType]: file }));
  };

  const uploadPendingFiles = async (userId) => {
    const entries = Object.entries(pendingFiles);
    if (entries.length === 0) return;
    setUploadingFiles(true);
    try {
      for (const [docType, file] of entries) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('docType', docType);
        await api.post('/users/kyc-upload', formData);
      }
      setPendingFiles({});
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploadingFiles(false);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/users');
        setClients(data.filter((u) => u.role === 'client'));
      } catch (e) {
        console.error('Failed to load clients', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    let list = clients;
    if (activeTab === 'direct') {
      list = list.filter((c) => c.relation === 'Direct' || c.relation === 'direct' || (c.createdBy || c.created_by) === 'Direct');
    }
    if (activeTab === 'super_partner') {
      list = list.filter((c) => (c.createdBy || c.created_by) === 'Super Partner');
    }
    if (activeTab === 'partner') {
      list = list.filter((c) => (c.createdBy || c.created_by) === 'Partner');
    }
    if (statusFilter === 'active') list = list.filter((c) => c.is_active !== false);
    if (statusFilter === 'inactive') list = list.filter((c) => c.is_active === false);
    if (serviceTypeFilter !== 'all') {
      list = list.filter((c) => (c.serviceType || c.service_type) === serviceTypeFilter);
    }
    if (departmentFilter !== 'all') {
      list = list.filter((c) => c.department === departmentFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const id = (c.client_id_ref || c._id || '').toString().toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        id.includes(q)
      );
    });
  }, [clients, activeTab, statusFilter, serviceTypeFilter, departmentFilter, query]);

  const openAddClient = () => {
    navigate('/clients/add');
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveClient(null);
    setEditForm(null);
    setCurrentStep(1);
    setPendingFiles({});
  };

  const openViewClient = (client) => {
    setActiveClient(client);
    setActiveModal('view_client');
  };

  const openEditClient = (client) => {
    setActiveClient(client);
    setEditForm({
      ...client,
      _id: client._id,
      client_id_ref: client.client_id_ref,
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      city: client.city || client.kyc_data?.address || '',
      status: client.is_active === false ? 'inactive' : 'active',
    });
    setActiveModal('edit_client');
  };

  const handleSaveClient = async () => {
    if (!editForm?._id) return;
    setSavingEdit(true);
    try {
      const payload = {
        ...editForm,
        is_active: editForm.status !== 'inactive',
      };
      const { data } = await api.patch(`/users/${editForm._id}`, payload);
      setClients((prev) => prev.map((c) => (String(c._id) === String(data._id) ? data : c)));
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update client');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateClient = async () => {
    if (!formData.name && !formData.firstName) {
      alert('Please fill in Name or First Name.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: formData.name || `${formData.firstName} ${formData.lastName}`.trim(),
        role: 'client'
      };

      const { data } = await api.post('/users/enrol', payload);
      const refreshed = await api.get('/users');
      setClients(refreshed.data.filter((u) => u.role === 'client'))
      // Upload any pending KYC files for the newly created client
      await uploadPendingFiles(data._id);
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${client._id}`);
      setClients((prev) => prev.filter((c) => String(c._id) !== String(client._id)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete client');
    }
  };

  const handleExport = () => {
    if (filteredClients.length === 0) {
      alert("No clients to export.");
      return;
    }
    
    const headers = ["Client ID", "Name", "Status", "Phone", "Email", "City", "Created At"];
    const rows = filteredClients.map(c => [
      c.client_id_ref || c._id,
      c.name,
      c.is_active === false ? "Inactive" : "Active",
      c.phone || "—",
      c.email,
      c.city || "—",
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `client_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ClientRow = ({ client }) => {
    const [isHovered, setIsHovered] = useState(false);
    const serviceType = client.serviceType || client.service_type;
    const category = client.category;
    const department = client.department;
    const assignedTo = client.assignedTo || client.assigned_to;
    const superPartner = client.superPartner || client.super_partner;
    const partner = client.partner;
    const createdBy = client.createdBy || client.created_by;

    return (
      <tr 
        style={{ cursor: 'pointer', background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent', transition: 'background 0.2s' }} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/clients/${client.client_id_ref || client._id}`)}
      >
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'var(--blue)', fontWeight: 700 }}>
            {client.client_id_ref || String(client._id).slice(-6).toUpperCase()}
          </span>
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar" style={{ background: '#f3e8ff', color: '#a855f7', width: 36, height: 36, fontSize: 13, fontWeight: 800 }}>
              {client.name?.substring(0, 2).toUpperCase() || 'NA'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--text)', lineHeight: '1.2' }}>{client.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>{client.city || 'Location Not Set'}</div>
            </div>
          </div>
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          {client.is_active === false ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>Inactive</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>Active</span>
            </div>
          )}
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{client.phone ? client.phone.replace(/(\+\d{2})\s?(\d{5})\s?(\d{5})/, '$1 $2 $3') : '—'}</div>
        </td>
        <td style={{ fontSize: '13px', color: 'var(--blue)', fontWeight: 600, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{client.email || '—'}</td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          {serviceType ? (
            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              {serviceType}
            </span>
          ) : '—'}
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          {category ? (
             <span style={{ background: '#f3e8ff', color: '#a855f7', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
               {category}
             </span>
          ) : '—'}
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          {department ? (
            <span style={{ background: '#fff7ed', color: '#f97316', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>✦</span> {department}
            </span>
          ) : '—'}
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{assignedTo || '—'}</div>
          </div>
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{superPartner || '—'}</div>
          </div>
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{partner || '—'}</div>
          </div>
        </td>
        <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          {createdBy ? (
            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              {createdBy}
            </span>
          ) : '—'}
        </td>
        <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
          {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </td>
      </tr>
    );
  };

  const directCount = clients.filter(c => c.relation === 'Direct' || c.relation === 'direct' || (c.createdBy || c.created_by) === 'Direct').length;
  const superPartnerCount = clients.filter(c => (c.createdBy || c.created_by) === 'Super Partner').length;
  const partnerCount = clients.filter(c => (c.createdBy || c.created_by) === 'Partner').length;
  const totalClients = clients.length;

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="topbar">
        <div>
          <div className="topbar-title">Client List</div>
          <div className="topbar-subtitle">
            All clients with service, department &amp; partner mapping
          </div>
        </div>
        <div className="topbar-spacer"></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="topbar-btn" onClick={openAddClient} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Client
          </button>
        </div>
      </div>
      <div className="content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['all', 'direct', 'super_partner', 'partner'].map((tab) => {
            const labels = {
              all: 'All Clients',
              direct: 'Direct (Our)',
              super_partner: 'Super Partner',
              partner: 'Partner'
            };
            const counts = {
              all: totalClients,
              direct: directCount,
              super_partner: superPartnerCount,
              partner: partnerCount
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 20px',
                  background: activeTab === tab ? 'var(--blue)' : 'var(--card)',
                  color: activeTab === tab ? '#fff' : 'var(--text-light)',
                  border: activeTab === tab ? 'none' : '1px solid var(--border)',
                  borderRadius: '24px',
                  fontFamily: "'Sora',sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: activeTab === tab ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
                }}
              >
                {labels[tab]}
                <span style={{ 
                  opacity: activeTab === tab ? 0.9 : 0.6, 
                  fontSize: '13px', 
                  fontWeight: 600,
                  color: activeTab === tab ? '#fff' : 'var(--text-muted)'
                }}>
                  {loading ? '...' : counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="stat-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>TOTAL CLIENTS</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>{loading ? '...' : totalClients}</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>ACTIVE CLAIMS</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>89</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>23 pending</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>AVG CLAIM VALUE</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>₹3.2L</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>SUCCESS RATE</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>78%</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>MULTI-SERVICE</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>34</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>Claim+Service</div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid var(--border)',
              flexWrap: 'wrap',
              background: 'transparent'
            }}
          >
            <div className="search-input" style={{ flex: 1, minWidth: '240px', background: 'var(--card)' }}>
              <Search size={16} color="var(--text-light)" />
              <input
                type="text"
                placeholder="Search by name, ID, phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ background: 'transparent' }}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '130px', background: 'var(--card)', color: 'var(--text)' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="form-select"
              style={{ width: '150px', background: 'var(--card)', color: 'var(--text)' }}
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
            >
              <option value="all">Service Type</option>
              <option value="IEPF Claim">IEPF Claim</option>
              <option value="Demat">Demat</option>
              <option value="Transmission">Transmission</option>
              <option value="GST Reg.">GST Reg.</option>
            </select>
            <select
              className="form-select"
              style={{ width: '140px', background: 'var(--card)', color: 'var(--text)' }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">Department</option>
              <option value="Claim">Claim</option>
              <option value="Service">Service</option>
            </select>
            <div className="export-btn" onClick={handleExport} style={{ background: 'var(--card)', color: 'var(--text)' }}>
              <Download size={14} /> Export CSV
            </div>
          </div>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '1400px' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>CLIENT ID</th>
                  <th style={{ whiteSpace: 'nowrap' }}>CLIENT NAME</th>
                  <th style={{ whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ whiteSpace: 'nowrap' }}>PHONE</th>
                  <th style={{ whiteSpace: 'nowrap' }}>EMAIL</th>
                  <th style={{ whiteSpace: 'nowrap' }}>SERVICE TYPE</th>
                  <th style={{ whiteSpace: 'nowrap' }}>CATEGORY</th>
                  <th style={{ whiteSpace: 'nowrap' }}>DEPARTMENT</th>
                  <th style={{ whiteSpace: 'nowrap' }}>ASSIGNED TO</th>
                  <th style={{ whiteSpace: 'nowrap' }}>SUPER PARTNER</th>
                  <th style={{ whiteSpace: 'nowrap' }}>PARTNER</th>
                  <th style={{ whiteSpace: 'nowrap' }}>CREATED BY</th>
                  <th style={{ whiteSpace: 'nowrap' }}>CREATED DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((c) => <ClientRow key={c._id} client={c} />)
                ) : (
                  <tr>
                    <td colSpan={13} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      {loading ? 'Loading clients...' : 'No clients found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay ${activeModal !== null ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) closeModal();
        }}
      >
        {activeModal === 'add_client' && (
          <div className="modal form-modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '850px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize: '20px' }}>
                Add New Client — Step {currentStep} of 8
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '32px' }}>
              
              {currentStep === 1 && (
                <div className="form-section">
                  <div style={{ marginBottom: '24px' }}>
                    <div className="form-row cols-2">
                      <div className="form-group">
                        <span className="form-label text-gray">FIRST NAME</span>
                        <input type="text" className="form-input" placeholder="Enter First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <span className="form-label text-gray">MIDDLE NAME</span>
                        <input type="text" className="form-input" placeholder="Enter Middle Name" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                      <div className="form-group">
                        <span className="form-label text-gray">LAST NAME</span>
                        <input type="text" className="form-input" placeholder="Enter Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <span className="form-label text-gray">USER NAME</span>
                        <input type="text" className="form-input" placeholder="Enter User Name" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-row cols-1" style={{ marginTop: '16px' }}>
                      <div className="form-group">
                        <span className="form-label text-gray">NEW PASSWORD</span>
                        <input type="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: 'var(--text)' }}>2. Personal Info</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">DATE OF BIRTH</span>
                      <input type="date" className="form-input" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">GENDER</span>
                      <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                        {['Male', 'Female', 'Others'].map(g => (
                          <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                            <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={e => setFormData({...formData, gender: e.target.value})} />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">MARITAL STATUS</span>
                      <select className="form-select" value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}>
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">OLD NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Old Name" value={formData.oldName} onChange={e => setFormData({...formData, oldName: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">NEW NAME</span>
                      <input type="text" className="form-input" placeholder="Enter New Name" value={formData.newName} onChange={e => setFormData({...formData, newName: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row cols-1" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">CITIZENSHIP</span>
                      <select className="form-select" value={formData.citizenship} onChange={e => setFormData({...formData, citizenship: e.target.value})}>
                        <option value="">Select Status</option>
                        <option value="Indian">Indian</option>
                        <option value="NRI">NRI</option>
                        <option value="OCI">OCI</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: 'var(--text)' }}>3. Contact Info</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">PHONE</span>
                      <input type="tel" className="form-input" placeholder="Enter Contact Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">E-MAIL</span>
                      <input type="email" className="form-input" placeholder="john.doe@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">STATE</span>
                      <input type="text" className="form-input" placeholder="Enter State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">CITY</span>
                      <input type="text" className="form-input" placeholder="Enter City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">PINCODE</span>
                      <input type="text" className="form-input" placeholder="Enter Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">PERMANENT ADDRESS</span>
                      <input type="text" className="form-input" placeholder="Permanent Address" value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">STATE (OLD)</span>
                      <input type="text" className="form-input" placeholder="Enter Old State" value={formData.stateOld} onChange={e => setFormData({...formData, stateOld: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">CITY (OLD)</span>
                      <input type="text" className="form-input" placeholder="Enter Old City" value={formData.cityOld} onChange={e => setFormData({...formData, cityOld: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">PINCODE (OLD)</span>
                      <input type="text" className="form-input" placeholder="Enter Old Pincode" value={formData.pincodeOld} onChange={e => setFormData({...formData, pincodeOld: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">OLD ADDRESS</span>
                      <input type="text" className="form-input" placeholder="Old Address" value={formData.oldAddress} onChange={e => setFormData({...formData, oldAddress: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: 'var(--text)' }}>4. Identification Details</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">AADHAR CARD</span>
                      <input type="file" className="form-input" onChange={(e) => handleFileChange(e, 'aadharCard')} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">PAN CARD</span>
                      <input type="file" className="form-input" onChange={(e) => handleFileChange(e, 'panCard')} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">PASSPORT</span>
                      <input type="file" className="form-input" onChange={(e) => handleFileChange(e, 'passport')} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">DRIVING LICENCE</span>
                      <input type="file" className="form-input" onChange={(e) => handleFileChange(e, 'drivingLicence')} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">NRI DOCS</span>
                      <input type="file" className="form-input" onChange={(e) => handleFileChange(e, 'nriDocs')} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">OTHER DOCS</span>
                      <input type="file" className="form-input" onChange={(e) => handleFileChange(e, 'otherDocs')} />
                    </div>
                  </div>
                  <div className="form-row cols-1" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">OTHER DOCS DESC</span>
                      <input type="text" className="form-input" placeholder="Enter Other Docs Desc" value={formData.otherDocsDesc} onChange={e => setFormData({...formData, otherDocsDesc: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: 'var(--text)' }}>5. Relationship Details</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">RELATION</span>
                      <select className="form-select" value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})}>
                        <option value="Direct">Direct</option>
                        <option value="Indirect">Indirect</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">RELATION WITH HOLDER</span>
                      <input type="text" className="form-input" placeholder="Enter Relation With Holder" value={formData.relationWithHolder} onChange={e => setFormData({...formData, relationWithHolder: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: 'var(--text)' }}>6. Reference Details</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">REFERENCE</span>
                      <select className="form-select" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})}>
                        <option value="Indirect">Indirect</option>
                        <option value="Direct">Direct</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">REFERENCE NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Reference Name" value={formData.referenceName} onChange={e => setFormData({...formData, referenceName: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row cols-1" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">REFERENCE MOBILE NO.</span>
                      <input type="tel" className="form-input" placeholder="Enter Reference Mobile no" value={formData.referenceMobileNo} onChange={e => setFormData({...formData, referenceMobileNo: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 7 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: 'var(--text)' }}>7. Nominee Details</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">NOMINEE NAME</span>
                      <input type="text" className="form-input" placeholder="Enter Nominee Name" value={formData.nomineeName} onChange={e => setFormData({...formData, nomineeName: e.target.value})} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">NOMINEE AGE AS PER CLIENT MASTER</span>
                      <input type="text" className="form-input" placeholder="Enter Nominee Age" value={formData.nomineeAge} onChange={e => setFormData({...formData, nomineeAge: e.target.value})} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">DATE OF BIRTH</span>
                      <input type="date" className="form-input" value={formData.nomineeDob} onChange={e => setFormData({...formData, nomineeDob: e.target.value})} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">NOMINEE RELATION</span>
                      <input type="text" className="form-input" placeholder="Enter Nominee Relation" value={formData.nomineeRelation} onChange={e => setFormData({...formData, nomineeRelation: e.target.value})} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">AADHAR CARD</span>
                      <input type="file" className="form-input" style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} onChange={(e) => handleFileChange(e, 'nomineeAadhar')} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">PAN CARD</span>
                      <input type="file" className="form-input" style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} onChange={(e) => handleFileChange(e, 'nomineePan')} />
                    </div>
                  </div>
                  <div className="form-row cols-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <span className="form-label text-gray">NOC</span>
                      <input type="file" className="form-input" style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} onChange={(e) => handleFileChange(e, 'nomineeNoc')} />
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">OTHER DOCS</span>
                      <input type="file" className="form-input" style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} onChange={(e) => handleFileChange(e, 'nomineeOtherDocs')} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 8 && (
                <div className="form-section">
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: 'var(--text)' }}>8. Preference & Status</div>
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <span className="form-label text-gray">PREFERENCE</span>
                      <select className="form-select" value={formData.preference} onChange={e => setFormData({...formData, preference: e.target.value})} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                        <option value="">Select Preference</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="Call">Call</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <span className="form-label text-gray">STATUS</span>
                      <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                        <option value="new">New</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ background: 'var(--card)', padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <button className="topbar-btn secondary" onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : closeModal()} style={{ borderRadius: 8, padding: '10px 22px' }}>
                {currentStep > 1 ? 'Previous' : 'Cancel'}
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                {currentStep < 8 ? (
                  <button className="topbar-btn" onClick={() => setCurrentStep(currentStep + 1)} style={{ borderRadius: 8, padding: '10px 22px' }}>
                    Next Step
                  </button>
                ) : (
                  <button className="topbar-btn" style={{ borderRadius: 8, padding: '10px 22px' }} onClick={handleCreateClient} disabled={submitting}>
                    {submitting ? 'Creating…' : 'Add Client'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeModal === 'view_client' && activeClient && (
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
                      <span className="va-label">Client ID</span>
                      <span className="va-value">{activeClient.client_id_ref || String(activeClient._id).slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Client Name</span>
                      <span className="va-value">{activeClient.name}</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Email</span>
                      <span className="va-value blue">{activeClient.email || '—'}</span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Phone</span>
                      <span className="va-value">{activeClient.phone || '—'}</span>
                    </div>
                    <div className="va-row" style={{ alignItems: 'flex-start', paddingTop: 16 }}>
                      <span className="va-label" style={{ marginTop: 6 }}>User<br/>Category</span>
                      <span className="va-pill blue-light" style={{ textTransform: 'capitalize' }}>
                        {activeClient.role?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="va-row">
                      <span className="va-label">Created Date</span>
                      <span className="va-value">{activeClient.createdAt ? new Date(activeClient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                    </div>
                  </div>

                  <div className="va-section-title">ACCOUNT CONTROL</div>
                  <div style={{ marginBottom: 32 }}>
                    <div className="va-row">
                      <span className="va-label">Account<br/>Status</span>
                      <select className="va-select" defaultValue={activeClient.is_active !== false ? 'Active' : 'Inactive'} disabled>
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
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                    <div className="va-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>PERMISSIONS</div>
                    <span className="va-pill gray-light" style={{ fontSize: '12px' }}>Role: Client</span>
                  </div>
                  
                  <div className="va-perm-grid">
                    {[
                      { label: 'Create Leads', on: false },
                      { label: 'Assign Tasks', on: false },
                      { label: 'View Reports', on: false },
                      { label: 'Approve Agreements', on: false },
                      { label: 'Upload Documents', on: true },
                      { label: 'Manage Commission', on: false },
                      { label: 'Delete Users', on: false },
                      { label: 'System Settings', on: false },
                      { label: 'Access Billing', on: true },
                      { label: 'View All Clients', on: false },
                    ].map((p, i) => (
                      <div className="va-toggle-wrap" key={i}>
                        <span className="va-toggle-label">{p.label.split(' ').map((w, j) => <span key={j}>{w}<br/></span>)}</span>
                        <input type="checkbox" className="va-toggle" defaultChecked={p.on} disabled />
                      </div>
                    ))}
                  </div>

                  <div className="va-section-title" style={{ marginTop: 40 }}>SIDEBAR ACCESS CONTROLS</div>
                  <div className="va-sidebar-grid">
                    {[
                      { label: 'Dashboard', on: true },
                      { label: 'Lead Centre', on: false },
                      { label: 'Activity Log', on: true },
                      { label: 'Client List', on: false },
                      { label: 'Task Board', on: false },
                      { label: 'Store Hub', on: false },
                    ].map((p, i) => (
                      <div className="va-toggle-wrap" key={i}>
                        <span className="va-toggle-label">{p.label}</span>
                        <input type="checkbox" className="va-toggle" defaultChecked={p.on} disabled />
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
                      <div className="va-activity-text">System login from new IP (Mumbai)</div>
                      <div className="va-activity-time">Oct 24, 2023 at 09:15 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="va-footer">
                <button className="va-btn red-outline" onClick={() => { closeModal(); handleDeleteClient(activeClient); }}>
                  <span style={{ fontSize: 16 }}>⊘</span> Delete Client
                </button>
                <button className="va-btn gray-outline" onClick={closeModal}>
                  Close
                </button>
                <button className="va-btn blue-solid" onClick={() => { closeModal(); openEditClient(activeClient); }}>
                  <Edit2 size={15} /> Edit Client
                </button>
              </div>

            </div>
          </div>
        )}

        {activeModal === 'edit_client' && editForm && (
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '760px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize: '20px' }}>
                Edit Client — {(editForm.client_id_ref || editForm._id || '').toString()}
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
                  <span className="form-label text-gray">DATE OF BIRTH</span>
                  <input type="date" className="form-input" value={editForm.dob || ''} onChange={(e) => setEditForm((p) => ({ ...p, dob: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                </div>
              </div>
              <div className="form-row cols-2" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <span className="form-label text-gray">GENDER</span>
                  <select className="form-select" value={editForm.gender || ''} onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <span className="form-label text-gray">MARITAL STATUS</span>
                  <select className="form-select" value={editForm.maritalStatus || ''} onChange={(e) => setEditForm((p) => ({ ...p, maritalStatus: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: '16px', marginTop: '32px' }}>CONTACT & ADDRESS</div>
              <div className="form-row cols-2">
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
                  <span className="form-label text-gray">CITY</span>
                  <input className="form-input" value={editForm.city || ''} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} style={{background:'var(--card)', borderColor:'rgba(255,255,255,0.1)', color:'var(--text)'}} />
                </div>
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
              <button className="topbar-btn" onClick={handleSaveClient} style={{ borderRadius: 8, padding: '10px 22px' }} disabled={savingEdit}>
                {savingEdit ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;

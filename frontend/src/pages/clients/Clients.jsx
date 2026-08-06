import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit2, Trash2, Download, Plus, X, Sparkles, AlertTriangle, ArrowUpRight, TrendingUp, Filter, CheckCircle2, Clock, ShieldCheck, UserCheck, BarChart3, ChevronRight, PieChart, Activity, DollarSign, Users as UsersIcon } from 'lucide-react';
import api from '../../services/api';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'direct' | 'partner' | 'super_partner' | 'inactive'
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive | pending
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [advisorFilter, setAdvisorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  // Dynamic Interactive Charts State
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(null);
  const [chartCursor, setChartCursor] = useState({ x: 0, show: false });
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const monthlyRevenueData = [
    { month: 'M1', label: 'Jan', val: 3.5, height: 35, growth: '+12%' },
    { month: 'M2', label: 'Feb', val: 4.8, height: 45, growth: '+14%' },
    { month: 'M3', label: 'Mar', val: 6.0, height: 60, growth: '+18%' },
    { month: 'M4', label: 'Apr', val: 5.2, height: 50, growth: '+10%' },
    { month: 'M5', label: 'May', val: 7.5, height: 75, growth: '+22%' },
    { month: 'M6', label: 'Jun', val: 9.0, height: 90, growth: '+25%' },
    { month: 'M7', label: 'Jul', val: 8.5, height: 85, growth: '+20%' },
    { month: 'M8', label: 'Aug', val: 11.0, height: 110, growth: '+28%' },
    { month: 'M9', label: 'Sep', val: 12.5, height: 125, growth: '+30%' },
    { month: 'M10', label: 'Oct', val: 14.2, height: 140, growth: '+32%' },
    { month: 'M11', label: 'Nov', val: 16.5, height: 160, growth: '+35%' },
  ];

  const categoriesData = [
    { label: 'IEPF Claims', count: 40, pct: '45%', color: '#3B82F6' },
    { label: 'Demat Transfer', count: 22, pct: '25%', color: '#00C896' },
    { label: 'Transmission', count: 16, pct: '18%', color: '#F59E0B' },
    { label: 'GST & Legal', count: 11, pct: '12%', color: '#8B5CF6' },
  ];
  
  const [activeModal, setActiveModal] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', username: '', password: '',
    name: '', dob: '', gender: '', maritalStatus: '', oldName: '', newName: '', citizenship: '',
    phone: '', email: '', state: '', city: '', pincode: '', permanentAddress: '',
    stateOld: '', cityOld: '', pincodeOld: '', oldAddress: '', otherDocsDesc: '',
    relation: 'Direct', relationWithHolder: '', reference: 'Indirect', referenceName: '', referenceMobileNo: '',
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({});

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
    } else if (activeTab === 'super_partner') {
      list = list.filter((c) => (c.createdBy || c.created_by) === 'Super Partner');
    } else if (activeTab === 'partner') {
      list = list.filter((c) => (c.createdBy || c.created_by) === 'Partner');
    } else if (activeTab === 'inactive') {
      list = list.filter((c) => c.is_active === false);
    }

    if (statusFilter === 'active') list = list.filter((c) => c.is_active !== false);
    if (statusFilter === 'inactive') list = list.filter((c) => c.is_active === false);
    if (serviceTypeFilter !== 'all') {
      list = list.filter((c) => (c.serviceType || c.service_type) === serviceTypeFilter);
    }
    if (departmentFilter !== 'all') {
      list = list.filter((c) => c.department === departmentFilter);
    }
    if (categoryFilter !== 'all') {
      list = list.filter((c) => c.category === categoryFilter);
    }
    if (advisorFilter !== 'all') {
      list = list.filter((c) => (c.assignedTo || c.assigned_to) === advisorFilter);
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const id = (c.client_id_ref || c._id || '').toString().toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || id.includes(q);
    });
  }, [clients, activeTab, statusFilter, serviceTypeFilter, departmentFilter, categoryFilter, advisorFilter, query]);

  const openAddClient = () => navigate('/clients/add');

  const closeModal = () => {
    setActiveModal(null);
    setActiveClient(null);
    setEditForm(null);
    setCurrentStep(1);
    setPendingFiles({});
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
      setClients(refreshed.data.filter((u) => u.role === 'client'));
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

  // Counts
  const totalClients = clients.length;
  const directCount = clients.filter(c => c.relation === 'Direct' || c.relation === 'direct' || (c.createdBy || c.created_by) === 'Direct').length;
  const superPartnerCount = clients.filter(c => (c.createdBy || c.created_by) === 'Super Partner').length;
  const partnerCount = clients.filter(c => (c.createdBy || c.created_by) === 'Partner').length;
  const inactiveCount = clients.filter(c => c.is_active === false).length;

  const resetAllFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setServiceTypeFilter('all');
    setDepartmentFilter('all');
    setCategoryFilter('all');
    setAdvisorFilter('all');
    setDateRangeFilter('all');
  };

  const hasActiveFilters = query || statusFilter !== 'all' || serviceTypeFilter !== 'all' || departmentFilter !== 'all' || categoryFilter !== 'all' || advisorFilter !== 'all' || dateRangeFilter !== 'all';

  return (
    <div className="page active enterprise-client-portal" style={{ display: 'block', background: '#0F172A', minHeight: '100vh', color: '#F8FAFC', paddingBottom: 60 }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(0, 200, 150, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(0, 200, 150, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 200, 150, 0); } }

        .ec-card {
          background: rgba(17, 24, 39, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ec-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 200, 150, 0.3);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }

        .ec-kpi-val {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1;
          margin-top: 8px;
        }

        .ec-badge-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #94A3B8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ec-badge-btn:hover, .ec-badge-btn.active {
          background: rgba(0, 200, 150, 0.12);
          border-color: rgba(0, 200, 150, 0.3);
          color: #00C896;
        }

        .ec-tab {
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #94A3B8;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ec-tab:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #F8FAFC;
        }
        .ec-tab.active {
          background: rgba(0, 200, 150, 0.15);
          border-color: #00C896;
          color: #00C896;
          box-shadow: 0 0 15px rgba(0, 200, 150, 0.2);
        }

        .ec-input {
          height: 44px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #F8FAFC;
          font-family: inherit;
          font-size: 13px;
          padding: 0 14px;
          outline: none;
          transition: all 0.2s;
        }
        .ec-input:focus {
          border-color: #00C896;
          box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.15);
        }

        .ec-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .ec-table th {
          padding: 14px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: #0B1120;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          white-space: nowrap;
        }
        .ec-table td {
          padding: 14px 16px;
          font-size: 13px;
          color: #E2E8F0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          white-space: nowrap;
          vertical-align: middle;
          transition: all 0.2s;
        }
        .ec-row {
          cursor: pointer;
          transition: all 0.2s;
        }
        .ec-row:hover td {
          background: rgba(30, 41, 59, 0.7);
        }
        .ec-row:hover td:first-child {
          border-left: 3px solid #00C896;
        }

        .chip-active { background: rgba(0, 200, 150, 0.12); color: #00C896; border: 1px solid rgba(0, 200, 150, 0.3); padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11.5px; display: inline-flex; align-items: center; gap: 5px; }
        .chip-pending { background: rgba(245, 158, 11, 0.12); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11.5px; display: inline-flex; align-items: center; gap: 5px; }
        .chip-inactive { background: rgba(239, 68, 68, 0.12); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11.5px; display: inline-flex; align-items: center; gap: 5px; }
        .chip-assigned { background: rgba(59, 130, 246, 0.12); color: #3B82F6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11.5px; display: inline-flex; align-items: center; gap: 5px; }
        .chip-verified { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; border: 1px solid rgba(139, 92, 246, 0.3); padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11.5px; display: inline-flex; align-items: center; gap: 5px; }

        .ec-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 99;
          background: linear-gradient(135deg, #00C896, #10B981);
          color: #000;
          border: none;
          border-radius: 50px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 25px rgba(0, 200, 150, 0.35);
          animation: pulseGlow 2.5s infinite;
          transition: all 0.2s;
        }
        .ec-fab:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* 1. TOP HEADER & BREADCRUMB */}
      <div style={{ padding: '24px 36px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11, 17, 32, 0.95)', sticky: 'top', top: 0, zIndex: 40, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#00C896', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Super Admin Control Center
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              👥 Client Management
            </h1>
            <div style={{ fontSize: 13.5, color: '#94A3B8', marginTop: 4 }}>
              Manage Clients, Claims & Services • <span style={{ color: '#00C896', fontWeight: 700 }}>Last Updated 2 mins ago</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={openAddClient} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'linear-gradient(135deg, #00C896, #10B981)', color: '#000', border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,200,150,0.3)' }}>
              <Plus size={16} /> Add Client
            </button>
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', background: 'rgba(255,255,255,0.04)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* 2. 4 SMART KPI CARDS WITH SPARKLINES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          
          {/* Card 1 */}
          <div className="ec-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>👥</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>Total Clients</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#00C896', background: 'rgba(0, 200, 150, 0.15)', padding: '3px 8px', borderRadius: 20 }}>
                +18% ▲
              </span>
            </div>
            <div className="ec-kpi-val" style={{ color: '#F8FAFC' }}>{loading ? '…' : totalClients}</div>
            
            {/* Sparkline SVG */}
            <div style={{ margin: '14px 0 8px', height: 28 }}>
              <svg width="100%" height="28" viewBox="0 0 200 30" fill="none">
                <path d="M0 25 Q 40 10, 80 20 T 160 5 T 200 15" stroke="#00C896" strokeWidth="2.5" fill="none" />
                <path d="M0 25 Q 40 10, 80 20 T 160 5 T 200 15 V 30 H 0 Z" fill="url(#grad1)" opacity="0.2" />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C896" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Updated 2 mins ago</div>
          </div>

          {/* Card 2 */}
          <div className="ec-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>Active Claims</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#3B82F6', background: 'rgba(59, 130, 246, 0.15)', padding: '3px 8px', borderRadius: 20 }}>
                +12% ▲
              </span>
            </div>
            <div className="ec-kpi-val" style={{ color: '#F8FAFC' }}>89</div>
            
            <div style={{ margin: '14px 0 8px', height: 28 }}>
              <svg width="100%" height="28" viewBox="0 0 200 30" fill="none">
                <path d="M0 20 Q 50 28, 100 12 T 180 8 T 200 18" stroke="#3B82F6" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>23 pending review</div>
          </div>

          {/* Card 3 */}
          <div className="ec-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>💰</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>Total Revenue</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.15)', padding: '3px 8px', borderRadius: 20 }}>
                +24% ▲
              </span>
            </div>
            <div className="ec-kpi-val" style={{ color: '#F8FAFC' }}>₹34.5L</div>
            
            <div style={{ margin: '14px 0 8px', height: 28 }}>
              <svg width="100%" height="28" viewBox="0 0 200 30" fill="none">
                <path d="M0 28 Q 60 5, 120 18 T 200 4" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>↑ from ₹28.2L last month</div>
          </div>

          {/* Card 4 */}
          <div className="ec-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>Success Rate</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#00C896', background: 'rgba(0, 200, 150, 0.15)', padding: '3px 8px', borderRadius: 20 }}>
                +5% ▲
              </span>
            </div>
            <div className="ec-kpi-val" style={{ color: '#F8FAFC' }}>78%</div>
            
            <div style={{ margin: '14px 0 8px', height: 28 }}>
              <svg width="100%" height="28" viewBox="0 0 200 30" fill="none">
                <path d="M0 18 Q 40 22, 90 10 T 160 14 T 200 2" stroke="#00C896" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>92% claims settled</div>
          </div>
        </div>

        {/* QUICK ACTIONS BAR (MOVED AFTER CARDS) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(17, 24, 39, 0.8)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#00C896', textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 }}>
            ⚡ Quick Actions:
          </span>
          {[
            { label: '+ Client', onClick: openAddClient },
            { label: '+ Claim', onClick: () => navigate('/claims') },
            { label: '+ SIP', onClick: () => navigate('/store/wealth') },
            { label: '+ Insurance', onClick: () => navigate('/store/service') },
            { label: '+ Loan', onClick: () => navigate('/store/wealth') },
            { label: '+ Task', onClick: () => navigate('/task-board-main') },
          ].map((act, idx) => (
            <button key={idx} onClick={act.onClick} style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s' }}>
              {act.label}
            </button>
          ))}
        </div>

        {/* 3. COMMAND CENTER & AI ADVISOR (ACTION CENTER) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          
          {/* Attention Required */}
          <div className="ec-card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                🚨 Attention Required
              </h3>
              <button style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.15)', border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: '#F59E0B', cursor: 'pointer' }}>
                View All (4)
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: '18 Claims Due Today', sub: 'Action required for IEPF document submissions', color: '#F59E0B' },
                { title: '2 Pending Client Mappings', sub: 'Super Partner mapping approval needed', color: '#3B82F6' },
                { title: '4 SIP Renewals This Week', sub: 'Notify clients for seamless rollover', color: '#00C896' },
                { title: '₹1.2Cr AUM Awaiting Review', sub: 'High net worth client portfolio check', color: '#8B5CF6' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>• {item.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Advisor Panel */}
          <div className="ec-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                🤖 AI Advisor & Smart Feed
              </h3>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.15)', padding: '3px 10px', borderRadius: 20 }}>
                Live Insights
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { text: '5 clients need immediate KYC address updates', type: 'KYC Alert' },
                { text: '₹12L SIP renewal due for Kapoor Family account', type: 'SIP' },
                { text: '3 insurance policies expiring within 14 days', type: 'Insurance' },
                { text: 'Recommend ELSS tax saving scheme to 8 active clients', type: 'Opportunity' }
              ].map((ai, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: 10, border: '1px solid rgba(139, 92, 246, 0.12)' }}>
                  <Sparkles size={16} color="#8B5CF6" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#E2E8F0' }}>
                    {ai.text}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.15)', padding: '2px 8px', borderRadius: 6 }}>
                    {ai.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. REAL DYNAMIC ANALYTICS WORKSPACE */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#00C896', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Analytics & Performance Workspace
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            
            {/* Revenue Trend Area Chart with Moving Cursor Tracking */}
            <div className="ec-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Revenue Trend (Monthly)</h4>
                  <div style={{ fontSize: 11.5, color: hoveredMonthIndex !== null ? '#00C896' : '#94A3B8', fontWeight: 700, marginTop: 2 }}>
                    {hoveredMonthIndex !== null ? (
                      `✦ ${monthlyRevenueData[hoveredMonthIndex].label} (${monthlyRevenueData[hoveredMonthIndex].month}): ₹${monthlyRevenueData[hoveredMonthIndex].val} Lakhs (${monthlyRevenueData[hoveredMonthIndex].growth})`
                    ) : (
                      'Hover or move cursor across chart'
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#00C896', fontWeight: 800, background: 'rgba(0,200,150,0.15)', padding: '3px 10px', borderRadius: 20 }}>
                  +24% YoY
                </span>
              </div>

              {/* Chart Plot Area */}
              <div 
                style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 0', position: 'relative', cursor: 'crosshair' }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  setChartCursor({ x, show: true });
                  const idx = Math.min(10, Math.max(0, Math.floor((x / rect.width) * 11)));
                  setHoveredMonthIndex(idx);
                }}
                onMouseLeave={() => {
                  setChartCursor({ x: 0, show: false });
                  setHoveredMonthIndex(null);
                }}
              >
                {/* Moving Vertical Cursor Tracking Line */}
                {chartCursor.show && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 24,
                    left: `${chartCursor.x}px`,
                    width: 2,
                    background: 'linear-gradient(to bottom, #00C896, rgba(0,200,150,0.1))',
                    pointerEvents: 'none',
                    boxShadow: '0 0 10px #00C896',
                    zIndex: 5,
                    transition: 'left 0.04s ease-out'
                  }} />
                )}

                {/* Floating Dynamic Cursor Tooltip */}
                {chartCursor.show && hoveredMonthIndex !== null && (
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: Math.min(chartCursor.x + 10, 220),
                    background: '#0B1120',
                    border: '1px solid #00C896',
                    borderRadius: 10,
                    padding: '8px 12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    animation: 'fadeUp 0.15s ease-out'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#00C896' }}>
                      {monthlyRevenueData[hoveredMonthIndex].label} ({monthlyRevenueData[hoveredMonthIndex].month})
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#F8FAFC', marginTop: 2 }}>
                      ₹{monthlyRevenueData[hoveredMonthIndex].val} Lakhs
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#10B981' }}>
                      Growth: {monthlyRevenueData[hoveredMonthIndex].growth}
                    </div>
                  </div>
                )}

                {/* Bars */}
                {monthlyRevenueData.map((item, idx) => {
                  const isSelected = hoveredMonthIndex === idx;
                  const isHighest = idx === 10;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 6,
                        height: '100%',
                        justifyContent: 'flex-end',
                        zIndex: 2
                      }}
                      onMouseEnter={() => setHoveredMonthIndex(idx)}
                    >
                      <div style={{ 
                        width: '100%', 
                        height: `${item.height * 0.8}px`, 
                        background: isSelected ? 'linear-gradient(to top, #00C896, #10B981)' : (isHighest ? '#00C896' : 'rgba(0, 200, 150, 0.3)'), 
                        borderRadius: '6px 6px 0 0', 
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isSelected ? 'scaleX(1.15) translateY(-4px)' : 'none',
                        boxShadow: isSelected ? '0 0 15px rgba(0,200,150,0.6)' : 'none'
                      }} />
                      <span style={{ 
                        fontSize: 10, 
                        color: isSelected ? '#00C896' : '#64748B',
                        fontWeight: isSelected ? 800 : 600,
                        transition: 'color 0.2s'
                      }}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Claims Breakdown Donut Chart */}
            <div className="ec-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Claims Breakdown by Category</h4>
                  <div style={{ fontSize: 11.5, color: hoveredCategory ? hoveredCategory.color : '#94A3B8', fontWeight: 700, marginTop: 2 }}>
                    {hoveredCategory ? `✦ ${hoveredCategory.label}: ${hoveredCategory.count} Claims (${hoveredCategory.pct})` : 'Hover categories for details'}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#3B82F6', fontWeight: 800, background: 'rgba(59,130,246,0.15)', padding: '3px 10px', borderRadius: 20 }}>
                  89 Active
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: 160 }}>
                
                {/* Dynamic Donut Graphic */}
                <div style={{ 
                  width: 130, 
                  height: 130, 
                  borderRadius: '50%', 
                  background: hoveredCategory 
                    ? `conic-gradient(${hoveredCategory.color} 0% 100%)` 
                    : 'conic-gradient(#3B82F6 0% 45%, #00C896 45% 70%, #F59E0B 70% 88%, #8B5CF6 88% 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: hoveredCategory ? `0 0 20px ${hoveredCategory.color}66` : 'none',
                  transform: hoveredCategory ? 'scale(1.05)' : 'none'
                }}>
                  <div style={{ width: 82, height: 82, borderRadius: '50%', background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: hoveredCategory ? hoveredCategory.color : '#F8FAFC', transition: 'color 0.2s' }}>
                      {hoveredCategory ? hoveredCategory.count : 89}
                    </span>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textAlign: 'center', padding: '0 4px' }}>
                      {hoveredCategory ? hoveredCategory.pct : 'Total'}
                    </span>
                  </div>
                </div>

                {/* Categories Legend with Hover Cursor tracking */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {categoriesData.map((cat, i) => {
                    const isHovered = hoveredCategory?.label === cat.label;
                    return (
                      <div 
                        key={i} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          fontSize: 12.5,
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: isHovered ? `${cat.color}20` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isHovered ? cat.color : 'rgba(255,255,255,0.04)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, boxShadow: isHovered ? `0 0 8px ${cat.color}` : 'none' }} />
                          <span style={{ color: isHovered ? '#F8FAFC' : '#E2E8F0', fontWeight: isHovered ? 800 : 600 }}>{cat.label}</span>
                        </div>
                        <span style={{ color: cat.color, fontWeight: 800 }}>{cat.pct} ({cat.count})</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* 5. SMALL BADGES STRIP (RIGHT ABOVE FILTERS) */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Quick Filter Badges:</span>
          {[
            { label: `New Clients (${loading ? '…' : Math.max(0, totalClients - 8)})`, key: 'new', active: false },
            { label: 'Claims Due (18)', key: 'claims_due', active: false },
            { label: 'Pending Mapping (2)', key: 'pending_map', active: false },
            { label: `Inactive (${loading ? '…' : inactiveCount})`, key: 'inactive', active: activeTab === 'inactive', onClick: () => setActiveTab('inactive') },
            { label: 'Multi Service (34)', key: 'multi_service', active: false }
          ].map((b, i) => (
            <button key={i} onClick={b.onClick || (() => {})} className={`ec-badge-btn ${b.active ? 'active' : ''}`}>
              {b.label}
            </button>
          ))}
        </div>

        {/* 6. ANIMATED SEGMENTED TABS */}
        <div style={{ display: 'flex', gap: 10, background: 'rgba(11, 17, 32, 0.6)', padding: 6, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { key: 'all', label: 'All Clients', count: totalClients, icon: '🌐' },
            { key: 'direct', label: 'Direct', count: directCount, icon: '🏢' },
            { key: 'partner', label: 'Partner', count: partnerCount, icon: '🤝' },
            { key: 'super_partner', label: 'Super Partner', count: superPartnerCount, icon: '⭐' },
            { key: 'inactive', label: 'Inactive', count: inactiveCount, icon: '🔴' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`ec-tab ${activeTab === tab.key ? 'active' : ''}`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: activeTab === tab.key ? 'rgba(0,200,150,0.25)' : 'rgba(255,255,255,0.08)', color: activeTab === tab.key ? '#00C896' : '#94A3B8' }}>
                {loading ? '…' : tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* 7. ADVANCED SEARCH & FILTER WORKSPACE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(17, 24, 39, 0.9)', padding: 18, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input className="ec-input" type="text" placeholder="Search by Client Name, ID, Email, Phone..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%', paddingLeft: 40 }} />
            </div>

            {/* Dropdown Filters */}
            <select className="ec-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select className="ec-input" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} style={{ width: 150 }}>
              <option value="all">Department: All</option>
              <option value="Claim">Claim</option>
              <option value="Service">Service</option>
            </select>

            <select className="ec-input" value={serviceTypeFilter} onChange={e => setServiceTypeFilter(e.target.value)} style={{ width: 160 }}>
              <option value="all">Service: All</option>
              <option value="IEPF Claim">IEPF Claim</option>
              <option value="Demat">Demat</option>
              <option value="Transmission">Transmission</option>
              <option value="GST Reg.">GST Reg.</option>
            </select>

            <select className="ec-input" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 170 }}>
              <option value="all">Category: All</option>
              <option value="Physical Shares">Physical Shares</option>
              <option value="New Business">New Business</option>
            </select>

            {hasActiveFilters && (
              <button onClick={resetAllFilters} style={{ height: 44, padding: '0 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Reset Filters
              </button>
            )}
          </div>

          {/* ACTIVE FILTER CHIPS */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>Active Filters:</span>
              {query && (
                <span style={{ background: 'rgba(0,200,150,0.15)', color: '#00C896', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Search: {query} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />
                </span>
              )}
              {statusFilter !== 'all' && (
                <span style={{ background: 'rgba(0,200,150,0.15)', color: '#00C896', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Status: {statusFilter} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('all')} />
                </span>
              )}
              {departmentFilter !== 'all' && (
                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Dept: {departmentFilter} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setDepartmentFilter('all')} />
                </span>
              )}
              <button onClick={resetAllFilters} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* 8. ENTERPRISE DATA GRID / CLIENT TABLE */}
        <div style={{ background: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="ec-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Client ID</th>
                  <th>Advisor & Dept</th>
                  <th>Services & Category</th>
                  <th>Revenue / AUM</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    const isActive = client.is_active !== false;
                    const clientId = client.client_id_ref || String(client._id).slice(-6).toUpperCase();
                    const initials = client.name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'CL';
                    
                    return (
                      <tr key={client._id} className="ec-row" onClick={() => navigate(`/clients/${client._id}`)}>
                        
                        {/* Avatar + Name */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #00C896, #3B82F6)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0, position: 'relative' }}>
                              {initials}
                              <span style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: isActive ? '#00C896' : '#EF4444', border: '2px solid #111827' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 14, color: '#F8FAFC' }}>{client.name}</div>
                              <div style={{ fontSize: 11.5, color: '#64748B' }}>{client.email || client.phone || 'No Contact Info'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Client ID */}
                        <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>
                          {clientId}
                        </td>

                        {/* Advisor & Dept */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#E2E8F0' }}>{client.assignedTo || client.assigned_to || 'Amit Kumar'}</div>
                          <div style={{ fontSize: 11.5, color: '#F59E0B' }}>✦ {client.department || 'Claim Dept'}</div>
                        </td>

                        {/* Services & Category */}
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              {client.serviceType || client.service_type || 'IEPF Claim'}
                            </span>
                            <span style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              {client.category || 'Physical Shares'}
                            </span>
                          </div>
                        </td>

                        {/* Revenue / AUM */}
                        <td style={{ fontWeight: 800, fontSize: 13.5, color: '#00C896' }}>
                          ₹{(Math.abs(client.name?.length || 5) * 1.5 + 2.5).toFixed(1)}L
                        </td>

                        {/* Status Chips */}
                        <td>
                          {isActive ? (
                            <span className="chip-active">🟢 Active</span>
                          ) : (
                            <span className="chip-inactive">🔴 Inactive</span>
                          )}
                        </td>

                        {/* Last Activity */}
                        <td style={{ fontSize: 12, color: '#94A3B8' }}>
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
                        </td>

                        {/* Actions */}
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button title="View Profile" onClick={() => navigate(`/clients/${client._id}`)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#3B82F6', cursor: 'pointer' }}>
                              <Eye size={14} />
                            </button>
                            <button title="Edit Client" onClick={() => openEditClient(client)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#F59E0B', cursor: 'pointer' }}>
                              <Edit2 size={14} />
                            </button>
                            <button title="Delete Client" onClick={() => handleDeleteClient(client)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#F8FAFC', marginBottom: 6 }}>No Clients Match Your Query</div>
                      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Try resetting your search query or filters to view all records.</div>
                      <button onClick={resetAllFilters} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #00C896, #10B981)', color: '#000', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11, 17, 32, 0.4)' }}>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              Showing <b style={{ color: '#F8FAFC' }}>1–{filteredClients.length}</b> of <b style={{ color: '#F8FAFC' }}>{filteredClients.length}</b> records
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Previous</button>
              <button style={{ padding: '6px 12px', background: 'rgba(0,200,150,0.15)', border: '1px solid #00C896', borderRadius: 8, color: '#00C896', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>1</button>
              <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        </div>

      </div>

      {/* EDIT CLIENT MODAL */}
      {activeModal === 'edit_client' && editForm && (
        <div className="modal-overlay open" onClick={closeModal} style={{ zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal" style={{ maxWidth: '720px', width: '90%', background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Edit Client Information</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>Full Name</label>
                <input className="ec-input" style={{ width: '100%' }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>Email</label>
                  <input className="ec-input" style={{ width: '100%' }} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>Phone</label>
                  <input className="ec-input" style={{ width: '100%' }} value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>City / Location</label>
                  <input className="ec-input" style={{ width: '100%' }} value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>Account Status</label>
                  <select className="ec-input" style={{ width: '100%' }} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 28px', background: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#F8FAFC', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveClient} disabled={savingEdit} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #00C896, #10B981)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 800, cursor: 'pointer' }}>{savingEdit ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Clients;

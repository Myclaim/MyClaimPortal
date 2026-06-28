import React, { useState, useEffect } from 'react';
import { Download, Plus, User, CheckCircle2, Clock, Eye, Edit2, Search, X } from 'lucide-react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

<<<<<<< HEAD
const API = import.meta.env.VITE_API_URL || 'https://myclaimportal.onrender.com/api';
=======
const API = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586

// Module-level SWR cache — persists across navigations
let _leadsCache = null;
let _leadsCacheTime = 0;
const LEADS_TTL = 3 * 60 * 1000;

const STATUS_API_TO_UI = {
  new: 'New',
  in_discussion: 'In Discussion',
  converted: 'Converted',
  not_interested: 'Not Interested',
};

const STATUS_UI_TO_API = {
  New: 'new',
  'In Discussion': 'in_discussion',
  Converted: 'converted',
  'Not Interested': 'not_interested',
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

function categoryBadgeLabel(category) {
  if (!category || category === 'N/A') return 'New Business';
  if (category.includes('Physical')) return 'Physical Shares';
  if (category.includes('Taxation')) return 'Taxation';
  if (category.includes('New Business')) return 'New Business';
  return category.length > 24 ? `${category.slice(0, 22)}…` : category;
}

function sourceTypeLabel(source) {
  if (!source || source === 'N/A') return 'Direct';
  const s = source.toLowerCase();
  if (s.includes('partner referral') || s.includes('partner')) return 'Partner';
  if (s.includes('client')) return 'Client Ref.';
  if (s.includes('super')) return 'Partner';
  return 'Direct';
}

const Leads = () => {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingLead, setSavingLead] = useState(false);
  const [activeTab, setActiveTab] = useState('All Leads');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeSource, setActiveSource] = useState('Source Type');
  const [activePriority, setActivePriority] = useState('Priority');

  const [realLeads, setRealLeads] = useState([]);
  const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
      firstName: '', lastName: '', phone: '', altPhone: '', email: '', city: '',
      category: '', serviceRequest: '', source: 'New', priority: 'Medium', notes: ''
    });
  const [currentStep, setCurrentStep] = useState(1);

  const handleAddLead = async () => {
    try {
      if (!formData.firstName || !formData.phone || !formData.serviceRequest) {
        alert("Please fill in the required fields: First Name, Contact Number, and Service Request.");
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const payload = {
        ...formData,
        name: formData.name || `${formData.firstName} ${formData.lastName}`.trim(),
        serviceInterest: formData.serviceRequest,
      };
      
      const { data } = await axios.post(`${API}/leads`, payload, config);

      setRealLeads((prev) => [data, ...prev]);
      closeModal();
    } catch (error) {
      console.error('Failed to create lead:', error.response?.data?.message || error.message);
      alert(`Failed to add lead: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    const fetchLeads = async (silent = false) => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API}/leads`, config);
        _leadsCache = data;
        _leadsCacheTime = Date.now();
        setRealLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    if (user && user.token) {
      if (_leadsCache && (Date.now() - _leadsCacheTime) < LEADS_TTL) {
        setRealLeads(_leadsCache);
        setLoading(false);
        fetchLeads(true); // silent background refresh
      } else {
        fetchLeads(false);
      }
    }
  }, [user]);

  const closeModal = () => {
    setActiveModal(null);
    setActiveLeadId(null);
    setEditForm(null);
  };

  const authConfig = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const buildCombinedNotes = (f) =>
    `[Alt Phone: ${f.altPhone || 'N/A'}] [City: ${f.city || 'N/A'}] [Category: ${f.category || 'N/A'}] [Source: ${f.source || 'N/A'}] [Priority: ${f.priority || 'N/A'}] [Super Partner: ${f.superPartner || 'N/A'}] [Partner: ${f.partner || 'N/A'}]\n\n${f.notes || ''}`;

  const openViewLead = (mongoId) => {
    setActiveLeadId(mongoId);
    setActiveModal('view_lead');
  };

  const openEditLead = (mongoId) => {
    const raw = realLeads.find((l) => String(l._id) === String(mongoId));
    if (!raw) return;
    const p = parseLeadNotes(raw.notes);
    const parts = (raw.name || '').trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    setEditForm({
      mongoId,
      firstName,
      lastName,
      phone: raw.phone || '',
      altPhone: p.altPhone && p.altPhone !== 'N/A' ? p.altPhone : '',
      email: raw.email || '',
      city: p.city && p.city !== 'N/A' ? p.city : '',
      category: p.category && p.category !== 'N/A' ? p.category : '',
      serviceRequest: raw.serviceInterest || '',
      source: p.source && p.source !== 'N/A' ? p.source : '',
      priority: p.priority || 'Medium',
      superPartner: p.superPartner && p.superPartner !== 'N/A' ? p.superPartner : '',
      partner: p.partner && p.partner !== 'N/A' ? p.partner : '',
      notes: p.freeform || '',
      statusUi: STATUS_API_TO_UI[raw.status] || 'Active',
      password: '',
    });
    setActiveLeadId(mongoId);
    setActiveModal('edit_lead');
  };

  const handleSaveEditLead = async () => {
    if (!editForm || !user?.token) return;
    if (!editForm.firstName?.trim() || !editForm.phone?.trim() || !editForm.serviceRequest?.trim()) {
      alert('First name, phone, and service request are required.');
      return;
    }
    setSavingLead(true);
    try {
      const statusApi = STATUS_UI_TO_API[editForm.statusUi] || 'new';
      const payload = {
        name: `${editForm.firstName} ${editForm.lastName}`.trim(),
        phone: editForm.phone,
        email: editForm.email,
        serviceInterest: editForm.serviceRequest,
        notes: buildCombinedNotes(editForm),
        status: statusApi,
        password: editForm.password,
      };
      const { data } = await axios.patch(`${API}/leads/${editForm.mongoId}`, payload, authConfig());
      setRealLeads((prev) => prev.map((l) => (String(l._id) === String(data._id) ? data : l)));
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Failed to save lead');
    } finally {
      setSavingLead(false);
    }
  };

  const selectedLeadRaw = activeLeadId ? realLeads.find((l) => String(l._id) === String(activeLeadId)) : null;
  const selectedParsed = selectedLeadRaw ? parseLeadNotes(selectedLeadRaw.notes) : null;
  const selectedLeadDate = selectedLeadRaw ? new Date(selectedLeadRaw.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const selectedLeadTime = selectedLeadRaw ? new Date(selectedLeadRaw.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      alert("No leads to export.");
      return;
    }
    
    const headers = [
      "Lead ID", "First Name", "Last Name", "Contact", "Alt. Contact", 
      "Category", "Service Request", "Source Type", "Created By", 
      "Super Partner", "Partner", "Priority", "Status"
    ];
    
    const rows = filteredLeads.map(lead => [
      lead.id,
      lead.firstName,
      lead.lastName,
      lead.contact,
      lead.altContact,
      lead.category,
      lead.serviceRequest,
      lead.sourceType,
      lead.createdBy,
      lead.superPartner,
      lead.partner,
      lead.priority,
      lead.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLeads = realLeads.length;
  const newLeadsCount = realLeads.filter(l => l.status === 'new').length;
  const discussionLeadsCount = realLeads.filter(l => l.status === 'in_discussion').length;
  const convertedLeads = realLeads.filter(l => l.status === 'converted').length;
  const notInterestedLeadsCount = realLeads.filter(l => l.status === 'not_interested').length;

  const leadsData = realLeads.map((lead) => {
    const p = parseLeadNotes(lead.notes);
    const idStr = String(lead._id);
    const shortId = idStr.slice(-6).toUpperCase();
    const catLabel = categoryBadgeLabel(p.category);
    const srcLabel = sourceTypeLabel(p.source);
    return {
      mongoId: idStr,
      id: shortId,
      firstName: lead.name.split(' ')[0] || 'Unknown',
      lastName: lead.name.split(' ').slice(1).join(' ') || '—',
      avatarBg: '#166534',
      initials: (lead.name || '??').substring(0, 2).toUpperCase(),
      contact: lead.phone || '—',
      altContact: p.altPhone && p.altPhone !== 'N/A' ? p.altPhone : '—',
      category: catLabel,
      serviceRequest: lead.serviceInterest || '—',
      sourceType: srcLabel,
      userRole: lead.sourceUserId?.name || 'Admin',
      createdBy: lead.sourceUserId?.name || 'Unknown',
      superPartner: p.superPartner && p.superPartner !== 'N/A' ? p.superPartner : '—',
      partner: p.partner && p.partner !== 'N/A' ? p.partner : '—',
      priority: p.priority && p.priority !== 'N/A' ? p.priority : 'Medium',
      status: STATUS_API_TO_UI[lead.status] || 'Low',
    };
  });

  const getBadgeStyle = (value) => {
    switch(value) {
      case 'Physical Shares': return {background:'rgba(59,130,246,0.1)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.2)'};
      case 'New Business': return {background:'rgba(139,92,246,0.1)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.2)'};
      case 'Taxation': return {background:'rgba(16,185,129,0.1)', color:'#34d399', border:'1px solid rgba(16,185,129,0.2)'};
      case 'Partner': return {background:'rgba(20,184,166,0.1)', color:'#2dd4bf', border:'1px solid rgba(20,184,166,0.2)'};
      case 'Direct': return {background:'rgba(255,255,255,0.05)', color:'var(--text)', border:'1px solid var(--border)'};
      case 'Client Ref.': return {background:'rgba(16,185,129,0.1)', color:'#34d399', border:'1px solid rgba(16,185,129,0.2)'};
      case 'High': return {background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'};
      case 'Medium': return {background:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.2)'};
      case 'Low': return {background:'rgba(255,255,255,0.05)', color:'var(--text)', border:'1px solid var(--border)'};
      case 'New': return {background:'rgba(16,185,129,0.1)', color:'#34d399', border:'1px solid rgba(16,185,129,0.2)'};
      case 'In Discussion': return {background:'rgba(234,179,8,0.15)', color:'#f59e0b', border:'1px solid rgba(234,179,8,0.3)'};
      case 'Converted': return {background:'rgba(37,99,235,0.15)', color:'#93c5fd', border:'1px solid rgba(37,99,235,0.3)'};
      case 'Not Interested': return {background:'rgba(248,113,113,0.12)', color:'#ef4444', border:'1px solid rgba(248,113,113,0.2)'};
      default: return {};
    }
  };

  const filteredLeads = leadsData.filter(lead => {
    if (activeTab !== 'All Leads') {
      if (activeTab === 'Client Ref.' && lead.userRole !== 'Client') return false;
      else if (activeTab !== 'Client Ref.' && lead.userRole !== activeTab) return false;
    }
    if (activeStatus !== 'All' && lead.status !== activeStatus) return false;
    if (activeSource !== 'Source Type' && lead.sourceType !== activeSource) return false;
    if (activePriority !== 'Priority' && lead.priority !== activePriority) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!lead.firstName.toLowerCase().includes(q) && 
          !lead.lastName.toLowerCase().includes(q) && 
          !lead.contact.includes(q) && 
          !lead.serviceRequest.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const tabs = [
    { name: 'All Leads', count: leadsData.length },
    { name: 'Super Admin', count: leadsData.filter(l => l.userRole === 'Super Admin').length },
    { name: 'Admin', count: leadsData.filter(l => l.userRole === 'Admin').length },
    { name: 'Super Partner', count: leadsData.filter(l => l.userRole === 'Super Partner').length },
    { name: 'Partner', count: leadsData.filter(l => l.userRole === 'Partner').length },
    { name: 'Client Ref.', count: leadsData.filter(l => l.userRole === 'Client').length }
  ];

  return (
    <div className="page active" style={{display:'block'}}>
      <div className="page active" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="topbar" style={{background:'var(--card)', borderBottom:'1px solid var(--border)', height:'auto', minHeight:'72px', padding:'16px 20px', flexWrap:'wrap', gap:'12px'}}>
          <div>
            <div className="topbar-title" style={{color:'var(--text)', fontSize:'20px', fontWeight:700, letterSpacing:'-0.5px'}}>Lead Centre</div>
            <div className="topbar-subtitle" style={{color:'var(--text)', fontSize:'13px', marginTop:'2px'}}>Manage all incoming leads across sources</div>
          </div>
          <div className="topbar-spacer"></div>
          <div style={{display:'flex', gap:'8px', flexShrink:0}}>
            <button className="topbar-btn secondary" onClick={handleExport} style={{background:'var(--card)', borderColor:'var(--border)', color:'var(--text)', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s'}} onMouseOver={(e)=>e.currentTarget.style.background='var(--sidebar-hover)'} onMouseOut={(e)=>e.currentTarget.style.background='var(--card)'}>
              <Download size={14} /> <span className="btn-text">Export</span>
            </button>
            <button className="topbar-btn" onClick={() => setActiveModal('add_lead')} style={{background:'linear-gradient(135deg, #0f766e 0%, #22c55e 100%)', color:'#fff', display:'flex', alignItems:'center', gap:'8px'}}>
              <Plus size={14} /> <span className="btn-text">Add Lead</span>
            </button>
          </div>
        </div>
        
        <div className="content" style={{padding:'20px 16px', flex:1, overflowY:'auto'}}>
          
          <div className="stats-row cols-4" style={{marginBottom:'24px'}}>
            <div className="stat-card">
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{width:'48px', height:'48px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'#60a5fa'}}><User size={24} /></div>
                <div><div className="text-muted" style={{fontSize:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700, color:'var(--text)'}}>Total Leads</div><div className="text-primary" style={{fontSize:'32px', fontWeight:800, lineHeight:1.1, color:'var(--text)'}}>{totalLeads}</div><div style={{color:'#10b981', fontSize:'12px', fontWeight:700, marginTop:'4px'}}>Live Sync</div></div>
              </div>
            </div>
            
            <div className="stat-card">
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{width:'48px', height:'48px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'#8b5cf6'}}><Plus size={24} /></div>
                <div><div className="text-muted" style={{fontSize:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700, color:'var(--text)'}}>New Leads</div><div className="text-primary" style={{fontSize:'32px', fontWeight:800, lineHeight:1.1, color:'var(--text)'}}>{newLeadsCount}</div><div style={{color:'#10b981', fontSize:'12px', fontWeight:700, marginTop:'4px'}}>Active</div></div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{width:'48px', height:'48px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0d9488'}}><Clock size={24} /></div>
                <div><div className="text-muted" style={{fontSize:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700, color:'var(--text)'}}>In Discussion</div><div className="text-primary" style={{fontSize:'32px', fontWeight:800, lineHeight:1.1, color:'var(--text)'}}>{discussionLeadsCount}</div><div style={{color:'#ef4444', fontSize:'12px', fontWeight:700, marginTop:'4px'}}>Needs Attention</div></div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{width:'48px', height:'48px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981'}}><CheckCircle2 size={24} /></div>
                <div><div className="text-muted" style={{fontSize:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700, color:'var(--text)'}}>Converted</div><div className="text-primary" style={{fontSize:'32px', fontWeight:800, lineHeight:1.1, color:'var(--text)'}}>{convertedLeads}</div><div style={{color:'#10b981', fontSize:'12px', fontWeight:700, marginTop:'4px'}}>Success</div></div>
              </div>
            </div>
          </div>

          <div className="status-filter-buttons" style={{display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'24px'}}>
            {[
              { label: 'All', value: 'All', count: totalLeads },
              { label: 'New', value: 'New', count: newLeadsCount },
              { label: 'In Discussion', value: 'In Discussion', count: discussionLeadsCount },
              { label: 'Converted', value: 'Converted', count: convertedLeads },
              { label: 'Not Interested', value: 'Not Interested', count: notInterestedLeadsCount },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveStatus(item.value)}
                style={{
                  border: activeStatus === item.value ? '1px solid #60a5fa' : '1px solid var(--border)',
                  background: activeStatus === item.value ? 'rgba(96,165,250,0.12)' : 'var(--card)',
                  color: activeStatus === item.value ? '#2563eb' : 'var(--text)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  display:'inline-flex',
                  alignItems:'center',
                  gap:'8px'
                }}
              >
                <span>{item.label}</span>
                <span style={{background: activeStatus === item.value ? '#2563eb' : 'rgba(255,255,255,0.08)', color: activeStatus === item.value ? '#fff' : 'var(--text)', borderRadius: 999, padding: '2px 8px', fontSize:'12px', fontWeight:700}}>{item.count}</span>
              </button>
            ))}
          </div>

          <div className="tabs" style={{marginBottom:'24px', overflowX:'auto', paddingBottom:'4px'}}>
            {tabs.map(tab => (
              <div 
                key={tab.name}
                className={`custom-tab ${activeTab === tab.name ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab.name)}
                style={activeTab === tab.name 
                  ? {color:'#60a5fa', borderBottomColor:'#60a5fa', transition: 'all 0.2s'}
                  : {color:'var(--text)', transition: 'all 0.2s'}
                }
              >
                {tab.name} <span className="count" style={activeTab === tab.name ? {background:'var(--card)', color:'var(--text)'} : {background:'rgba(255,255,255,0.1)', color:'var(--text)'}}>{tab.count}</span>
              </div>
            ))}
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', flexWrap:'wrap'}}>
            <div className="search-input" style={{flex:1, minWidth:'200px', background:'var(--card)', borderColor:'var(--border)'}}>
              <Search size={16} color="#64748b" />
              <input 
                type="text" 
                placeholder="Search by name, phone, service..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{color:'var(--text)', width:'100%', outline:'none', background:'transparent', border:'none', fontSize:'13px', fontFamily:"'Sora',sans-serif"}} 
              />
            </div>
            <select 
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              style={{padding:'10px 16px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'10px', fontFamily:"'Sora',sans-serif", fontSize:'13px', color:'var(--text)', outline:'none', minWidth:'120px'}}
            >
              <option>All</option>
              <option>New</option>
              <option>In Discussion</option>
              <option>Converted</option>
              <option>Not Interested</option>
            </select>
            <select 
              value={activeSource}
              onChange={(e) => setActiveSource(e.target.value)}
              style={{padding:'10px 16px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'10px', fontFamily:"'Sora',sans-serif", fontSize:'13px', color:'var(--text)', outline:'none', minWidth:'120px'}}
            >
              <option>Source Type</option><option>Partner</option><option>Direct</option><option>Client Ref.</option>
            </select>
            <select 
              value={activePriority}
              onChange={(e) => setActivePriority(e.target.value)}
              style={{padding:'10px 16px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'10px', fontFamily:"'Sora',sans-serif", fontSize:'13px', color:'var(--text)', outline:'none', minWidth:'120px'}}
            >
              <option>Priority</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>

          <div className="card" style={{padding:0, background:'var(--card)', border:'1px solid var(--border)'}}>
            <div className="table-wrap" style={{overflowX:'auto', margin:0, padding:0}}>
              <table className="table" style={{minWidth:'1400px'}}>
                <thead>
                  <tr style={{background:'rgba(255,255,255,0.02)'}}>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Lead ID</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>First Name</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Last Name</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Contact</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Alt. Contact</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Category</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Service Request</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Source Type</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>User / Created By</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Super Partner</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Partner</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Priority</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)'}}>Status</th>
                    <th style={{padding:'16px', color:'var(--text)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', textAlign:'center', borderBottom:'1px solid var(--border)'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="14" style={{textAlign:'center', padding:'32px', color:'var(--text)'}}>
                        Loading leads…
                      </td>
                    </tr>
                  ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead, i) => (
                      <tr key={lead.mongoId} style={{transition:'background 0.2s', borderBottom: i === filteredLeads.length - 1 ? 'none' : '1px solid var(--border)'}} onMouseOver={(e)=>e.currentTarget.style.background='rgba(34, 197, 94, 0.05)'} onMouseOut={(e)=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'16px'}}><span style={{background:'var(--blue-light)', color:'var(--blue)', border:'1px solid var(--border)', padding:'4px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:700}}>{lead.id}</span></td>
                        <td style={{padding:'16px'}}><div style={{display:'flex', alignItems:'center', gap:'8px'}}><div className="avatar" style={{background:lead.avatarBg, width:'28px', height:'28px', fontSize:'10px'}}>{lead.initials}</div><span className="text-primary" style={{fontWeight:600, color:'var(--text)'}}>{lead.firstName}</span></div></td>
                        <td style={{padding:'16px', color:'var(--text)'}}>{lead.lastName}</td>
                        <td style={{padding:'16px', color:'var(--text)'}}>{lead.contact}</td>
                        <td style={{padding:'16px', color:'var(--text-light)'}}>{lead.altContact}</td>
                        <td style={{padding:'16px'}}><span className="custom-badge" style={getBadgeStyle(lead.category)}>{lead.category}</span></td>
                        <td style={{padding:'16px', color:'var(--text)', fontWeight:600}}>{lead.serviceRequest}</td>
                        <td style={{padding:'16px'}}><span className="custom-badge" style={getBadgeStyle(lead.sourceType)}>{lead.sourceType}</span></td>
                        <td style={{padding:'16px'}}><div style={{fontSize:'12px', color:'var(--text)'}}>{lead.userRole}</div><div style={{fontSize:'10px', color:'#60a5fa'}}>{lead.createdBy}</div></td>
                        <td style={{padding:'16px', color:'var(--text)', fontSize:'12px'}}>{lead.superPartner}</td>
                        <td style={{padding:'16px', color:'var(--text)', fontSize:'12px'}}>{lead.partner}</td>
                        <td style={{padding:'16px'}}><span className="custom-badge" style={getBadgeStyle(lead.priority)}>{lead.priority}</span></td>
                        <td style={{padding:'16px'}}><span className="custom-badge" style={getBadgeStyle(lead.status)}>{lead.status}</span></td>
                        <td style={{padding:'16px'}}>
                          <div className="action-icons" style={{justifyContent:'center'}}>
                            <button
                              type="button"
                              className="action-icon"
                              title="View lead"
                              onClick={(e) => { e.stopPropagation(); openViewLead(lead.mongoId); }}
                              style={{background:'transparent', borderColor:'var(--border)', color:'var(--text)', cursor:'pointer'}}
                            >
                              <Eye size={14}/>
                            </button>
                            <button
                              type="button"
                              className="action-icon"
                              title="Edit lead"
                              onClick={(e) => { e.stopPropagation(); openEditLead(lead.mongoId); }}
                              style={{background:'transparent', borderColor:'var(--border)', color:'var(--text)', cursor:'pointer'}}
                            >
                              <Edit2 size={14}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="14" style={{textAlign:'center', padding:'32px', color:'var(--text)'}}>
                        No leads found matching these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div 
        className={`modal-overlay ${activeModal !== null ? 'open' : ''}`} 
        onClick={(e) => { if(e.target.classList.contains('modal-overlay')) closeModal(); }}
        style={{zIndex: 9999}}
      >
        {activeModal === 'add_lead' && (
          <div className="modal form-modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '700px', width: '90%', borderRadius: '16px', overflow: 'hidden', background: '#fff' }} onClick={(e) => e.stopPropagation()}>
            <style>{`
              .lead-form-label { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; display: block; }
              .lead-form-input { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; transition: all 0.2s; background: #fff; color: #1e293b; font-family: 'Sora', sans-serif; }
              .lead-form-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
              .lead-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              @media (max-width: 640px) { .lead-form-row { grid-template-columns: 1fr; } }
              @media (max-width: 640px) { .leads-modal-grid { grid-template-columns: 1fr !important; gap: 16px !important; } }
            `}</style>
            
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
              <div className="modal-title" style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Add New Lead</div>
              <button className="modal-close" onClick={closeModal} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '32px', background: '#fff' }}>
              <div className="lead-form-row">
                <div className="form-group">
                  <span className="lead-form-label uppercase">First Name</span>
                  <input type="text" className="lead-form-input" placeholder="First name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <span className="lead-form-label uppercase">Last Name</span>
                  <input type="text" className="lead-form-input" placeholder="Last name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>

              <div className="lead-form-row">
                <div className="form-group">
                  <span className="lead-form-label uppercase">Contact Number</span>
                  <input type="tel" className="lead-form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <span className="lead-form-label uppercase">Alt. Number</span>
                  <input type="tel" className="lead-form-input" placeholder="Optional" value={formData.altPhone} onChange={e => setFormData({...formData, altPhone: e.target.value})} />
                </div>
              </div>

              <div className="lead-form-row">
                <div className="form-group">
                  <span className="lead-form-label uppercase">Email</span>
                  <input type="email" className="lead-form-input" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <span className="lead-form-label uppercase">City</span>
                  <input type="text" className="lead-form-input" placeholder="e.g. Surat" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>

              <div className="lead-form-row">
                <div className="form-group">
                  <span className="lead-form-label uppercase">Category</span>
                  <select className="lead-form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select Category</option>
                    <option value="Physical Shares">Physical Shares</option>
                    <option value="IEPF Claims">IEPF Claims</option>
                    <option value="Taxation">Taxation</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div className="form-group">
                  <span className="lead-form-label uppercase">Service Request</span>
                  <input type="text" className="lead-form-input" placeholder="e.g. IEPF Claim" value={formData.serviceRequest} onChange={e => setFormData({...formData, serviceRequest: e.target.value})} />
                </div>
              </div>

              <div className="lead-form-row">
                <div className="form-group">
                  <span className="lead-form-label uppercase">Source</span>
                  <select className="lead-form-input" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                    <option value="New">New</option>
                    <option value="Direct">Direct</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
                <div className="form-group">
                  <span className="lead-form-label uppercase">Priority</span>
                  <select className="lead-form-input" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <span className="lead-form-label uppercase">Notes</span>
                <textarea className="lead-form-input" rows="4" placeholder="Any additional notes..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ resize: 'none' }}></textarea>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="modal-close-btn" onClick={closeModal} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddLead} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>Add Lead</button>
            </div>
          </div>
        )}

        {activeModal === 'view_lead' && selectedLeadRaw && selectedParsed && (
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '840px', width: 'min(92vw, 840px)', borderRadius: '24px', overflow: 'hidden', background: 'var(--bg)', boxShadow: '0 32px 80px rgba(15,23,42,0.18)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 28px', background: 'var(--card)' }}>
              <div>
                <div className="modal-title" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                  Lead details
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Lead created on {selectedLeadDate} at {selectedLeadTime}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: 999, fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em', ...getBadgeStyle(STATUS_API_TO_UI[selectedLeadRaw.status] || 'Low') }}>
                  {STATUS_API_TO_UI[selectedLeadRaw.status] || 'Low'}
                </span>
                <button type="button" className="modal-close" onClick={closeModal} aria-label="Close" style={{ borderRadius: '16px', width: '42px', height: '42px' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '28px', background: 'var(--bg)', display: 'grid', gap: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
                <div style={{ padding: '24px', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #0f766e, #22c55e)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16 }}>
                      {(selectedLeadRaw.name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>{selectedLeadRaw.name || '—'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>Lead ID LD-{String(selectedLeadRaw._id).slice(-6).toUpperCase()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Phone</div>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedLeadRaw.phone || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Alt Phone</div>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedParsed.altPhone && selectedParsed.altPhone !== 'N/A' ? selectedParsed.altPhone : '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Email</div>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedLeadRaw.email || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>City</div>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedParsed.city && selectedParsed.city !== 'N/A' ? selectedParsed.city : '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Service requested</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{selectedLeadRaw.serviceInterest || '—'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gap: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Source type</div>
                      <span className="custom-badge" style={{ ...getBadgeStyle(sourceTypeLabel(selectedParsed.source)), padding: '9px 14px', borderRadius: '999px', fontSize: '12px' }}>
                        {sourceTypeLabel(selectedParsed.source)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Super partner</div>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedParsed.superPartner && selectedParsed.superPartner !== 'N/A' ? selectedParsed.superPartner : '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Partner</div>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedParsed.partner && selectedParsed.partner !== 'N/A' ? selectedParsed.partner : '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Category</div>
                      <span className="custom-badge" style={{ ...getBadgeStyle(categoryBadgeLabel(selectedParsed.category)), padding: '9px 14px', borderRadius: '999px', fontSize: '12px' }}>
                        {categoryBadgeLabel(selectedParsed.category)}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Priority</div>
                        <span className="custom-badge" style={{ ...getBadgeStyle(selectedParsed.priority || 'Medium'), padding: '9px 14px', borderRadius: '999px', fontSize: '12px' }}>
                          {selectedParsed.priority || 'Medium'}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6, fontWeight: 700 }}>Lead created</div>
                        <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedLeadDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16 }}>NOTES</div>
                <div style={{ minHeight: '140px', fontSize: 14, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-line' }}>
                  {selectedParsed.freeform || 'No notes were added for this lead.'}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '20px 28px', background: 'var(--card)', justifyContent: 'flex-end' }}>
              <button type="button" className="topbar-btn secondary" onClick={closeModal} style={{ borderRadius: 999, padding: '12px 24px' }}>
                Close
              </button>
            </div>
          </div>
        )}

        {activeModal === 'edit_lead' && editForm && (
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '760px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Lead — LD-{String(editForm.mongoId).slice(-6).toUpperCase()}</div>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ background: '#fff' }}>
              <div className="leads-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', color: '#64748b', fontWeight: 700, marginBottom: 12 }}>CONTACT</div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">FIRST NAME</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">LAST NAME</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">PHONE</span>
                    <input
                      type="tel"
                      className="form-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">ALT. PHONE</span>
                    <input
                      type="tel"
                      className="form-input"
                      value={editForm.altPhone}
                      onChange={(e) => setEditForm({ ...editForm, altPhone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">EMAIL</span>
                    <input
                      type="email"
                      className="form-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">PASSWORD (FOR CONVERSION)</span>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">CITY</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">CATEGORY</span>
                    <select
                      className="form-select"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      <option value="Physical Shares & Documents">Physical Shares & Documents</option>
                      <option value="New Business / Closure">New Business / Closure</option>
                      <option value="Taxation & Compliance">Taxation & Compliance</option>
                      <option value="IEPF Claims">IEPF Claims</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">SERVICE REQUEST</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.serviceRequest}
                      onChange={(e) => setEditForm({ ...editForm, serviceRequest: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', color: '#64748b', fontWeight: 700, marginBottom: 12 }}>SOURCE &amp; STATUS</div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">SOURCE</span>
                    <select
                      className="form-select"
                      value={editForm.source}
                      onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    >
                      <option value="">Select source</option>
                      <option value="New">New</option>
                      <option value="My Client">My Client</option>
                      <option value="Partner Referral">Partner Referral</option>
                      <option value="Super Partner">Super Partner</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">SUPER PARTNER</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.superPartner}
                      onChange={(e) => setEditForm({ ...editForm, superPartner: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">PARTNER</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.partner}
                      onChange={(e) => setEditForm({ ...editForm, partner: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">PRIORITY</span>
                    <select
                      className="form-select"
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">STATUS</span>
                    <select
                      className="form-select"
                      value={editForm.statusUi}
                      onChange={(e) => setEditForm({ ...editForm, statusUi: e.target.value })}
                    >
                      <option>Active</option>
                      <option>Under Review</option>
                      <option>Converted</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <span className="form-label text-gray">CREATED BY (READ ONLY)</span>
                    <input
                      type="text"
                      className="form-input"
                      readOnly
                      value={
                        realLeads.find((l) => String(l._id) === String(editForm.mongoId))?.sourceUserId?.name || '—'
                      }
                      style={{ background: '#f1f5f9', color: '#64748b' }}
                    />
                  </div>
                  <div className="form-group">
                    <span className="form-label text-gray">NOTES</span>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="topbar-btn secondary" onClick={closeModal} style={{ borderRadius: 8, padding: '10px 20px' }} disabled={savingLead}>
                Close
              </button>
              <button type="button" className="topbar-btn" onClick={handleSaveEditLead} style={{ background: '#2563eb', borderRadius: 8, padding: '10px 20px', color: '#fff' }} disabled={savingLead}>
                {savingLead ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Leads;

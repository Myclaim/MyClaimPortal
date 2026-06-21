import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, ArrowLeft, X, Check, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_CLAIM_SERVICES = [
  { id: 'c1', code: 'CLM-IEPF-001', name: 'IEPF Claim Recovery', category: 'Physical Shares', subCategory: 'IEPF Authority', price: 2499, stages: 6, status: true, mappedStore: 'All Stores', description: 'Recover shares & dividends from IEPF', tracking: ['Docs Collected', 'Verification', 'IEPF-5 Filed', 'Authority Review', 'Claim Approved', 'Shares Credited'] },
  { id: 'c2', code: 'CLM-SHR-002', name: 'Share Recovery', category: 'Physical Shares', subCategory: 'Registrar', price: 1999, stages: 5, status: true, mappedStore: 'All Stores', description: 'Recover physical shares', tracking: ['Docs Collected', 'Verification', 'Filed', 'Processing', 'Shares Credited'] },
  { id: 'c3', code: 'CLM-DEM-003', name: 'Dematerialisation', category: 'Physical Shares', subCategory: 'Depository', price: 1499, stages: 5, status: true, mappedStore: 'All Stores', description: 'Convert physical to demat', tracking: ['Docs Collected', 'Verification', 'Filed', 'Processing', 'Shares Credited'] },
  { id: 'c4', code: 'CLM-DUP-004', name: 'Duplicate Certificate', category: 'Physical Shares', subCategory: 'Registrar', price: 1299, stages: 4, status: true, mappedStore: 'All Stores', description: 'Apply for duplicate certificate', tracking: ['Docs Collected', 'Verification', 'Filed', 'Issued'] },
  { id: 'c5', code: 'CLM-TRN-005', name: 'Transmission', category: 'Physical Shares', subCategory: 'Legal Heir', price: 2999, stages: 5, status: true, mappedStore: 'All Stores', description: 'Transmission of shares to legal heir', tracking: ['Docs Collected', 'Verification', 'Filed', 'Processing', 'Transmitted'] },
  { id: 'c6', code: 'CLM-NAM-006', name: 'Name Correction', category: 'Physical Shares', subCategory: 'Registrar', price: 999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Correct name on shares', tracking: ['Docs Collected', 'Verification', 'Filed', 'Corrected'] },
  { id: 'c7', code: 'CLM-DIV-007', name: 'Unclaimed Dividend', category: 'Dividends', subCategory: 'IEPF', price: 1499, stages: 4, status: true, mappedStore: 'All Stores', description: 'Claim unpaid dividend', tracking: ['Docs Collected', 'Verification', 'Filed', 'Credited'] },
  { id: 'c8', code: 'CLM-INS-008', name: 'Insurance Claim', category: 'Insurance', subCategory: 'Life Insurance', price: 3499, stages: 4, status: false, mappedStore: 'All Stores', description: 'Process life insurance claim', tracking: ['Docs Collected', 'Verification', 'Filed', 'Settled'] },
];

const DEFAULT_SERVICE_SERVICES = [
  { id: 's1', code: 'SVC-GST-001', name: 'GST Registration', category: 'Licenses & Registrations', subCategory: 'Tax', price: 499, stages: 5, status: true, mappedStore: 'All Stores', description: 'Register for GST', tracking: ['Application', 'Docs Verified', 'Filed', 'ARN Generated', 'GSTIN Issued'] },
  { id: 's2', code: 'SVC-TM-002', name: 'Trademark Registration', category: 'Trademark & IP', subCategory: 'Brand', price: 1349, stages: 4, status: true, mappedStore: 'All Stores', description: 'Register Trademark', tracking: ['Application', 'Docs Verified', 'Filed', 'Registered'] },
  { id: 's3', code: 'SVC-PVT-003', name: 'Pvt Ltd Registration', category: 'New Business / Closure', subCategory: 'Incorporation', price: 2499, stages: 5, status: true, mappedStore: 'All Stores', description: 'Incorporate Pvt Ltd company', tracking: ['Name Approval', 'Docs Verified', 'Filed', 'Processing', 'Incorporated'] },
  { id: 's4', code: 'SVC-ITR-004', name: 'ITR Filing', category: 'Taxation & Compliance', subCategory: 'Income Tax', price: 299, stages: 4, status: true, mappedStore: 'All Stores', description: 'File Income Tax Return', tracking: ['Data Collected', 'Computation', 'Filed', 'Acknowledged'] },
  { id: 's5', code: 'SVC-LHC-005', name: 'Legal Heir Certificate', category: 'Agreements & Contracts', subCategory: 'Legal', price: 1999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Obtain legal heir certificate', tracking: ['Application', 'Docs Verified', 'Filed', 'Issued'] },
  { id: 's6', code: 'SVC-NDA-006', name: 'NDA Agreement', category: 'Agreements & Contracts', subCategory: 'Business', price: 999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Draft NDA', tracking: ['Drafting', 'Review', 'Finalized', 'Signed'] },
  { id: 's7', code: 'SVC-MSME-007', name: 'MSME Registration', category: 'Licenses & Registrations', subCategory: 'License', price: 199, stages: 3, status: true, mappedStore: 'All Stores', description: 'Register MSME', tracking: ['Application', 'Filed', 'Registered'] },
  { id: 's8', code: 'SVC-GSTC-008', name: 'GST Cancellation', category: 'New Business / Closure', subCategory: 'Closure', price: 499, stages: 3, status: false, mappedStore: 'All Stores', description: 'Cancel GST', tracking: ['Application', 'Filed', 'Cancelled'] },
];

const DEFAULT_STORE_SERVICES = [
  { id: 't1', code: 'STR-SWG-001', name: 'Swiggy', category: 'Pre-IPO Equity', subCategory: 'Food Tech', price: 485, stages: 4, status: true, mappedStore: 'Store A', description: 'Pre-IPO shares of Swiggy', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't2', code: 'STR-PHP-002', name: 'PhonePe', category: 'Pre-IPO Equity', subCategory: 'Fintech', price: 1240, stages: 4, status: true, mappedStore: 'Store B', description: 'Pre-IPO shares of PhonePe', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't3', code: 'STR-ATH-003', name: 'Ather Energy', category: 'Pre-IPO Equity', subCategory: 'EV', price: 680, stages: 4, status: true, mappedStore: 'All Stores', description: 'Pre-IPO shares of Ather Energy', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't4', code: 'STR-LNS-004', name: 'Lenskart', category: 'Pre-IPO Equity', subCategory: 'Retail', price: 340, stages: 4, status: true, mappedStore: 'All Stores', description: 'Pre-IPO shares of Lenskart', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't5', code: 'STR-BYJ-005', name: "BYJU's", category: 'Pre-IPO Equity', subCategory: 'EdTech', price: 12, stages: 4, status: false, mappedStore: 'Store A', description: "Pre-IPO shares of BYJU's", tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
];

const CLAIM_CATEGORIES = ['All Categories', 'Physical Shares', 'Dividends', 'Insurance'];
const SERVICE_CATEGORIES = ['All Categories', 'Licenses & Registrations', 'Trademark & IP', 'New Business / Closure', 'Taxation & Compliance', 'Agreements & Contracts'];
const STORE_CATEGORIES = ['All Categories', 'Pre-IPO Equity'];

const DepartmentBoard = ({ initialTab = 'claim' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [claimServices, setClaimServices] = useState(() => JSON.parse(localStorage.getItem('claimServices')) || DEFAULT_CLAIM_SERVICES);
  const [serviceServices, setServiceServices] = useState(() => JSON.parse(localStorage.getItem('serviceServices')) || DEFAULT_SERVICE_SERVICES);
  const [storeServices, setStoreServices] = useState(() => JSON.parse(localStorage.getItem('storeServices')) || DEFAULT_STORE_SERVICES);

  const services = activeTab === 'claim' ? claimServices : activeTab === 'service' ? serviceServices : storeServices;
  const setServices = activeTab === 'claim' ? setClaimServices : activeTab === 'service' ? setServiceServices : setStoreServices;

  useEffect(() => { localStorage.setItem('claimServices', JSON.stringify(claimServices)); }, [claimServices]);
  useEffect(() => { localStorage.setItem('serviceServices', JSON.stringify(serviceServices)); }, [serviceServices]);
  useEffect(() => { localStorage.setItem('storeServices', JSON.stringify(storeServices)); }, [storeServices]);

  const [activeService, setActiveService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState(null);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setCategoryFilter('All Categories');
    setActiveService(null);
  }, [activeTab]);

  const categories = activeTab === 'store' ? STORE_CATEGORIES : activeTab === 'service' ? SERVICE_CATEGORIES : CLAIM_CATEGORIES;

  const filteredServices = services.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'All Categories' && s.category !== categoryFilter) return false;
    if (statusFilter === 'Active' && !s.status) return false;
    if (statusFilter === 'Inactive' && s.status) return false;
    return true;
  });

  const handleToggle = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: !s.status } : s));
    if (activeService && activeService.id === id) {
      setActiveService(prev => ({ ...prev, status: !prev.status }));
    }
  };

  const openView = (service) => {
    setActiveService(service);
  };

  const closeView = () => {
    setActiveService(null);
  };

  const openEdit = (service) => {
    setEditForm({ ...service });
    setIsEditing(true);
  };

  const openAdd = () => {
    setEditForm({ name: '', code: '', category: '', subCategory: '', description: '', price: 0, stages: 3, tracking: ['Stage 1', 'Stage 2', 'Stage 3'], status: true, mappedStore: 'All Stores' });
    setIsAdding(true);
  };

  const handleSaveEdit = () => {
    if (isAdding) {
      setServices(prev => [{ ...editForm, id: Math.random().toString() }, ...prev]);
      setIsAdding(false);
    } else {
      setServices(prev => prev.map(s => s.id === editForm.id ? editForm : s));
      if (activeService && activeService.id === editForm.id) {
        setActiveService(editForm);
      }
      setIsEditing(false);
    }
  };

  return (
    <div className="page active" style={{ display: 'block', padding: '32px' }}>
      <style>{`
        /* ✨ Fintech Theme for Dept Board */
        .db-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .db-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
        .db-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }
        
        .db-btn-primary { background: linear-gradient(135deg, var(--green), var(--blue)); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .db-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
        
        .db-tabs { display: flex; gap: 24px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
        .db-tab { padding: 12px 0; font-size: 14px; font-weight: 700; color: var(--text-muted); cursor: pointer; position: relative; display: flex; align-items: center; gap: 8px; transition: 0.2s; border-bottom: 2px solid transparent; }
        .db-tab:hover { color: var(--text); }
        .db-tab.active { color: var(--green); border-bottom-color: var(--green); }
        .db-tab-count { font-size: 11px; font-weight: 800; background: var(--border); padding: 2px 8px; border-radius: 12px; }
        .db-tab.active .db-tab-count { background: rgba(16, 185, 129, 0.15); color: var(--green); }
        
        .db-toolbar { display: flex; gap: 16px; margin-bottom: 24px; }
        .db-search { flex: 1; position: relative; background: var(--card); border: 1px solid var(--border); border-radius: 10px; display: flex; align-items: center; }
        .db-search input { width: 100%; background: transparent; border: none; padding: 12px 16px 12px 42px; color: var(--text); font-size: 14px; outline: none; }
        .db-search svg { position: absolute; left: 14px; color: var(--text-light); }
        
        .db-select { background: var(--card); border: 1px solid var(--border); color: var(--text); padding: 0 16px; border-radius: 10px; font-size: 13.5px; font-weight: 600; outline: none; cursor: pointer; min-width: 160px; }
        
        .db-table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th { text-align: left; padding: 16px 24px; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); background: var(--bg); }
        .db-table td { padding: 16px 24px; border-bottom: 1px solid var(--border); color: var(--text); font-size: 13.5px; font-weight: 600; }
        .db-table tr:last-child td { border-bottom: none; }
        .db-table tr:hover td { background: var(--sidebar-hover); }
        
        .db-pill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
        .db-pill.blue { background: rgba(16, 185, 129, 0.15); color: var(--green); }
        .db-pill.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
        
        .db-toggle { position: relative; width: 44px; height: 24px; background: var(--border); border-radius: 12px; cursor: pointer; transition: 0.3s; }
        .db-toggle.active { background: var(--green); }
        .db-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .db-toggle.active::after { transform: translateX(20px); }
        
        .db-actions { display: flex; gap: 8px; }
        .db-action-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .db-action-icon:hover { border-color: var(--green); color: var(--green); background: rgba(16, 185, 129, 0.1); }
        
        /* Service Details View */
        .db-details-header { display: flex; justify-content: space-between; align-items: flex-start; margin: 24px 0; }
        .db-icon-box { width: 48px; height: 48px; background: rgba(245, 158, 11, 0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 24px; }
        
        .db-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .db-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .db-card-title { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 20px; }
        
        .db-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .db-row:last-child { border-bottom: none; }
        .db-label { color: var(--text-muted); font-size: 13px; font-weight: 500; }
        .db-value { color: var(--text); font-size: 13.5px; font-weight: 700; text-align: right; max-width: 60%; }
        
        .db-stage { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--sidebar-hover); border-radius: 10px; margin-bottom: 8px; }
        .db-stage-num { width: 24px; height: 24px; background: var(--green); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
        
        /* Modal */
        .db-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .db-modal { background: var(--card); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 600px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .db-modal-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .db-modal-body { padding: 24px; }
        .db-modal-footer { padding: 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
        .db-input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-size: 14px; outline: none; margin-top: 6px; font-family: inherit; }
        .db-input:focus { border-color: var(--green); }
      `}</style>

      {/* Main View */}
      {!activeService && (
        <div className="animate-fade-in">
          <div className="db-header">
            <div>
              <h1 className="db-title">{activeTab === 'service' ? 'Service Department' : activeTab === 'store' ? 'Store Department' : 'Claim Department'}</h1>
              <p className="db-subtitle">Manage services — add, edit, toggle on/off, set stages & pricing</p>
            </div>
            <button className="db-btn-primary" onClick={openAdd}><Plus size={16} /> Add Service</button>
          </div>

          <div className="db-toolbar">
            <div className="db-search">
              <Search size={18} />
              <input type="text" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="db-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="db-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Price</th>
                  <th>Stages</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(service => (
                  <tr key={service.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{service.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{service.code}</div>
                    </td>
                    <td><span className="db-pill blue">{service.category}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{service.subCategory}</td>
                    <td style={{ fontWeight: 800 }}>₹{service.price.toLocaleString('en-IN')}</td>
                    <td><span className="db-pill purple">{service.stages} stages</span></td>
                    <td>
                      <div className={`db-toggle ${service.status ? 'active' : ''}`} onClick={() => handleToggle(service.id)}></div>
                    </td>
                    <td>
                      <div className="db-actions">
                        <div className="db-action-icon" onClick={() => openView(service)}><Eye size={14} /></div>
                        <div className="db-action-icon" onClick={() => openEdit(service)}><Edit2 size={14} /></div>
                        <div className="db-action-icon" onClick={() => {
                          if (window.confirm('Are you sure you want to delete this service?')) {
                            setServices(prev => prev.filter(s => s.id !== service.id));
                          }
                        }}><Trash2 size={14} /></div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No services found for this hub.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details View */}
      {activeService && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text)', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: 'fit-content' }} onClick={closeView}>
              <ArrowLeft size={16} /> Back to List
            </div>
            <div className="db-search" style={{ maxWidth: '300px', margin: 0 }}>
              <Search size={16} />
              <input type="text" placeholder={`Search in ${activeService.name}...`} />
            </div>
          </div>
          
          <div className="db-details-header" style={{ marginTop: 0 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="db-icon-box">{activeTab === 'service' ? '🔧' : '⚖️'}</div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{activeService.name}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>{activeService.code}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className={`db-toggle ${activeService.status ? 'active' : ''}`} onClick={() => handleToggle(activeService.id)}></div>
              {activeService.status ? (
                 <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }}></span> Active</span>
              ) : (
                 <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }}></span> Inactive</span>
              )}
              <button className="db-btn-primary" onClick={() => openEdit(activeService)}><Edit2 size={14} /> Edit</button>
              <button className="db-btn-primary" style={{ background: '#3b82f6', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} onClick={() => {
                alert(`Redirecting to Create Ticket flow for: ${activeService.name}`);
              }}><Plus size={14} /> Create Ticket</button>
            </div>
          </div>

          <div className="db-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="db-card">
                <div className="db-card-title">Service Details</div>
                <div className="db-row">
                  <span className="db-label">Category</span>
                  <span className="db-value">{activeService.category}</span>
                </div>
                <div className="db-row">
                  <span className="db-label">Sub Category</span>
                  <span className="db-value">{activeService.subCategory}</span>
                </div>
                <div className="db-row">
                  <span className="db-label">Mapped Store</span>
                  <span className="db-value">{activeService.mappedStore || 'All Stores'}</span>
                </div>
                <div className="db-row">
                  <span className="db-label">Description</span>
                  <span className="db-value">{activeService.description}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="db-card">
                <div className="db-card-title">Pricing</div>
                <div className="db-row" style={{ border: 'none', padding: 0 }}>
                  <span className="db-label">Base Price</span>
                  <span className="db-value" style={{ color: 'var(--green)', fontSize: 18 }}>₹{activeService.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="db-card">
                <div className="db-card-title">Tracking Stages</div>
                {activeService.tracking?.map((stage, idx) => (
                  <div className="db-stage" key={idx}>
                    <div className="db-stage-num">{idx + 1}</div> 
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {(isEditing || isAdding) && editForm && (
        <div className="db-modal-overlay" onClick={() => { setIsEditing(false); setIsAdding(false); }}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{isAdding ? 'Add New Service' : `Edit — ${editForm.name}`}</h2>
              <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer' }} onClick={() => { setIsEditing(false); setIsAdding(false); }}>
                <X size={16} />
              </button>
            </div>
            <div className="db-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Service Name</div>
                  <input type="text" className="db-input" placeholder="e.g. IEPF Claim Recovery" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Service Code</div>
                  <input type="text" className="db-input" placeholder="e.g. CLM-IEPF-001" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Category</div>
                  <input type="text" className="db-input" placeholder="e.g. Physical Shares" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Sub Category</div>
                  <input type="text" className="db-input" placeholder="e.g. IEPF Authority" value={editForm.subCategory} onChange={e => setEditForm({...editForm, subCategory: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Description</div>
                <textarea className="db-input" placeholder="Service description..." style={{ height: 80, resize: 'vertical' }} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Mapped Store</div>
                  <select className="db-input" value={editForm.mappedStore || 'All Stores'} onChange={e => setEditForm({...editForm, mappedStore: e.target.value})}>
                    <option value="All Stores">All Stores</option>
                    <option value="Store A">Store A</option>
                    <option value="Store B">Store B</option>
                    <option value="Store C">Store C</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Base Price (₹)</div>
                  <input type="number" className="db-input" placeholder="e.g. 2499" value={editForm.price || ''} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            <div className="db-modal-footer">
              <button style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} onClick={() => { setIsEditing(false); setIsAdding(false); }}>Cancel</button>
              <button className="db-btn-primary" onClick={handleSaveEdit}>Save Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentBoard;

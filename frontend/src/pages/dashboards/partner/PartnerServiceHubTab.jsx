import React, { useState, useEffect } from 'react';
import { Search, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import useAuth from '../../../hooks/useAuth';
import { searchCompanies } from '../../../services/stockService';

const DEFAULT_SERVICE_SERVICES = [
  { id: 's1', code: 'SVC-GST-001', name: 'GST Registration', category: 'Licenses & Registrations', subCategory: 'Tax', price: 499, stages: 5, status: true, mappedStore: 'All Stores', description: 'Register for GST', tracking: ['Application', 'Docs Verified', 'Filed', 'ARN Generated', 'GSTIN Issued'] },
  { id: 's2', code: 'SVC-TM-002', name: 'Trademark Registration', category: 'Trademark & IP', subCategory: 'Brand', price: 1349, stages: 4, status: true, mappedStore: 'All Stores', description: 'Register Trademark', tracking: ['Application', 'Docs Verified', 'Filed', 'Registered'] },
  { id: 's3', code: 'SVC-PVT-003', name: 'Pvt Ltd Registration', category: 'New Business / Closure', subCategory: 'Incorporation', price: 2499, stages: 5, status: true, mappedStore: 'All Stores', description: 'Incorporate Pvt Ltd company', tracking: ['Name Approval', 'Docs Verified', 'Filed', 'Processing', 'Incorporated'] },
  { id: 's4', code: 'SVC-ITR-004', name: 'ITR Filing', category: 'Taxation & Compliance', subCategory: 'Income Tax', price: 299, stages: 4, status: true, mappedStore: 'All Stores', description: 'File Income Tax Return', tracking: ['Data Collected', 'Computation', 'Filed', 'Acknowledged'] },
  { id: 's5', code: 'SVC-LHC-005', name: 'Legal Heir Certificate', category: 'Agreements & Contracts', subCategory: 'Legal', price: 1999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Obtain legal heir certificate', tracking: ['Application', 'Docs Verified', 'Filed', 'Issued'] },
  { id: 's6', code: 'SVC-NDA-006', name: 'NDA Agreement', category: 'Agreements & Contracts', subCategory: 'Business', price: 999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Draft NDA', tracking: ['Drafting', 'Review', 'Finalized', 'Signed'] },
  { id: 's7', code: 'SVC-MSME-007', name: 'MSME Registration', category: 'Licenses & Registrations', subCategory: 'License', price: 199, stages: 3, status: true, mappedStore: 'All Stores', description: 'Register MSME', tracking: ['Application', 'Filed', 'Registered'] },
];

const DEFAULT_CLAIM_SERVICES = [
  { id: 'c1', code: 'CLM-IEPF-001', name: 'IEPF Claim', category: 'Physical Shares & Dividends', subCategory: 'IEPF', price: 4999, stages: 5, status: true, mappedStore: 'All Stores', description: 'Claim shares and dividends from IEPF authority', tracking: ['Docs Verification', 'IEPF-5 Filing', 'Nodal Officer Verification', 'Approval', 'Shares Credited'] },
  { id: 'c2', code: 'CLM-TRM-002', name: 'Transmission of Shares', category: 'Inheritance & Transmission', subCategory: 'Shares', price: 2999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Transmission of physical/demat shares upon death of holder', tracking: ['Docs Collection', 'Company Submission', 'Verification', 'Transferred'] },
  { id: 'c3', code: 'CLM-DUP-003', name: 'Duplicate Share Certificate', category: 'Physical Shares & Dividends', subCategory: 'Certificates', price: 1999, stages: 4, status: true, mappedStore: 'All Stores', description: 'Obtain duplicate share certificates for lost/damaged shares', tracking: ['FIR & Newspaper Ad', 'RTA Submission', 'Board Approval', 'Certificate Issued'] },
  { id: 'c4', code: 'CLM-DIV-004', name: 'Unclaimed Dividend Recovery', category: 'Physical Shares & Dividends', subCategory: 'Dividend', price: 1499, stages: 4, status: true, mappedStore: 'All Stores', description: 'Recover unpaid or unclaimed company dividends', tracking: ['Claim Calculation', 'RTA Request', 'Verification', 'Disbursed'] },
];

const PartnerServiceHubTab = ({ type = 'service', onTicketCreated }) => {
  const isClaim = type === 'claim';
  const defaultServices = isClaim ? DEFAULT_CLAIM_SERVICES : DEFAULT_SERVICE_SERVICES;
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('Popular');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [ticketDetails, setTicketDetails] = useState({ companyName: '', quantity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiClients, setApiClients] = useState([]);
  const [storeServices, setStoreServices] = useState([]);
  const [ordersToday, setOrdersToday] = useState(0);

  // Company Search state
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyResults, setCompanyResults] = useState([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Debounce logic for company search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (companyQuery.length >= 2) {
        setIsSearchingCompany(true);
        const results = await searchCompanies(companyQuery);
        setCompanyResults(results);
        setIsSearchingCompany(false);
        setShowCompanyDropdown(true);
      } else {
        setCompanyResults([]);
        setShowCompanyDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [companyQuery]);

  const handleSelectCompany = (company) => {
    setTicketDetails({ ...ticketDetails, companyName: company.name });
    setCompanyQuery(company.name);
    setShowCompanyDropdown(false);
  };

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await api.get(`/department-services?type=${type}`);
        const data = res.data.length > 0 ? res.data : defaultServices;
        setStoreServices(data.filter(s => s.status !== false).map(s => ({
          ...s,
          title: s.name,
          desc: s.description || s.desc || '',
          icon: isClaim ? '⚖️' : '📋',
          tabs: ['Popular', s.category]
        })));
      } catch (err) {
        console.error(err);
        setStoreServices(defaultServices.filter(s => s.status).map(s => ({
          ...s,
          title: s.name,
          desc: s.description || s.desc || '',
          icon: isClaim ? '⚖️' : '📋',
          tabs: ['Popular', s.category]
        })));
      }
    };

    loadServices();
  }, [type]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/users');
        const myClients = data.filter(u => u.role === 'client');
        if (myClients.length > 0) {
          const formatted = myClients.map((c, i) => ({
            _id: c._id,
            id: c._id,
            initials: c.name.substring(0, 2).toUpperCase(),
            bg: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6'][i % 4],
            name: c.name,
            phone: c.phone || '+91 -',
            email: c.email || 'N/A',
            crn: c.crn || `CRN-${c._id.substring(0, 4).toUpperCase()}`
          }));
          setApiClients(formatted);
        } else {
          setApiClients([]);
        }
      } catch (err) {
        console.error('Failed to fetch clients', err);
        setApiClients([]);
      }
    };
    
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/tickets');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = data.filter(t => new Date(t.createdAt) >= today).length;
        setOrdersToday(todayCount);
      } catch (err) {
        console.error('Failed to fetch tickets', err);
      }
    };

    if (user) {
      fetchClients();
      fetchTickets();
    }
  }, [user]);

  const dbCategories = [...new Set(storeServices.map(s => s.category).filter(Boolean))];
  const tabs = ['Popular', ...dbCategories];
  const filteredServices = storeServices.filter(s => s.tabs.includes(activeTab));

  const handleServiceSelect = (service) => {
    setSelectedService({ ...service, category: activeTab });
    setStep(2);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setStep(3);
  };

  const handleCreateTicket = async () => {
    if (!selectedClient || !selectedService) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ticketNo: String(Date.now()),
        clientId: selectedClient.dbId || selectedClient._id || selectedClient.id,
        hubType: isClaim ? 'Claim Hub' : 'Service Hub',
        subject: `New ${isClaim ? 'Claim' : 'Service'} Request: ${selectedService.title} for ${ticketDetails.companyName || 'N/A'}`,
        service: selectedService.title,
        priority: 'medium',
        notes: `Quantity: ${ticketDetails.quantity || 'N/A'}`
      };
      await api.post('/tickets', payload);
      alert('Ticket created successfully!');
      if (onTicketCreated) {
        onTicketCreated();
      } else {
        setStep(1);
        setSelectedService(null);
        setSelectedClient(null);
        setTicketDetails({ companyName: '', quantity: '' });
      }
    } catch (err) {
      console.error('Failed to create ticket', err);
      alert('Failed to create ticket. Make sure you are using a real client from the database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ProgressStep = ({ number, title, active, completed }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ 
        width: '24px', height: '24px', borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: completed ? 'var(--blue)' : active ? 'var(--blue)' : 'var(--border)',
        color: completed || active ? '#fff' : 'var(--text-muted)',
        fontSize: '12px', fontWeight: 600
      }}>
        {completed ? <Check size={14} /> : number}
      </div>
      <span style={{ 
        fontSize: '14px', fontWeight: active ? 700 : 500,
        color: active ? 'var(--text)' : 'var(--text-muted)'
      }}>
        {title}
      </span>
    </div>
  );

  return (
    <div style={{ paddingBottom: '40px' }}>
      <style>{`
        .service-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid var(--border); }
        .service-card:hover { border-color: var(--blue); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1); transform: translateY(-2px); }
        .client-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid var(--border); }
        .client-card:hover { border-color: var(--blue); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1); }
        .tab-btn { background: none; border: none; padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; color: var(--text-muted); border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .tab-btn:hover { color: var(--blue); }
        .tab-btn.active { color: var(--blue); border-bottom-color: var(--blue); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{isClaim ? 'Claim Hub' : 'Service Store'}</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{isClaim ? 'Claim services — Select claim, choose client, create ticket' : 'Professional services — Select service, choose client, create ticket'}</p>
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Services</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{storeServices.length}</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Registered Clients</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{apiClients.length}</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Departments</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{tabs.length - 1}</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Orders Today</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{ordersToday}</div>
        </div>
      </div>

      {/* Main Process Content */}
      <div style={{ marginBottom: '32px' }}>
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontWeight: 600, color: 'var(--text)' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* Progress Bar */}
        <div style={{ background: 'var(--card)', padding: '16px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', border: '1px solid var(--border)' }}>
          <ProgressStep number={1} title="Select Service" active={step === 1} completed={step > 1} />
          <div style={{ flex: 1, height: '2px', background: step > 1 ? 'var(--blue)' : 'var(--border)', margin: '0 24px' }}></div>
          <ProgressStep number={2} title="Choose Client" active={step === 2} completed={step > 2} />
          <div style={{ flex: 1, height: '2px', background: step > 2 ? 'var(--blue)' : 'var(--border)', margin: '0 24px' }}></div>
          <ProgressStep number={3} title="Confirm & Create" active={step === 3} completed={step > 3} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
                {tabs.map(tab => (
                  <button 
                    key={tab} 
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {filteredServices.map((s, i) => (
                  <div key={s._id || s.id || i} className="service-card" onClick={() => handleServiceSelect(s)} style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', background: 'var(--card)', padding: '32px 24px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>{s.icon}</div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{s.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4', flexGrow: 1 }}>{s.desc}</p>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: 'auto' }}>
                      Get Started <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: 'var(--card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>Choose Client</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '24px' }}>
                <Search size={18} color="var(--text-muted)" />
                <input type="text" placeholder="Search by name, email or phone" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent', color: 'var(--text)' }} />
              </div>

              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', marginBottom: '16px' }}>My Clients</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {apiClients.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', padding: '20px' }}>No clients found. Add a client first.</div>
                ) : (
                  apiClients.map(c => (
                    <div key={c.id} className="client-card" onClick={() => handleClientSelect(c)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                        {c.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.phone}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.email}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.7 }}>{c.crn}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', maxWidth: '600px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>Confirm & Create Ticket</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>COMPANY NAME</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search NSE/BSE company..." 
                        value={companyQuery}
                        onChange={e => {
                          setCompanyQuery(e.target.value);
                          setTicketDetails({...ticketDetails, companyName: e.target.value});
                        }}
                        onFocus={() => { if(companyResults.length > 0) setShowCompanyDropdown(true); }}
                        onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
                        style={{ width: '100%', padding: '10px 12px', paddingRight: '30px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                      {isSearchingCompany && (
                        <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                          <Loader2 size={16} className="animate-spin" color="var(--text-muted)" />
                        </div>
                      )}
                    </div>
                    {showCompanyDropdown && companyResults.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {companyResults.map(c => (
                          <div 
                            key={c._id} 
                            onClick={() => handleSelectCompany(c)}
                            style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{c.name}</div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              {c.exchanges?.includes('NSE') && <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>NSE: {c.nseSymbol}</span>}
                              {c.exchanges?.includes('BSE') && <span style={{ fontSize: '11px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>BSE: {c.bseScripCode}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>QUANTITY (SHARES)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 500" 
                      value={ticketDetails.quantity}
                      onChange={e => setTicketDetails({...ticketDetails, quantity: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Service</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{selectedService?.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Category</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{selectedService?.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Client</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{selectedClient?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Client Email</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{selectedClient?.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    onClick={() => setStep(2)}
                    style={{ padding: '10px 16px', border: '1px solid var(--border)', background: 'var(--bg)', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: 'var(--text)' }}
                  >
                    Change Client
                  </button>
                  <button 
                    onClick={handleCreateTicket}
                    disabled={isSubmitting}
                    style={{ padding: '10px 16px', border: 'none', background: 'var(--blue)', color: '#fff', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Ticket'} {!isSubmitting && <ArrowRight size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerServiceHubTab;

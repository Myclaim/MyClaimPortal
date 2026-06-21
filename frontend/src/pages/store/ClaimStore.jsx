import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

const ClaimStore = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [ticketDetails, setTicketDetails] = useState({ companyName: '', quantity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiClients, setApiClients] = useState([]);
  const navigate = useNavigate();

  const [storeServices, setStoreServices] = useState([]);
  
  useEffect(() => {
    const loadServices = () => {
      let rawServices = JSON.parse(localStorage.getItem('claimServices'));
      if (!rawServices || rawServices.length === 0) {
        rawServices = DEFAULT_CLAIM_SERVICES;
      }
      setStoreServices(rawServices.filter(s => s.status));
    };

    loadServices();

    const handleStorageChange = (e) => {
      if (e.key === 'claimServices') {
        loadServices();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Group services by category
  const groupedServices = storeServices.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push({
      ...curr,
      title: curr.name, // mapping name to title for existing logic
      desc: curr.description,
      icon: curr.category === 'Physical Shares' ? '📋' : curr.category === 'Dividends' ? '💰' : curr.category === 'Insurance' ? '🛡️' : '⚖️'
    });
    return acc;
  }, {});

  const clients = [
    { id: 1, initials: 'AK', bg: '#3b82f6', name: 'Arvind Kumar', phone: '+91 98210 33456', email: 'arvind.k@gmail.com', crn: 'CRN-2891' },
    { id: 2, initials: 'PS', bg: '#10b981', name: 'Priya Sharma', phone: '+91 97654 21890', email: 'priya.s@outlook.com', crn: 'CRN-2892' },
    { id: 3, initials: 'RM', bg: '#f97316', name: 'Ravi Mehta', phone: '+91 99887 65432', email: 'ravi.m@yahoo.com', crn: 'CRN-2893' },
    { id: 4, initials: 'SP', bg: '#8b5cf6', name: 'Sunita Patel', phone: '+91 98765 43210', email: 'sunita.p@gmail.com', crn: 'CRN-2894' },
    { id: 5, initials: 'DV', bg: '#0ea5e9', name: 'Deepak Verma', phone: '+91 96543 21789', email: 'deepak.v@gmail.com', crn: 'CRN-2895' },
    { id: 6, initials: 'MJ', bg: '#eab308', name: 'Meena Joshi', phone: '+91 94321 56789', email: 'meena.j@hotmail.com', crn: 'CRN-2896' }
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/users');
        const clientUsers = data.filter(u => u.role === 'client');
        if (clientUsers.length > 0) {
          const formatted = clientUsers.map((c, i) => ({
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
          setApiClients(clients);
        }
      } catch (err) {
        console.error('Failed to fetch clients, using mock', err);
        setApiClients(clients);
      }
    };
    fetchClients();
  }, []);

  const handleServiceSelect = (service, category) => {
    setSelectedService({ ...service, category });
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
        clientId: selectedClient._id || selectedClient.id,
        hubType: 'Claim Hub',
        subject: `New Claim Request: ${selectedService.title} for ${ticketDetails.companyName || 'N/A'}`,
        companyName: ticketDetails.companyName,
        service: selectedService.title,
        mappedStore: selectedService.mappedStore || 'All Stores',
        priority: 'high',
        notes: `Quantity: ${ticketDetails.quantity || 'N/A'}`
      };
      await api.post('/tickets', payload);
      navigate('/task-board-main');
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
    <div className="page active" style={{ display: 'block', background: 'var(--bg)', minHeight: '100vh', padding: '0 0 80px 0' }}>
      <style>{`
        .service-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid var(--border); }
        .service-card:hover { border-color: var(--blue); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1); transform: translateY(-2px); }
        .client-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid var(--border); }
        .client-card:hover { border-color: var(--blue); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1); }
      `}</style>
      
      {/* Header */}
      <div style={{ padding: '24px 32px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Claim Store</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Physical Shares & IEPF Claim services — Select service, choose client, create ticket</p>
      </div>

      {/* Store-wise Dashboard */}
      <div style={{ padding: '32px 32px 0', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Services</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{storeServices.length}</div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Registered Clients</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{apiClients.length > 0 ? apiClients.length : 6}</div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Departments</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{Object.keys(groupedServices).length}</div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #f97316' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Orders Today</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>8</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        
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
              {Object.keys(groupedServices).length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   No active claim services found. Please add them from the Department Board.
                 </div>
              ) : (
                Object.keys(groupedServices).map(category => (
                  <div key={category} style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{groupedServices[category][0].icon}</span> {category}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                      {groupedServices[category].map(s => (
                        <div key={s.id} className="service-card" onClick={() => handleServiceSelect(s, category)} style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', background: 'var(--card)', padding: '32px 24px', borderRadius: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: '16px' }}>{s.icon}</div>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{s.title}</h4>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4', flexGrow: 1 }}>{s.desc}</p>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: 'auto' }}>
                            Get Started <ArrowRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: 'var(--card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>Choose Client</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '24px' }}>
                <Search size={18} color="var(--text-muted)" />
                <input type="text" placeholder="Search by name, email or phone" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent', color: 'var(--text)' }} />
              </div>

              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', marginBottom: '16px' }}>All Clients</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {apiClients.map(c => (
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
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', maxWidth: '600px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>Confirm & Create Ticket</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>COMPANY NAME</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Reliance Industries, TCS Ltd" 
                      value={ticketDetails.companyName}
                      onChange={e => setTicketDetails({...ticketDetails, companyName: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
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

export default ClaimStore;

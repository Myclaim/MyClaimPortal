import React, { useState, useEffect } from 'react';
import { Search, Check, ArrowRight, ArrowLeft, Plus, Edit2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DEFAULT_STORE_SERVICES = [
  { id: 't1', code: 'STR-SWG-001', name: 'Swiggy', category: 'Pre-IPO Equity', subCategory: 'Food Tech', price: '480 - 495', stages: 4, status: true, mappedStore: 'Store A', description: 'Pre-IPO shares of Swiggy', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't2', code: 'STR-PHP-002', name: 'PhonePe', category: 'Pre-IPO Equity', subCategory: 'Fintech', price: '1200 - 1250', stages: 4, status: true, mappedStore: 'Store B', description: 'Pre-IPO shares of PhonePe', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't3', code: 'STR-ATH-003', name: 'Ather Energy', category: 'Pre-IPO Equity', subCategory: 'EV', price: '650 - 700', stages: 4, status: true, mappedStore: 'All Stores', description: 'Pre-IPO shares of Ather Energy', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't4', code: 'STR-LNS-004', name: 'Lenskart', category: 'Pre-IPO Equity', subCategory: 'Retail', price: '320 - 360', stages: 4, status: true, mappedStore: 'All Stores', description: 'Pre-IPO shares of Lenskart', tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
  { id: 't5', code: 'STR-BYJ-005', name: "BYJU's", category: 'Pre-IPO Equity', subCategory: 'EdTech', price: '10 - 15', stages: 4, status: false, mappedStore: 'Store A', description: "Pre-IPO shares of BYJU's", tracking: ['Order Placed', 'Payment Verified', 'Transfer Initiated', 'Shares Credited'] },
];

const PreIpoStore = () => {
  const [step, setStep] = useState(1);
  const [selectedFund, setSelectedFund] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [ticketDetails, setTicketDetails] = useState({ quantity: '', type: 'BUY' });
  const [apiClients, setApiClients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [storeFunds, setStoreFunds] = useState([]);
  const { user } = useAuth();


  const fetchPreIpos = async () => {
    try {
      const { data } = await api.get('/pre-ipo');
      if (data && data.length > 0) {
        setStoreFunds(data.filter(ipo => ipo.status !== false).map(ipo => ({
          ...ipo,
          id: ipo._id,
          sector: ipo.subCategory || 'Pre-IPO',
          isin: `INE-${ipo.code}`,
          minQty: 10
        })));
      } else {
        // Fallback to local
        setStoreFunds(DEFAULT_STORE_SERVICES.map((s, i) => ({
          ...s,
          sector: s.subCategory || 'Pre-IPO',
          isin: `INE000000${100 + i}`,
          minQty: 25,
          availableEquity: 5000,
          totalEquity: 5000
        })));
      }
    } catch (error) {
      console.error('Error fetching Pre-IPOs', error);
    }
  };


  useEffect(() => {
    fetchPreIpos();

    
  }, []);

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

  const handleFundSelect = (fund) => {
    setSelectedFund(fund);
    setStep(2);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setStep(3);
  };

    const handleConfirmOrder = async () => {
    if (!selectedClient || !selectedFund) return;
    setIsSubmitting(true);
    try {
      if (selectedFund._id) {
        // Dynamic Allocation
        await api.post(`/pre-ipo/${selectedFund._id}/allocate`, {
          clientId: selectedClient._id || selectedClient.id,
          clientName: selectedClient.name,
          quantity: ticketDetails.quantity || 1
        });
      }
      
      const payload = {
        ticketNo: String(Date.now()),
        clientId: selectedClient._id || selectedClient.id,
        hubType: 'Store Hub',
        subject: `Pre-IPO Order: ${selectedFund.name}`,
        service: selectedFund.name,
        priority: 'high',
        notes: `Quantity: ${ticketDetails.quantity || 'N/A'}, Type: ${ticketDetails.type}`
      };
      await api.post('/tickets', payload);
      
      fetchPreIpos(); // Update live equity
      navigate('/task-board-main');
    } catch (err) {
      console.error('Failed to create order', err);
      alert(err.response?.data?.message || 'Failed to create order. Please check inputs.');
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
        .fund-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid var(--border); }
        .fund-card:hover { border-color: var(--blue); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1); transform: translateY(-2px); }
        .client-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid var(--border); }
        .client-card:hover { border-color: var(--blue); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1); }
      `}</style>
      
      {/* Header */}
      <div style={{ padding: '24px 32px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Store Pre-IPO</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pre-IPO shares — Select company, choose client, set quantity, buy/sell</p>
      
      </div>

      {/* Store-wise Dashboard */}
      <div style={{ padding: '32px 32px 0', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Available Funds</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{storeFunds.length}</div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Registered Clients</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{apiClients.length > 0 ? apiClients.length : 6}</div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Departments</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>1</div>
          </div>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #f97316' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Orders Today</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>21</div>
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
          <ProgressStep number={1} title="Select Fund" active={step === 1} completed={step > 1} />
          <div style={{ flex: 1, height: '2px', background: step > 1 ? 'var(--blue)' : 'var(--border)', margin: '0 24px' }}></div>
          <ProgressStep number={2} title="Choose Client" active={step === 2} completed={step > 2} />
          <div style={{ flex: 1, height: '2px', background: step > 2 ? 'var(--blue)' : 'var(--border)', margin: '0 24px' }}></div>
          <ProgressStep number={3} title="Set Qty & Type" active={step === 3} completed={step > 3} />
          <div style={{ flex: 1, height: '2px', background: step > 3 ? 'var(--blue)' : 'var(--border)', margin: '0 24px' }}></div>
          <ProgressStep number={4} title="Confirm" active={step === 4} completed={step > 4} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {storeFunds.map(f => (
                  <div key={f.id} className="fund-card" onClick={() => handleFundSelect(f)} style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', background: 'var(--card)', padding: '24px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{f.name}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>{f.sector}</p>
                    
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>ISIN</span>
                      <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700 }}>{f.isin}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Price Range</span>
                      <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 800 }}>₹{f.price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', background: 'rgba(59, 130, 246, 0.05)', padding: '8px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Available</span>
                      <span style={{ fontSize: '13px', color: 'var(--blue)', fontWeight: 800 }}>{f.availableEquity !== undefined ? f.availableEquity : 5000}</span>
                    </div>




                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
                      Choose Client <ArrowRight size={14} />
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: 'var(--card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Set Quantity & Type</h2>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pre-IPO • {selectedClient?.name}</div>
              </div>
              
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' }}>{selectedFund?.name}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>QUANTITY</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 25" 
                    value={ticketDetails.quantity}
                    onChange={e => setTicketDetails({...ticketDetails, quantity: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Min: {selectedFund?.minQty}, Available: 1977</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>TYPE</label>
                  <select 
                    value={ticketDetails.type}
                    onChange={e => setTicketDetails({...ticketDetails, type: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', appearance: 'none' }}
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setStep(4)}
                  style={{ padding: '10px 20px', border: 'none', background: 'var(--blue)', color: '#fff', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', maxWidth: '450px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' }}>Confirm Order</h2>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Company</span>
                    <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '14px' }}>{selectedFund?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Client</span>
                    <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '14px' }}>{selectedClient?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Quantity</span>
                    <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '14px' }}>{ticketDetails.quantity || 0} shares</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Type</span>
                    <span style={{ fontWeight: 700, color: ticketDetails.type === 'BUY' ? '#10b981' : '#ef4444', fontSize: '11px', background: ticketDetails.type === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                      {ticketDetails.type}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    style={{ padding: '10px 24px', border: 'none', background: 'var(--blue)', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Order'} {!isSubmitting && <Check size={16} />}
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

export default PreIpoStore;

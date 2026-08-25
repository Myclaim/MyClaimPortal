import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, FileText, CheckCircle2, TrendingUp, AlertTriangle, XCircle, Check } from 'lucide-react';
import api from '../../../services/api';

const ClientStoreProposalsTab = ({ user }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredProposals = proposals.filter(p => {
    if (filterStatus === 'All') return true;
    const s = p.status?.toLowerCase() || '';
    const isAccepted = s.includes('accepted') || s.includes('active') || s.includes('converted');
    const isDeclined = s.includes('declined');
    
    if (filterStatus === 'Accepted') return isAccepted;
    if (filterStatus === 'Declined') return isDeclined;
    if (filterStatus === 'In Progress') return !isAccepted && !isDeclined;
    return true;
  });

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const res = await api.get('/proposals');
        // Filter proposals for the current client by matching clientName
        const myProposals = res.data.filter(
          (p) => 
            p.clientName === user?.name || 
            p.clientName === user?.username || 
            p.clientName === user?.email
        );
        setProposals(myProposals);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setError('Failed to load store proposals.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProposals();
    }
  }, [user]);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('active') || s.includes('converted') || s.includes('accepted')) return '#10B981';
    if (s.includes('declined')) return '#EF4444';
    if (s.includes('review') || s.includes('progress') || s.includes('sent')) return '#F59E0B';
    return '#818CF8';
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`/proposals/${id}`, { status: newStatus });
      if (res.status === 200 || res.status === 201) {
        setProposals(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error('Failed to update proposal', err);
      alert('Failed to update proposal status');
    }
  };

  return (
    <div style={{ padding: '24px 0', animation: 'fadeSlideUp 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ 
          width: 48, height: 48, borderRadius: '12px', 
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', 
          display: 'grid', placeItems: 'center', color: '#10B981' 
        }}>
          <ShoppingBag size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--dashboard-text)' }}>Store Proposals</h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--dashboard-text-muted)' }}>Proposals and orders placed from the Wealtharth Store</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['All', 'In Progress', 'Accepted', 'Declined'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterStatus === status ? 'none' : '1px solid var(--dashboard-border)',
              background: filterStatus === status ? 'var(--blue, #3B82F6)' : 'transparent',
              color: filterStatus === status ? '#fff' : 'var(--dashboard-text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--dashboard-text-muted)' }}>
          <Clock size={32} style={{ animation: 'spinSlow 2s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}>
          {error}
        </div>
      ) : filteredProposals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--dashboard-card-soft)', border: '1px solid var(--dashboard-border)', borderRadius: '16px' }}>
          <ShoppingBag size={48} style={{ color: 'var(--dashboard-text-muted)', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: 'var(--dashboard-text)' }}>No proposals found</h3>
          <p style={{ margin: 0, color: 'var(--dashboard-text-muted)' }}>
            {proposals.length > 0 ? `No proposals match the "${filterStatus}" filter.` : "You haven't placed any store orders or received any proposals yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredProposals.map((prop, idx) => (
            <div key={prop._id || idx} style={{ 
              background: 'var(--dashboard-card)', 
              border: '1px solid var(--dashboard-border)', 
              borderRadius: '16px', 
              padding: '24px', 
              display: 'flex', flexDirection: 'column', gap: '16px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: 'var(--dashboard-text)' }}>
                  {prop.category || 'Store Item'}
                </div>
                <div style={{ 
                  background: `${getStatusColor(prop.status)}15`, 
                  color: getStatusColor(prop.status), 
                  border: `1px solid ${getStatusColor(prop.status)}30`,
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800
                }}>
                  {prop.status}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dashboard-text)', marginBottom: '8px', lineHeight: 1.3 }}>
                  {prop.serviceRequest}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--dashboard-text-muted)' }}>
                  {prop.notes || 'No additional notes provided.'}
                </div>
              </div>

              {prop.status === 'Proposal Sent' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button 
                    onClick={() => handleUpdateStatus(prop._id, 'Accepted')}
                    style={{ flex: 1, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Check size={16} /> Accept
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(prop._id, 'Declined')}
                    style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <XCircle size={16} /> Decline
                  </button>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--dashboard-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--dashboard-text-muted)' }}>
                  <Clock size={14} />
                  {new Date(prop.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
                {prop.priority && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: '#F59E0B' }}>
                    <AlertTriangle size={12} /> {prop.priority}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientStoreProposalsTab;

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const CreateTicketModal = ({ onClose, onSuccess, initialClients, defaultClientId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState(initialClients || []);
  const [users, setUsers] = useState([]);
  
  const [form, setForm] = useState({
    hubType: 'Service Hub',
    client: defaultClientId || '',
    companyName: '',
    service: '',
    assignedTo: '',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    // Fetch clients if not provided
    const fetchData = async () => {
      try {
        const [usersRes] = await Promise.all([
          api.get('/users')
        ]);
        
        // Find clients if we need to
        if (!initialClients) {
          const fetchedClients = usersRes.data.filter(u => u.role === 'client');
          setClients(fetchedClients);
        }

        // Find employees/admins for assignment
        const teamMembers = usersRes.data.filter(u => ['employee', 'admin', 'super_admin'].includes(u.role));
        setUsers(teamMembers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    
    fetchData();
  }, [initialClients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client || !form.service) {
      alert('Client and Service Category are required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        clientId: form.client,
        service: form.service,
        companyName: form.companyName,
        hubType: form.hubType,
        priority: form.priority,
        assignedTo: form.assignedTo || undefined,
        notes: form.notes
      };

      const { data } = await api.post('/tickets', payload);
      if (onSuccess) {
        onSuccess(data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)', 
        borderRadius: '16px', width: '100%', maxWidth: '640px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '24px 32px', borderBottom: '1px solid var(--border)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Create New Ticket</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: '1px solid var(--border)', 
              borderRadius: '8px', padding: '6px', color: 'var(--text-light)', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '32px', overflowY: 'auto' }}>
          <form id="create-ticket-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Hub Type</label>
              <select 
                name="hubType"
                value={form.hubType} 
                onChange={handleChange}
                style={{
                  padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', 
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none'
                }}
              >
                <option value="Service Hub">Service Hub</option>
                <option value="Claim Hub">Claim Hub</option>
                <option value="Store Hub">Store Hub</option>
                <option value="Support Hub">Support Hub</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Client</label>
              <select 
                name="client"
                value={form.client} 
                onChange={handleChange}
                style={{
                  padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', 
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none'
                }}
              >
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {form.hubType === 'Claim Hub' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Company Name</label>
                <input 
                  type="text"
                  name="companyName"
                  placeholder="e.g. Reliance Industries, TATA Motors"
                  value={form.companyName} 
                  onChange={handleChange}
                  style={{
                    padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', 
                    borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Service / Category</label>
              <input 
                type="text"
                name="service"
                placeholder="e.g. IEPF Claim Settlement"
                value={form.service} 
                onChange={handleChange}
                style={{
                  padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', 
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Assigned To</label>
              <select 
                name="assignedTo"
                value={form.assignedTo} 
                onChange={handleChange}
                style={{
                  padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', 
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none'
                }}
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Priority</label>
              <select 
                name="priority"
                value={form.priority} 
                onChange={handleChange}
                style={{
                  padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', 
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Notes</label>
              <textarea 
                name="notes"
                placeholder="Ticket notes..." 
                value={form.notes} 
                onChange={handleChange}
                style={{
                  padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', 
                  borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                  minHeight: '100px', resize: 'vertical'
                }}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '24px 32px', borderTop: '1px solid var(--border)', 
          display: 'flex', justifyContent: 'flex-end', gap: '16px', background: 'var(--card)',
          borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
        }}>
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '12px 24px', background: 'var(--bg)', color: 'var(--text)', 
              border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', 
              fontWeight: 700, cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="create-ticket-form"
            disabled={loading}
            style={{
              padding: '12px 24px', background: 'var(--blue)', color: '#fff', border: 'none', 
              borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateTicketModal;

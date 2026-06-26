import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AddFamilyMemberModal = ({ isOpen, onClose, clientId, onSuccess, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    relationWithHolder: '',
    phone: '',
    email: '',
    dob: '',
    panNo: '',
    aadharNo: ''
  });

  React.useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        relationWithHolder: initialData.relationWithHolder || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        dob: initialData.dob || '',
        panNo: initialData.panNo || '',
        aadharNo: initialData.aadharNo || ''
      });
    } else {
      setForm({
        name: '',
        relationWithHolder: '',
        phone: '',
        email: '',
        dob: '',
        panNo: '',
        aadharNo: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-format Aadhar
    if (name === 'aadharNo') {
      let val = value.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
      value = val;
    }

    // Auto-format PAN
    if (name === 'panNo') {
      let val = value.toUpperCase();
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i < 4) {
          if (/[A-Z]/.test(val[i])) formatted += val[i];
        } else if (i < 8) {
          if (/[0-9]/.test(val[i])) formatted += val[i];
        } else if (i < 9) {
          if (/[A-Z]/.test(val[i])) formatted += val[i];
        }
      }
      value = formatted;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.name || !form.phone || !form.relationWithHolder) {
        throw new Error('Name, Phone, and Relation are required.');
      }

      const payload = {
        name: form.name,
        email: form.email.toLowerCase(),
        phone: form.phone,
        dob: form.dob,
        relationWithHolder: form.relationWithHolder,
        panNo: form.panNo,
        aadharNo: form.aadharNo
      };

      if (initialData && initialData._id) {
        await api.put(`/users/${clientId}/family/${initialData._id}`, payload);
      } else {
        await api.post(`/users/${clientId}/family`, payload);
      }

      setForm({
        name: '',
        relationWithHolder: '',
        phone: '',
        email: '',
        dob: '',
        panNo: '',
        aadharNo: ''
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{initialData ? 'Edit Family Member' : 'Add Family Member'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Rahul Kumar" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Relation to Primary Client *</label>
              <select name="relationWithHolder" value={form.relationWithHolder} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#fff' }}>
                <option value="">Select Relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Phone *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Date of Birth</label>
                <input name="dob" type="date" value={form.dob} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Aadhaar Number</label>
                <input name="aadharNo" value={form.aadharNo} onChange={handleChange} placeholder="0000 0000 0000" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>PAN Number</label>
                <input name="panNo" value={form.panNo} onChange={handleChange} placeholder="ABCDE1234F" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
              {loading ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFamilyMemberModal;

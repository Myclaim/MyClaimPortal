import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess, linkedTo, ticketId, clientId }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedType, setSelectedType] = useState(linkedTo || 'client');
  const [selectedId, setSelectedId] = useState(ticketId || clientId || '');
  const [docCategory, setDocCategory] = useState('primary');

  useEffect(() => {
    if (isOpen) {
      if (!linkedTo) {
        fetchInitialData();
      }
    } else {
      setFile(null);
      setName('');
      setError('');
      setSuccess(false);
      setLoading(false);
      setDocCategory('primary');
    }
  }, [isOpen, linkedTo]);

  const fetchInitialData = async () => {
    try {
      const [ticketsRes, clientsRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/users?role=client')
      ]);
      setTickets(ticketsRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.error('Error fetching data for modal', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      setFile(selectedFile);
      setName(selectedFile.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('linked_to', selectedType);
    formData.append('doc_category', docCategory);
    if (selectedType === 'ticket') {
      formData.append('ticket_id', selectedId);
    } else {
      formData.append('client_id', selectedId);
    }
    formData.append('file', file);

    try {
      const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess(data);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Upload Document</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ color: '#10b981', marginBottom: '10px' }}><CheckCircle size={48} style={{ margin: '0 auto' }} /></div>
              <h4 style={{ fontWeight: 800, fontSize: '18px' }}>Upload Successful!</h4>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Your document has been linked.</p>
            </div>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Document Name / Tag</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. PAN Card, Salary Slip"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Category</label>
                <select 
                  className="form-select" 
                  value={docCategory} 
                  onChange={(e) => setDocCategory(e.target.value)}
                >
                  <option value="primary">1. Personal Docs (PAN, Aadhaar, Photo, Sign)</option>
                  <option value="address">2. Proof of Address (Passport, Voter ID, bills...)</option>
                  <option value="income">3. Income Proof (Bank Statement, Salary Slip...)</option>
                  <option value="others">4. Other Documents (Nominee, Minor, etc.)</option>
                </select>
              </div>

              {!linkedTo && (
                <div className="form-row cols-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Link To</label>
                    <select 
                      className="form-select" 
                      value={selectedType} 
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                        setSelectedId('');
                      }}
                    >
                      <option value="client">Client</option>
                      <option value="ticket">Ticket</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select Owner</label>
                    <select 
                      className="form-select" 
                      value={selectedId} 
                      onChange={(e) => setSelectedId(e.target.value)}
                      required
                    >
                      <option value="">Choose...</option>
                      {selectedType === 'ticket' ? (
                        tickets.map(t => (
                          <option key={t._id} value={t._id}>
                            #{t._id.slice(-6).toUpperCase()} - {t.service}
                          </option>
                        ))
                      ) : (
                        clients.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              )}

              <div 
                className="upload-zone" 
                onClick={() => document.getElementById('file-input').click()}
                style={{ marginBottom: '16px', borderColor: file ? '#15803d' : '#cbd5e1' }}
              >
                <input 
                  id="file-input" 
                  type="file" 
                  hidden 
                  onChange={handleFileChange} 
                />
                <div className="upload-icon"><Upload size={32} color={file ? '#15803d' : '#94a3b8'} /></div>
                <div className="upload-title">{file ? file.name : 'Select a file'}</div>
                <div className="upload-sub">PDF, Word, or Images (Max 5MB)</div>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', fontWeight: 600 }}>{error}</div>}
            </>
          )}
          
          {!success && (
            <div className="modal-footer" style={{ border: 'none', background: 'transparent', padding: 0 }}>
              <button 
                type="button" 
                className="topbar-btn secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="topbar-btn" 
                disabled={loading || !file || (!linkedTo && !selectedId)}
              >
                {loading ? 'Uploading...' : 'Upload Now'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;

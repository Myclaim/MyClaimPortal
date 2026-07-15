import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess, linkedTo, ticketId, clientId, folderId, theme = 'light' }) => {
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

  const isDark = theme === 'dark';

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
      setFile(selectedFile);
      setName(selectedFile.name);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setName(droppedFile.name);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    formData.append('folder', 'NestedFolder');
    if (folderId) {
      formData.append('folder_id', folderId);
    }
    
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
    <div className="modal-overlay open" style={{ zIndex: 1000, background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(0,0,0,0.5)', backdropFilter: isDark ? 'blur(8px)' : 'none' }}>
      <div className="modal" style={{ maxWidth: '450px', background: isDark ? 'var(--dashboard-card)' : '#fff', border: isDark ? '1px solid var(--dashboard-border)' : '1px solid #e2e8f0', color: isDark ? '#fff' : '#0f172a' }}>
        <div className="modal-header" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
          <h3 className="modal-title" style={{ color: isDark ? '#fff' : '#0f172a' }}>Upload Document</h3>
          <button className="modal-close" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'inherit', background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ color: '#10b981', marginBottom: '10px' }}><CheckCircle size={48} style={{ margin: '0 auto' }} /></div>
              <h4 style={{ fontWeight: 800, fontSize: '18px', color: isDark ? '#fff' : 'inherit' }}>Upload Successful!</h4>
              <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: '14px' }}>Your document has been linked.</p>
            </div>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'inherit' }}>Document Name / Tag</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. PAN Card, Salary Slip"
                  style={isDark ? { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' } : undefined}
                />
              </div>

              {!linkedTo && (
                <div className="form-row cols-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'inherit' }}>Link To</label>
                    <select 
                      className="form-select" 
                      value={selectedType} 
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                        setSelectedId('');
                      }}
                      style={isDark ? { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' } : undefined}
                    >
                      <option value="client">Client</option>
                      <option value="ticket">Ticket</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'inherit' }}>Select Owner</label>
                    <select 
                      className="form-select" 
                      value={selectedId} 
                      onChange={(e) => setSelectedId(e.target.value)}
                      required
                      style={isDark ? { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' } : undefined}
                    >
                      <option value="">Choose...</option>
                      {selectedType === 'ticket' ? (
                        tickets.map(t => (
                          <option key={t._id} value={t._id}>
                            #{new Date(t.createdAt).getTime()} - {t.service}
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
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ marginBottom: '16px', borderColor: file ? '#10b981' : (isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'), borderStyle: 'dashed', borderWidth: '2px', padding: '30px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', color: isDark ? '#fff' : 'inherit' }}
              >
                <input 
                  id="file-input" 
                  type="file" 
                  hidden 
                  onChange={handleFileChange} 
                />
                <div className="upload-icon"><Upload size={32} color={file ? '#10b981' : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8')} /></div>
                <div className="upload-title">{file ? file.name : 'Select a file'}</div>
                <div className="upload-sub" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Any file type (No size limit)</div>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', fontWeight: 600 }}>{error}</div>}
            </>
          )}
          
          {!success && (
            <div className="modal-footer" style={{ border: 'none', background: 'transparent', padding: 0 }}>
              <button 
                type="button" 
                className={isDark ? "claim-btn-sec" : "topbar-btn secondary"}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={isDark ? "claim-btn-primary" : "topbar-btn"}
                disabled={loading || !file || (!linkedTo && !selectedId)}
                style={isDark ? { background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none' } : undefined}
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

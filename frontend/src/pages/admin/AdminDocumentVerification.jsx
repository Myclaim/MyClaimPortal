import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, CheckCircle, XCircle, Clock, Eye, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const AdminDocumentVerification = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Assuming getDocuments returns all docs for admin
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedDoc) return;
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/documents/${selectedDoc._id}/verify`, {
        status,
        notes: actionNotes
      });
      // Update local state
      setDocuments(prev => prev.map(d => d._id === data._id ? data : d));
      setSelectedDoc(null);
      setActionNotes('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update document status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (statusFilter !== 'all' && doc.verification_status !== statusFilter && !(statusFilter === 'pending' && !doc.verification_status)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!doc.name?.toLowerCase().includes(term) && !doc.client_id?.name?.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    if (status === 'verified') return <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Verified</span>;
    if (status === 'rejected') return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejected</span>;
    return <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending</span>;
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Document Verification Center</div>
          <div className="topbar-subtitle">Review and verify client documents</div>
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        {/* Filters */}
        <div className="card" style={{ padding: '16px', display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="search-input" style={{ flex: 1, minWidth: '300px' }}>
            <Search size={18} color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Search by document name or client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-select" 
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Documents Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Client</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading documents...</td></tr>
                ) : filteredDocs.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No documents found.</td></tr>
                ) : (
                  filteredDocs.map(doc => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{doc.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.file_type?.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {doc.client_id ? (
                          <>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '13px' }}>{doc.client_id.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.client_id.email}</div>
                          </>
                        ) : '—'}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {doc.doc_category || 'Others'}
                        </span>
                      </td>
                      <td>
                        {getStatusBadge(doc.verification_status || 'pending')}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="action-icon" 
                          title="Review Document"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedDoc && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={() => setSelectedDoc(null)}>
          <div style={{
            background: 'var(--card)', width: '100%', maxWidth: '900px', height: '85vh',
            borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>Document Review</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedDoc.name}</div>
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedDoc(null)}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
              {/* Document Preview (Left) */}
              <div style={{ flex: '2', background: 'var(--bg)', borderRight: '1px solid var(--border)', position: 'relative' }}>
                {selectedDoc.file_url ? (
                  <iframe 
                    src={`https://myclaimportal.onrender.com${selectedDoc.file_url}`} 
                    style={{ width: '100%', height: '100%', border: 'none' }} 
                    title="Document Preview"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No preview available
                  </div>
                )}
              </div>

              {/* Action Panel (Right) */}
              <div style={{ flex: '1', padding: '24px', display: 'flex', flexDirection: 'column', background: 'var(--card)', overflowY: 'auto' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Current Status</div>
                  {getStatusBadge(selectedDoc.verification_status || 'pending')}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Details</div>
                  <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}><b>Client:</b> {selectedDoc.client_id?.name || 'N/A'}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}><b>Category:</b> <span style={{ textTransform: 'capitalize' }}>{selectedDoc.doc_category || 'Others'}</span></div>
                  <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}><b>Uploaded:</b> {new Date(selectedDoc.createdAt).toLocaleString()}</div>
                </div>

                <div style={{ marginBottom: '24px', flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Verification Notes (Optional)</div>
                  <textarea 
                    style={{ width: '100%', height: '120px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', color: 'var(--text)', outline: 'none', resize: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                    placeholder="Add notes explaining verification or rejection reason..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />
                  {selectedDoc.verification_notes && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '13px', color: 'var(--text)' }}>
                      <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '4px' }}><AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Previous Notes:</div>
                      {selectedDoc.verification_notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    disabled={submitting || selectedDoc.verification_status === 'verified'}
                    onClick={() => handleUpdateStatus('verified')}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: (submitting || selectedDoc.verification_status === 'verified') ? 'not-allowed' : 'pointer', opacity: (submitting || selectedDoc.verification_status === 'verified') ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                  >
                    <CheckCircle size={18} /> Verify Document
                  </button>
                  <button 
                    disabled={submitting || selectedDoc.verification_status === 'rejected'}
                    onClick={() => handleUpdateStatus('rejected')}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: (submitting || selectedDoc.verification_status === 'rejected') ? 'not-allowed' : 'pointer', opacity: (submitting || selectedDoc.verification_status === 'rejected') ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <XCircle size={18} /> Reject & Request Reupload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentVerification;

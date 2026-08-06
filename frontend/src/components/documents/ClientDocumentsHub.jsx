import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Download, Eye, X, RefreshCw, Clock, Building2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ClientDocumentsHub = ({ documents, clientProfile, user, onRefresh, themeProp }) => {
  const { theme: contextTheme } = useTheme();
  const theme = themeProp || contextTheme || 'light';
  const isLight = theme === 'light';
  const vText = isLight ? '#0f172a' : '#f8fafc';
  const vTextMuted = isLight ? '#64748b' : '#94a3b8';
  const vCard = isLight ? '#ffffff' : 'rgba(30, 41, 59, 0.5)';
  const vCardSoft = isLight ? '#f8fafc' : 'rgba(30, 41, 59, 0.3)';
  const vBorder = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
  const BASE_URL = import.meta.env.DEV ? 'http://localhost:5005' : 'https://myclaimportal.onrender.com';
  const [activeSubTab, setActiveSubTab] = useState('Client Documents');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [companyDocs, setCompanyDocs] = useState([]);
  const [legalDocs, setLegalDocs] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingLegal, setLoadingLegal] = useState(false);

  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const submitVerification = async (status, docId) => {
    setVerifyLoading(true);
    try {
      await axios.patch(`${BASE_URL}/api/documents/${docId}/verify`, {
        status,
        notes: verifyNotes
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setVerifyNotes('');
      setPreviewDoc(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update document status');
    } finally {
      setVerifyLoading(false);
    }
  };

  const fetchCompanyDocs = async () => {
    setLoadingCompany(true);
    try {
      const url = user?.role === 'client' ? `${BASE_URL}/api/documents/company` : `${BASE_URL}/api/documents/company?client_id=${clientProfile._id}`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCompanyDocs(data);
    } catch (err) {
      console.error('Error fetching company documents:', err);
    } finally {
      setLoadingCompany(false);
    }
  };

  const fetchLegalDocs = async () => {
    setLoadingLegal(true);
    try {
      const url = user?.role === 'client' ? `${BASE_URL}/api/documents/legal` : `${BASE_URL}/api/documents/legal?client_id=${clientProfile._id}`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLegalDocs(data);
    } catch (err) {
      console.error('Error fetching legal documents:', err);
    } finally {
      setLoadingLegal(false);
    }
  };

  // Lazy-load tab data on first switch
  useEffect(() => {
    if (activeSubTab === 'Company Documents' && companyDocs.length === 0 && !loadingCompany) {
      fetchCompanyDocs();
    }
    if (activeSubTab === 'Legal Documents' && legalDocs.length === 0 && !loadingLegal) {
      fetchLegalDocs();
    }
  }, [activeSubTab]);

  const getDocDetails = (docName) => {
    let doc = documents.find(d => d.name.toLowerCase() === docName.toLowerCase());
    if (!doc) {
      doc = documents.find(d => d.name.toLowerCase().includes(docName.toLowerCase().replace(' card', '').trim()));
    }
    
    if (doc) {
      return {
        uploaded: true,
        status: doc.verification_status || 'pending',
        url: doc.file_url,
        name: doc.name,
        docRecord: doc
      };
    }
    
    if (clientProfile?.kyc_data) {
      if (docName === 'PAN Card' && clientProfile.kyc_data.panCardFile) {
        return { uploaded: true, status: 'verified', url: clientProfile.kyc_data.panCardFile, name: 'PAN Card' };
      }
      if (docName === 'Aadhaar Card' && clientProfile.kyc_data.aadharCardFile) {
        return { uploaded: true, status: 'verified', url: clientProfile.kyc_data.aadharCardFile, name: 'Aadhaar Card' };
      }
    }
    
    return { uploaded: false, status: 'Not uploaded' };
  };

  const handleFileUpload = async (file, docName) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', docName);
    formData.append('linked_to', 'client');
    formData.append('doc_category', activeSubTab === 'Company Documents' ? 'company' : (activeSubTab === 'Legal Documents' ? 'legal' : 'primary'));
    formData.append('folder', 'General');
    formData.append('client_id', clientProfile?._id || clientProfile?.id || user?._id || user?.id);

    try {
      await axios.post(`${BASE_URL}/api/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await onRefresh();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const triggerDirectUpload = (docName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        await handleFileUpload(file, docName);
      }
    };
    input.click();
  };

  const triggerGeneralUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const docName = prompt("Enter a name/tag for this document:", file.name);
        if (docName) {
          await handleFileUpload(file, docName);
        }
      }
    };
    input.click();
  };

  const primaryDocs = documents.filter(d => d.doc_category === 'primary');
  const uniquePrimaryNames = [...new Set(primaryDocs.map(d => d.name))];
  const cardItems = uniquePrimaryNames.map(name => ({ name, type: 'dynamic' }));
  
  if (!cardItems.find(c => c.name.toLowerCase() === 'aadhaar card')) cardItems.unshift({ name: 'Aadhaar Card', type: 'aadhaar' });
  if (!cardItems.find(c => c.name.toLowerCase() === 'pan card')) cardItems.unshift({ name: 'PAN Card', type: 'pan' });

  /* ── read-only card for admin/legal docs ── */
  const ReadOnlyDocCard = ({ doc }) => {
    const ext = doc.file_url?.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);
    const isPDF = ext === 'pdf';
    const formatSize = (b) => !b ? '' : b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return (
      <div style={{ background: 'rgba(129,140,248,0.03)', border: '1px solid rgba(129,140,248,0.18)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, transition: 'transform 0.2s ease, border-color 0.2s ease' }} className="family-node-hover">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', border: '1px solid rgba(129,140,248,0.2)', flexShrink: 0 }}>
            <FileText size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: vText, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: vTextMuted, background: 'rgba(129,140,248,0.08)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(129,140,248,0.15)' }}>{isPDF ? 'PDF' : isImage ? 'Image' : ext.toUpperCase() || 'File'}</span>
              {doc.file_size && <span style={{ fontSize: '11px', color: vTextMuted }}>{formatSize(doc.file_size)}</span>}
              {doc.createdAt && <span style={{ fontSize: '11px', color: vTextMuted }}>{formatDate(doc.createdAt)}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setPreviewDoc({ name: doc.name, url: doc.file_url })} title="Preview" style={{ width: 36, height: 36, borderRadius: '50%', background: vCard, border: '1px solid var(--dashboard-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: vText, cursor: 'pointer' }}>
            <Eye size={15} />
          </button>
          <a href={`${BASE_URL}/${doc.file_url.replace(/^[/\\]+/, '').replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" title="Download" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', textDecoration: 'none' }}>
            <Download size={15} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="client-docs-hub" style={{ position: 'relative' }}>
      
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: vCard, border: '1px solid var(--dashboard-border)', borderRadius: '20px', width: '90%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: vText }}>{previewDoc.name}</h3>
                {previewDoc.url && (
                  <a href={`${BASE_URL}/${previewDoc.url.replace(/^[/\\]+/, '').replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', background: vCard, border: '1px solid var(--dashboard-border)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', color: vText, fontWeight: 700, cursor: 'pointer' }}><Download size={14} /> View Original</a>
                )}
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} onClick={() => setPreviewDoc(null)}><X size={22} /></button>
            </div>
            {previewDoc.docRecord && (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'partner') && (
              <div style={{ padding: '16px 24px', background: vCard, borderBottom: '1px solid var(--dashboard-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: vTextMuted, marginBottom: '6px' }}>Verification Status: <span style={{ color: previewDoc.docRecord.verification_status === 'verified' ? '#10B981' : previewDoc.docRecord.verification_status === 'rejected' ? '#EF4444' : '#F59E0B' }}>{(previewDoc.docRecord.verification_status || 'pending').toUpperCase()}</span></div>
                  <input type="text" placeholder="Add verification notes (optional)" value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', background: vCardSoft, color: vText, fontSize: '13px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '20px' }}>
                  <button disabled={verifyLoading} onClick={() => submitVerification('verified', previewDoc.docRecord._id)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 700, cursor: 'pointer', opacity: verifyLoading ? 0.5 : 1 }}>Approve</button>
                  <button disabled={verifyLoading} onClick={() => submitVerification('rejected', previewDoc.docRecord._id)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', fontWeight: 700, cursor: 'pointer', opacity: verifyLoading ? 0.5 : 1 }}>Reject</button>
                </div>
              </div>
            )}
            <div style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#0a0f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                if (!previewDoc.url) return <div style={{ color: vText, fontSize: '16px' }}>No file uploaded yet.</div>;
                const normalizedUrl = previewDoc.url.replace(/\\/g, '/');
                const fullUrl = previewDoc.url.startsWith('http') ? previewDoc.url : `${BASE_URL}/${normalizedUrl.replace(/^\/+/, '')}`;
                const ext = fullUrl.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                return isImage ? <img src={fullUrl} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <iframe src={fullUrl} title={previewDoc.name} style={{ width: '100%', height: '100%', border: 'none' }} />;
              })()}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--dashboard-border)', marginBottom: 24 }}>
        {['Client Documents', 'Company Documents', 'Legal Documents'].map(tab => (
          <div 
            key={tab}
            style={{
              padding: '12px 0', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              color: activeSubTab === tab ? vText : vTextMuted,
              borderBottom: activeSubTab === tab ? '2.5px solid #10B981' : '2.5px solid transparent',
              transition: 'all 0.2s', position: 'relative', top: '1px'
            }}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {activeSubTab === 'Client Documents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '13px', color: vTextMuted, fontWeight: 500 }}>
              Your identity and financial documents
            </div>
            {user?.role === 'client' && (
              <button
                onClick={triggerGeneralUpload}
                disabled={uploading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none',
                  color: '#ffffff', cursor: uploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease', opacity: uploading ? 0.7 : 1
                }}
              >
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Doc'}
              </button>
            )}
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: 20, fontWeight: 600 }}>{error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {cardItems.map(item => {
              const details = getDocDetails(item.name);
              const isUploaded = details.uploaded;
              let borderStyle = !isUploaded ? '1px solid rgba(245,158,11,0.2)' : (details.status === 'verified' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(129,140,248,0.25)');
              let iconColor = !isUploaded ? '#F59E0B' : (details.status === 'verified' ? '#10B981' : '#818CF8');
              return (
                <div key={item.name} style={{ background: 'rgba(255,255,255,0.02)', border: borderStyle, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: vCardSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, border: '1px solid var(--dashboard-border)' }}><FileText size={20} /></div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: vText, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: iconColor }}>{isUploaded ? details.status.charAt(0).toUpperCase() + details.status.slice(1) : 'Not uploaded'}</div>
                    </div>
                  </div>
                  {isUploaded ? (
                    <button onClick={() => setPreviewDoc({ name: item.name, url: details.url, docRecord: details.docRecord })} style={{ width: 36, height: 36, borderRadius: '50%', background: vCard, border: '1px solid var(--dashboard-border)', color: vText, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={16} /></button>
                  ) : user?.role === 'client' ? (
                    <button onClick={() => triggerDirectUpload(item.name)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Upload size={16} /></button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* ── COMPANY DOCUMENTS ── */}
      {activeSubTab === 'Company Documents' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '13px', color: vTextMuted, fontWeight: 500 }}>
              Documents shared by My Claim team specifically for your account
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={fetchCompanyDocs}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: vCard, border: '1px solid var(--dashboard-border)', color: vText, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
              {user?.role !== 'client' && (
                <button
                  onClick={triggerGeneralUpload}
                  disabled={uploading}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
                >
                  <Upload size={13} /> {uploading ? 'Uploading...' : 'Upload Doc'}
                </button>
              )}
            </div>
          </div>
          {loadingCompany ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: vTextMuted }}>
              <Clock size={24} style={{ color: 'var(--dashboard-accent)', marginRight: 10 }} /> Loading...
            </div>
          ) : companyDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: vTextMuted, background: 'rgba(129,140,248,0.02)', borderRadius: '16px', border: '1px solid rgba(129,140,248,0.12)' }}>
              <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.3, color: '#818CF8' }} />
              <div style={{ fontSize: '16px', fontWeight: 800, color: vText }}>No company documents shared yet</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>Files shared by My Claim team for your account will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {companyDocs.map(doc => <ReadOnlyDocCard key={doc._id} doc={doc} />)}
            </div>
          )}
        </div>
      )}

      {/* ── LEGAL DOCUMENTS ── */}
      {activeSubTab === 'Legal Documents' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '13px', color: vTextMuted, fontWeight: 500 }}>
              Official legal documents, templates and compliance files
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={fetchLegalDocs}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: vCard, border: '1px solid var(--dashboard-border)', color: vText, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
              {user?.role !== 'client' && (
                <button
                  onClick={triggerGeneralUpload}
                  disabled={uploading}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
                >
                  <Upload size={13} /> {uploading ? 'Uploading...' : 'Upload Doc'}
                </button>
              )}
            </div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '12px', padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: vText, marginBottom: 3 }}>Legal Notice</div>
              <div style={{ fontSize: '12px', color: vTextMuted, lineHeight: 1.5 }}>These documents are provided for your reference only. Please read all legal documents carefully before signing. For any queries, contact your assigned relationship manager.</div>
            </div>
          </div>
          {loadingLegal ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: vTextMuted }}>
              <Clock size={24} style={{ color: 'var(--dashboard-accent)', marginRight: 10 }} /> Loading...
            </div>
          ) : legalDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: vTextMuted, background: 'rgba(16,185,129,0.02)', borderRadius: '16px', border: '1px dashed rgba(16,185,129,0.2)' }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.3, color: '#10B981' }} />
              <div style={{ fontSize: '16px', fontWeight: 800, color: vText }}>No legal documents available</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>Legal documents and templates will be published here by the My Claim team.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {legalDocs.map(doc => <ReadOnlyDocCard key={doc._id} doc={doc} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ClientDocumentsHub;






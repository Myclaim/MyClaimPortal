import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search, Upload, FileText, Download, Loader2, ListFilter,
  CheckCircle2, X, Clock, FileImage, File
} from 'lucide-react';
import api from '../../../services/api';

// ============================================================
// EMPLOYEE DOCUMENTS MODULE
// Role: Employee only
// Scope: View, Download, and Upload documents.
// Employee CANNOT verify or reject documents.
// ============================================================

const CSS = `
  .ed-page { display: block; }
  .ed-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card);
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
  .ed-body { padding: 28px 32px; }

  .ed-stat { background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    transition: all 0.25s; cursor: pointer; position: relative; overflow: hidden; }
  .ed-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .ed-stat.selected { border-color: var(--accent-green) !important; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }

  .ed-table { width: 100%; border-collapse: collapse; }
  .ed-table th { padding: 14px 16px; font-size: 10.5px; font-weight: 800; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.7px; background: var(--card);
    border-bottom: 1px solid var(--border); text-align: left; }
  .ed-table td { padding: 14px 16px; font-size: 13.5px; color: var(--text);
    border-bottom: 1px solid var(--border); vertical-align: middle; }
  .ed-table tr { transition: all 0.2s; }
  .ed-table tr:hover td { background: rgba(34,197,94,0.02); }

  .ed-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
    border-radius: 9px; font-weight: 700; font-size: 13px; cursor: pointer;
    font-family: inherit; border: none; transition: all 0.2s; }
  .ed-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
  .ed-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ed-btn-blue { background: linear-gradient(135deg,#2563eb,#3b82f6); color: #fff; }
  .ed-btn-outline { background: var(--bg); border: 1px solid var(--border) !important; color: var(--text); }

  .ed-action-btn { display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .ed-action-btn:hover { border-color: var(--accent-green); color: var(--accent-green);
    transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

  .ed-modal-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.5);
    backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; }
  .ed-modal { background: var(--card); border: 1px solid var(--border); border-radius: 18px;
    width: 460px; max-width: 95vw; box-shadow: 0 24px 48px rgba(0,0,0,0.2);
    animation: edSlideUp 0.3s cubic-bezier(0.16,1,0.3,1); }

  @keyframes edSlideUp { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
  @keyframes spin { to { transform: rotate(360deg) } }
`;

const fmtFull = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const getFileIcon = (ext) => {
  const e = ext?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(e)) return <FileImage size={16} color="#3b82f6" />;
  if (['pdf'].includes(e)) return <FileText size={16} color="#ef4444" />;
  if (['doc', 'docx'].includes(e)) return <FileText size={16} color="#2563eb" />;
  return <File size={16} color="var(--text-muted)" />;
};

const EmployeeDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filtered = useMemo(() => {
    let list = documents;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(d => 
        (d.name || '').toLowerCase().includes(q) ||
        (d.uploaded_by?.name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [documents, search]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file types
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];
    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return allowedExtensions.includes(ext);
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only PDF, JPG, PNG, and DOCX are allowed.');
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      await Promise.all(validFiles.map(async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('linked_to', 'client'); // default linking, backend will attach to user if missing client_id
        // Employee docs upload
        return api.post('/documents/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }));
      setUploadModalOpen(false);
      await fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page active ed-page">
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="ed-topbar">
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px' }}>Documents</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            View and download documents
          </div>
        </div>

        <div className="search-input" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} color="var(--text-light)" />
          <input placeholder="Search by file name or uploader…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button className="ed-btn ed-btn-blue" onClick={() => setUploadModalOpen(true)}>
          <Upload size={14} /> Upload Documents
        </button>
      </div>

      <div className="ed-body">
        
        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)' }} />
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Loading documents…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, color: 'var(--text-muted)' }}>
            <ListFilter size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>No documents found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {search ? 'Try adjusting your search query' : 'No documents have been uploaded yet'}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="ed-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>File Type</th>
                    <th>Uploaded By</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {getFileIcon(doc.file_type)}
                          <div style={{ fontWeight: 600, color: 'var(--text)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.name}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--bg)', padding: '3px 8px', borderRadius: 5 }}>
                          {doc.file_type || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{doc.uploaded_by?.name || 'Unknown User'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmtFull(doc.createdAt)}</div>
                      </td>
                      <td>
                        {doc.verification_status === 'verified' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                            <CheckCircle2 size={11} /> Verified
                          </span>
                        )}
                        {doc.verification_status === 'rejected' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            <X size={11} /> Rejected
                          </span>
                        )}
                        {doc.verification_status === 'pending' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <a 
<<<<<<< HEAD
                            href={`https://myclaimportal.onrender.com${doc.file_url}`} 
=======
                            href={`http://localhost:5005${doc.file_url}`} 
>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586
                            download 
                            target="_blank" 
                            rel="noreferrer"
                            className="ed-action-btn" 
                            title="Download Document"
                            style={{ color: '#3b82f6' }}
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="ed-modal-overlay" onClick={() => setUploadModalOpen(false)}>
          <div className="ed-modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Upload Documents</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Supported formats: PDF, JPG, PNG, DOCX
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: 14, padding: '40px 20px',
                  textAlign: 'center', cursor: 'pointer', background: 'var(--bg)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-green)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)', marginBottom: 8 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Uploading…</div>
                  </>
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Click to select files</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Maximum 5 files per upload
                    </div>
                  </>
                )}
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="ed-btn ed-btn-outline" onClick={() => setUploadModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;

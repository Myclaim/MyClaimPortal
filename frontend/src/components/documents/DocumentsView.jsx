import React, { useState, useEffect } from 'react';
import { 
  Folder, Upload, ChevronRight, Download, MoreVertical, 
  Trash2, Edit2, Copy, CornerUpRight, X, File, FolderInput,
  FolderOpen, CheckCircle, XCircle
} from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import DocumentUploadModal from './DocumentUploadModal';

const DocumentsView = ({ documents, client, onRefresh, readOnlyStructure = false, theme = 'light' }) => {
  const { user: currentUser } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  
  // Verification states
  const [verifyDoc, setVerifyDoc] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const submitVerification = async (status) => {
    if (!verifyDoc) return;
    setVerifyLoading(true);
    try {
      await api.patch(`/documents/${verifyDoc._id}/verify`, {
        status,
        notes: verifyNotes
      });
      setVerifyDoc(null);
      setVerifyNotes('');
      if (onRefresh) onRefresh();
      fetchFolders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update document status');
    } finally {
      setVerifyLoading(false);
    }
  };
  const [folderPath, setFolderPath] = useState([{ _id: null, name: 'Client Documents' }]);
  
  const [dbFolders, setDbFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  
  // Create Folder State
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [newFolderTag, setNewFolderTag] = useState('');
  const [newFolderTagColor, setNewFolderTagColor] = useState('#3b82f6');
  const [newFolderLogo, setNewFolderLogo] = useState(null);
  const [addingFolderLoading, setAddingFolderLoading] = useState(false);

  // Rename Folder State
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameFolderColor, setRenameFolderColor] = useState('#3b82f6');
  const [renameTag, setRenameTag] = useState('');
  const [renameTagColor, setRenameTagColor] = useState('#3b82f6');
  const [renameLogo, setRenameLogo] = useState(null);
  const [renameLoading, setRenameLoading] = useState(false);

  // Move Doc State
  const [isMovingDoc, setIsMovingDoc] = useState(false);
  const [docToMove, setDocToMove] = useState(null);
  const [moveToFolder, setMoveToFolder] = useState('');
  const [moveLoading, setMoveLoading] = useState(false);
  const [allFolders, setAllFolders] = useState([]);

  // Context Menu States
  const [activeFolderMenu, setActiveFolderMenu] = useState(null);
  const [activeDocMenu, setActiveDocMenu] = useState(null);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Clipboard State
  const [clipboard, setClipboard] = useState(null); // { action: 'copy', doc: obj }

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, [currentFolderId, client._id]);

  const fetchFolders = async () => {
    if (currentFolderId === 'Profile Form Uploads') return; // Virtual folder
    setLoadingFolders(true);
    try {
      const parentQuery = currentFolderId ? currentFolderId : 'root';
      const res = await api.get(`/folders?client_id=${client._id}&parent_folder_id=${parentQuery}`);
      setDbFolders(res.data);
    } catch (err) {
      console.error('Error fetching folders', err);
    } finally {
      setLoadingFolders(false);
    }
  };

  // --- Virtual KYC Documents ---
  const virtualKycDocs = [];
  if (client?.kyc_data) {
    const kycMap = {
      panPath: 'PAN Card',
      aadharPath: 'Aadhaar Card',
      itrPath: 'ITR Document',
      bankStatementPath: 'Bank Statement',
      otherDocsPath: 'Other KYC Docs'
    };
    Object.keys(kycMap).forEach(key => {
      if (client.kyc_data[key]) {
        virtualKycDocs.push({
          _id: key,
          name: kycMap[key],
          doc_category: 'primary',
          createdAt: client.createdAt || new Date().toISOString(),
          file_url: client.kyc_data[key],
          isVirtual: true
        });
      }
    });
  }

  // Combine folders
  const currentFolders = [...dbFolders];
  if (currentFolderId === null && virtualKycDocs.length > 0) {
    currentFolders.unshift({ _id: 'Profile Form Uploads', name: 'Profile Form Uploads', isVirtual: true });
  }

  // Filter documents for current folder
  let currentDocs = [];
  if (currentFolderId === 'Profile Form Uploads') {
    currentDocs = virtualKycDocs;
  } else {
    currentDocs = documents.filter(d => {
      if (currentFolderId) {
        return d.folder_id === currentFolderId;
      } else {
        // Root documents: either no folder_id and folder='General', or just no folder_id
        return !d.folder_id || d.folder === 'General';
      }
    });
  }

  // Navigation
  const navigateToFolder = (folder) => {
    setCurrentFolderId(folder._id);
    setFolderPath([...folderPath, { _id: folder._id, name: folder.name }]);
  };

  const navigateToCrumb = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1]._id);
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processEntry = async (entry, parentFolderId) => {
    if (entry.isFile) {
      const file = await new Promise((resolve) => entry.file(resolve));
      const formData = new FormData();
      formData.append('file', file);
      formData.append('client_id', client._id);
      formData.append('linked_to', 'client');
      formData.append('folder', 'NestedFolder');
      if (parentFolderId) {
        formData.append('folder_id', parentFolderId);
      }
      try {
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err) {
        console.error('Error uploading file:', file.name, err);
      }
    } else if (entry.isDirectory) {
      let newFolderId = parentFolderId;
      try {
        const formData = new FormData();
        formData.append('name', entry.name);
        formData.append('client_id', client._id);
        if (parentFolderId) formData.append('parent_folder_id', parentFolderId);
        const res = await api.post(`/folders`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        newFolderId = res.data._id;
      } catch (err) {
        if (err.response && err.response.status === 400 && err.response.data.message.includes('already exists')) {
          const parentQuery = parentFolderId ? parentFolderId : 'root';
          const existingRes = await api.get(`/folders?client_id=${client._id}&parent_folder_id=${parentQuery}`);
          const existingFolder = existingRes.data.find(f => f.name === entry.name);
          if (existingFolder) newFolderId = existingFolder._id;
        } else {
          console.error('Error creating folder:', entry.name, err);
        }
      }

      const dirReader = entry.createReader();
      const readEntries = async () => {
        return new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
      };
      
      let entries = [];
      let readResult;
      do {
        readResult = await readEntries();
        entries.push(...readResult);
      } while (readResult.length > 0);

      for (const childEntry of entries) {
        await processEntry(childEntry, newFolderId);
      }
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (currentFolderId === 'Profile Form Uploads') {
      alert('Cannot upload directly to the Profile Form virtual folder.');
      return;
    }

    setUploadingFiles(true);
    const items = Array.from(e.dataTransfer.items);
    
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await processEntry(entry, currentFolderId);
        }
      }
    }
    
    setUploadingFiles(false);
    fetchFolders();
    if (onRefresh) onRefresh();
  };

  // --- FOLDER ACTIONS ---
  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setAddingFolderLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newFolderName.trim());
      formData.append('client_id', client._id);
      formData.append('folder_color', newFolderColor);
      if (currentFolderId) formData.append('parent_folder_id', currentFolderId);
      if (newFolderTag.trim()) formData.append('tag', newFolderTag.trim());
      formData.append('tag_color', newFolderTagColor);
      if (newFolderLogo) formData.append('logo', newFolderLogo);

      await api.post(`/folders`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setIsAddingFolder(false);
      setNewFolderName('');
      setNewFolderColor('#3b82f6');
      setNewFolderTag('');
      setNewFolderTagColor('#3b82f6');
      setNewFolderLogo(null);
      fetchFolders();
    } catch (err) {
      alert('Error creating folder: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingFolderLoading(false);
    }
  };

  const handleRenameFolder = async (e) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    setRenameLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', renameValue.trim());
      formData.append('folder_color', renameFolderColor);
      if (renameTag.trim()) formData.append('tag', renameTag.trim());
      else formData.append('tag', ''); // Clear tag
      formData.append('tag_color', renameTagColor);
      if (renameLogo) formData.append('logo', renameLogo);

      await api.put(`/folders/${folderToRename._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setIsRenamingFolder(false);
      fetchFolders();
    } catch (err) {
      alert('Error updating folder: ' + (err.response?.data?.message || err.message));
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (folder.isVirtual) {
      alert('Cannot delete system folders.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${folder.name}" and ALL its contents recursively?`)) return;
    
    try {
      await api.delete(`/folders/${folder._id}`);
      fetchFolders();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error deleting folder: ' + (err.response?.data?.message || err.message));
    }
  };

  // --- DOCUMENT ACTIONS ---
  const handleDeleteDoc = async (doc) => {
    if (doc.isVirtual) {
      alert('Cannot delete Profile Form uploads from here. Edit the client profile instead.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${doc.name}?`)) return;
    try {
      await api.delete(`/documents/${doc._id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error deleting document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMoveDoc = async (e) => {
    e.preventDefault();
    if (!docToMove) return;
    setMoveLoading(true);
    try {
      await api.put(`/documents/${docToMove._id}/move`, { 
        folder: 'NestedFolder',
        folder_id: moveToFolder === 'root' || !moveToFolder ? null : moveToFolder 
      });
      setIsMovingDoc(false);
      setDocToMove(null);
      if (onRefresh) onRefresh();
      fetchFolders();
    } catch (err) {
      alert('Error moving document: ' + (err.response?.data?.message || err.message));
    } finally {
      setMoveLoading(false);
    }
  };

  const handleCopyDoc = (doc) => {
    setClipboard({ action: 'copy', doc });
    setActiveDocMenu(null);
  };

  const handlePaste = async () => {
    if (!clipboard) return;
    if (clipboard.doc.isVirtual) {
      alert('Cannot copy Profile Form virtual documents.');
      return;
    }
    try {
      await api.post(`/documents/${clipboard.doc._id}/copy`, { 
        folder: 'NestedFolder',
        folder_id: currentFolderId || null
      });
      setClipboard(null); // Clear after paste
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error copying document: ' + (err.response?.data?.message || err.message));
    }
  };

  const forceDownload = async (e, url, filename) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: 'relative', minHeight: '400px' }}
    >
      <style>{`
        .doc-grid-item {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease !important;
        }
        .doc-grid-item:hover {
          transform: translateY(-8px) scale(1.02);
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff'} !important;
          box-shadow: 0 20px 40px -12px ${theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'} !important;
        }
      `}</style>

      {/* Drag Drop Overlay */}
      {isDragging && (
        <div style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, background: 'rgba(59, 130, 246, 0.1)', border: '2px dashed #3b82f6', borderRadius: '16px', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ background: '#fff', padding: '20px 40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Upload size={48} color="#3b82f6" />
            <h3 style={{ margin: 0, color: '#3b82f6', fontWeight: 800 }}>Drop files to upload here</h3>
          </div>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {folderPath.map((crumb, idx) => (
              <React.Fragment key={crumb._id || 'root'}>
                <span 
                  style={{ 
                    cursor: idx === folderPath.length - 1 ? 'default' : 'pointer', 
                    color: idx === folderPath.length - 1 ? (theme === 'dark' ? '#fff' : '#0f172a') : (theme === 'dark' ? '#10B981' : '#2563eb'), 
                    fontWeight: idx === folderPath.length - 1 ? 900 : 600, 
                    fontSize: idx === 0 ? '18px' : '15px' 
                  }} 
                  onClick={() => idx !== folderPath.length - 1 && navigateToCrumb(idx)}
                >
                  {crumb.name}
                </span>
                {idx < folderPath.length - 1 && <ChevronRight size={16} color={theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#94a3b8'} />}
              </React.Fragment>
            ))}
          </div>
          {uploadingFiles && <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>Uploading files...</div>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {clipboard && !readOnlyStructure && (
            <button onClick={handlePaste} style={{ padding: '10px 20px', background: '#f59e0b', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: 6 }}>
              <Copy size={16} /> Paste Here
            </button>
          )}
          {!readOnlyStructure && (
            <button onClick={() => setIsAddingFolder(true)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: 6 }}><Folder size={16} /> Add Folder</button>
          )}
          <button 
            onClick={() => setIsUploadModalOpen(true)} 
            style={{ 
              padding: '10px 20px', 
              background: theme === 'dark' ? 'linear-gradient(135deg, #10B981, #059669)' : '#2563eb', 
              border: 'none', 
              borderRadius: '10px', 
              color: '#fff', 
              fontWeight: 800, 
              cursor: 'pointer', 
              display: 'flex', 
              gap: 6,
              boxShadow: theme === 'dark' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <Upload size={16} /> Upload Doc
          </button>
        </div>
      </div>
      
      {/* Create Folder Modal */}
      {isAddingFolder && (
        <div className="modal-overlay open" style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Folder</h3>
              <button className="modal-close" onClick={() => setIsAddingFolder(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddFolder} className="modal-body">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Folder Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" className="form-input" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g. Legal Case 2026" autoFocus required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Folder Color</label>
                <input type="color" style={{ width: '100%', height: 40, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }} value={newFolderColor} onChange={(e) => setNewFolderColor(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tag Name (Optional)</label>
                <input type="text" className="form-input" value={newFolderTag} onChange={(e) => setNewFolderTag(e.target.value)} placeholder="e.g. Urgent, Archived" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tag Color</label>
                <input type="color" style={{ width: '100%', height: 40, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }} value={newFolderTagColor} onChange={(e) => setNewFolderTagColor(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Custom Logo Image (Optional)</label>
                <input type="file" className="form-input" accept="image/*" onChange={(e) => setNewFolderLogo(e.target.files[0])} />
              </div>
              <div className="modal-footer" style={{ border: 'none', padding: 0 }}>
                <button type="button" className="topbar-btn secondary" onClick={() => setIsAddingFolder(false)}>Cancel</button>
                <button type="submit" className="topbar-btn" disabled={addingFolderLoading || !newFolderName.trim()}>
                  {addingFolderLoading ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {isRenamingFolder && folderToRename && (
        <div className="modal-overlay open" style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Folder</h3>
              <button className="modal-close" onClick={() => setIsRenamingFolder(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRenameFolder} className="modal-body">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Folder Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" className="form-input" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Folder Color</label>
                <input type="color" style={{ width: '100%', height: 40, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }} value={renameFolderColor} onChange={(e) => setRenameFolderColor(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tag Name (Optional)</label>
                <input type="text" className="form-input" value={renameTag} onChange={(e) => setRenameTag(e.target.value)} placeholder="e.g. Urgent, Archived" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tag Color</label>
                <input type="color" style={{ width: '100%', height: 40, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }} value={renameTagColor} onChange={(e) => setRenameTagColor(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Custom Logo Image (Optional)</label>
                <input type="file" className="form-input" accept="image/*" onChange={(e) => setRenameLogo(e.target.files[0])} />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>Upload a new image to replace the current one.</div>
              </div>
              <div className="modal-footer" style={{ border: 'none', padding: 0 }}>
                <button type="button" className="topbar-btn secondary" onClick={() => setIsRenamingFolder(false)}>Cancel</button>
                <button type="submit" className="topbar-btn" disabled={renameLoading || !renameValue.trim()}>
                  {renameLoading ? 'Updating...' : 'Update Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Document Modal */}
      {isMovingDoc && docToMove && (
        <div className="modal-overlay open" style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Move Document</h3>
              <button className="modal-close" onClick={() => setIsMovingDoc(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleMoveDoc} className="modal-body">
              <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Moving: {docToMove.name}</div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Destination Folder</label>
                <select 
                  className="form-select" 
                  value={moveToFolder} 
                  onChange={(e) => setMoveToFolder(e.target.value)}
                >
                  <option value="root">/ Root (Client Documents)</option>
                  {allFolders.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer" style={{ border: 'none', padding: 0 }}>
                <button type="button" className="topbar-btn secondary" onClick={() => setIsMovingDoc(false)}>Cancel</button>
                <button type="submit" className="topbar-btn" disabled={moveLoading || !moveToFolder}>
                  {moveLoading ? 'Moving...' : 'Move Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay open" style={{ zIndex: 1200, background: theme === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(0,0,0,0.5)', backdropFilter: theme === 'dark' ? 'blur(8px)' : 'none' }} onClick={() => setPreviewDoc(null)}>
          <div className="modal" style={{ width: '90%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', background: theme === 'dark' ? 'var(--dashboard-card)' : '#fff', border: theme === 'dark' ? '1px solid var(--dashboard-border)' : '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '16px 24px', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 className="modal-title" style={{ margin: 0, color: theme === 'dark' ? '#fff' : 'inherit' }}>{previewDoc.name}</h3>
                {previewDoc.verification_status && (
                  <span style={{ 
                    fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
                    background: previewDoc.verification_status === 'verified' ? 'rgba(34,197,94,0.1)' : previewDoc.verification_status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: previewDoc.verification_status === 'verified' ? '#22c55e' : previewDoc.verification_status === 'rejected' ? '#ef4444' : '#f59e0b'
                  }}>
                    {previewDoc.verification_status.toUpperCase()}
                  </span>
                )}
                <a 
                  href={`${api.defaults.baseURL.replace('/api', '')}${previewDoc.file_url}`}
                  onClick={(e) => forceDownload(e, `${api.defaults.baseURL.replace('/api', '')}${previewDoc.file_url}`, previewDoc.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', color: theme === 'dark' ? '#fff' : '#0f172a', fontWeight: 600, cursor: 'pointer' }}
                ><Download size={12} /> Download Original</a>
              </div>
              <button className="modal-close" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'inherit', background: 'none', border: 'none' }} onClick={() => setPreviewDoc(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ flex: 1, padding: 0, overflow: 'hidden', background: theme === 'dark' ? '#0a0f18' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                const url = `${api.defaults.baseURL.replace('/api', '')}${previewDoc.file_url}`;
                const ext = previewDoc.file_url ? previewDoc.file_url.split('.').pop().toLowerCase() : previewDoc.name.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                
                if (isImage) {
                  return <img src={url} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
                } else {
                  // For PDFs and everything else, use an iframe
                  return <iframe src={url} title={previewDoc.name} style={{ width: '100%', height: '100%', border: 'none' }} />;
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Mac-Style Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '24px' }}>
        
        {/* Render Folders */}
        {currentFolders.map(f => (
          <div 
            key={f._id} 
            className="doc-grid-item"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', borderRadius: '16px', transition: 'all 0.2s', cursor: 'pointer', background: activeFolderMenu === f._id ? (theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9') : 'transparent' }}
            onMouseLeave={() => setActiveFolderMenu(null)}
          >
            {/* Folder Context Menu */}
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
              {!f.isVirtual && !readOnlyStructure && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveFolderMenu(activeFolderMenu === f._id ? null : f._id); }}
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', cursor: 'pointer', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeFolderMenu === f._id ? 1 : 0.4 }}
                >
                  <MoreVertical size={14} color="#64748b" />
                </button>
              )}
              {activeFolderMenu === f._id && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 10, width: 120, overflow: 'hidden' }}>
                  <div 
                    style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}
                    onClick={(e) => { e.stopPropagation(); setFolderToRename(f); setRenameValue(f.name); setRenameFolderColor(f.folder_color || '#3b82f6'); setRenameTag(f.tag || ''); setRenameTagColor(f.tag_color || '#3b82f6'); setRenameLogo(null); setIsRenamingFolder(true); setActiveFolderMenu(null); }}
                  ><Edit2 size={14} /> Edit</div>
                  <div 
                    style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 600, borderTop: '1px solid #f1f5f9' }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f); setActiveFolderMenu(null); }}
                  ><Trash2 size={14} /> Delete</div>
                </div>
              )}
            </div>

            {/* Folder Tag Badge */}
            {f.tag && (
              <div style={{ position: 'absolute', top: -8, left: 16, background: f.tag_color, color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 5, whiteSpace: 'nowrap', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.tag}
              </div>
            )}

            <div onClick={() => navigateToFolder(f)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {f.isVirtual ? (
                <div style={{ position: 'relative' }}>
                  <Folder size={80} color="#eab308" fill="#fef08a" strokeWidth={1} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FolderOpen size={24} color="#ca8a04" /></div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <Folder size={80} color={f.folder_color || '#3b82f6'} fill={`${f.folder_color || '#3b82f6'}40`} strokeWidth={1.5} />
                  {f.logo_url && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '10px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#fff', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <img src={`${api.defaults.baseURL.replace('/api', '')}${f.logo_url}`} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ fontWeight: 600, fontSize: '13px', color: theme === 'dark' ? '#fff' : '#1e293b', marginTop: '12px', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.3 }}>
                {f.name}
              </div>
            </div>
          </div>
        ))}

        {/* Render Documents */}
        {currentDocs.map(d => (
          <div 
            key={d._id} 
            className="doc-grid-item"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', borderRadius: '16px', transition: 'all 0.2s', background: activeDocMenu === d._id ? (theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9') : 'transparent' }}
            onMouseLeave={() => setActiveDocMenu(null)}
          >
            {/* Document Context Menu */}
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
              {!d.isVirtual && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveDocMenu(activeDocMenu === d._id ? null : d._id); }}
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', cursor: 'pointer', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeDocMenu === d._id ? 1 : 0.4 }}
                >
                  <MoreVertical size={14} color="#64748b" />
                </button>
              )}
              {activeDocMenu === d._id && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 10, width: 140, overflow: 'hidden' }}>
                  <a 
                    href={`${api.defaults.baseURL.replace('/api', '')}${d.file_url}`} 
                    style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}
                    onClick={(e) => {
                      setActiveDocMenu(null);
                      forceDownload(e, `${api.defaults.baseURL.replace('/api', '')}${d.file_url}`, d.name);
                    }}
                  ><Download size={14} /> Download</a>
                  {['admin', 'super_admin'].includes(currentUser?.role) && (
                    <div 
                      style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#10b981', borderTop: '1px solid #f1f5f9' }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setVerifyDoc(d); 
                        setVerifyNotes(d.verification_notes || '');
                        setActiveDocMenu(null); 
                      }}
                    ><CheckCircle size={14} /> Verify/Reject</div>
                  )}
                  {!readOnlyStructure && (
                    <>
                      <div 
                        style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, borderTop: '1px solid #f1f5f9' }}
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          setDocToMove(d); 
                          setMoveToFolder('root');
                          setActiveDocMenu(null); 
                          setIsMovingDoc(true); 
                          try {
                            const res = await api.get(`/folders?client_id=${client._id}&parent_folder_id=all`);
                            setAllFolders(res.data);
                          } catch(err) { console.error('Failed to fetch all folders'); }
                        }}
                      ><CornerUpRight size={14} /> Move To...</div>
                      <div 
                        style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}
                        onClick={(e) => { e.stopPropagation(); handleCopyDoc(d); }}
                      ><Copy size={14} /> Copy</div>
                      <div 
                        style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 600, borderTop: '1px solid #f1f5f9' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteDoc(d); setActiveDocMenu(null); }}
                      ><Trash2 size={14} /> Delete</div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div 
              onClick={() => setPreviewDoc(d)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative' }}>
                <File size={76} color="#cbd5e1" fill="#f8fafc" strokeWidth={1.5} />
                <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {d.file_type ? d.file_type.substring(0,4) : (d.name.split('.').pop() || 'FILE')}
                </div>
                {d.verification_status && (
                  <div style={{ 
                    position: 'absolute', top: -4, right: -4, 
                    width: 20, height: 20, borderRadius: '50%', 
                    display: 'grid', placeItems: 'center',
                    background: d.verification_status === 'verified' ? '#10B981' : d.verification_status === 'rejected' ? '#EF4444' : '#F59E0B',
                    color: '#fff', fontSize: '10px', fontWeight: 'bold',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    zIndex: 2
                  }}>
                    {d.verification_status === 'verified' ? '✓' : d.verification_status === 'rejected' ? '✗' : '⌛'}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 500, fontSize: '12px', color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155', marginTop: '12px', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.3 }}>
                {d.name.length > 35 ? d.name.substring(0, 32) + '...' : d.name}
              </div>
            </div>
          </div>
        ))}

        {currentFolders.length === 0 && currentDocs.length === 0 && !loadingFolders && (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#94a3b8', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '16px', border: theme === 'dark' ? '2px dashed rgba(255,255,255,0.1)' : '2px dashed #e2e8f0' }}>
            <FolderInput size={48} color={theme === 'dark' ? 'rgba(255,255,255,0.2)' : '#cbd5e1'} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: '16px', fontWeight: 600, color: theme === 'dark' ? '#fff' : '#64748b' }}>This folder is empty</div>
            <div style={{ fontSize: '14px', marginTop: 8, color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'inherit' }}>
              {readOnlyStructure ? 'Drag and drop files here to upload' : 'Drag and drop files here or click Add Folder'}
            </div>
          </div>
        )}
      </div>

      <DocumentUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        clientId={client._id}
        linkedTo="client"
        onUploadSuccess={onRefresh}
        folderId={currentFolderId}
        theme={theme}
      />

      {/* Document Verification Modal (Admin only) */}
      {verifyDoc && (
        <div className="modal-overlay open" style={{ zIndex: 1200, background: theme === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setVerifyDoc(null)}>
          <div className="modal" style={{ maxWidth: '450px', background: theme === 'dark' ? 'var(--dashboard-card)' : '#fff', border: theme === 'dark' ? '1px solid var(--dashboard-border)' : '1px solid #e2e8f0', color: theme === 'dark' ? '#fff' : '#0f172a' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}>Verify Document</h3>
              <button className="modal-close" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'inherit', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setVerifyDoc(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Document Name</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{verifyDoc.name}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Verification Notes</span>
                <textarea 
                  style={{ width: '100%', height: '100px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#f8fafc', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', color: theme === 'dark' ? '#fff' : 'inherit', outline: 'none', resize: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                  placeholder="Explain why this document is verified or rejected (optional)..."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  disabled={verifyLoading}
                  onClick={() => submitVerification('rejected')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  Reject
                </button>
                <button 
                  disabled={verifyLoading}
                  onClick={() => submitVerification('verified')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;

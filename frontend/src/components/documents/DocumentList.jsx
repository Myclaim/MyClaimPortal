import React from 'react';
import { FileIcon, FileText, ImageIcon, Download, Trash2, Calendar, User } from 'lucide-react';
import api from '../../services/api';

const DocumentList = ({ documents, loading, onDeleteSuccess }) => {
  const getFileIcon = (type) => {
    const t = type?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(t)) return <ImageIcon size={20} />;
    if (['pdf'].includes(t)) return <FileText size={20} color="#dc2626" />;
    return <FileIcon size={20} color="#3b82f6" />;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${id}`);
        if (onDeleteSuccess) onDeleteSuccess(id);
      } catch (err) {
        alert('Error deleting document');
      }
    }
  };

  const handleDownload = (fileUrl, name) => {
    const link = document.createElement('a');
    link.href = `${api.defaults.baseURL.replace('/api', '')}${fileUrl}`;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading documents...</div>;

  if (documents.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {documents.map((doc) => (
        <div key={doc._id} className="card" style={{ padding: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: '#f1f5f9', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#64748b'
          }}>
            {getFileIcon(doc.file_type)}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{doc.name}</div>
              {doc.client_id?.name && (
                <span className="custom-badge badge-blue" style={{ fontSize: '9px', padding: '2px 8px' }}>
                   {doc.client_id.name}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} />
                {doc.uploaded_by?.name || 'Unknown'}
              </span>
              <span style={{ textTransform: 'uppercase' }}>{doc.file_type} • {(doc.file_size / 1024).toFixed(0)} KB</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="action-icon" 
              onClick={() => handleDownload(doc.file_url, doc.name)}
              title="Download"
            >
              <Download size={16} />
            </button>
            <button 
              className="action-icon red" 
              onClick={() => handleDelete(doc._id)}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;

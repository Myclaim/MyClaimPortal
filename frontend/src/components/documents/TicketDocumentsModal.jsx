import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Upload } from 'lucide-react';
import api from '../../services/api';
import DocumentList from './DocumentList';
import DocumentUploadModal from './DocumentUploadModal';

const TicketDocumentsModal = ({ isOpen, onClose, ticket }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    if (isOpen && ticket) {
      fetchDocuments();
    }
  }, [isOpen, ticket]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/documents?ticket_id=${ticket._id}`);
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching ticket docs', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" style={{ zIndex: 999 }}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Documents: #{ticket?._id.slice(-6).toUpperCase()}</h3>
            <p className="modal-subtitle" style={{ fontSize: '12px', color: '#64748b' }}>{ticket?.service} - {ticket?.client?.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontWeight: 800, fontSize: '14px' }}>Linked Files</h4>
            <button className="topbar-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setIsUploadOpen(true)}>
              <Upload size={14} />
              Upload Document
            </button>
          </div>

          <DocumentList 
            documents={documents} 
            loading={loading} 
            onDeleteSuccess={(id) => setDocuments(prev => prev.filter(d => d._id !== id))}
          />
        </div>

        <div className="modal-footer">
          <button className="topbar-btn secondary" onClick={onClose}>Close</button>
        </div>

        <DocumentUploadModal 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          linkedTo="ticket"
          ticketId={ticket?._id}
          onUploadSuccess={(newDoc) => setDocuments(prev => [newDoc, ...prev])}
        />
      </div>
    </div>
  );
};

export default TicketDocumentsModal;

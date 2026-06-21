import React, { useState, useEffect } from 'react';
import { Search, User, FileText, ChevronRight, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import api from '../../services/api';
import DocumentList from '../../components/documents/DocumentList';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';

const KYCHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/users?role=client');
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients', err);
    }
  };

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setLoading(true);
    try {
      const { data } = await api.get(`/documents?client_id=${client._id}`);
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching docs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client_id_ref?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: 'primary', label: '1. Personal Documents', sub: 'PAN, Aadhaar, Photographs, Signature' },
    { id: 'address', label: '2. Proof of Address', sub: 'Passport, Voter ID, Utility Bills, Bank Statement' },
    { id: 'income', label: '3. Income Proof', sub: 'Bank Statement (6m), Salary Slip, ITR, Form 16' },
    { id: 'others', label: '4. Other Considerations', sub: 'Nominee Details, Minor/HUF/NRI certificates' }
  ];

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="topbar-title">KYC Verification Hub</div>
          <div className="topbar-subtitle">Categorized document management for client onboarding</div>
        </div>
      </div>

      <div className="content" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 120px)' }}>
        {/* Left: Client Search */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <div className="search-input">
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search person..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredClients.map(client => (
              <div 
                key={client._id}
                onClick={() => handleSelectClient(client)}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid #f8fafc',
                  cursor: 'pointer',
                  background: selectedClient?._id === client._id ? '#f0fdf4' : 'transparent',
                  borderLeft: selectedClient?._id === client._id ? '4px solid #15803d' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{client.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{client.client_id_ref}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Categorized Documents */}
        <div style={{ overflowY: 'auto', paddingRight: '8px' }}>
          {selectedClient ? (
            <div className="animate-slide-up">
              <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #fff 0%, #f0fdf4 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#15803d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                      {selectedClient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{selectedClient.name}</h2>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {selectedClient.phone || 'N/A'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {selectedClient.email}</span>
                      </div>
                    </div>
                  </div>
                  <button className="topbar-btn" onClick={() => setIsUploadOpen(true)}>
                    <CheckCircle size={18} />
                    Upload Documents
                  </button>
                </div>
              </div>

              {categories.map(cat => {
                const catDocs = documents.filter(d => d.doc_category === cat.id);
                return (
                  <div key={cat.id} className="card" style={{ marginBottom: '20px', padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: '#1a0f00' }}>{cat.label}</h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{cat.sub}</p>
                    </div>
                    
                    <DocumentList 
                      documents={catDocs} 
                      loading={loading}
                      onDeleteSuccess={(id) => setDocuments(prev => prev.filter(d => d._id !== id))}
                    />
                    
                    {catDocs.length === 0 && !loading && (
                      <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: '12px' }}>
                        No documents uploaded in this category
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <User size={40} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Select a client to view KYC</h2>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '300px' }}>Choose a profile from the left list to manage or verify onboarding documents.</p>
            </div>
          )}
        </div>
      </div>

      <DocumentUploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        linkedTo="client"
        clientId={selectedClient?._id}
        onUploadSuccess={(newDoc) => setDocuments(prev => [newDoc, ...prev])}
      />
    </div>
  );
};

export default KYCHub;

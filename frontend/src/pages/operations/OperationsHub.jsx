import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  FileText, 
  FolderOpen, 
  BookOpen, 
  LifeBuoy, 
  Zap,
  Search,
  ArrowRight,
  Filter,
  Upload,
  Scale,
  Wrench,
  ShoppingBag
} from 'lucide-react';
import api from '../../services/api';
import DocumentList from '../../components/documents/DocumentList';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';
import HubPage from '../hubs/HubPage';

const OperationsHub = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || 'claim-hub');

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/operations/${tabId}`);
  };

  const tabs = [
    { id: 'claim-hub', label: 'Claim Hub', icon: Scale, color: '#f59e0b' },
    { id: 'service-hub', label: 'Service Hub', icon: Wrench, color: '#3b82f6' },
    { id: 'store', label: 'Store Hub', icon: ShoppingBag, color: '#8b5cf6' },
    { id: 'email-log', label: 'Email Log', icon: Mail, color: '#15803d' },
    { id: 'call-log', label: 'Call Log', icon: Phone, color: '#3b82f6' },
    { id: 'letter-log', label: 'Letter Log', icon: FileText, color: '#8b5cf6' },
    { id: 'documents', label: 'Documents', icon: FolderOpen, color: '#10b981' },
    { id: 'resources', label: 'Resources', icon: BookOpen, color: '#0d9488' },
    { id: 'support', label: 'Support', icon: LifeBuoy, color: '#ef4444' },
    { id: 'automation', label: 'Automation', icon: Zap, color: '#06b6d4' },
  ];

  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab]);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents', err);
    } finally {
      setDocsLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.client_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];
    const Icon = activeTabData ? activeTabData.icon : Mail;

    if (activeTab === 'claim-hub') {
      return <HubPage vertical="claim" title="Claim Hub" subtitle="All IEPF and claim tickets" />;
    }

    if (activeTab === 'service-hub') {
      return <HubPage vertical="service" title="Service Hub" subtitle="All service tickets and controls" />;
    }

    if (activeTab === 'store') {
      return <HubPage vertical="store" title="Store Hub" subtitle="Box & pricing controls" />;
    }

    if (activeTab === 'support') {
      return <HubPage vertical="support" title="Support Hub" subtitle="Support tickets from all users" />;
    }

    if (activeTab === 'documents') {
      return (
        <div className="animate-slide-up">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a0f00', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: `${activeTabData.color}15`, 
                  color: activeTabData.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} />
                </div>
                Document Center
              </h2>
              <p style={{ color: '#7a5c2e', fontSize: '14px' }}>Global repository for all tickets and client records</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
               <div className="search-input" style={{ width: '250px' }}>
                <Search size={18} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search by name or client..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
               <button className="topbar-btn" onClick={() => setIsUploadModalOpen(true)}>
                <Upload size={18} />
                Upload New
              </button>
            </div>
          </div>
          
          <DocumentList 
            documents={filteredDocuments} 
            loading={docsLoading} 
            onDeleteSuccess={(id) => setDocuments(prev => prev.filter(d => d._id !== id))} 
          />

          <DocumentUploadModal 
            isOpen={isUploadModalOpen} 
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={(newDoc) => setDocuments(prev => [newDoc, ...prev])}
          />
        </div>
      );
    }


    return (
      <div className="animate-slide-up">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a0f00', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: `${activeTabData.color}15`, 
                color: activeTabData.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={22} />
              </div>
              {activeTabData.label}
            </h2>
            <p style={{ color: '#7a5c2e', fontSize: '14px' }}>Manage and track your {activeTabData.label.toLowerCase()} activities</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="search-input" style={{ width: '300px' }}>
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder={`Search ${activeTabData.label}...`} />
            </div>
            <button className="export-btn">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(249, 115, 22, 0.1)' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9'
          }}>
            <Icon size={40} color={activeTabData.color} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1a0f00', marginBottom: '8px' }}>{activeTabData.label} Module</h3>
          <p style={{ maxWidth: '400px', color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            The {activeTabData.label.toLowerCase()} system is currently being integrated with your workspace. This module will allow you to track and manage all {activeTabData.label.toLowerCase()} communications in real-time.
          </p>
          <button className="topbar-btn" style={{ background: activeTabData.color }}>
            Request Access
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="topbar-title">Operations Hub</div>
          <div className="topbar-subtitle">Unified workspace for logs, documents, and resources</div>
        </div>
        <div className="topbar-spacer"></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            padding: '8px 16px', 
            background: '#fffaf0', 
            border: '1px solid #fed7aa', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#c2410c'
          }}>
            <Zap size={14} fill="#15803d" />
            7 Modules Active
          </div>
        </div>
      </div>

      <div className="content">
        <div className="tabs" style={{ marginBottom: '32px' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <div 
                key={tab.id}
                className={`custom-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
              >
                <Icon size={16} />
                {tab.label}
                {activeTab === tab.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#15803d' }}></div>}
              </div>
            );
          })}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default OperationsHub;

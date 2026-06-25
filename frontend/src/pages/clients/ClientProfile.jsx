import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, Upload, Plus, X, Eye, Edit2, Download, Ticket, 
  Layers, Package, Users, Activity, MessageSquare, GitBranch, 
  CheckCircle2, AlertCircle, Phone, Mail, MapPin, ChevronRight,
  Folder, MoreVertical, Search, Save, Trash2, UserPlus, Share2, Loader,
  CheckSquare, Square, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';
import DocumentsView from '../../components/documents/DocumentsView';
import CreateTicketModal from '../../components/forms/CreateTicketModal';
import AddFamilyMemberModal from '../../components/forms/AddFamilyMemberModal';

const ClientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, docsRes, claimsRes, ticketsRes, familyRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/documents?client_id=${id}`),
        api.get(`/claims?client_id=${id}`).catch(() => ({ data: [] })),
        api.get(`/tickets?client_id=${id}`).catch(() => ({ data: [] })),
        api.get(`/users?parent_id=${id}`).catch(() => ({ data: [] }))
      ]);
      
      setClient(userRes.data);
      setDocuments(docsRes.data);
      setClaims(claimsRes.data);
      setTickets(ticketsRes.data);
      
      // Combine embedded family members with standalone ones (for backward compatibility)
      const embedded = userRes.data.familyMembers || [];
      const standalone = familyRes.data.filter(u => u.parent_id === id);
      setFamilyMembers([...embedded, ...standalone]);
    } catch (err) {
      console.error('Error fetching client dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!client) return 0;
    const fields = [
      client.username, client.password, client.name, client.dob, client.gender, 
      client.email, client.phone, client.city, client.kyc_data?.pan, client.kyc_data?.aadhaar
    ];
    const filled = fields.filter(f => f && f !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Form', icon: <FileText size={16} /> },
    { id: 'overview', label: 'Overview', icon: <Package size={16} /> },
    { id: 'claims', label: 'Claims', icon: <Layers size={16} />, badge: claims.length },
    { id: 'holders', label: 'Holders', icon: <Users size={16} />, badge: familyMembers.length },
    { id: 'documents', label: 'Documents', icon: <Folder size={16} />, badge: documents.length },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle2 size={16} />, badge: 0 },
    { id: 'communication', label: 'Communication', icon: <MessageSquare size={16} /> },
    { id: 'family', label: 'Family Tree', icon: <GitBranch size={16} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={16} /> },
  ];

  if (loading && !client) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader className="animate-spin" size={40} color="#10b981" />
        <div style={{ marginTop: '16px', fontWeight: 600, color: '#64748b' }}>Syncing Client Data...</div>
      </div>
    </div>
  );

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      {/* 🚀 COMPACT HEADER */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}
        >
          ← Back
        </button>

        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>
          {client?.name?.substring(0, 2).toUpperCase() || 'CL'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{client?.name}</h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{client?.client_id_ref || 'CLT-001'}</span>
            <span style={{ padding: '2px 8px', background: documents.length > 0 ? '#f0fdf4' : '#fff7ed', color: documents.length > 0 ? '#15803d' : '#c2410c', border: `1px solid ${documents.length > 0 ? '#dcfce7' : '#ffedd5'}`, borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
              {documents.length > 0 ? 'KYC VERIFIED' : 'DOCS PENDING'}
            </span>
            <span style={{ padding: '2px 8px', background: client?.is_active !== false ? '#f0fdf4' : '#fef2f2', color: client?.is_active !== false ? '#15803d' : '#dc2626', border: `1px solid ${client?.is_active !== false ? '#dcfce7' : '#fecaca'}`, borderRadius: '4px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: client?.is_active !== false ? '#10b981' : '#ef4444' }} /> {client?.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} strokeWidth={3} color="#10b981" /> {client?.phone || 'N/A'} <CheckCircle2 size={12} color="#10b981" fill="#f0fdf4" /></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {client?.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {client?.city || 'Location N/A'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Profile: <span style={{ color: '#10b981' }}>{calculateProgress()}% complete</span></span>
              <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${calculateProgress()}%`, background: '#10b981', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsTicketModalOpen(true)}
            style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}
          >
            <Ticket size={16} color="#eab308" /> Create Ticket
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}
          >
            <Upload size={16} color="#3b82f6" /> Upload Doc
          </button>
          <button style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
            <FileText size={16} /> Create Proposal
          </button>
        </div>
      </div>

      {/* 📑 TABS NAV */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0', padding: '0 24px', overflowX: 'auto', flexShrink: 0 }}>
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '16px 20px', 
              fontSize: '13px', 
              fontWeight: 700, 
              color: activeTab === tab.id ? '#10b981' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #10b981' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.label}
            {tab.badge > 0 && (
              <span style={{ fontSize: '10px', background: activeTab === tab.id ? '#10b981' : '#f1f5f9', color: activeTab === tab.id ? '#fff' : '#64748b', padding: '1px 6px', borderRadius: '10px', marginLeft: '2px' }}>
                {tab.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 🖼️ MAIN CONTENT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {activeTab === 'profile' && <ProfileView client={client} onEdit={(section) => { setEditSection(section); setIsEditModalOpen(true); }} />}
        {activeTab === 'overview' && <OverviewView client={client} claims={claims} tickets={tickets} documents={documents} />}
        {activeTab === 'documents' && <DocumentsView documents={documents} client={client} onRefresh={fetchData} setIsUploadModalOpen={setIsUploadModalOpen} />}
        {activeTab === 'family' && <FamilyTreeView familyMembers={familyMembers} client={client} onRefresh={fetchData} onAddFamily={() => setIsAddFamilyModalOpen(true)} />}
        {activeTab === 'holders' && <HoldersView members={familyMembers} onAddHolder={() => setIsAddFamilyModalOpen(true)} />}
        {activeTab === 'claims' && <ClaimsView claims={claims} tickets={tickets} />}
        {activeTab === 'tickets' && <TicketsView tickets={tickets} />}
        {activeTab === 'activity' && <ActivityView tickets={tickets} client={client} />}
        {!['profile', 'overview', 'documents', 'family', 'holders', 'claims', 'tickets', 'activity'].includes(activeTab) && (
          <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
            <Activity size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div style={{ fontSize: '18px', fontWeight: 600 }}>{activeTab.toUpperCase()} View</div>
            <p>This module is currently in active development.</p>
          </div>
        )}
      </div>

      {/* 🏗️ UPLOAD MODAL */}
      {/* Upload Modal has been moved into DocumentsView.jsx so it has access to currentFolderId */}

      {/* 🎫 CREATE TICKET MODAL */}
      {isTicketModalOpen && (
        <CreateTicketModal
          defaultClientId={id}
          onClose={() => setIsTicketModalOpen(false)}
          onSuccess={fetchData}
        />
      )}

      {/* 📝 EDIT CLIENT MODAL (Dynamic Form) */}
      {isEditModalOpen && (
        <EditClientModal 
          client={client} 
          section={editSection}
          onClose={() => { setIsEditModalOpen(false); setEditSection(null); }} 
          onSave={fetchData} 
        />
      )}

      {/* 👨‍👩‍👧 ADD FAMILY MEMBER MODAL */}
      <AddFamilyMemberModal
        isOpen={isAddFamilyModalOpen}
        onClose={() => setIsAddFamilyModalOpen(false)}
        clientId={id}
        onSuccess={fetchData}
      />
    </div>
  );
};

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

const ProfileView = ({ client, onEdit }) => {
  const steps = [
    { num: 1, label: 'Login', status: client?.username ? 'done' : 'empty' },
    { num: 2, label: 'Personal', status: client?.name ? 'done' : 'empty' },
    { num: 3, label: 'Contact', status: client?.email ? 'done' : 'empty' },
    { num: 4, label: 'ID Docs', status: (client?.kyc_data?.pan || client?.kyc_data?.aadhaar) ? 'done' : 'empty' },
    { num: 5, label: 'Relationship', status: client?.relation ? 'done' : 'empty' },
    { num: 6, label: 'Nominee', status: client?.nomineeName ? 'done' : 'empty' },
    { num: 7, label: 'Contact Person', status: client?.responsiblePerson?.name ? 'done' : 'empty' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: 900, color: '#0f172a', textAlign: 'center' }}>Form Completion Progress</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0', padding: '0 40px' }}>
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: s.status === 'done' ? '#10b981' : s.status === 'pending' ? '#f97316' : '#f1f5f9',
                  color: s.status === 'empty' ? '#94a3b8' : '#fff',
                  border: s.status === 'empty' ? '1.5px solid #e2e8f0' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800
                }}>
                  {s.status === 'done' ? <CheckCircle2 size={18} /> : s.num}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: s.status !== 'empty' ? '#0f172a' : '#94a3b8' }}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: s.status === 'done' ? '#10b981' : '#e2e8f0', margin: '0 0 20px', marginTop: '-20px' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <ProfileSection title="1. Login Credentials" onEdit={() => onEdit(1)} data={[
        { label: 'Client Code / ID', value: client?.client_id_ref || client?._id, blue: true },
        { label: 'Username', value: client?.username || '—' },
        { label: 'Email (Login)', value: client?.email || '—' },
        { label: 'Phone', value: client?.phone || '—', verified: !!client?.phone }
      ]} />

      <ProfileSection title="2. Personal Info" onEdit={() => onEdit(2)} data={[
        { label: 'Name', value: client?.name || '—' },
        { label: 'Date of Birth', value: client?.dob || '—' },
        { label: 'Gender', value: client?.gender || '—' },
        { label: 'Marital Status', value: client?.maritalStatus || '—' },
        { label: 'Old Name', value: client?.oldName || '—' },
        { label: 'New Name', value: client?.newName || '—' },
        { label: 'Citizenship', value: client?.citizenship || '—' },
        { label: 'Father/Spouse', value: client?.fatherName || '—' }
      ]} />

      <ProfileSection title="3. Contact Info" onEdit={() => onEdit(3)} data={[
        { label: 'Permanent Address', value: client?.permanentAddress || client?.city || client?.kyc_data?.address || '—' },
        { label: 'Correspondence Address', value: 'Same as Permanent' },
        { label: 'Old Address', value: client?.oldAddress || '—' },
        { label: 'Rent Agreement', value: client?.kyc_data?.otherDocsFile ? 'View' : 'Not Uploaded', link: !!client?.kyc_data?.otherDocsFile, href: client?.kyc_data?.otherDocsFile, warning: !client?.kyc_data?.otherDocsFile }
      ]} />

      <ProfileSection title="4. Identification Details" badge="2 Pending" onEdit={() => onEdit(4)} data={[
        { label: 'Aadhaar No.', value: client?.kyc_data?.aadhaar || '—' },
        { label: 'PAN No.', value: client?.kyc_data?.pan || '—' },
        { label: 'Aadhaar Card', value: client?.kyc_data?.aadharCardFile ? 'View' : 'Not Uploaded', link: !!client?.kyc_data?.aadharCardFile, href: client?.kyc_data?.aadharCardFile, warning: !client?.kyc_data?.aadharCardFile },
        { label: 'PAN Card', value: client?.kyc_data?.panCardFile ? 'View' : 'Not Uploaded', link: !!client?.kyc_data?.panCardFile, href: client?.kyc_data?.panCardFile, warning: !client?.kyc_data?.panCardFile },
        { label: 'Passport', value: client?.kyc_data?.passportFile ? 'View' : 'Not Uploaded', link: !!client?.kyc_data?.passportFile, href: client?.kyc_data?.passportFile, warning: !client?.kyc_data?.passportFile },
        { label: 'Signature', value: client?.kyc_data?.otherDocsFile ? 'View' : 'Not Uploaded', link: !!client?.kyc_data?.otherDocsFile, href: client?.kyc_data?.otherDocsFile, warning: !client?.kyc_data?.otherDocsFile },
      ]} />

      <ProfileSection title="5. Relationship Details" onEdit={() => onEdit(5)} data={[
        { label: 'Relation to Shareholder', value: client?.relationWithHolder || client?.relation || '—' },
        { label: 'Reference Type', value: client?.reference || '—' },
        { label: 'Super Partner Firm', value: client?.superPartnerFirm || '—' },
        { label: 'Partner Firm', value: client?.referenceName || client?.partnerFirm || '—' }
      ]} />

      <ProfileSection title="6. Nominee Details" onEdit={() => onEdit(6)} data={[
        { label: 'Nominee Name', value: client?.nomineeName || '—' },
        { label: 'Nominee Relation', value: client?.nomineeRelation || '—' },
        { label: 'Nominee DOB', value: client?.nomineeDob || '—' },
        { label: 'NOC (Other Heirs)', value: client?.nomineeNocPath ? 'View' : 'Not Uploaded', link: !!client?.nomineeNocPath, href: client?.nomineeNocPath, warning: !client?.nomineeNocPath }
      ]} />

      <ProfileSection 
        title="7. Contact Person Details" 
        alert="Client ID is created on the actual claimant (legal beneficiary), not the contact person."
        onEdit={() => onEdit(7)} 
        data={[
          { label: 'Contact Person Name', value: client?.responsiblePerson?.name || '—' },
          { label: 'Relation to Claimant', value: client?.responsiblePerson?.designation || '—' },
          { label: 'Mobile Number', value: client?.responsiblePerson?.mobile || '—' },
          { label: 'Email ID', value: client?.responsiblePerson?.email || '—' },
          { label: 'Aadhaar', value: client?.responsiblePerson?.aadhaar || '—' }
        ]} 
      />
    </div>
  );
};

const ProfileSection = ({ title, data, onEdit, badge, alert }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{title}</h4>
        {badge && <span style={{ background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>{badge}</span>}
      </div>
      <button onClick={onEdit} style={{ padding: '6px 12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={12} /> Edit</button>
    </div>
    {alert && (
      <div style={{ background: '#f0f4ff', color: '#1d4ed8', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #dbeafe' }}>
        <AlertCircle size={16} /> {alert}
      </div>
    )}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
          {item.link ? (
            <a href={`${api.defaults.baseURL.replace('/api', '')}${item.href}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#0f172a' }}><Eye size={12} /> View</a>
          ) : item.warning ? (
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#ea580c' }}>{item.value}</span>
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 800, color: item.blue ? '#2563eb' : '#0f172a' }}>
              {item.value} {item.verified && <CheckCircle2 size={12} color="#10b981" style={{ marginLeft: 4 }} />}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const OverviewView = ({ client, claims, tickets, documents }) => (
  <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
      <StatBox title="Claim Statistics" data={[
        { label: claims.length.toString(), sub: 'TOTAL CLAIMS' },
        { label: '1,250', sub: 'TOTAL SHARES' }, // placeholder as shares are from claims
        { label: '1', sub: 'HOLDERS' },
        { label: claims.filter(c => c.status === 'Active').length.toString(), sub: 'ACTIVE CLAIMS' }
      ]} meta={{ stage: client?.status || 'New', sla: '—', risk: '—' }} />

      <StatBox title="Service Statistics" data={[
        { label: documents.length.toString(), sub: 'DOCS UPLOADED', green: true },
        { label: '0', sub: 'OPEN TASKS' },
        { label: tickets.length.toString(), sub: 'ACTIVE TICKETS' },
        { label: '0', sub: 'BLOCKERS' }
      ]} meta={{ officer: '—', partner: client?.referenceName || 'Direct', service: 'Wealth Claims' }} />

      <StatBox title="Store Statistics" data={[
        { label: '0', sub: 'PRODUCTS HELD' },
        { label: '0', sub: 'ACTIVE ORDERS' },
        { label: '₹0', sub: 'PORTFOLIO VALUE', blue: true },
        { label: documents.length > 0 ? '1/1' : '0/1', sub: 'KYC APPROVED' }
      ]} meta={{ lastOrder: '—', category: 'General' }} />
    </div>

    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 900 }}>📝 Internal Notes</h4>
      <textarea 
        placeholder="Add a note..." 
        defaultValue={client?.notes}
        style={{ width: '100%', minHeight: '100px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontSize: '14px', outline: 'none' }}
      />
    </div>
  </div>
);

const StatBox = ({ title, data, meta }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
    <h4 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{title}</h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ fontSize: '20px', fontWeight: 900, color: d.green ? '#10b981' : d.blue ? '#3b82f6' : '#0f172a' }}>{d.label}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>{d.sub}</div>
        </div>
      ))}
    </div>
    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '11px' }}>
       {meta.stage && <div><span style={{ color: '#94a3b8' }}>STATUS:</span> <b style={{ color: '#15803d' }}>{meta.stage}</b></div>}
       {meta.service && <div><span style={{ color: '#94a3b8' }}>SERVICE:</span> <b>{meta.service}</b></div>}
    </div>
  </div>
);

const FamilyTreeNode = ({ name, role, isClient }) => (
  <div style={{ 
    background: isClient ? '#2563eb' : '#fff', 
    border: `2px solid ${isClient ? '#1d4ed8' : '#e2e8f0'}`,
    color: isClient ? '#fff' : '#0f172a',
    padding: '12px 24px', 
    borderRadius: '12px', 
    minWidth: '120px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    position: 'relative',
    zIndex: 2
  }}>
    <div style={{ fontWeight: 800, fontSize: '14px' }}>{name}</div>
    <div style={{ fontSize: '10px', color: isClient ? '#bfdbfe' : '#64748b', fontWeight: 800, marginTop: 4, textTransform: 'uppercase' }}>{role}</div>
  </div>
);

const FamilyTreeView = ({ familyMembers, client, onRefresh, onAddFamily }) => {
  const ancestors = familyMembers.filter(m => ['Father', 'Mother', 'Grandfather', 'Grandmother'].includes(m.relationWithHolder));
  const siblings = familyMembers.filter(m => ['Brother', 'Sister'].includes(m.relationWithHolder));
  const children = familyMembers.filter(m => ['Son', 'Daughter'].includes(m.relationWithHolder));
  const spouse = familyMembers.filter(m => ['Spouse'].includes(m.relationWithHolder));
  const others = familyMembers.filter(m => !['Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse'].includes(m.relationWithHolder));

  return (
    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Family Tree & Hierarchy</h3>
        <button 
          onClick={onAddFamily}
          style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Add Member
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '20px 0' }}>
        
        {/* Ancestors Level */}
        {ancestors.length > 0 && (
          <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', position: 'relative' }}>
            {ancestors.map((m, i) => <FamilyTreeNode key={`anc-${i}`} name={m.name} role={m.relationWithHolder} />)}
            <div style={{ position: 'absolute', bottom: '-40px', left: '50%', width: '2px', height: '40px', background: '#cbd5e1', transform: 'translateX(-50%)', zIndex: 1 }} />
            {ancestors.length > 1 && (
              <div style={{ position: 'absolute', bottom: '-20px', left: '10%', right: '10%', height: '2px', background: '#cbd5e1', zIndex: 1 }} />
            )}
          </div>
        )}

        {/* Client & Siblings Level */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '40px', position: 'relative', marginBottom: '40px', width: '100%' }}>
          
          {/* Siblings (Left) */}
          <div style={{ display: 'flex', gap: '20px', position: 'relative', justifyContent: 'flex-end' }}>
            {siblings.map((m, i) => <FamilyTreeNode key={`sib-${i}`} name={m.name} role={m.relationWithHolder} />)}
            {siblings.length > 0 && (
              <div style={{ position: 'absolute', top: '50%', right: '-40px', width: '40px', height: '2px', background: '#cbd5e1', zIndex: 1, transform: 'translateY(-50%)' }} />
            )}
          </div>

          {/* Client Node (Center) */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
            <FamilyTreeNode name={client?.name} role="PRIMARY CLIENT" isClient={true} />
            {children.length > 0 && (
              <div style={{ position: 'absolute', bottom: '-40px', left: '50%', width: '2px', height: '40px', background: '#cbd5e1', transform: 'translateX(-50%)', zIndex: 1 }} />
            )}
          </div>

          {/* Spouse (Right) */}
          <div style={{ display: 'flex', gap: '20px', position: 'relative', justifyContent: 'flex-start' }}>
            {spouse.length > 0 && (
              <div style={{ position: 'absolute', top: '50%', left: '-40px', width: '40px', height: '2px', background: '#cbd5e1', zIndex: 1, transform: 'translateY(-50%)' }} />
            )}
            {spouse.map((m, i) => <FamilyTreeNode key={`sp-${i}`} name={m.name} role={m.relationWithHolder} />)}
          </div>
        </div>

        {/* Children Level */}
        {children.length > 0 && (
          <div style={{ display: 'flex', gap: '30px', position: 'relative' }}>
            {children.length > 1 && (
              <div style={{ position: 'absolute', top: '-20px', left: '20%', right: '20%', height: '2px', background: '#cbd5e1', zIndex: 1 }} />
            )}
            {children.map((m, i) => (
              <div key={`child-${i}`} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-20px', left: '50%', width: '2px', height: '20px', background: '#cbd5e1', transform: 'translateX(-50%)', zIndex: 1 }} />
                <FamilyTreeNode name={m.name} role={m.relationWithHolder} />
              </div>
            ))}
          </div>
        )}

        {/* Other Relatives */}
        {others.length > 0 && (
          <div style={{ marginTop: '60px', width: '100%' }}>
            <div style={{ height: '1px', background: '#e2e8f0', margin: '0 0 20px' }} />
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Other Relatives</h4>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {others.map((m, i) => <FamilyTreeNode key={`oth-${i}`} name={m.name} role={m.relationWithHolder} />)}
            </div>
          </div>
        )}

        {familyMembers.length === 0 && (
          <div style={{ color: '#94a3b8', padding: '40px', border: '2px dashed #e2e8f0', borderRadius: '16px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Users size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No family members linked yet.</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Click "Add Member" to start building the family tree.</p>
          </div>
        )}

      </div>
    </div>
  );
};

const mockHoldersData = [
  { pan: 'ABCPD1234F', aadhaar: 'XXXX-XXXX-1234', status: 'DECEASED', progress: 65, docs: [{name: 'PAN Card', done: true}, {name: 'Death Certificate', done: false}, {name: 'Aadhaar', done: true}, {name: 'Ration Card', done: false}] },
  { pan: 'XYZMP5678G', aadhaar: 'XXXX-XXXX-5678', status: 'ALIVE', progress: 85, docs: [{name: 'PAN Card', done: true}, {name: 'Aadhaar', done: true}, {name: 'Birth Certificate', done: true}, {name: 'Bank Passbook', done: false}] },
  { pan: 'PQRSP9812H', aadhaar: 'XXXX-XXXX-9812', status: 'ALIVE', progress: 40, docs: [{name: 'PAN Card', done: false}, {name: 'Aadhaar', done: false}, {name: 'School LC', done: false}] }
];

const HoldersView = ({ members, onAddHolder }) => {
  const displayMembers = members.length > 0 ? members : [];
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>Shareholders / Holders</h3>
        <button onClick={onAddHolder} style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Holder Form
        </button>
      </div>

      {displayMembers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {displayMembers.map((m, i) => {
            const mock = mockHoldersData[i % mockHoldersData.length];
            const colors = [
              { border: '#fca5a5', bg: '#fef2f2', text: '#ef4444', progress: '#ef4444' }, // Red
              { border: '#86efac', bg: '#f0fdf4', text: '#22c55e', progress: '#22c55e' }, // Green
              { border: '#d8b4fe', bg: '#faf5ff', text: '#a855f7', progress: '#ef4444' }  // Purple (red progress in design for H3)
            ];
            const c = colors[i % colors.length];
            
            return (
              <div key={m._id} style={{ background: '#f8fafc', borderRadius: '16px', border: `2px solid ${c.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px' }}>
                    H{i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>{m.name}</div>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>Holder {i + 1} — {m.relationWithHolder || (i===0?'Primary':'Joint')}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>PAN</span>
                    <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>{mock.pan}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Aadhaar</span>
                    <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>{mock.aadhaar}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Status</span>
                    <span style={{ 
                      fontSize: '10px', fontWeight: 900, letterSpacing: '0.5px', padding: '4px 10px', borderRadius: '12px',
                      background: mock.status === 'ALIVE' ? '#dcfce7' : '#fee2e2',
                      color: mock.status === 'ALIVE' ? '#16a34a' : '#ef4444'
                    }}>
                      {mock.status}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Profile Complete</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: c.text }}>{mock.progress}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: c.progress, width: `${mock.progress}%` }}></div>
                  </div>
                </div>

                {/* Documents */}
                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', flexGrow: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' }}>DOCUMENTS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mock.docs.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {doc.done ? <CheckSquare size={14} color="#16a34a" /> : <Square size={14} color="#ef4444" />}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: doc.done ? '#475569' : '#ef4444' }}>{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#475569' }}>No holders found</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Add family members to view their details here.</p>
        </div>
      )}

      {/* Compliance Box */}
      {displayMembers.length > 0 && (
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(15,23,42,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ color: '#eab308' }}><AlertTriangle size={24} /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>Missing Compliance Files</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px', fontWeight: 600 }}>3 critical documents required for Holder {displayMembers.length >= 3 ? 3 : 1}.</div>
            </div>
          </div>
          <button style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', letterSpacing: '0.5px' }}>
            REMIND CLIENT
          </button>
        </div>
      )}
    </div>
  );
};

const ClaimsView = ({ claims, tickets = [] }) => {
  const [localClaims, setLocalClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [editingStages, setEditingStages] = useState(false);

  useEffect(() => {
    const calculateProgressAndStatus = (stages) => {
      const completedCount = stages.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedCount / stages.length) * 100);
      
      let status = 'In Progress';
      if (progress === 100) status = 'Completed';
      else if (progress === 0) status = 'Pending';
      else {
        const lastCompleted = [...stages].reverse().find(s => s.status === 'completed');
        if (lastCompleted && lastCompleted.name === 'Application Filed') {
           status = 'Filed';
        }
      }
      return { progress, status };
    };

    const demoClaims = [
      { 
        _id: 'mock1', companyName: 'TATA Motors Ltd', isin: 'INE155A01022', folio: 'TM12345', shares: 200, claimValue: '₹1.4L', color: '#ea580c', ticketId: 'TKT-8924', holders: 'H1, H3', clientName: 'Rajesh Kumar', contact: 'rajesh@gmail.com', updates: [{ date: '5 Feb 2026', msg: 'Sent documents to IEPF authority for review. Tracking ID: IN889922.' }],
        stages: [
          { name: 'Document Collection', status: 'completed', date: '12 Jan 2026' },
          { name: 'Verification', status: 'completed', date: '20 Jan 2026' },
          { name: 'Application Filed', status: 'completed', date: '28 Jan 2026' },
          { name: 'Authority Review', status: 'in-progress', date: 'In progress since 5 Feb 2026' },
          { name: 'Claim Approved', status: 'pending', date: '' },
          { name: 'Shares Credited', status: 'pending', date: '' }
        ]
      },
      { 
        _id: 'mock2', companyName: 'Reliance Industries', isin: 'INE002A01018', folio: 'RJ56789', shares: 500, claimValue: '₹6.5L', color: '#2563eb', ticketId: 'TKT-9011', holders: 'H1', clientName: 'Rajesh Kumar', contact: 'rajesh@gmail.com', updates: [{ date: '15 Feb 2026', msg: 'Application filed successfully online.' }],
        stages: [
          { name: 'Document Collection', status: 'completed', date: '10 Jan 2026' },
          { name: 'Verification', status: 'completed', date: '15 Jan 2026' },
          { name: 'Application Filed', status: 'completed', date: '22 Jan 2026' },
          { name: 'Authority Review', status: 'pending', date: '' },
          { name: 'Claim Approved', status: 'pending', date: '' },
          { name: 'Shares Credited', status: 'pending', date: '' }
        ]
      },
      { 
        _id: 'mock3', companyName: 'HDFC Bank', isin: 'INE040A01034', folio: 'HB34567', shares: 150, claimValue: '₹2.4L', color: '#16a34a', ticketId: 'TKT-8100', holders: 'H1, H2', clientName: 'Rajesh Kumar', contact: 'rajesh@gmail.com', updates: [{ date: '10 Jan 2026', msg: 'Shares credited to demat account successfully.' }],
        stages: [
          { name: 'Document Collection', status: 'completed', date: '1 Dec 2025' },
          { name: 'Verification', status: 'completed', date: '10 Dec 2025' },
          { name: 'Application Filed', status: 'completed', date: '15 Dec 2025' },
          { name: 'Authority Review', status: 'completed', date: '20 Dec 2025' },
          { name: 'Claim Approved', status: 'completed', date: '5 Jan 2026' },
          { name: 'Shares Credited', status: 'completed', date: '10 Jan 2026' }
        ]
      },
      { 
        _id: 'mock4', companyName: 'Infosys', isin: 'INE009A01021', folio: 'IN98765', shares: 400, claimValue: '₹4.8L', color: '#94a3b8', ticketId: 'TKT-9255', holders: 'H2', clientName: 'Rajesh Kumar', contact: 'rajesh@gmail.com', updates: [{ date: '20 Feb 2026', msg: 'Pending submission of missing signature on indemnity bond by H2.' }],
        stages: [
          { name: 'Document Collection', status: 'in-progress', date: 'In progress since 20 Feb 2026' },
          { name: 'Verification', status: 'pending', date: '' },
          { name: 'Application Filed', status: 'pending', date: '' },
          { name: 'Authority Review', status: 'pending', date: '' },
          { name: 'Claim Approved', status: 'pending', date: '' },
          { name: 'Shares Credited', status: 'pending', date: '' }
        ]
      }
    ];

    const claimTickets = tickets.filter(t => t.hubType === 'Claim Hub');

    const displayClaims = claimTickets.length > 0 ? claimTickets.map((t, i) => {
      const mockRef = demoClaims[i % demoClaims.length];
      const stages = (t.stages && t.stages.length > 0) ? t.stages : JSON.parse(JSON.stringify(mockRef.stages));
      const { progress, status } = calculateProgressAndStatus(stages);
      
      let compName = t.companyName || t.subject || mockRef.companyName;
      if (compName.startsWith('New Claim Request:')) {
        compName = compName.split(' for ')[1] || compName;
      }
      
      return {
        _id: t._id,
        companyName: compName,
        serviceName: t.service,
        isin: mockRef.isin,
        folio: mockRef.folio,
        shares: mockRef.shares,
        claimValue: mockRef.claimValue,
        progress: progress,
        color: mockRef.color,
        status: status,
        ticketId: `TKT-${t._id.slice(-6).toUpperCase()}`,
        holders: mockRef.holders,
        clientName: mockRef.clientName,
        contact: mockRef.contact,
        updates: [{ date: new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), msg: `Claim Ticket "${t.subject || t.service}" created.` }],
        stages: stages,
      };
    }) : [];

    setLocalClaims(displayClaims);
  }, [claims, tickets]);

  useEffect(() => {
    if (!selectedClaimId && localClaims.length > 0) {
      setSelectedClaimId(localClaims[0]._id);
    }
  }, [localClaims, selectedClaimId]);

  const selectedClaim = localClaims.find(c => c._id === selectedClaimId);

  const handleStageChange = (idx, field, value) => {
    setLocalClaims(prev => prev.map(c => {
      if (c._id === selectedClaimId) {
        const newStages = [...c.stages];
        newStages[idx] = { ...newStages[idx], [field]: value };
        
        // If a stage is moved out of 'completed', reset all subsequent stages
        if (field === 'status' && (value === 'pending' || value === 'in-progress')) {
          for (let i = idx + 1; i < newStages.length; i++) {
            newStages[i] = { ...newStages[i], status: 'pending' };
          }
        }
        
        const completedCount = newStages.filter(s => s.status === 'completed').length;
        const progress = Math.round((completedCount / newStages.length) * 100);
        let status = 'In Progress';
        if (progress === 100) status = 'Completed';
        else if (progress === 0) status = 'Pending';
        else {
          const lastCompleted = [...newStages].reverse().find(s => s.status === 'completed');
          if (lastCompleted && lastCompleted.name === 'Application Filed') status = 'Filed';
        }

        return { ...c, stages: newStages, progress, status };
      }
      return c;
    }));
  };

  const handleSaveStages = async () => {
    if (editingStages) {
      try {
        const claim = localClaims.find(c => c._id === selectedClaimId);
        await api.patch(`/tickets/${selectedClaimId}/stages`, { 
          stages: claim.stages,
          progress: claim.progress,
          status: claim.status
        });
      } catch (err) {
        console.error('Failed to save claim stages', err);
      }
    }
    setEditingStages(!editingStages);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>Companies & Claims</h3>
        <button style={{ padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      {localClaims.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          {localClaims.map(c => (
          <div 
            key={c._id} 
            onClick={() => setSelectedClaimId(c._id)}
            style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              padding: '20px', 
              border: selectedClaimId === c._id ? `2px solid ${c.color}` : '1px solid #e2e8f0', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: selectedClaimId === c._id ? `0 4px 12px ${c.color}20` : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: c.color, width: `${c.progress}%` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{c.companyName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>Service: {c.serviceName}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>ISIN: {c.isin} • Folio: {c.folio}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ 
                  background: c.status === 'Completed' ? '#f0fdf4' : c.status === 'Filed' ? '#eff6ff' : c.status === 'In Progress' ? '#fff7ed' : '#f8fafc', 
                  color: c.status === 'Completed' ? '#16a34a' : c.status === 'Filed' ? '#2563eb' : c.status === 'In Progress' ? '#ea580c' : '#64748b', 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, border: `1px solid ${c.status === 'Completed' ? '#bbf7d0' : c.status === 'Filed' ? '#bfdbfe' : c.status === 'In Progress' ? '#fed7aa' : '#e2e8f0'}`
                }}>
                  {c.status}
                </span>
                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                  <Edit2 size={12} /> Edit
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>SHARES</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{c.shares}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>CLAIM VALUE</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{c.claimValue}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>PROGRESS</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: c.color }}>{c.progress}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#475569' }}>No claims found for this client</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>To add a claim, create a ticket and select "Claim Hub" as the Hub Type.</p>
        </div>
      )}

      {selectedClaim && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{selectedClaim.companyName} — Detailed View</h4>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Service: {selectedClaim.serviceName} • ISIN: {selectedClaim.isin} • Folio: {selectedClaim.folio} • Cert: TC-001, TC-002</div>
          </div>
          <div style={{ color: selectedClaim.color, fontWeight: 800, fontSize: '14px' }}>{selectedClaim.status} — {selectedClaim.progress}%</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
          {/* Left: Claim Stages */}
          <div>
            <h5 style={{ margin: '0 0 20px', fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              CLAIM STAGES
              <button 
                onClick={handleSaveStages} 
                style={{ background: 'none', border: 'none', color: editingStages ? '#10b981' : '#2563eb', cursor: 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {editingStages ? <><Save size={12} /> Save</> : <><Edit2 size={12} /> Edit</>}
              </button>
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {(selectedClaim.stages || []).map((stage, idx) => {
                const isPrevCompleted = idx === 0 || selectedClaim.stages.slice(0, idx).every(s => s.status === 'completed');
                return (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {idx !== selectedClaim.stages.length - 1 && (
                    <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-8px', width: '2px', background: stage.status === 'completed' ? '#10b981' : '#f1f5f9' }} />
                  )}
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    background: stage.status === 'completed' ? '#10b981' : stage.status === 'in-progress' ? '#fff' : '#f1f5f9',
                    border: stage.status === 'in-progress' ? '2px solid #2563eb' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: stage.status === 'completed' ? '#fff' : '#cbd5e1',
                    zIndex: 1
                  }}>
                    {stage.status === 'completed' && <CheckCircle2 size={16} />}
                    {stage.status === 'in-progress' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />}
                  </div>
                  <div style={{ paddingBottom: '24px', flex: 1 }}>
                    {editingStages ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '-4px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            value={stage.name} 
                            onChange={(e) => handleStageChange(idx, 'name', e.target.value)} 
                            style={{ flex: 1, padding: '4px 8px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: 700 }}
                          />
                          <select 
                            value={stage.status} 
                            onChange={(e) => handleStageChange(idx, 'status', e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }}
                          >
                            <option value="completed" disabled={!isPrevCompleted}>Completed</option>
                            <option value="in-progress" disabled={!isPrevCompleted}>In Progress</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Date or description..."
                          value={stage.date} 
                          onChange={(e) => handleStageChange(idx, 'date', e.target.value)} 
                          style={{ width: '100%', padding: '4px 8px', fontSize: '11px', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b' }}
                        />
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: stage.status === 'pending' ? '#94a3b8' : '#0f172a' }}>{stage.name}</div>
                        <div style={{ fontSize: '12px', color: stage.status === 'in-progress' ? '#2563eb' : '#64748b', marginTop: '2px', fontWeight: 600 }}>{stage.date}</div>
                      </>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Right: Application Info & Updates */}
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h5 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>APPLICATION INFO</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Ticket ID</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}><Ticket size={14} color="#eab308" /> {selectedClaim.ticketId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Holders</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{selectedClaim.holders}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Client Name</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{selectedClaim.clientName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Contact</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{selectedClaim.contact}</div>
                </div>
              </div>
            </div>

            <div>
              <h5 style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
                TRACK PROGRESS
                <span style={{ color: '#2563eb', cursor: 'pointer', textTransform: 'none' }}>+ Add Update</span>
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {(selectedClaim.updates || []).map((update, idx) => (
                  <div key={idx} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 800, marginBottom: '6px' }}>{update.date}</div>
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>{update.msg}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TicketsView = ({ tickets }) => (
  <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ background: '#f8fafc' }}>
        <tr>
          <th style={{ padding: '16px', textAlign: 'left' }}>Ticket ID</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Subject</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Service</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Priority</th>
        </tr>
      </thead>
      <tbody>
        {tickets.length > 0 ? tickets.map(t => (
          <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '16px', fontWeight: 800 }}>#{t._id.slice(-6).toUpperCase()}</td>
            <td style={{ padding: '16px' }}>{t.subject}</td>
            <td style={{ padding: '16px' }}>{t.service}</td>
            <td style={{ padding: '16px' }}>{t.priority}</td>
          </tr>
        )) : <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No support tickets found.</td></tr>}
      </tbody>
    </table>
  </div>
);

const EditClientModal = ({ client, section, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...client });
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState({});

  const handleFileChange = (e, field) => {
    if (e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/users/${client._id}`, formData);

      if (Object.keys(files).length > 0) {
        const fileForm = new FormData();
        fileForm.append('userId', client._id);
        Object.entries(files).forEach(([field, file]) => {
           fileForm.append('docType', field);
           fileForm.append('files', file);
        });
        await api.post('/users/kyc-upload', fileForm);
      }

      onSave();
      onClose();
    } catch (err) {
      alert('Error updating client info');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionFields = () => {
    switch (section) {
      case 1:
        return (
          <>
            <div className="form-row cols-2">
              <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            </div>
            <div className="form-row cols-1" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="form-row cols-2">
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input" value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
              <div className="form-group"><label className="form-label">Marital Status</label><select className="form-select" value={formData.maritalStatus || ''} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}><option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option></select></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Old Name</label><input className="form-input" value={formData.oldName || ''} onChange={e => setFormData({...formData, oldName: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">New Name</label><input className="form-input" value={formData.newName || ''} onChange={e => setFormData({...formData, newName: e.target.value})} /></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Citizenship</label><input className="form-input" value={formData.citizenship || ''} onChange={e => setFormData({...formData, citizenship: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Father/Spouse</label><input className="form-input" value={formData.fatherName || ''} onChange={e => setFormData({...formData, fatherName: e.target.value})} /></div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="form-row cols-1">
              <div className="form-group"><label className="form-label">Permanent Address</label><input className="form-input" value={formData.permanentAddress || formData.city || ''} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} /></div>
            </div>
            <div className="form-row cols-1" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Old Address</label><input className="form-input" value={formData.oldAddress || ''} onChange={e => setFormData({...formData, oldAddress: e.target.value})} /></div>
            </div>
            <div className="form-row cols-1" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Rent Agreement</label><input type="file" className="form-input" onChange={e => handleFileChange(e, 'otherDocs')} /></div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="form-row cols-2">
              <div className="form-group"><label className="form-label">Aadhaar Number</label><input className="form-input" value={formData.kyc_data?.aadhaar || ''} onChange={e => setFormData({...formData, kyc_data: {...formData.kyc_data, aadhaar: e.target.value}})} /></div>
              <div className="form-group"><label className="form-label">PAN Number</label><input className="form-input" value={formData.kyc_data?.pan || ''} onChange={e => setFormData({...formData, kyc_data: {...formData.kyc_data, pan: e.target.value}})} /></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Upload Aadhaar</label><input type="file" className="form-input" onChange={e => handleFileChange(e, 'aadharCard')} /></div>
              <div className="form-group"><label className="form-label">Upload PAN</label><input type="file" className="form-input" onChange={e => handleFileChange(e, 'panCard')} /></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Upload Passport</label><input type="file" className="form-input" onChange={e => handleFileChange(e, 'passport')} /></div>
              <div className="form-group"><label className="form-label">Upload Signature</label><input type="file" className="form-input" onChange={e => handleFileChange(e, 'otherDocs')} /></div>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div className="form-row cols-2">
              <div className="form-group"><label className="form-label">Relation to Shareholder</label><input className="form-input" value={formData.relationWithHolder || ''} onChange={e => setFormData({...formData, relationWithHolder: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Reference Type</label><input className="form-input" value={formData.reference || ''} onChange={e => setFormData({...formData, reference: e.target.value})} /></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Super Partner Firm</label><input className="form-input" value={formData.superPartnerFirm || ''} onChange={e => setFormData({...formData, superPartnerFirm: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Partner Firm</label><input className="form-input" value={formData.referenceName || ''} onChange={e => setFormData({...formData, referenceName: e.target.value})} /></div>
            </div>
          </>
        );
      case 6:
        return (
          <>
            <div className="form-row cols-2">
              <div className="form-group"><label className="form-label">Nominee Name</label><input className="form-input" value={formData.nomineeName || ''} onChange={e => setFormData({...formData, nomineeName: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Nominee Relation</label><input className="form-input" value={formData.nomineeRelation || ''} onChange={e => setFormData({...formData, nomineeRelation: e.target.value})} /></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Nominee DOB</label><input type="date" className="form-input" value={formData.nomineeDob || ''} onChange={e => setFormData({...formData, nomineeDob: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">NOC Document</label><input type="file" className="form-input" onChange={e => handleFileChange(e, 'nomineeNoc')} /></div>
            </div>
          </>
        );
      case 7:
        return (
          <>
            <div className="form-row cols-2">
              <div className="form-group"><label className="form-label">Contact Person Name</label><input className="form-input" value={formData.responsiblePerson?.name || ''} onChange={e => setFormData({...formData, responsiblePerson: {...formData.responsiblePerson, name: e.target.value}})} /></div>
              <div className="form-group"><label className="form-label">Relation to Claimant</label><input className="form-input" value={formData.responsiblePerson?.designation || ''} onChange={e => setFormData({...formData, responsiblePerson: {...formData.responsiblePerson, designation: e.target.value}})} /></div>
            </div>
            <div className="form-row cols-2" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Mobile Number</label><input className="form-input" value={formData.responsiblePerson?.mobile || ''} onChange={e => setFormData({...formData, responsiblePerson: {...formData.responsiblePerson, mobile: e.target.value}})} /></div>
              <div className="form-group"><label className="form-label">Email ID</label><input className="form-input" value={formData.responsiblePerson?.email || ''} onChange={e => setFormData({...formData, responsiblePerson: {...formData.responsiblePerson, email: e.target.value}})} /></div>
            </div>
            <div className="form-row cols-1" style={{ marginTop: 16 }}>
              <div className="form-group"><label className="form-label">Aadhaar</label><input className="form-input" value={formData.responsiblePerson?.aadhaar || ''} onChange={e => setFormData({...formData, responsiblePerson: {...formData.responsiblePerson, aadhaar: e.target.value}})} /></div>
            </div>
          </>
        );
      default:
        return <div>Invalid Section</div>;
    }
  };

  const sectionTitles = {
    1: 'Login Credentials',
    2: 'Personal Info',
    3: 'Contact Info',
    4: 'Identification Details',
    5: 'Relationship Details',
    6: 'Nominee Details',
    7: 'Contact Person Details',
  };

  return (
    <div className="modal-overlay open" style={{ zIndex: 1100 }}>
       <div className="modal" style={{ maxWidth: '700px' }}>
          <div className="modal-header">
             <h3 className="modal-title">Edit {sectionTitles[section] || 'Profile'}</h3>
             <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {renderSectionFields()}
          </form>
          <div className="modal-footer">
             <button type="button" className="topbar-btn secondary" onClick={onClose}>Cancel</button>
             <button type="submit" className="topbar-btn" disabled={saving} onClick={handleSubmit}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
       </div>
    </div>
  );
};



const ActivityView = ({ tickets, client }) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return { bg: '#dcfce7', text: '#16a34a' };
      case 'in_process': return { bg: '#ffedd5', text: '#ea580c' };
      case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
      case 'closed': return { bg: '#f1f5f9', text: '#64748b' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const generateTicketId = (t) => {
    const prefix = t.hubType === 'Claim Hub' ? 'CLM' : 'SRV';
    const year = new Date(t.createdAt).getFullYear() || new Date().getFullYear();
    const shortId = t._id ? t._id.toString().slice(-4).toUpperCase() : '0000';
    return `#${prefix}-${year}-${shortId}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return { date: '—', time: '—' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: '—', time: '—' };
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>Activity Log</h3>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
          All tickets and actions for {client?.name || 'Client'} (CLT-{client?._id ? client._id.toString().slice(-4).toUpperCase() : '0000'})
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>TICKET ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>STATUS</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>CATEGORY → SERVICE</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>DEPARTMENT ADMIN</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>CREATED BY</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>DATE</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map(t => {
                const statusColors = getStatusColor(t.status);
                const dt = formatDate(t.createdAt);
                return (
                  <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: '#2563eb' }}>
                      {generateTicketId(t)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: statusColors.bg, 
                        color: statusColors.text, 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textTransform: 'capitalize'
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors.text }} />
                        {t.status === 'in_process' ? 'In Process' : t.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={14} color="#64748b" /> {t.hubType || 'Service Hub'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        {t.subject || 'General Request'} → {t.service}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {t.assignedTo?.name || 'Unassigned'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        {t.assignedTo?.department || 'Operations Dept'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        {t.creatorRole === 'client' ? 'Client Self' : (t.creatorRole || 'System')}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                        {t.createdBy?.name || client?.name || 'Unknown'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{dt.date}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{dt.time}</div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button style={{ 
                        padding: '8px', 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        color: '#64748b'
                      }}>
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <Activity size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                    <div>No activities or tickets found for this client.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;

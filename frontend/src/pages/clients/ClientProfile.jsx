import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, Upload, Plus, X, Eye, Edit2, Download, Ticket, 
  Layers, Package, Users, Activity, MessageSquare, GitBranch, 
  CheckCircle2, AlertCircle, Phone, Mail, MapPin, ChevronRight,
  Folder, MoreVertical, Search, Save, Trash2, UserPlus, Share2, Loader
} from 'lucide-react';
import api from '../../services/api';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';
import CreateTicketModal from '../../components/forms/CreateTicketModal';

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
      // Filter family members locally if the query param isn't supported by backend exactly
      const members = familyRes.data.filter(u => u.parent_id === id || u.referredById === id);
      setFamilyMembers(members);
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
        {activeTab === 'documents' && <DocumentsView documents={documents} onRefresh={fetchData} setIsUploadModalOpen={setIsUploadModalOpen} />}
        {activeTab === 'family' && <FamilyTreeView familyMembers={familyMembers} client={client} onRefresh={fetchData} />}
        {activeTab === 'holders' && <HoldersView members={familyMembers} />}
        {activeTab === 'claims' && <ClaimsView claims={claims} />}
        {activeTab === 'tickets' && <TicketsView tickets={tickets} />}
        {!['profile', 'overview', 'documents', 'family', 'holders', 'claims', 'tickets'].includes(activeTab) && (
          <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
            <Activity size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div style={{ fontSize: '18px', fontWeight: 600 }}>{activeTab.toUpperCase()} View</div>
            <p>This module is currently in active development.</p>
          </div>
        )}
      </div>

      {/* 🏗️ UPLOAD MODAL */}
      <DocumentUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        clientId={id}
        linkedTo="client"
        onUploadSuccess={fetchData}
      />

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

const DocumentsView = ({ documents, onRefresh, setIsUploadModalOpen }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Client Documents</h3>
      <button onClick={() => setIsUploadModalOpen(true)} style={{ padding: '10px 20px', background: '#2563eb', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: 6 }}><Upload size={16} /> Upload New</button>
    </div>
    
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc' }}>
          <tr>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>NAME</th>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>CATEGORY</th>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>DATE</th>
            <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {documents.length > 0 ? documents.map(d => (
            <tr key={d._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '16px', fontWeight: 700 }}>{d.name}</td>
              <td style={{ padding: '16px' }}><span style={{ fontSize: '10px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>{d.doc_category || 'Primary'}</span></td>
              <td style={{ padding: '16px', color: '#64748b' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '16px' }}>
                 <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <a href={`${api.defaults.baseURL}/documents/download/${d._id}`} target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px' }}><Download size={14} color="#2563eb" /></a>
                 </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No documents uploaded yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const FamilyTreeView = ({ familyMembers, client, onRefresh }) => (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '40px' }}>Family Tree & Hierarchy</h3>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', padding: '16px 32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ fontWeight: 900 }}>{client?.name}</div>
        <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 800, marginTop: 4 }}>ORIGINAL HOLDER (PRIMARY)</div>
      </div>
      
      {familyMembers.length > 0 ? (
        <>
          <div style={{ height: '40px', width: '2px', background: '#e2e8f0' }} />
          <div style={{ display: 'flex', gap: '40px' }}>
            {familyMembers.map(m => (
              <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ height: '20px', width: '2px', background: '#e2e8f0' }} />
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 24px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800 }}>{m.name}</div>
                  <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 800 }}>{m.relationWithHolder || 'LEGAL HEIR'}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ marginTop: '24px', color: '#94a3b8' }}>
           <p>No legal heirs or family members linked yet.</p>
           <button 
             onClick={() => navigate('/users/add?role=client')}
             style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
           >
             + Add Family Member
           </button>
        </div>
      )}
    </div>
  </div>
);

const HoldersView = ({ members }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
    {members.map(m => (
      <div key={m._id} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
         <div style={{ fontWeight: 900, fontSize: '16px' }}>{m.name}</div>
         <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 800 }}>{m.relationWithHolder}</div>
         <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
           <div>Ref ID: {m.client_id_ref || '—'}</div>
           <div>Phone: {m.phone || '—'}</div>
         </div>
      </div>
    ))}
    {members.length === 0 && <div style={{ textAlign: 'center', gridColumn: 'span 3', padding: '40px', color: '#94a3b8' }}>No holders found.</div>}
  </div>
);

const ClaimsView = ({ claims }) => (
  <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ background: '#f8fafc' }}>
        <tr>
          <th style={{ padding: '16px', textAlign: 'left' }}>Company</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Nature of Claim</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {claims.length > 0 ? claims.map(c => (
          <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '16px', fontWeight: 800 }}>{c.companyName}</td>
            <td style={{ padding: '16px' }}>{c.natureOfClaim}</td>
            <td style={{ padding: '16px' }}><span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', borderRadius: '10px', fontSize: '13px' }}>{c.status}</span></td>
          </tr>
        )) : <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No claims found for this client.</td></tr>}
      </tbody>
    </table>
  </div>
);

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



export default ClientProfile;

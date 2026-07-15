import { useEffect, useState, useMemo } from 'react';
import api from '../../../services/api';
import { 
  Briefcase, Search, FileText, Download, Plus, Filter, 
  ChevronDown, MoreHorizontal, Eye, Clock, CheckCircle2, 
  AlertCircle, Activity, LayoutGrid, ClipboardList, 
  ShoppingBag, LifeBuoy
} from 'lucide-react';
import TicketDetailsModal from '../../../components/documents/TicketDetailsModal';
import CreateTicketModal from '../../../components/forms/CreateTicketModal';
import { downloadCSV } from '../../../utils/exportUtils';

const ClientMyServices = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Tickets');
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [bulkAssignTo, setBulkAssignTo] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [form, setForm] = useState({ clientId: '', service: '', priority: 'medium', notes: '' });

  const load = async () => {
    try {
      setLoading(true);
      // Fallback in case /users is protected for clients
      let usersRes = { data: [] };
      try {
        usersRes = await api.get('/users');
      } catch(e) {
        console.warn('Could not fetch users', e);
      }
      const ticketsRes = await api.get('/tickets');
      setTickets(ticketsRes.data);
      setClients(usersRes.data.filter(u => u.role === 'client'));
      setTeamMembers(usersRes.data.filter(u => ['admin', 'super_admin', 'employee'].includes(u.role)));
    } catch (err) {
      console.error('Failed to load tickets/clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateTicket = async () => {
    if (!form.clientId || !form.service) {
      alert('Client and Service are required');
      return;
    }
    try {
      const verticalMap = {
        'IEPF Claim': 'Claim Hub',
        'Duplicate Share': 'Claim Hub',
        'GST Filing': 'Service Hub',
        'Company Incorporation': 'Service Hub',
        'Pre-IPO Shares': 'Store Hub',
      };
      const hubType = verticalMap[form.service] || 'Service Hub';

      const payload = {
        clientId: form.clientId,
        service: form.service,
        hubType,
        priority: form.priority,
        notes: form.notes
      };

      await api.post('/tickets', payload);
      setShowModal(false);
      setForm({ clientId: '', service: '', priority: 'medium', notes: '' });
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket status');
    }
  };

  const toggleSelect = (id) => {
    setSelectedTickets(prev => prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length && filteredTickets.length > 0) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t._id));
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedTickets.length === 0) return;
    try {
      let payload = {};
      if (actionType === 'status' && bulkStatus) payload = { status: bulkStatus };
      else if (actionType === 'assign' && bulkAssignTo) payload = { userId: bulkAssignTo === 'unassigned' ? null : bulkAssignTo };
      else return;

      await api.patch('/tickets/bulk', { ticketIds: selectedTickets, action: actionType, payload });
      setSelectedTickets([]);
      setBulkStatus('');
      setBulkAssignTo('');
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to process bulk action');
    }
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) handleStatusChange(ticketId, status);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const active = tickets.filter(t => t.status === 'active').length;
    const inProcess = tickets.filter(t => t.status === 'in_process').length;
    const completed = tickets.filter(t => t.status === 'completed' || t.status === 'closed').length;
    return { total, active, inProcess, completed };
  }, [tickets]);

  const openDocs = (ticket) => {
    setSelectedTicket(ticket);
    setIsDocsModalOpen(true);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = 
        t.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t._id.slice(-6).toUpperCase().includes(searchQuery.toUpperCase());
      
      const matchesTab = activeTab === 'All Tickets' || 
        (activeTab === 'Claim Hub' && t.service?.toLowerCase().includes('claim')) ||
        (activeTab === 'Service Hub' && t.service?.toLowerCase().includes('service')) ||
        (activeTab === 'Store' && t.service?.toLowerCase().includes('store')) ||
        (activeTab === 'Support' && t.service?.toLowerCase().includes('support'));

      const matchesStatus = activeStatusTab === 'All' ||
        (activeStatusTab === 'Active' && t.status === 'active') ||
        (activeStatusTab === 'In Process' && t.status === 'in_process') ||
        (activeStatusTab === 'Completed' && (t.status === 'completed' || t.status === 'closed'));

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [tickets, searchQuery, activeTab, activeStatusTab]);

  const handleExport = () => {
    if (!filteredTickets || filteredTickets.length === 0) {
      alert('No tickets to export.');
      return;
    }
    
    // Map complex data to a flat structure for CSV
    const exportData = filteredTickets.map(t => ({
      'Ticket ID': t._id,
      'Service': t.service || 'N/A',
      'Status': t.status || 'N/A',
      'Client Name': t.client?.name || 'Unknown',
      'Client Phone': t.client?.phone || 'N/A',
      'Client Email': t.client?.email || 'N/A',
      'Dept Admin': t.assignedTo?.name || 'Unassigned',
      'Dept Admin Role': t.assignedTo?.role ? t.assignedTo.role.replace('_', ' ') : 'N/A',
      'Created By': t.createdBy?.name || 'System',
      'Creator Role': t.creatorRole ? t.creatorRole.replace('_', ' ') : 'N/A',
      'Super Partner': t.client?.superPartnerFirm || 'N/A',
      'Partner': t.client?.partnerFirm || t.client?.referenceName || 'Direct',
      'Date Created': t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(exportData, `Tickets_Export_${dateStr}.csv`);
  };

  return (
    <div className="page active animate-fade-up" style={{ display: 'block', backgroundColor: 'var(--dashboard-bg)', color: 'var(--dashboard-text)', width: '100%' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        }
        .animate-fade-up {
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .page {
          --ms-export-bg: var(--dashboard-card);
          --ms-export-border: var(--dashboard-border);
          --ms-export-text: var(--dashboard-text);
          --ms-export-hover-bg: var(--dashboard-bg);
          
          --ms-stat-bg: linear-gradient(145deg, var(--dashboard-card), var(--dashboard-bg));
          --ms-stat-border: var(--dashboard-border);
          --ms-stat-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.05);
          --ms-stat-before: linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%);
          --ms-stat-hover-border: rgba(16, 185, 129, 0.3);
          --ms-stat-hover-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.15);

          --ms-card-soft: var(--dashboard-card-soft);
          --ms-card-hover: var(--dashboard-card);
          --ms-card-th: var(--dashboard-card-soft);
          --ms-search-bg: var(--dashboard-card-soft);

          --ms-board-bg: linear-gradient(180deg, var(--dashboard-card-soft), var(--dashboard-bg));
          --ms-board-card-border: var(--dashboard-border);
          --ms-board-card-shadow: 0 6px 16px rgba(0,0,0,0.05);
          --ms-board-card-hover-border: rgba(16,185,129,0.3);
          
          --ms-selection-bg: var(--dashboard-card);
          --ms-selection-text: var(--dashboard-text);
        }

        .dark .page {
          --ms-export-bg: #0f172a;
          --ms-export-border: rgba(16, 185, 129, 0.3);
          --ms-export-text: #10B981;
          --ms-export-hover-bg: #10B981;

          --ms-stat-bg: linear-gradient(145deg, var(--dashboard-card), rgba(15, 23, 42, 0.4));
          --ms-stat-border: rgba(255, 255, 255, 0.05);
          --ms-stat-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
          --ms-stat-before: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
          --ms-stat-hover-border: rgba(16, 185, 129, 0.3);
          --ms-stat-hover-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.15);

          --ms-card-soft: rgba(255,255,255,0.03);
          --ms-card-hover: rgba(255,255,255,0.08);
          --ms-card-th: rgba(255,255,255,0.02);
          --ms-search-bg: rgba(15, 23, 42, 0.6);

          --ms-board-bg: linear-gradient(180deg, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.1));
          --ms-board-card-border: rgba(255, 255, 255, 0.05);
          --ms-board-card-shadow: 0 6px 16px rgba(0,0,0,0.15);
          --ms-board-card-hover-border: rgba(255,255,255,0.15);

          --ms-selection-bg: rgba(255,255,255,0.05);
          --ms-selection-text: #fff;
        }

        .btn-export {
          padding: 10px 20px;
          border-radius: 12px;
          background: var(--ms-export-bg);
          border: 1px solid var(--ms-export-border);
          color: var(--ms-export-text);
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .btn-export:hover {
          background: var(--ms-export-hover-bg);
          color: var(--dashboard-text);
          border-color: #10B981;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.15);
        }

        .btn-new-ticket {
          padding: 10px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #000;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
        }
        .btn-new-ticket:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
        }

        .ticket-stat-card {
          background: var(--ms-stat-bg);
          border: 1px solid var(--ms-stat-border);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--ms-stat-shadow);
          position: relative;
          overflow: hidden;
          min-height: 160px;
        }
        .ticket-stat-card::before {
          content: ''; position: absolute; inset: 0;
          background: var(--ms-stat-before);
          pointer-events: none; opacity: 0; transition: opacity 0.3s;
        }
        .ticket-stat-card:hover::before { opacity: 1; }
        .ticket-stat-card:hover { transform: translateY(-4px); border-color: var(--ms-stat-hover-border); box-shadow: var(--ms-stat-hover-shadow); }
        
        .tab-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid transparent;
          background: var(--ms-card-soft);
          color: var(--dashboard-text-muted);
        }
        .tab-btn.active { background: rgba(16, 185, 129, 0.1); color: var(--green); border-color: rgba(16, 185, 129, 0.3); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1); }
        .tab-btn:not(.active):hover { background: var(--ms-card-hover); color: var(--dashboard-text); }
        
        .ticket-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .ticket-table th { 
          text-align: left; 
          padding: 18px 24px; 
          font-size: 12px; 
          text-transform: uppercase; 
          color: var(--dashboard-text-muted); 
          font-weight: 800;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--dashboard-border);
          background: var(--ms-card-th);
        }
        .ticket-table td { 
          padding: 18px 24px; 
          font-size: 14px; 
          border-bottom: 1px solid var(--dashboard-border);
          color: var(--dashboard-text);
          transition: background 0.2s;
        }
        .ticket-table tr:hover td { background: var(--ms-card-soft); }
        
        .badge-pill {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
        }
        .badge-active { background: var(--green-light); color: var(--green); border: 1px solid rgba(22, 101, 52, 0.1); }
        .badge-process { background: rgba(245, 158, 11, 0.1); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.1); }

        .search-area input {
          width: 100%; 
          background: var(--ms-search-bg); 
          border: 1px solid var(--dashboard-border); 
          border-radius: 14px; 
          padding: 14px 16px 14px 48px;
          color: var(--dashboard-text);
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s;
        }
        .search-area input:focus { border-color: var(--green); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); outline: none; background: var(--dashboard-card); }
        
        .status-toggle { display: flex; background: var(--ms-card-soft); border: 1px solid var(--dashboard-border); border-radius: 14px; padding: 6px; gap: 6px; }
        .status-toggle-btn {
          padding: 10px 18px; 
          font-size: 13px; 
          font-weight: 800; 
          border: 1px solid transparent;
          background: transparent;
          color: var(--dashboard-text-muted);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .status-toggle-btn:hover {
          color: var(--dashboard-text);
          background: var(--ms-card-hover);
        }
        .status-toggle-btn.active { 
          background: var(--dashboard-card); 
          color: var(--dashboard-text); 
          border-color: var(--dashboard-border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }

        .board-column {
          background: var(--ms-board-bg);
          border: 1px solid var(--dashboard-border);
          border-radius: 20px;
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }
        .board-card {
          background: var(--dashboard-card);
          border: 1px solid var(--ms-board-card-border);
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 14px;
          cursor: grab;
          box-shadow: var(--ms-board-card-shadow);
          transition: transform 0.2s, border-color 0.2s;
        }
        .board-card:hover { border-color: var(--ms-board-card-hover-border); transform: translateY(-2px); }
        .board-card:active { cursor: grabbing; transform: scale(0.98); }
      `}</style>

      <div style={{ padding: '0 32px 40px', maxWidth: '1600px', margin: '0 auto' }}>

      {/* Header */}
      <div className="topbar" style={{ padding: '0 0 24px 0', borderBottom: '1px solid var(--dashboard-border)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.8px', color: 'var(--dashboard-text)' }}>Activity Log – Ticket System</h1>
            <p style={{ color: 'var(--dashboard-text-muted)', fontSize: '14px', margin: '6px 0 0', fontWeight: 500 }}>All service, claim, store & support tickets</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExport} className="btn-export">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setShowModal(true)} className="btn-new-ticket">
              <Plus size={16} /> New Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div className="ticket-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', maxWidth: '60%' }}>Total Tickets</div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
                <LayoutGrid size={22} />
              </div>
            </div>
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <div style={{ fontSize: '42px', fontWeight: 800, margin: '0', color: 'var(--dashboard-text)', lineHeight: 1 }}>{stats.total}</div>
            </div>
          </div>
          <div className="ticket-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', maxWidth: '60%' }}>Active</div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: '#10b981' }}>
                <Activity size={22} />
              </div>
            </div>
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <div style={{ fontSize: '42px', fontWeight: 800, margin: '0', color: 'var(--dashboard-text)', lineHeight: 1 }}>{stats.active}</div>
            </div>
          </div>
          <div className="ticket-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', maxWidth: '60%' }}>In Process</div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', color: '#d97706' }}>
                <Clock size={22} />
              </div>
            </div>
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <div style={{ fontSize: '42px', fontWeight: 800, margin: '0', color: 'var(--dashboard-text)', lineHeight: 1 }}>{stats.inProcess}</div>
            </div>
          </div>
          <div className="ticket-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', maxWidth: '60%' }}>Completed</div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: '#10b981' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <div style={{ fontSize: '42px', fontWeight: 800, margin: '0', color: 'var(--dashboard-text)', lineHeight: 1 }}>{stats.completed}</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button className={`tab-btn ${activeTab === 'All Tickets' ? 'active' : ''}`} onClick={() => setActiveTab('All Tickets')}>
            <ClipboardList size={16} /> All Tickets <span style={{ opacity: 0.7, fontSize: '11px' }}>{stats.total}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'Claim Hub' ? 'active' : ''}`} onClick={() => setActiveTab('Claim Hub')}>
            <Briefcase size={16} /> Claim Hub <span style={{ opacity: 0.7, fontSize: '11px' }}>{filteredTickets.filter(t => t.service?.toLowerCase().includes('claim')).length}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'Service Hub' ? 'active' : ''}`} onClick={() => setActiveTab('Service Hub')}>
            <Activity size={16} /> Service Hub <span style={{ opacity: 0.7, fontSize: '11px' }}>{filteredTickets.filter(t => t.service?.toLowerCase().includes('service')).length}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'Store' ? 'active' : ''}`} onClick={() => setActiveTab('Store')}>
            <ShoppingBag size={16} /> Store <span style={{ opacity: 0.7, fontSize: '11px' }}>{filteredTickets.filter(t => t.service?.toLowerCase().includes('store')).length}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'Support' ? 'active' : ''}`} onClick={() => setActiveTab('Support')}>
            <LifeBuoy size={16} /> Support <span style={{ opacity: 0.7, fontSize: '11px' }}>{filteredTickets.filter(t => t.service?.toLowerCase().includes('support')).length}</span>
          </button>
        </div>

        {/* Search & Tool Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
          <div className="search-area" style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dashboard-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by ticket ID, client name, service..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <button 
              onClick={() => setViewMode('table')}
              style={{ padding: '10px 16px', border: 'none', background: viewMode === 'table' ? 'var(--blue)' : 'transparent', color: viewMode === 'table' ? '#fff' : 'var(--dashboard-text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
            >
              Table View
            </button>
            <button 
              onClick={() => setViewMode('board')}
              style={{ padding: '10px 16px', border: 'none', background: viewMode === 'board' ? 'var(--blue)' : 'transparent', color: viewMode === 'board' ? '#fff' : 'var(--dashboard-text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
            >
              Kanban Board
            </button>
          </div>

          <div className="status-toggle">
            {[
              { label: 'All', count: stats.total },
              { label: 'Active', count: stats.active },
              { label: 'In Process', count: stats.inProcess },
              { label: 'Completed', count: stats.completed }
            ].map((item) => (
              <button 
                key={item.label}
                className={`status-toggle-btn ${activeStatusTab === item.label ? 'active' : ''}`}
                onClick={() => setActiveStatusTab(item.label)}
              >
                {item.label} {item.count}
              </button>
            ))}
          </div>
        </div>

        {selectedTickets.length > 0 && viewMode === 'table' && (
          <div style={{ background: 'var(--ms-selection-bg)', border: '1px solid var(--dashboard-border)', borderRadius: '12px', padding: '12px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px', animation: 'fadeIn 0.3s' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ms-selection-text)' }}>{selectedTickets.length} Tickets Selected</div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-card)', color: 'var(--dashboard-text)', fontSize: '13px', outline: 'none' }}>
                <option value="">Change Status...</option>
                <option value="active">Active</option>
                <option value="in_process">In Process</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
              <button onClick={() => handleBulkAction('status')} style={{ padding: '8px 16px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Apply</button>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--dashboard-border)' }}></div>

            <button onClick={() => setSelectedTickets([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--dashboard-text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Clear Selection</button>
          </div>
        )}

        {/* Main Content Area */}
        {viewMode === 'table' ? (
        <div style={{ background: 'var(--dashboard-card)', border: '1px solid var(--dashboard-border)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px -12px rgba(0,0,0,0.1)' }}>
          <table className="ticket-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                </th>
                <th>Ticket ID</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Client Name</th>
                <th>Category → Service</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '64px' }}>
                  <div className="spin" style={{ width: '32px', height: '32px', border: '3px solid var(--dashboard-border)', borderTopColor: 'var(--blue)', borderRadius: '50%', margin: '0 auto' }}></div>
                  <div style={{ marginTop: '16px', color: 'var(--dashboard-text-muted)' }}>Syncing Activity logs...</div>
                </td></tr>
              ) : filteredTickets.length > 0 ? filteredTickets.map(t => {
                const now = new Date();
                const due = t.dueDate ? new Date(t.dueDate) : null;
                const hoursLeft = due ? (due - now) / (1000 * 60 * 60) : null;
                let slaColor = 'var(--dashboard-text-muted)';
                let slaBg = 'rgba(148, 163, 184, 0.1)';
                let slaText = 'No SLA';
                
                if (t.status === 'completed' || t.status === 'closed') {
                  slaText = 'Resolved';
                  slaColor = 'var(--green)';
                  slaBg = 'var(--green-light)';
                } else if (hoursLeft !== null) {
                  if (hoursLeft < 0) {
                    slaText = 'Overdue';
                    slaColor = '#ef4444';
                    slaBg = 'rgba(239, 68, 68, 0.1)';
                  } else if (hoursLeft < 48) {
                    slaText = `${Math.floor(hoursLeft)}h Left`;
                    slaColor = '#f59e0b';
                    slaBg = 'rgba(245, 158, 11, 0.1)';
                  } else {
                    slaText = `${Math.floor(hoursLeft/24)}d Left`;
                    slaColor = 'var(--blue)';
                    slaBg = 'var(--blue-light)';
                  }
                }

                return (
                <tr key={t._id}>
                  <td>
                    <input type="checkbox" checked={selectedTickets.includes(t._id)} onChange={() => toggleSelect(t._id)} style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={{ color: 'var(--blue)', fontWeight: 800 }}>#{t.service?.slice(0, 3).toUpperCase()}-2024-{t._id.slice(-4).toUpperCase()}</td>
                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select 
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                        className={`badge-pill ${t.status === 'active' ? 'badge-active' : t.status === 'in_process' ? 'badge-process' : ''}`}
                        style={{
                          appearance: 'none',
                          border: 'none',
                          outline: 'none',
                          cursor: 'pointer',
                          paddingRight: '24px',
                          background: t.status === 'active' ? 'var(--green-light)' : t.status === 'in_process' ? 'rgba(245, 158, 11, 0.1)' : t.status === 'completed' ? 'var(--blue-light)' : 'rgba(148, 163, 184, 0.1)',
                          color: t.status === 'active' ? 'var(--green)' : t.status === 'in_process' ? '#b45309' : t.status === 'completed' ? 'var(--blue)' : 'var(--dashboard-text-muted)',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="in_process">In Process</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                      </select>
                      <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'currentColor', opacity: 0.7 }} />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '6px', background: 'var(--dashboard-border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${t.progress || 0}%`, height: '100%', background: 'var(--blue)', borderRadius: '10px' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{t.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#10B981', boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)' }}>
                        {t.client?.name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--dashboard-text)' }}>{t.client?.name || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dashboard-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                      <Briefcase size={13} /> {t.service?.toLowerCase().includes('claim') ? 'Claim Hub' : 'Service Hub'}
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '4px', fontWeight: 600 }}>{t.service}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                    <div style={{ fontSize: '11px', color: slaColor, background: slaBg, padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: 800 }}>{slaText}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ padding: '8px', borderRadius: '10px', background: 'var(--blue-light)', border: '1px solid var(--dashboard-border)', color: 'var(--blue)', cursor: 'pointer' }} onClick={() => openDocs(t)}>
                        <Eye size={18} />
                      </button>
                      <button style={{ padding: '8px', borderRadius: '10px', background: 'transparent', border: 'none', color: 'var(--dashboard-text-muted)', cursor: 'pointer' }}>
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}) : (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '64px', color: 'var(--dashboard-text-muted)' }}>No tickets found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          /* KANBAN BOARD VIEW */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { id: 'active', title: 'Active', color: 'var(--green)' },
              { id: 'in_process', title: 'In Process', color: '#f59e0b' },
              { id: 'completed', title: 'Completed', color: 'var(--blue)' },
              { id: 'closed', title: 'Closed', color: 'var(--dashboard-text-muted)' }
            ].map(col => (
              <div 
                key={col.id} 
                className="board-column"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, col.id)}
              >
                <div style={{ padding: '16px', borderBottom: '1px solid var(--dashboard-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }}></div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.title}</h3>
                  </div>
                  <span style={{ background: 'var(--dashboard-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                    {filteredTickets.filter(t => t.status === col.id).length}
                  </span>
                </div>
                
                <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                  {filteredTickets.filter(t => t.status === col.id).map(t => (
                    <div 
                      key={t._id} 
                      className="board-card"
                      draggable
                      onDragStart={e => e.dataTransfer.setData('ticketId', t._id)}
                      onClick={() => openDocs(t)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--blue)' }}>#{t._id.slice(-6).toUpperCase()}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dashboard-text-muted)', background: 'var(--dashboard-bg)', padding: '2px 8px', borderRadius: '6px' }}>{t.priority}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dashboard-text)', marginBottom: '4px' }}>{t.client?.name || 'Unknown Client'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--dashboard-text-muted)', marginBottom: '16px' }}>{t.service}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--dashboard-border)', paddingTop: '12px' }}>
                        {t.dueDate && (
                          <div style={{ fontSize: '10px', fontWeight: 700, color: (new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'closed') ? '#ef4444' : 'var(--dashboard-text-muted)' }}>
                            <Clock size={10} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }}/>
                            {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TicketDetailsModal 
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        ticket={selectedTicket}
      />

      {showModal && (
        <CreateTicketModal 
          onClose={() => setShowModal(false)} 
          onSuccess={load} 
          initialClients={clients}
        />
      )}
      </div>
    </div>
  );
};

export default ClientMyServices;

import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, ChevronDown, ChevronRight, X, Info } from 'lucide-react';
import { io } from 'socket.io-client';

const KanbanBoard = ({ vertical, tasks, onDropTask }) => {
  const columns = ['Open', 'In Progress', 'Waiting Client', 'Blocked', 'Completed'];
  
  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onDropTask) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 24, overflowX: 'auto', padding: '0 0 16px 0' }}>
      {columns.map(status => {
        let badgeClass = 'ch-badge-open';
        if (status === 'In Progress') badgeClass = 'ch-badge-inprogress';
        if (status === 'Blocked') badgeClass = 'ch-badge-blocked';
        if (status === 'Waiting Client') badgeClass = 'ch-badge-waiting';
        if (status === 'Completed') badgeClass = 'ch-badge-low';

        const columnTasks = tasks.filter(t => t.status === status);

        return (
          <div 
            key={status} 
            style={{ flex: '0 0 320px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, status)}
          >
            <div style={{ fontWeight: 800, marginBottom: 16, color: 'var(--text)', display: 'flex', justifyContent: 'space-between' }}>
              {status} <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 12, fontSize: 12, color: 'var(--text-muted)' }}>{columnTasks.length}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 150 }}>
              {columnTasks.map(t => (
                <div 
                  key={t.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('taskId', t.id)}
                  style={{ background: 'var(--card)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'grab' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{new Date(t.createdAt).getTime()}</span>
                    <span className={`ch-badge ${t.priority === 'High' ? 'ch-badge-high' : t.priority === 'Medium' ? 'ch-badge-medium' : 'ch-badge-low'}`}>{t.priority}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Client: {t.client}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`ch-badge ${badgeClass}`}>{status}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {t.admin && t.admin.split ? t.admin.split(' ').map(n=>n[0]).join('') : 'U'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 8, fontSize: 12 }}>
                  Drag tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


const HubPage = ({ title, vertical, subtitle }) => {
  const [viewMode, setViewMode] = useState('table');
  const [isAddMainTopicOpen, setIsAddMainTopicOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);
  
  const [topics, setTopics] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState({ 
    'active': true, 'completed': true 
  });
  
  const [availableServices, setAvailableServices] = useState([]);
  
  // Load services, now fetching real-time data for Service Hub
  useEffect(() => {
    const loadServices = async () => {
      if (vertical === 'service') {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('https://myclaimportal.onrender.com/api/services', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const data = await res.json();
            setAvailableServices(data);
            return;
          }
          console.error('Failed to fetch services, falling back to local storage');
        } catch (err) {
          console.error('Error fetching services:', err);
        }
      }
      // Fallback to local storage for other verticals or on error
      let storageKey = 'claimServices';
      if (vertical === 'service') storageKey = 'serviceServices';
      if (vertical === 'store') storageKey = 'storeServices';
      if (vertical !== 'support') {
        const raw = JSON.parse(localStorage.getItem(storageKey)) || [];
        setAvailableServices(raw.filter(s => s.status));
      }
    };
    loadServices();
  
    const handleStorageChange = (e) => {
      const keys = ['claimServices', 'serviceServices', 'storeServices'];
      if (keys.includes(e.key)) {
        loadServices();
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [vertical]);
  
// Services table JSX moved to proper location

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://myclaimportal.onrender.com/api/tickets', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) return;
      const data = await res.json();
      
      let hubName = 'Claim Hub';
      if (vertical === 'service') hubName = 'Service Hub';
      if (vertical === 'store') hubName = 'Store Hub';
      if (vertical === 'support') hubName = 'Support Hub';

      const filtered = data.filter(t => t.hubType === hubName);

      if (vertical === 'support') {
        setSupportTickets(filtered);
      } else {
        const grouped = {};
        filtered.forEach(t => {
          const topicName = t.subject || t.service || 'General Tasks';
          if (!grouped[topicName]) {
            grouped[topicName] = {
              id: topicName,
              name: topicName,
              tasksCount: 0,
              status: t.status === 'in_process' ? 'In Progress' : t.status === 'active' ? 'Open' : t.status === 'completed' ? 'Completed' : 'Blocked',
              priority: t.priority === 'urgent' ? 'High' : t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Medium' : 'Low',
              tasks: []
            };
          }
          grouped[topicName].tasks.push({
            id: t._id,
            name: t.service,
            status: t.status === 'in_process' ? 'In Progress' : t.status === 'active' ? 'Open' : t.status === 'completed' ? 'Completed' : 'Blocked',
            client: t.client ? t.client.name : 'Unknown',
            company: t.client && t.client.companyName ? t.client.companyName : (t.client && t.client.role ? t.client.role : 'Client'),
            service: t.service,
            due: t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date',
            admin: t.assignedTo ? t.assignedTo.name : 'Unassigned',
            priority: t.priority === 'urgent' ? 'High' : t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Medium' : 'Low',
            checked: t.status === 'completed',
            raw: t
          });
          grouped[topicName].tasksCount++;
        });

        const newExpanded = { 'active': true, 'completed': true };
        Object.keys(grouped).forEach(k => newExpanded[k] = true);
        setExpandedTopics(prev => ({ ...prev, ...newExpanded }));
        setTopics(Object.values(grouped));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
    const socket = io('https://myclaimportal.onrender.com');
    socket.on('ticket_created', fetchTickets);
    socket.on('ticket_updated', fetchTickets);
    socket.on('ticket_comment', fetchTickets);
    
    return () => socket.disconnect();
  }, [vertical]);

  const allTasks = topics.flatMap(topic => topic.tasks);

  const updateTicketInBackend = async (ticketId, status) => {
    try {
      const token = localStorage.getItem('token');
      let backendStatus = 'active';
      if (status === 'In Progress') backendStatus = 'in_process';
      if (status === 'Completed') backendStatus = 'completed';
      if (status === 'Blocked' || status === 'Waiting Client') backendStatus = 'closed'; // Fallback mapping
      
      await fetch(`https://myclaimportal.onrender.com/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: backendStatus })
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDropTask = (taskId, newStatus) => {
    updateTicketInBackend(taskId, newStatus);
    setTopics(prevTopics => {
      return prevTopics.map(topic => {
        const hasTask = topic.tasks.some(t => t.id === taskId);
        if (!hasTask) return topic;
        
        return {
          ...topic,
          tasks: topic.tasks.map(t => t.id === taskId ? { ...t, status: newStatus, checked: newStatus === 'Completed' } : t)
        };
      });
    });
  };

  const toggleTaskCompletion = (e, taskId) => {
    e.stopPropagation();
    setTopics(prevTopics => {
      return prevTopics.map(topic => {
        const hasTask = topic.tasks.some(t => t.id === taskId);
        if (!hasTask) return topic;
        
        return {
          ...topic,
          tasks: topic.tasks.map(t => {
            if (t.id === taskId) {
              const isNowCompleted = !t.checked;
              const newStatus = isNowCompleted ? 'Completed' : 'In Progress';
              updateTicketInBackend(taskId, newStatus);
              return { 
                ...t, 
                checked: isNowCompleted,
                status: newStatus 
              };
            }
            return t;
          })
        };
      });
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTaskDetail) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://myclaimportal.onrender.com/api/tickets/${selectedTaskDetail.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newComment })
      });
      setNewComment('');
      fetchTickets(); // refresh to get new comment
    } catch (e) { console.error(e); }
  };

  const handleEscalate = async () => {
    if (!selectedTaskDetail) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://myclaimportal.onrender.com/api/tickets/${selectedTaskDetail.id}/escalate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({})
      });
      alert('Ticket escalated successfully.');
      fetchTickets();
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedTaskDetail) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }
    try {
      await fetch(`https://myclaimportal.onrender.com/api/tickets/${selectedTaskDetail.id}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      alert('Attachment(s) uploaded successfully.');
      fetchTickets();
    } catch (err) { console.error(err); }
  };

  const toggleExpand = (id) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return 'ch-badge-open';
      case 'In Progress': return 'ch-badge-inprogress';
      case 'Blocked': return 'ch-badge-blocked';
      case 'Waiting Client': return 'ch-badge-waiting';
      case 'Completed': return 'ch-badge-completed';
      default: return 'ch-badge-open';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High': return 'ch-badge-high';
      case 'Medium': return 'ch-badge-medium';
      case 'Low': return 'ch-badge-low';
      default: return 'ch-badge-low';
    }
  };

  const styles = `
    .hub-stat-card {
      background: var(--card); border: 1px solid var(--border); border-radius: 12px;
      padding: 24px; display: flex; flex-direction: column; justify-content: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.2s;
    }
    .hub-stat-card:hover { border-color: var(--accent-green, #10b981); transform: translateY(-2px); }
    .hub-stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .hub-stat-value { font-size: 32px; font-weight: 800; line-height: 1; }
    .val-text { color: var(--text); }
    .val-blue { color: #3b82f6; }
    .val-orange { color: #f97316; }
    .val-green { color: var(--accent-green, #10b981); }
    .val-red { color: #ef4444; }

    .hub-container { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .hub-container-header { padding: 20px 24px; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 16px; color: var(--text); display: flex; justify-content: space-between; align-items: center; }
    .hub-row { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .hub-row:last-child { border-bottom: none; }
    .hub-row-title { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 4px; }
    .hub-row-sub { font-size: 13px; color: var(--text-muted); }

    .toggle-wrap { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text-muted); }
    .toggle-btn { width: 44px; height: 24px; border-radius: 12px; position: relative; cursor: pointer; transition: background 0.2s; }
    .toggle-btn.on { background: var(--accent-green, #10b981); }
    .toggle-btn.off { background: rgba(100, 116, 139, 0.3); border: 1px solid var(--border); }
    .toggle-knob { width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    .toggle-btn.on .toggle-knob { transform: translateX(20px); }
    
    .price-input-wrap { display: flex; align-items: center; gap: 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; }
    .price-input { background: transparent; border: none; outline: none; font-weight: 600; width: 60px; color: var(--text); }
    
    .hub-table th { padding: 16px 24px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; background: var(--card); border-bottom: 1px solid var(--border); text-align: left; }
    .hub-table td { padding: 16px 24px; font-size: 14px; color: var(--text); border-bottom: 1px solid var(--border); vertical-align: middle; }
    .user-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; color: #fff; font-size: 11px; font-weight: 700; margin-right: 12px; }
    .badge-soft { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .badge-orange { background: rgba(234, 88, 12, 0.15); color: #f97316; }
    .badge-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .badge-red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    .ch-header-row { display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .ch-topic-header { display: flex; align-items: center; padding: 16px 24px; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); cursor: pointer; font-weight: 800; color: var(--text); }
    .ch-task-row { display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid var(--border); font-size: 13.5px; color: var(--text); cursor: pointer; }
    .ch-task-row:hover { background: rgba(255,255,255,0.02); }
    .ch-add-task { padding: 12px 24px 12px 64px; font-size: 13px; font-weight: 700; color: #3b82f6; cursor: pointer; border-bottom: 1px solid var(--border); }
    .ch-add-task:hover { text-decoration: underline; }
    
    .ch-col-task { flex: 2.5; display: flex; align-items: center; gap: 12px; }
    .ch-col-status { flex: 1.2; }
    .ch-col-client { flex: 1.5; }
    .ch-col-company { flex: 1.5; }
    .ch-col-service { flex: 1.8; }
    .ch-col-due { flex: 1.2; color: var(--text-muted); }
    .ch-col-admin { flex: 1.2; }
    .ch-col-priority { flex: 1; text-align: right; }

    .ch-badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 700; }
    .ch-badge-open { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .ch-badge-inprogress { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .ch-badge-blocked { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .ch-badge-waiting { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .ch-badge-completed { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .ch-badge-high { color: #f87171; background: rgba(239, 68, 68, 0.1); }
    .ch-badge-medium { color: #fbbf24; background: rgba(245, 158, 11, 0.1); }
    .ch-badge-low { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }

    input[type="checkbox"] { accent-color: var(--accent-green, #10b981); width: 16px; height: 16px; cursor: pointer; border-radius: 4px; }

    .db-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .db-modal { background: var(--card); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 600px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .db-modal-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .db-modal-body { padding: 24px; }
    .db-modal-footer { padding: 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
    .db-input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-size: 14px; outline: none; margin-top: 6px; font-family: inherit; }
    .db-input:focus { border-color: var(--accent-green, #10b981); }
    .db-select { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-size: 14px; outline: none; margin-top: 6px; font-family: inherit; cursor: pointer; }
    
    .info-box { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 16px; border-radius: 8px; display: flex; gap: 12px; color: #60a5fa; font-size: 13.5px; margin-bottom: 24px; }

    .task-detail-panel { position: fixed; top: 0; right: 0; width: 450px; height: 100vh; background: var(--card); border-left: 1px solid var(--border); box-shadow: -10px 0 30px rgba(0,0,0,0.1); z-index: 1001; display: flex; flex-direction: column; animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .td-header { padding: 24px; border-bottom: 1px solid var(--border); }
    .td-body { padding: 24px; flex: 1; overflow-y: auto; }
    .td-grid { display: grid; grid-template-columns: 120px 1fr; gap: 16px; align-items: center; }
    .td-label { font-size: 13px; font-weight: 800; color: var(--text-muted); }
    .td-value { font-size: 14px; font-weight: 600; color: var(--text); }
    .td-footer { padding: 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
  `;

  const topButtonText = () => {
    if (vertical === 'store') return '+ Add Store Item';
    if (vertical === 'service') return '+ New Service Ticket';
    if (vertical === 'claim') return '+ Add New';
    return '+ New Support Ticket';
  };

  return (
    <div className="page active" style={{ display: 'block', background: 'var(--bg)', minHeight: '100vh', padding: 0 }}>
      <style>{styles}</style>
      
      <div className="topbar" style={{ background: 'var(--card)' }}>
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-subtitle">{subtitle}</div>
        </div>
        <div className="topbar-spacer"></div>
        
        {/* Universal View Toggle for all departments */}
        <div style={{ display: 'flex', gap: '8px', marginRight: '16px', background: 'var(--bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: viewMode === 'table' ? 'var(--card)' : 'transparent', color: viewMode === 'table' ? 'var(--text)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }} onClick={() => setViewMode('table')}>📊 Table</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: viewMode === 'kanban' ? 'var(--card)' : 'transparent', color: viewMode === 'kanban' ? 'var(--text)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }} onClick={() => setViewMode('kanban')}>📋 Kanban</button>
        </div>

        <button className="topbar-btn" style={{ background: 'linear-gradient(135deg, #059669, var(--accent-green, #10b981))', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }} onClick={() => setIsAddMainTopicOpen(true)}>
          {topButtonText()}
        </button>
      </div>

      <div className="content">
        {/* Kanban View overrides Table View when selected */}
        {viewMode === 'kanban' ? (
          <KanbanBoard vertical={vertical} tasks={allTasks} onDropTask={handleDropTask} />
        ) : (
          <>
            {/* --- TABLE VIEWS PER VERTICAL --- */}
            {(vertical === 'claim' || vertical === 'service' || vertical === 'store') && (
              <div className="hub-container">
                <div className="ch-topic-header" onClick={() => toggleExpand('active')}>
                  {expandedTopics['active'] ? <ChevronDown size={18} style={{ marginRight: 8 }} /> : <ChevronRight size={18} style={{ marginRight: 8 }} />}
                  Active tasks <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12 }}>3</span>
                </div>
                
                {expandedTopics['active'] && (
                  <>
                    <div className="ch-header-row">
                      <div className="ch-col-task" style={{ paddingLeft: 40 }}>TASK</div>
                      <div className="ch-col-status">STATUS</div>
                      <div className="ch-col-client">CLIENT</div>
                      <div className="ch-col-company">COMPANY</div>
                      <div className="ch-col-service">SERVICE</div>
                      <div className="ch-col-due">DUE</div>
                      <div className="ch-col-admin">ADMIN</div>
                      <div className="ch-col-priority">PRIORITY</div>
                    </div>

                    {topics.filter(t => t.status !== 'Completed').map((topic) => (
                      <div key={topic.id}>
                        <div className="ch-topic-header" style={{ paddingLeft: 40, borderTop: 'none', background: 'transparent' }} onClick={() => toggleExpand(topic.id)}>
                          {expandedTopics[topic.id] ? <ChevronDown size={18} style={{ marginRight: 8 }} /> : <ChevronRight size={18} style={{ marginRight: 8 }} />}
                          {topic.name} <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{topic.tasksCount} tasks</span>
                          <div style={{ flex: 1 }}></div>
                          {topic.status && <span className={`ch-badge ${getStatusBadge(topic.status)}`} style={{ marginRight: 16 }}>{topic.status}</span>}
                          {topic.priority && <span className={`ch-badge ${getPriorityBadge(topic.priority)}`}>{topic.priority}</span>}
                        </div>

                        {expandedTopics[topic.id] && (
                          <div style={{ paddingBottom: 8 }}>
                            {topic.tasks.map(task => (
                              <div className="ch-task-row" key={task.id} onClick={() => setSelectedTaskDetail({ ...task, topicName: topic.name })}>
                                <div className="ch-col-task" style={{ paddingLeft: 64 }}>
                                  <input type="checkbox" checked={task.checked} onChange={(e) => toggleTaskCompletion(e, task.id)} onClick={(e) => e.stopPropagation()} />
                                  <span style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? 'var(--text-muted)' : 'inherit' }}>{task.name}</span>
                                </div>
                                <div className="ch-col-status"><span className={`ch-badge ${getStatusBadge(task.status)}`}>{task.status}</span></div>
                                <div className="ch-col-client">{task.client}</div>
                                <div className="ch-col-company">{task.company}</div>
                                <div className="ch-col-service">{task.service}</div>
                                <div className="ch-col-due">{task.due}</div>
                                <div className="ch-col-admin">{task.admin}</div>
                                <div className="ch-col-priority"><span className={`ch-badge ${getPriorityBadge(task.priority)}`}>{task.priority}</span></div>
                              </div>
                            ))}
                            <div className="ch-add-task">+ Add task</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                <div className="ch-topic-header" onClick={() => toggleExpand('completed')} style={{ borderTop: '1px solid var(--border)' }}>
                  {expandedTopics['completed'] ? <ChevronDown size={18} style={{ marginRight: 8 }} /> : <ChevronRight size={18} style={{ marginRight: 8 }} />}
                  Completed <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12 }}>{topics.filter(t => t.status === 'Completed').length}</span>
                </div>
                {expandedTopics['completed'] && (
                  topics.filter(t => t.status === 'Completed').length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      No completed tasks
                    </div>
                  ) : (
                    topics.filter(t => t.status === 'Completed').map((topic) => (
                      <div key={topic.id}>
                        <div className="ch-topic-header" style={{ paddingLeft: 40, borderTop: 'none', background: 'transparent' }} onClick={() => toggleExpand(topic.id)}>
                          {expandedTopics[topic.id] ? <ChevronDown size={18} style={{ marginRight: 8 }} /> : <ChevronRight size={18} style={{ marginRight: 8 }} />}
                          {topic.name} <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{topic.tasksCount} tasks</span>
                          {topic.status === 'Completed' && <span style={{ marginLeft: 8, fontSize: 11, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>1/1 done</span>}
                          <div style={{ flex: 1 }}></div>
                          {topic.status && <span className={`ch-badge ${getStatusBadge(topic.status)}`} style={{ marginRight: 16 }}>{topic.status}</span>}
                          {topic.priority && <span className={`ch-badge ${getPriorityBadge(topic.priority)}`}>{topic.priority}</span>}
                        </div>

                        {expandedTopics[topic.id] && (
                          <div style={{ paddingBottom: 8 }}>
                            {topic.tasks.map(task => (
                              <div className="ch-task-row" key={task.id} onClick={() => setSelectedTaskDetail({ ...task, topicName: topic.name })}>
                                <div className="ch-col-task" style={{ paddingLeft: 64 }}>
                                  <input type="checkbox" checked={task.checked} onChange={(e) => toggleTaskCompletion(e, task.id)} onClick={(e) => e.stopPropagation()} />
                                  <span style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? 'var(--text-muted)' : 'inherit' }}>{task.name}</span>
                                </div>
                                <div className="ch-col-status"><span className={`ch-badge ${getStatusBadge(task.status)}`}>{task.status}</span></div>
                                <div className="ch-col-client">{task.client}</div>
                                <div className="ch-col-company">{task.company}</div>
                                <div className="ch-col-service">{task.service}</div>
                                <div className="ch-col-due">{task.due}</div>
                                <div className="ch-col-admin">{task.admin}</div>
                                <div className="ch-col-priority"><span className={`ch-badge ${getPriorityBadge(task.priority)}`}>{task.priority}</span></div>
                              </div>
                            ))}
                            <div className="ch-add-task">+ Add task</div>
                          </div>
                        )}
                      </div>
                    ))
                  )
                )}
              </div>
            )}

            {vertical === 'support' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                  <div className="hub-stat-card"><div className="hub-stat-label">TOTAL SUPPORT TICKETS</div><div className="hub-stat-value val-text">{supportTickets.length}</div></div>
                  <div className="hub-stat-card"><div className="hub-stat-label">OPEN</div><div className="hub-stat-value val-red">{supportTickets.filter(t => t.status === 'active').length}</div></div>
                  <div className="hub-stat-card"><div className="hub-stat-label">IN PROGRESS</div><div className="hub-stat-value val-orange">{supportTickets.filter(t => t.status === 'in_process').length}</div></div>
                  <div className="hub-stat-card"><div className="hub-stat-label">RESOLVED</div><div className="hub-stat-value val-green">{supportTickets.filter(t => t.status === 'completed').length}</div></div>
                </div>

                <div className="hub-container">
                  <table className="hub-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th>TICKET ID</th>
                        <th>RAISED BY</th>
                        <th>SUBJECT</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets.map(t => (
                        <tr key={t._id}>
                          <td><span style={{ color: '#3b82f6', fontWeight: 600 }}>#{new Date(t.createdAt).getTime()}</span></td>
                          <td style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="user-badge" style={{ background: '#06b6d4' }}>{t.client?.name?.[0] || 'U'}</span> {t.client?.name || 'Unknown'} ({t.client?.role === 'partner' ? 'Partner' : 'Client'})
                          </td>
                          <td>{t.subject || t.service}</td>
                          <td><span className={`badge-soft ${t.priority === 'urgent' || t.priority === 'high' ? 'badge-red' : t.priority === 'medium' ? 'badge-orange' : 'badge-green'}`}>{t.priority === 'urgent' || t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Medium' : 'Low'}</span></td>
                          <td><span className="badge-soft" style={{ background: t.status === 'active' ? 'rgba(249, 115, 22, 0.15)' : t.status === 'in_process' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: t.status === 'active' ? '#f97316' : t.status === 'in_process' ? '#3b82f6' : '#22c55e' }}>● {t.status === 'active' ? 'Open' : t.status === 'in_process' ? 'In Progress' : 'Resolved'}</span></td>
                          <td style={{ color: 'var(--text-muted)' }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button style={{ padding: '6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedTaskDetail({ name: t.subject || t.service, topicName: '#' + new Date(t.createdAt).getTime(), status: t.status === 'active' ? 'Open' : t.status === 'in_process' ? 'In Progress' : 'Resolved', client: t.client?.name || 'Unknown', company: t.client?.role || 'Client', service: 'Support Request', due: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '', admin: t.assignedTo?.name || 'Support Team', priority: t.priority === 'urgent' || t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Medium' : 'Low' })}><Eye size={16} /></button>
                              <button style={{ padding: '6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {supportTickets.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No Support Tickets found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {isAddMainTopicOpen && (
        <div className="db-modal-overlay" onClick={() => setIsAddMainTopicOpen(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Add New {vertical === 'support' ? 'Support Ticket' : 'Main Topic'} — {vertical === 'claim' ? 'Claim Hub' : vertical === 'service' ? 'Service Hub' : vertical === 'store' ? 'Store Hub' : 'Support Hub'}</h2>
              <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer' }} onClick={() => setIsAddMainTopicOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="db-modal-body">
              <div className="info-box">
                <Info size={18} style={{ flexShrink: 0 }} />
                <div>Creates a Main Topic (e.g. a client case or project). You can add subtasks inside it after creation.</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Main Topic Name</div>
                <input type="text" className="db-input" placeholder="e.g. IEPF Claim — Reliance Industries — Rajesh Kumar" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Client Name</div>
                  <input type="text" className="db-input" placeholder="Client name" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Company Name</div>
                  <input type="text" className="db-input" placeholder="e.g. Reliance Industries" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Hub</div>
                  <select className="db-select">
                    <option>Claim Hub</option>
                    <option>Service Hub</option>
                    <option>Store Hub</option>
                    <option>Support Hub</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Service Type</div>
                  <select className="db-select">
                    <option value="">Select Service</option>
                    {availableServices.map(s => (
                      <option key={s.id || s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Admin</div>
                  <select className="db-select">
                    <option>Amit Sharma</option>
                    <option>Priya Mehta</option>
                    <option>Rahul Kumar</option>
                    <option>Riya Gupta</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Employee</div>
                  <select className="db-select">
                    <option>Amit S.</option>
                    <option>Priya M.</option>
                    <option>Rahul K.</option>
                    <option>Riya G.</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Priority</div>
                  <select className="db-select">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Status</div>
                  <select className="db-select">
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Waiting Client</option>
                    <option>Blocked</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="db-modal-footer">
              <button style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} onClick={() => setIsAddMainTopicOpen(false)}>Cancel</button>
              <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #059669, var(--accent-green, #10b981))', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }} onClick={() => setIsAddMainTopicOpen(false)}>Create Main Topic</button>
            </div>
          </div>
        </div>
      )}

      {selectedTaskDetail && (
        <>
          <div className="db-modal-overlay" style={{ zIndex: 1000 }} onClick={() => setSelectedTaskDetail(null)}></div>
          <div className="task-detail-panel">
            <div className="td-header">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                {vertical === 'claim' ? 'Claim Hub' : vertical === 'service' ? 'Service Hub' : 'Store Hub'} › {selectedTaskDetail.topicName}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text)' }}>{selectedTaskDetail.name}</h2>
                <button onClick={() => setSelectedTaskDetail(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20}/></button>
              </div>
            </div>
            <div className="td-body" style={{ padding: 0 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <button style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: activeTab === 'details' ? '2px solid #3b82f6' : '2px solid transparent', color: activeTab === 'details' ? '#3b82f6' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setActiveTab('details')}>Details</button>
                <button style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: activeTab === 'comments' ? '2px solid #10b981' : '2px solid transparent', color: activeTab === 'comments' ? '#10b981' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setActiveTab('comments')}>Comments</button>
                <button style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: activeTab === 'attachments' ? '2px solid #8b5cf6' : '2px solid transparent', color: activeTab === 'attachments' ? '#8b5cf6' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setActiveTab('attachments')}>Files</button>
              </div>
              
              <div style={{ padding: '24px' }}>
                {activeTab === 'details' && (
                  <>
                    <div className="td-grid">
                      <div className="td-label">Status</div>
                      <div className="td-value"><span className={`ch-badge ${getStatusBadge(selectedTaskDetail.status)}`}>{selectedTaskDetail.status}</span></div>
                      
                      <div className="td-label">Service</div>
                      <div className="td-value">{selectedTaskDetail.service}</div>
                      
                      <div className="td-label">Client</div>
                      <div className="td-value">{selectedTaskDetail.client}</div>
                      
                      <div className="td-label">Company</div>
                      <div className="td-value">{selectedTaskDetail.company}</div>
                      
                      <div className="td-label">Due Date</div>
                      <div className="td-value">
                        <input type="date" className="db-input" style={{ width: '100%', padding: '8px 12px', marginTop: 0 }} defaultValue={selectedTaskDetail.due ? new Date(selectedTaskDetail.due).toISOString().split('T')[0] : ''} />
                      </div>
                      
                      <div className="td-label">Mapped Store</div>
                      <div className="td-value">{selectedTaskDetail.raw?.mappedStore || 'All Stores'}</div>
                      
                      <div className="td-label">Admin</div>
                      <div className="td-value">{selectedTaskDetail.admin}</div>
                      
                      <div className="td-label">Priority</div>
                      <div className="td-value"><span className={`ch-badge ${getPriorityBadge(selectedTaskDetail.priority)}`}>{selectedTaskDetail.priority}</span></div>

                      <div className="td-label">Escalation</div>
                      <div className="td-value">
                        {selectedTaskDetail.raw?.isEscalated ? (
                          <span className="ch-badge ch-badge-blocked" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Escalated</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Normal</span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 32 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Edit2 size={14}/> Description
                      </div>
                      <textarea className="db-input" placeholder="Add a description..." style={{ minHeight: 120, resize: 'vertical' }} defaultValue={selectedTaskDetail.raw?.notes || ''}></textarea>
                    </div>
                  </>
                )}

                {activeTab === 'comments' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(!selectedTaskDetail.raw?.comments || selectedTaskDetail.raw.comments.length === 0) ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No comments yet.</div>
                      ) : (
                        selectedTaskDetail.raw.comments.map((c, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{new Date(c.createdAt).toLocaleString()}</div>
                            <div style={{ fontSize: 13, color: 'var(--text)' }}>{c.text}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <input type="text" className="db-input" style={{ marginTop: 0 }} placeholder="Type an internal note..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                      <button onClick={handleAddComment} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontWeight: 700, cursor: 'pointer' }}>Send</button>
                    </div>
                  </div>
                )}

                {activeTab === 'attachments' && (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      {(!selectedTaskDetail.raw?.attachments || selectedTaskDetail.raw.attachments.length === 0) ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No attachments found.</div>
                      ) : (
                        selectedTaskDetail.raw.attachments.map((a, i) => (
                          <a key={i} href={a.url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)', textDecoration: 'none', color: '#3b82f6', fontSize: 13, fontWeight: 600 }}>
                            📎 {a.name}
                          </a>
                        ))
                      )}
                    </div>
                    <div style={{ padding: 16, border: '1px dashed var(--border)', borderRadius: 8, textAlign: 'center' }}>
                      <label style={{ cursor: 'pointer', color: '#10b981', fontWeight: 700, fontSize: 13 }}>
                        + Upload Files
                        <input type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="td-footer" style={{ justifyContent: 'space-between' }}>
              <button style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={handleEscalate}>Escalate</button>
              <button style={{ background: 'linear-gradient(135deg, #059669, var(--accent-green, #10b981))', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }} onClick={() => setSelectedTaskDetail(null)}>Save & Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HubPage;

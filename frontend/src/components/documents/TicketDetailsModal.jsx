import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, MessageSquare, Send, Clock, User as UserIcon, Activity, Trash2 } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import DocumentList from './DocumentList';
import DocumentUploadModal from './DocumentUploadModal';

const TicketDetailsModal = ({ isOpen, onClose, ticket, onDelete }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stages, setStages] = useState([]);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Ticket Tasks State
  const [ticketTasks, setTicketTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // default to 'tasks' or 'details'
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    mainHeading: '',
    status: 'Active',
    type: 'Service',
    assignedTo: ''
  });
  const [teamUsers, setTeamUsers] = useState([]);

  useEffect(() => {
    if (isOpen && ticket) {
      fetchDocuments();
      fetchTicketTasks();
      fetchTeamUsers();
      setComments(ticket.comments || []);
      setProgress(ticket.progress || 0);

      if (ticket.hubType === 'Claim Hub') {
        const defaultStages = [
          'Document Collection', 'Verification', 'Application Filed',
          'Authority Review', 'Claim Approved', 'Shares Credited'
        ];
        const ticketStages = ticket.stages || [];
        const initializedStages = defaultStages.map(name => {
          const existing = ticketStages.find(s => s.name === name);
          return existing ? existing : { name, subProgress: 0, status: 'pending', date: '' };
        });
        setStages(initializedStages);
      }
    }
  }, [isOpen, ticket]);

  const fetchTicketTasks = async () => {
    if (!ticket?._id) return;
    setLoadingTasks(true);
    try {
      const { data } = await api.get(`/ticket-tasks?ticket=${ticket._id}`);
      setTicketTasks(data || []);
    } catch (err) {
      console.error('Error fetching ticket tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchTeamUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setTeamUsers((data || []).filter(u => u.role !== 'client'));
    } catch (err) {
      console.error('Error fetching team users:', err);
    }
  };

  const handleCreateTicketTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.mainHeading.trim()) return;
    try {
      const payload = {
        client: ticket.client?._id || ticket.client,
        ticket: ticket._id,
        mainHeading: newTaskForm.mainHeading.trim(),
        description: newTaskForm.mainHeading.trim(),
        status: newTaskForm.status,
        type: newTaskForm.type,
        assignedTo: newTaskForm.assignedTo || undefined,
        dateInitiated: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0]
      };
      await api.post('/ticket-tasks', payload);
      setNewTaskForm({ mainHeading: '', status: 'Active', type: 'Service', assignedTo: '' });
      setShowCreateTask(false);
      fetchTicketTasks();
    } catch (err) {
      console.error('Error creating task for ticket:', err);
      alert('Failed to create task');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const { data } = await api.get(`/documents?ticket_id=${ticket._id}`);
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching ticket docs', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUpdateProgress = async () => {
    setUpdatingProgress(true);
    try {
      const endpoint = user?.role === 'employee' ? `/tickets/${ticket._id}/employee/status` : `/tickets/${ticket._id}/status`;
      await api.patch(endpoint, { progress });
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleUpdateStages = async () => {
    setUpdatingProgress(true);
    try {
      const sum = stages.reduce((acc, s) => acc + (s.subProgress || 0), 0);
      const overallProgress = Math.round(sum / 6);
      setProgress(overallProgress);
      await api.patch(`/tickets/${ticket._id}/stages`, { stages, progress: overallProgress });
    } catch (err) {
      console.error('Failed to update stages', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const updateStageProgress = (stageName, val) => {
    setStages(prev => prev.map(s => {
      if (s.name === stageName) {
        return { ...s, subProgress: val, status: val === 100 ? 'completed' : val > 0 ? 'in-progress' : 'pending', date: val > 0 && !s.date ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : s.date };
      }
      return s;
    }));
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSending(true);
    try {
      const { data } = await api.post(`/tickets/${ticket._id}/comments`, { text: newComment });
      setComments(data.comments);
      setNewComment('');
    } catch (err) {
      console.error('Failed to send comment', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" style={{ zIndex: 999, justifyContent: 'flex-end', padding: 0 }}>
      <div className="modal" style={{ width: '800px', maxWidth: '100%', height: '100vh', margin: 0, borderRadius: '24px 0 0 24px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h3 className="modal-title" style={{ fontSize: '20px' }}>
                Ticket #{user?.role === 'client' ? new Date(ticket?.createdAt).getTime() : ticket?._id.slice(-6).toUpperCase()}
              </h3>
              <span className={`badge-pill ${ticket?.status === 'active' ? 'badge-active' : ticket?.status === 'in_process' ? 'badge-process' : ''}`} style={{ background: ticket?.status === 'active' ? 'var(--green-light)' : ticket?.status === 'in_process' ? 'rgba(245, 158, 11, 0.1)' : 'var(--blue-light)', color: ticket?.status === 'active' ? 'var(--green)' : ticket?.status === 'in_process' ? '#b45309' : 'var(--blue)', padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '12px' }}>
                {ticket?.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="modal-subtitle" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{ticket?.client?.name}</span> • {ticket?.service}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {['admin', 'super_admin'].includes(user?.role) && (
              <button 
                type="button"
                onClick={async () => {
                  if (onDelete) {
                    onDelete(ticket._id, ticket.ticketNo);
                  } else {
                    if (!window.confirm('Are you sure you want to delete this ticket? This will also remove any linked tasks.')) return;
                    try {
                      await api.delete(`/tickets/${ticket._id}`);
                      onClose();
                    } catch (err) {
                      alert(err.response?.data?.message || 'Failed to delete ticket');
                    }
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Delete Ticket"
              >
                <Trash2 size={15} />
                <span>Delete Ticket</span>
              </button>
            )}
            <button className="modal-close" onClick={onClose} style={{ background: 'var(--bg)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Layout Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '400px', borderRight: '1px solid var(--border)', background: 'var(--bg)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--card)', padding: '8px 16px', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'tasks' ? 'var(--blue)' : 'transparent',
                  color: activeTab === 'tasks' ? 'white' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Tasks ({ticketTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'details' ? 'var(--blue)' : 'transparent',
                  color: activeTab === 'details' ? 'white' : 'var(--text-muted)'
                }}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('files')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'files' ? 'var(--blue)' : 'transparent',
                  color: activeTab === 'files' ? 'white' : 'var(--text-muted)'
                }}
              >
                Files ({documents.length})
              </button>
            </div>

            {/* Content Area */}
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              
              {/* ── TAB 1: TASKS ── */}
              {activeTab === 'tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>Ticket Tasks</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Track assigned tasks and client deliverables</p>
                    </div>
                    {['admin', 'super_admin', 'employee'].includes(user?.role) && (
                      <button 
                        onClick={() => setShowCreateTask(!showCreateTask)}
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        {showCreateTask ? 'Cancel' : '+ Add Task'}
                      </button>
                    )}
                  </div>

                  {showCreateTask && (
                    <form onSubmit={handleCreateTicketTask} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>New Task for this Ticket</div>
                      <input 
                        type="text" 
                        placeholder="Task heading / subject..." 
                        value={newTaskForm.mainHeading}
                        onChange={e => setNewTaskForm({ ...newTaskForm, mainHeading: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px', outline: 'none' }}
                        required
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          value={newTaskForm.type} 
                          onChange={e => setNewTaskForm({ ...newTaskForm, type: e.target.value })}
                          style={{ flex: 1, padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11px' }}
                        >
                          <option value="Claim">Claim</option>
                          <option value="Service">Service</option>
                          <option value="Store">Store</option>
                        </select>
                        <select 
                          value={newTaskForm.status} 
                          onChange={e => setNewTaskForm({ ...newTaskForm, status: e.target.value })}
                          style={{ flex: 1, padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11px' }}
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Assign To (Assignee)</label>
                        <select 
                          value={newTaskForm.assignedTo} 
                          onChange={e => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11px' }}
                        >
                          <option value="">Unassigned</option>
                          {teamUsers.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" style={{ padding: '8px', background: 'var(--blue)', color: 'white', fontWeight: 700, fontSize: '11px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Create & Assign Task
                      </button>
                    </form>
                  )}

                  {loadingTasks ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>Loading tasks...</div>
                  ) : ticketTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '12px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      No tasks created for this ticket yet.
                    </div>
                  ) : (
                    ticketTasks.map(task => (
                      <div 
                        key={task._id} 
                        style={{
                          background: 'var(--card)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '14px', 
                          padding: '14px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '10px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            padding: '3px 8px', 
                            borderRadius: '20px',
                            background: task.type === 'Claim' ? 'rgba(59,130,246,0.1)' : task.type === 'Store' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                            color: task.type === 'Claim' ? '#2563eb' : task.type === 'Store' ? '#d97706' : '#059669',
                            border: '1px solid currentColor'
                          }}>
                            {task.type || 'Service'}
                          </span>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            padding: '2px 8px', 
                            borderRadius: '10px',
                            background: task.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'var(--bg)',
                            color: task.status === 'Completed' ? '#059669' : 'var(--text-muted)'
                          }}>
                            {task.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
                          {task.mainHeading || task.description || 'Task'}
                        </div>

                        <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                              👤 ASSIGNED TO
                            </span>
                            <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '12px' }}>
                              {task.assignedTo?.name || 'Unassigned'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                              🏢 FOR CLIENT
                            </span>
                            <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '12px' }}>
                              {task.client?.name || ticket?.client?.name || 'Client'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
                          <span>Init: {task.dateInitiated ? new Date(task.dateInitiated).toLocaleDateString() : '-'}</span>
                          {task.dateCompleted ? (
                            <span style={{ color: '#059669', fontWeight: 800 }}>Done: {new Date(task.dateCompleted).toLocaleDateString()}</span>
                          ) : (
                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── TAB 2: DETAILS ── */}
              {activeTab === 'details' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ background: 'var(--card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Assignee</div>
                        <div style={{ fontWeight: 600 }}>{ticket?.assignedTo?.name || 'Unassigned'}</div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Priority</div>
                        <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{ticket?.priority}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Notes</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{ticket?.notes || 'No notes provided.'}</div>
                      </div>

                      {/* Ticket Tasks Preview in Details */}
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Tasks for this Ticket ({ticketTasks.length})
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('tasks')}
                            style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            View All Tasks →
                          </button>
                        </div>
                        {ticketTasks.length === 0 ? (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg)', padding: '10px 12px', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                            No tasks created for this ticket yet.{' '}
                            <span onClick={() => { setActiveTab('tasks'); setShowCreateTask(true); }} style={{ color: 'var(--blue)', cursor: 'pointer', fontWeight: 800 }}>+ Add Task</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {ticketTasks.slice(0, 3).map(tk => (
                              <div key={tk._id} onClick={() => setActiveTab('tasks')} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', cursor: 'pointer' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text)' }}>{tk.mainHeading || tk.description || 'Task'}</div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', flexWrap: 'wrap' }}>
                                  <span style={{ color: '#2563eb', fontWeight: 800 }}>👤 Assigned To: {tk.assignedTo?.name || 'Unassigned'}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                                  <span style={{ color: '#059669', fontWeight: 800 }}>🏢 For Client: {tk.client?.name || ticket?.client?.name || 'Client'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {['admin', 'super_admin', 'employee'].includes(user?.role) && (
                        ticket?.hubType === 'Claim Hub' ? (
                          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Update Claim Stages</div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--blue)' }}>
                                {Math.round(stages.reduce((acc, s) => acc + (s.subProgress || 0), 0) / 6)}% Overall
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: '8px', marginBottom: '16px' }}>
                              {stages.map((stage, i) => {
                                const isDone = stage.subProgress === 100;
                                const isActive = stage.subProgress > 0 && stage.subProgress < 100;
                                
                                return (
                                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                                      <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                        background: isDone ? 'var(--green)' : isActive ? 'var(--blue-light)' : 'var(--bg)',
                                        border: isDone ? '2px solid var(--green)' : isActive ? '2px solid var(--blue)' : '2px solid var(--border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        transition: 'all 0.2s', color: isDone ? '#fff' : 'var(--blue)'
                                      }} onClick={() => updateStageProgress(stage.name, isDone ? 0 : 100)}>
                                        {isDone ? '✓' : isActive ? '⚡' : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />}
                                      </div>
                                      {i < stages.length - 1 && (
                                        <div style={{ width: '2px', flex: 1, minHeight: '30px', background: isDone ? 'var(--green)' : 'var(--border)', margin: '4px 0' }} />
                                      )}
                                    </div>
                                    <div style={{ paddingBottom: i < stages.length - 1 ? '16px' : '0', flex: 1 }}>
                                      <div style={{ fontSize: '13px', fontWeight: isDone || isActive ? 800 : 600, color: 'var(--text)' }}>
                                        {stage.name}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <button 
                              onClick={handleUpdateStages} 
                              disabled={updatingProgress}
                              style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: 700, background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: updatingProgress ? 'not-allowed' : 'pointer', opacity: updatingProgress ? 0.6 : 1 }}
                            >
                              Save Stages
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Update Progress</div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--blue)' }}>{progress}%</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="range" 
                                min="0" max="100" step="5" 
                                value={progress} 
                                onChange={e => setProgress(Number(e.target.value))}
                                style={{ flex: 1, accentColor: 'var(--blue)' }}
                              />
                              <button 
                                onClick={handleUpdateProgress} 
                                disabled={updatingProgress || progress === ticket?.progress}
                                style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '6px', cursor: (updatingProgress || progress === ticket?.progress) ? 'not-allowed' : 'pointer', opacity: (updatingProgress || progress === ticket?.progress) ? 0.6 : 1 }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: FILES ── */}
              {activeTab === 'files' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Linked Files</h4>
                    <button className="topbar-btn" style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--sidebar-active)', color: 'white', border: 'none' }} onClick={() => setIsUploadOpen(true)}>
                      <Upload size={12} /> Upload
                    </button>
                  </div>
                  <DocumentList 
                    documents={documents} 
                    loading={loadingDocs} 
                    onDeleteSuccess={(id) => setDocuments(prev => prev.filter(d => d._id !== id))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Chat Thread */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--card)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, margin: 0 }}>
                <MessageSquare size={16} color="var(--blue)" /> Internal Discussion
              </h4>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-light)', margin: 'auto' }}>
                  <MessageSquare size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                  <div>No comments yet. Start the discussion!</div>
                </div>
              ) : (
                comments.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                      {msg.user?.name?.substring(0,2).toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{msg.user?.name || 'Unknown'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{new Date(msg.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ background: 'var(--bg)', padding: '12px 16px', borderRadius: '0 12px 12px 12px', fontSize: '14px', lineHeight: 1.5, color: 'var(--text)', border: '1px solid var(--border)' }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
              <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Type a message..." 
                  style={{ flex: 1, padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
                />
                <button type="submit" disabled={sending || !newComment.trim()} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '12px', padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (!newComment.trim() || sending) ? 0.5 : 1 }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
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

export default TicketDetailsModal;

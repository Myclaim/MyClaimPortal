import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, MessageSquare, Send, Clock, User as UserIcon, Activity } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import DocumentList from './DocumentList';
import DocumentUploadModal from './DocumentUploadModal';

const TicketDetailsModal = ({ isOpen, onClose, ticket }) => {
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

  useEffect(() => {
    if (isOpen && ticket) {
      fetchDocuments();
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
              <h3 className="modal-title" style={{ fontSize: '20px' }}>Ticket #{ticket?._id.slice(-6).toUpperCase()}</h3>
              <span className={`badge-pill ${ticket?.status === 'active' ? 'badge-active' : ticket?.status === 'in_process' ? 'badge-process' : ''}`} style={{ background: ticket?.status === 'active' ? 'var(--green-light)' : ticket?.status === 'in_process' ? 'rgba(245, 158, 11, 0.1)' : 'var(--blue-light)', color: ticket?.status === 'active' ? 'var(--green)' : ticket?.status === 'in_process' ? '#b45309' : 'var(--blue)', padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '12px' }}>
                {ticket?.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="modal-subtitle" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{ticket?.client?.name}</span> • {ticket?.service}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} style={{ background: 'var(--bg)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Layout Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Side: Details & Documents */}
          <div style={{ width: '350px', borderRight: '1px solid var(--border)', background: 'var(--bg)', overflowY: 'auto', padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Details</h4>
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
                              {/* dot + line column */}
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
                              
                              {/* content */}
                              <div style={{ paddingBottom: i < stages.length - 1 ? '16px' : '0', flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: isDone || isActive ? 800 : 600, color: 'var(--text)' }}>
                                  {stage.name}
                                </div>
                                
                                {/* Substages */}
                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '0', paddingLeft: '0', borderLeft: isDone ? `1px solid var(--green)` : isActive ? `1px solid var(--blue-light)` : `1px solid var(--border)`, marginLeft: '11px' }}>
                                  {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].map((subName, subIdx) => {
                                    const val = (subIdx + 1) * 25;
                                    const isSubDone = stage.subProgress >= val;
                                    const subColor = isSubDone ? (isDone ? 'var(--green)' : 'var(--blue)') : 'var(--border)';
                                    
                                    return (
                                      <div 
                                        key={val} 
                                        onClick={() => updateStageProgress(stage.name, stage.subProgress === val ? val - 25 : val)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', padding: '4px 0 4px 16px', cursor: 'pointer' }}
                                      >
                                        <div style={{ position: 'absolute', left: '-4px', top: '50%', transform: 'translateY(-50%)', width: '7px', height: '7px', borderRadius: '50%', background: subColor, border: `2px solid var(--card)`, transition: 'all 0.2s' }} />
                                        <div style={{ fontSize: '11px', fontWeight: isSubDone ? 700 : 500, color: isSubDone ? 'var(--text)' : 'var(--text-muted)' }}>
                                          {subName} <span style={{ opacity: 0.5 }}>({val}%)</span>
                                        </div>
                                      </div>
                                    )
                                  })}
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

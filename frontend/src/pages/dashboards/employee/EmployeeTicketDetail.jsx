import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, UploadCloud, MessageSquare, FileText, User, Briefcase, Clock, Paperclip } from 'lucide-react';
import api from '../../../services/api';

const EmployeeTicketDetail = ({ ticketId }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [progressModal, setProgressModal] = useState({ isOpen: false, text: '' });
  const [uploadModal, setUploadModal] = useState({ isOpen: false, files: null });

  const fetchTicket = async () => {
    try {
      setLoading(true);
      // Fetch all tickets for this employee and find the specific one
      const { data } = await api.get('/tickets');
      const found = data.find(t => t._id === ticketId);
      if (found) {
        setTicket(found);
      } else {
        setError('Ticket not found or you do not have permission to view it.');
      }
    } catch (err) {
      console.error('Error fetching ticket', err);
      setError('Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleUpdateProgress = async () => {
    if (!progressModal.text.trim()) return;
    try {
      await api.post(`/tickets/${ticketId}/comments`, { text: progressModal.text });
      setProgressModal({ isOpen: false, text: '' });
      fetchTicket();
      alert('Progress note added successfully!');
    } catch (error) {
      console.error('Failed to update progress', error);
      alert('Failed to update progress.');
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadModal.files || uploadModal.files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < uploadModal.files.length; i++) {
      formData.append('files', uploadModal.files[i]);
    }

    try {
      await api.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadModal({ isOpen: false, files: null });
      fetchTicket();
      alert('Documents uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload document', error);
      alert('Failed to upload document.');
    }
  };

  const handleMarkComplete = async () => {
    if (window.confirm('Are you sure you want to mark this task as complete?')) {
      try {
        await api.patch(`/tickets/${ticketId}/employee-status`, { status: 'completed' });
        fetchTicket();
        alert('Task marked as complete!');
      } catch (error) {
        console.error('Failed to mark complete', error);
        alert('Failed to update task status.');
      }
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading ticket details...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  if (!ticket) return null;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => window.history.back()}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
            TICKET #{ticket._id.substring(ticket._id.length - 8).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
            {ticket.subject || `${ticket.service} Request`}
          </h2>
        </div>
        
        {/* Top Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setUploadModal({ isOpen: true, files: null })}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>
            <UploadCloud size={16} /> Upload Docs
          </button>
          <button 
            onClick={() => setProgressModal({ isOpen: true, text: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>
            <MessageSquare size={16} /> Add Note
          </button>
          {ticket.status !== 'completed' && (
            <button 
              onClick={handleMarkComplete}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--green)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              <CheckCircle size={16} /> Mark Complete
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Details & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Instructions / Notes */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text)', fontWeight: 700 }}>
              <FileText size={18} color="var(--blue)" /> Instructions & Notes
            </div>
            <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
              {ticket.notes ? ticket.notes : 'No specific instructions provided for this task.'}
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text)', fontWeight: 700 }}>
              <Paperclip size={18} color="var(--green)" /> Uploaded Documents
            </div>
            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {ticket.attachments.map((doc, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={16} color="var(--blue)" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{doc.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                No documents uploaded yet.
              </div>
            )}
          </div>

          {/* Timeline / Progress Notes */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text)', fontWeight: 700 }}>
              <Clock size={18} color="var(--orange)" /> Progress Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '2px', background: 'var(--border)', position: 'relative', marginTop: '4px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--blue)', position: 'absolute', left: '-4px', top: '0' }} />
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{comment.user?.name || 'User'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {comment.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  No progress updates yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Client Information */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text)', fontWeight: 700 }}>
              <User size={18} color="var(--blue)" /> Client Information
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{ticket.client?.name || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{ticket.client?.email || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone Number</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{ticket.client?.phone || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Company</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{ticket.client?.companyName || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text)', fontWeight: 700 }}>
              <Briefcase size={18} color="var(--green)" /> Service Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Service Name</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{ticket.service}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Status</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', textTransform: 'capitalize' }}>
                  {ticket.status.replace('_', ' ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Priority Level</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: ticket.priority === 'urgent' ? '#ef4444' : 'var(--orange)', textTransform: 'capitalize' }}>
                  {ticket.priority}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Due Date</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'No Due Date'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '400px', background: 'var(--bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Upload Document</h3>
            <form onSubmit={handleUploadDocument}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Select Files</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setUploadModal({ ...uploadModal, files: e.target.files })}
                  style={{ width: '100%', padding: '12px', border: '2px dashed var(--border)', borderRadius: '12px', background: 'var(--bg-secondary)', color: 'var(--text)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setUploadModal({ isOpen: false, files: null })}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--blue)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Upload Files
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {progressModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '400px', background: 'var(--bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Add Progress Note</h3>
            <textarea
              value={progressModal.text}
              onChange={e => setProgressModal({ ...progressModal, text: e.target.value })}
              placeholder="What progress have you made?"
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', marginBottom: '16px', resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setProgressModal({ isOpen: false, text: '' })}
                style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button 
                onClick={handleUpdateProgress}
                style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--green)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTicketDetail;

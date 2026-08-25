import { useState, useEffect } from 'react';
import {
  Bell, CheckCircle2, AlertTriangle, AlertCircle, 
  Clock, FileText, Ticket, MessageSquare, Loader2, Play
} from 'lucide-react';
import api from '../../../services/api';

const CSS = `
  .en-page { padding-bottom: 40px; }
  .en-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
  
  .en-body { padding: 24px 32px; max-width: 900px; margin: 0 auto; }
  
  .en-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 20px; display: flex; gap: 16px; margin-bottom: 16px; transition: all 0.2s; position: relative; overflow: hidden; }
  .en-item:hover { border-color: var(--border-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
  .en-item.unread { background: var(--bg); border-color: var(--accent-green); }
  .en-item.unread::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent-green); }
  
  .en-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  
  .en-content { flex: 1; min-width: 0; }
  .en-title { font-size: 14.5px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
  .en-desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px; }
  
  .en-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
  
  .en-action-btn { background: none; border: 1px solid var(--border); border-radius: 6px;
    padding: 6px 12px; font-size: 12px; font-weight: 700; color: var(--text); cursor: pointer;
    transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
  .en-action-btn:hover { background: var(--bg-secondary); }
  .en-action-btn.primary { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.2); color: var(--accent-green); }
  .en-action-btn.primary:hover { background: rgba(34,197,94,0.15); }
  
  .en-mark-all { padding: 8px 16px; background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; font-size: 13px; font-weight: 700; color: var(--text); cursor: pointer; transition: 0.2s; }
  .en-mark-all:hover:not(:disabled) { background: var(--bg-secondary); border-color: var(--border-hover); }
  .en-mark-all:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const getTypeStyles = (type) => {
  switch (type) {
    case 'ticket_assigned':
    case 'ticket_reassigned': return { icon: Ticket, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    case 'comment_added': return { icon: MessageSquare, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
    case 'doc_approved': return { icon: FileText, color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    case 'doc_rejected': return { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    case 'task_overdue': return { icon: AlertCircle, color: '#dc2626', bg: 'rgba(220,38,38,0.1)' };
    case 'due_approaching': return { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    case 'task_completed': return { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    default: return { icon: Bell, color: 'var(--text-muted)', bg: 'var(--bg-secondary)' };
  }
};

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      
      // Update global unread count via custom event
      window.dispatchEvent(new CustomEvent('notificationCountUpdate', { detail: data.unreadCount }));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      updateGlobalCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent('notificationCountUpdate', { detail: 0 }));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const updateGlobalCount = () => {
    // We can rely on the current state to dispatch the updated count minus 1 (or just recalculate)
    // The state update in markAsRead happens concurrently, so let's just trigger a refetch or calculate.
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page active en-page">
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="en-topbar">
        <div>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ fontSize: 13, background: 'var(--accent-green)', color: '#fff', padding: '2px 8px', borderRadius: 12, fontWeight: 800 }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Stay updated on your assigned tasks and documents
          </div>
        </div>
        <button className="en-mark-all" onClick={markAllAsRead} disabled={unreadCount === 0 || loading}>
          <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
          Mark all as read
        </button>
      </div>

      <div className="en-body">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)', margin: '0 auto' }} />
            <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'var(--card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
            <Bell size={48} color="var(--border-hover)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>You&apos;re all caught up!</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>You don&apos;t have any notifications at the moment.</p>
          </div>
        ) : (
          <div>
            {notifications.map(n => {
              const { icon: Icon, color, bg } = getTypeStyles(n.type);
              return (
                <div key={n._id} className={`en-item ${!n.isRead ? 'unread' : ''}`}>
                  <div className="en-icon" style={{ background: bg, color: color }}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="en-content">
                    <div className="en-title">{n.title}</div>
                    <div className="en-desc">{n.message}</div>
                    <div className="en-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {new Date(n.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!n.isRead && (
                        <button className="en-action-btn" onClick={() => markAsRead(n._id)}>
                          Mark as read
                        </button>
                      )}
                      {n.link && (
                        <a href={`/${n.link}`} className="en-action-btn primary" style={{ textDecoration: 'none' }}>
                          View Details <Play size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications;

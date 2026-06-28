import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu, X, Bell } from 'lucide-react';
import CommandPalette from '../CommandPalette';
import { useSocket } from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';

const Toast = ({ message, onClose }) => (
  <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10000, animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Bell size={20} />
    </div>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>New Activity</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{message}</div>
    </div>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '4px' }}>
      <X size={16} />
    </button>
    <style>{`
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `}</style>
  </div>
);

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const { socket } = useSocket();
  const [toast, setToast] = useState(null);
  
  const { user } = useAuth();

  React.useEffect(() => {
    if (!socket) return;

    const isRelevant = (ticketOrClientId) => {
      if (!user) return false;
      if (['super_admin', 'admin', 'employee', 'partner', 'super_partner'].includes(user.role)) return true;
      const clientId = typeof ticketOrClientId === 'object' ? ticketOrClientId._id : ticketOrClientId;
      return String(clientId) === String(user._id) || String(clientId) === String(user.id);
    };

    const handleTicketCreated = (ticket) => {
      if (!isRelevant(ticket.client)) return;
      setToast(`New ticket created: #${ticket._id.slice(-6).toUpperCase()} (${ticket.service})`);
      setTimeout(() => setToast(null), 5000);
      window.dispatchEvent(new CustomEvent('newNotificationEvent'));
    };

    const handleTicketUpdated = (ticket) => {
      if (!isRelevant(ticket.client)) return;
      setToast(`Ticket #${ticket._id.slice(-6).toUpperCase()} updated to ${ticket.status}`);
      setTimeout(() => setToast(null), 5000);
      window.dispatchEvent(new CustomEvent('newNotificationEvent'));
    };

    const handleTicketComment = ({ ticketId, comment, clientId }) => {
      if (clientId && !isRelevant(clientId)) return;
      setToast(`New comment on ticket #${ticketId.slice(-6).toUpperCase()}`);
      setTimeout(() => setToast(null), 5000);
      window.dispatchEvent(new CustomEvent('newNotificationEvent'));
    };

    socket.on('ticket_created', handleTicketCreated);
    socket.on('ticket_updated', handleTicketUpdated);
    socket.on('ticket_comment', handleTicketComment);

    return () => {
      socket.off('ticket_created', handleTicketCreated);
      socket.off('ticket_updated', handleTicketUpdated);
      socket.off('ticket_comment', handleTicketComment);
    };
  }, [socket, user]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 150,
        }}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="main">
        <Outlet />
      </main>
      <CommandPalette />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default Layout;

import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu, X, Bell } from 'lucide-react';
import CommandPalette from '../CommandPalette';
import { useSocket } from '../../hooks/useSocket';

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

<<<<<<< HEAD
=======
const FloatingBubbles = () => {
  return (
    <div className="bubbles-container">
      {[...Array(15)].map((_, i) => (
        <div key={i} className={`bubble bubble-${i + 1}`}></div>
      ))}
      <style>{`
        .bubbles-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0; /* Behind everything */
        }
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(16,185,129,0.05), transparent);
          box-shadow: inset 0 0 10px rgba(255,255,255,0.05), 0 0 20px rgba(16,185,129,0.1);
          border: 1px solid rgba(255,255,255,0.05);
          animation: floatRoam linear infinite;
        }
        @keyframes floatRoam {
          0% { transform: translateY(110vh) translateX(0) scale(0.8) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(50vh) translateX(50px) scale(1.1) rotate(180deg); opacity: 0.5; }
          90% { opacity: 0; }
          100% { transform: translateY(-10vh) translateX(-50px) scale(0.9) rotate(360deg); opacity: 0; }
        }
        ${[...Array(15)].map((_, i) => {
          const size = Math.random() * 80 + 30; // 30px to 110px
          const left = Math.random() * 100;
          const animDuration = Math.random() * 20 + 15; // 15s to 35s
          const animDelay = Math.random() * -30; // Start at random positions
          return `
            .bubble-${i + 1} {
              width: ${size}px; height: ${size}px;
              left: ${left}%;
              animation-duration: ${animDuration}s;
              animation-delay: ${animDelay}s;
            }
          `;
        }).join('')}
      `}</style>
    </div>
  );
};

>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586
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

  React.useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (ticket) => {
      setToast(`New ticket created: #${ticket._id.slice(-6).toUpperCase()} (${ticket.service})`);
      setTimeout(() => setToast(null), 5000);
    };

    const handleTicketUpdated = (ticket) => {
      setToast(`Ticket #${ticket._id.slice(-6).toUpperCase()} updated to ${ticket.status}`);
      setTimeout(() => setToast(null), 5000);
    };

    const handleTicketComment = ({ ticketId, comment }) => {
      setToast(`New comment on ticket #${ticketId.slice(-6).toUpperCase()}: "${comment.text.slice(0, 20)}..."`);
      setTimeout(() => setToast(null), 5000);
    };

    socket.on('ticket_created', handleTicketCreated);
    socket.on('ticket_updated', handleTicketUpdated);
    socket.on('ticket_comment', handleTicketComment);

    return () => {
      socket.off('ticket_created', handleTicketCreated);
      socket.off('ticket_updated', handleTicketUpdated);
      socket.off('ticket_comment', handleTicketComment);
    };
  }, [socket]);

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
<<<<<<< HEAD
=======
        <FloatingBubbles />
>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586
        <Outlet />
      </main>
      <CommandPalette />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default Layout;

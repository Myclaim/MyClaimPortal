import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, Clock, ShieldCheck, Activity as ActivityIcon, Sun, Moon } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
const Topbar = ({ title }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/activity');
      setRecentLogs(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const socket = io('https://myclaimportal.onrender.com');
    socket.on('activity_created', () => {
      setUnreadCount(prev => prev + 1);
      fetchLogs();
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setUnreadCount(0);
    }
  };
  return (
    <header style={{ 
      background: 'rgba(17, 24, 45, 0.8)', 
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1 style={{ 
          fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', 
          fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em', margin: 0 
        }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', 
          borderRadius: '12px', padding: '8px 16px', border: '1px solid var(--glass-border)',
          gap: '10px'
        }}>
          <Search size={16} color="var(--muted)" />
          <input 
            type="text" 
            placeholder="Global search..." 
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-primary)', 
              fontSize: '13px', outline: 'none', width: '200px' 
            }} 
          />
        </div>

        <div onClick={toggleTheme} style={{
          width: '40px', height: '40px', background: 'var(--bg-primary)',
          borderRadius: '12px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', border: '1px solid var(--glass-border)',
          color: 'var(--muted)', cursor: 'pointer', transition: '0.3s'
        }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </div>

        <div style={{ position: 'relative', cursor: 'pointer' }} ref={dropdownRef}>
          <div onClick={handleBellClick} style={{ 
            width: '40px', height: '40px', background: 'var(--bg-primary)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', border: '1px solid var(--glass-border)',
            color: 'var(--muted)', transition: '0.3s'
          }}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, background: 'var(--accent-green)', borderRadius: '50%', border: '2px solid var(--card-bg)', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>

          {showDropdown && (
            <div style={{ position: 'absolute', top: '50px', right: 0, width: '340px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Notifications</span>
                {unreadCount > 0 && <span style={{ fontSize: '12px', background: 'var(--accent-green)', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>{unreadCount} New</span>}
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto', background: 'var(--card)' }}>
                {recentLogs.length > 0 ? recentLogs.map((log) => (
                  <div key={log._id} style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'flex-start', transition: '0.2s' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {log.action.toLowerCase().includes('create') ? <Clock size={16} /> : 
                       log.action.toLowerCase().includes('delete') ? <ActivityIcon size={16} /> :
                       <ShieldCheck size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.4', marginBottom: '4px' }}>{log.action}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No recent notifications</div>
                )}
              </div>
              <div 
                onClick={() => { setShowDropdown(false); navigate('/super-admin/activity'); }}
                style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--accent-green)', fontWeight: 700, borderTop: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)' }}
              >
                View all activity
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', 
          background: 'rgba(34, 197, 94, 0.05)', padding: '6px 16px', 
          borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.1)',
          cursor: 'pointer'
        }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent-green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>System Admin</span>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase' }}>Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

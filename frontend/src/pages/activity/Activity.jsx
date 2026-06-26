import React, { useState, useEffect } from 'react';
import { Search, Download, Clock, User, ShieldCheck, Activity as ActivityIcon, Filter } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';

// Module-level SWR cache
let _activityCache = null;
let _activityCacheTime = 0;
const ACTIVITY_TTL = 30 * 1000; // 30 seconds

const Activity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async (silent = false) => {
      try {
        const { data } = await api.get('/activity');
        _activityCache = data;
        _activityCacheTime = Date.now();
        setLogs(data);
      } catch (err) {
        console.error('Error fetching system logs:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    if (_activityCache && (Date.now() - _activityCacheTime) < ACTIVITY_TTL) {
      setLogs(_activityCache);
      setLoading(false);
      fetchLogs(true);
    } else {
      fetchLogs(false);
    }

    const socket = io('http://localhost:5005');
    socket.on('activity_created', () => fetchLogs(true));
    return () => socket.disconnect();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                         log.user?.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && log.user?.role === filter;
  });
  const handleDownloadAudit = () => {
    if (filteredLogs.length === 0) {
      alert("No logs to download.");
      return;
    }

    const headers = ["Timestamp", "Action", "User", "Role", "Date", "Time"];
    const rows = filteredLogs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.action,
      log.user?.name || "System",
      log.user?.role || "System",
      new Date(log.createdAt).toLocaleDateString(),
      new Date(log.createdAt).toLocaleTimeString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="page active" style={{ display: 'block' }}>
      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        
        .activity-card { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
        .timeline-line { position: absolute; left: 53px; top: 0; bottom: 0; width: 2px; background: var(--border); z-index: 1; }
        .timeline-dot { width: 44px; height: 44px; border-radius: 50%; background: var(--card); border: 2px solid #22c55e; display: flex; align-items: center; justify-content: center; z-index: 2; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.1); }
        .log-item:hover .timeline-dot { transform: scale(1.1); box-shadow: 0 6px 15px rgba(34, 197, 94, 0.2); border-color: #4ade80; }
        
        .premium-gradient { background: linear-gradient(135deg, var(--green) 0%, #22c55e 100%); }
      `}</style>

      <div className="topbar">
        <div>
          <div className="topbar-title">System Log</div>
          <div className="topbar-subtitle">Audit trails & system-wide operational logs</div>
        </div>
        <div className="topbar-spacer"></div>
        <button className="export-btn" onClick={handleDownloadAudit} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Download size={16} /> <span>Download Audit</span>
        </button>
      </div>

      <div className="content">
        <div className="grid-2" style={{ marginBottom: '32px' }}>
          <div className="card activity-card stagger-1" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-10px', opacity: 0.05 }}><ShieldCheck size={120} /></div>
            <div className="stat-label">System Integrity</div>
            <div className="stat-value" style={{ margin: '12px 0' }}>All Operational</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Sync status: 100% active</span>
            </div>
          </div>
          <div className="card activity-card stagger-2" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-10px', opacity: 0.05 }}><ActivityIcon size={120} /></div>
            <div className="stat-label">Log Volume</div>
            <div className="stat-value" style={{ margin: '12px 0' }}>{logs.length} <span style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8' }}>Total Items</span></div>
            <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 700 }}>↑ 14% growth this week</div>
          </div>
        </div>

        <div className="card activity-card stagger-3" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div className="search-bar" style={{ margin: 0, flex: 1 }}>
              <div className="search-input" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Filter by action or username..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Filter:</div>
              {['all', 'admin', 'partner', 'client'].map(r => (
                <button 
                  key={r}
                  onClick={() => setFilter(r)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: filter === r ? 'var(--blue)' : 'var(--card)',
                    color: filter === r ? '#fff' : 'var(--text)',
                    border: '1px solid',
                    borderColor: filter === r ? 'var(--blue)' : 'var(--border)',
                  }}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="timeline-line"></div>
            
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                <div style={{ marginTop: '16px', color: '#94a3b8', fontWeight: 600 }}>Analyzing trail hooks...</div>
              </div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => (
                <div 
                  key={log._id} 
                  className="log-item"
                  style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    marginBottom: '32px', 
                    position: 'relative',
                    animation: `slideInUp 0.5s both ${i * 0.05}s`
                  }}
                >
                  <div className="timeline-dot">
                    <div style={{ color: 'var(--blue)' }}>
                      {log.action.toLowerCase().includes('create') ? <Clock size={20} /> : 
                       log.action.toLowerCase().includes('delete') ? <ActivityIcon size={20} /> :
                       <ShieldCheck size={20} />}
                    </div>
                  </div>
                  
                  <div className="card" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{log.action}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, background: 'var(--bg)', padding: '4px 10px', borderRadius: '20px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                          <User size={14} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{log.user?.name || 'System Auto-Trigger'}</span>
                      </div>
                      <div style={{ width: '1px', height: '12px', background: 'var(--border)' }}></div>
                      <div className={`custom-badge ${log.user?.role === 'admin' ? 'badge-blue' : 'badge-teal'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                        {log.user?.role || 'system'}
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No trail hooks detected</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try broadening your search or resetting categories.</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Activity;

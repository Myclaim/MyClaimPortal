import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Clock, AlertCircle, MoreVertical, LayoutGrid, List, X, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { io } from 'socket.io-client';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // grid or list
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAdvFilters, setShowAdvFilters] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    service: '',
    priority: 'medium',
    assignedTo: '',
    notes: ''
  });
  const [creating, setCreating] = useState(false);

  // Dynamic filtering
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);

    const q = search.trim().toLowerCase();
    if (!q) return result;
    return result.filter(t => 
      (t.service || '').toLowerCase().includes(q) ||
      (t.client?.name || '').toLowerCase().includes(q) ||
      (t.client?.companyName || '').toLowerCase().includes(q) ||
      (t.assignedTo?.name || '').toLowerCase().includes(q) ||
      String(t._id || '').toLowerCase().includes(q)
    );
  }, [tasks, search, statusFilter, priorityFilter]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (search) c++;
    if (statusFilter !== 'all') c++;
    if (priorityFilter !== 'all') c++;
    return c;
  }, [search, statusFilter, priorityFilter]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, userRes] = await Promise.all([
          api.get('/users?role=client'),
          api.get('/users')
        ]);
        setClients(clientRes.data || []);
        setEmployees((userRes.data || []).filter(u => u.role !== 'client'));
      } catch (err) {
        console.error('Error fetching data for modal', err);
      }
    };
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.service) return alert('Client and Service are required');
    setCreating(true);
    try {
      await api.post('/tickets', formData);
      // Socket will update tasks, but we can also manually prepend if needed
      // setTasks(prev => [res.data, ...prev]);
      setIsModalOpen(false);
      setFormData({ clientId: '', service: '', priority: 'medium', assignedTo: '', notes: '' });
    } catch (err) {
      console.error(err);
      alert('Error creating task');
    } finally {
      setCreating(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tickets');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const socketUrl = import.meta.env.VITE_API_URL || 'https://myclaimportal.onrender.com';
    const socket = io(socketUrl);
    
    socket.on('ticket_created', (newTicket) => {
      setTasks(prev => [newTicket, ...prev]);
    });
    
    socket.on('ticket_updated', (updatedTicket) => {
      setTasks(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
    });
    
    return () => socket.disconnect();
  }, []);

  const getPriorityColor = (p) => {
    const priority = p ? p.toLowerCase() : '';
    switch(priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#0d9488';
      case 'low': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active': return { label: 'Pending', progress: 10 };
      case 'in_process': return { label: 'In Progress', progress: 50 };
      case 'completed': return { label: 'Completed', progress: 100 };
      case 'closed': return { label: 'Closed', progress: 100 };
      default: return { label: 'Pending', progress: 0 };
    }
  };

  return (
    <div className="page active" style={{ display: 'block' }}>
      <style>{`
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .stagger-card { animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .task-progress { height: 6px; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-top: 12px; }
        .task-progress-bar { height: 100%; transition: width 1s ease-out; }
      `}</style>

      <div className="topbar">
        <div>
          <div className="topbar-title">Task Management Board</div>
          <div className="topbar-subtitle">Track operational jobs and fulfilment status</div>
        </div>
        <div className="topbar-spacer"></div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg)', padding: '4px', borderRadius: '10px' }}>
          <button onClick={() => setView('grid')} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: view === 'grid' ? 'var(--card)' : 'transparent', cursor: 'pointer', display: 'flex' }}><LayoutGrid size={16} color={view === 'grid' ? '#22c55e' : 'var(--text-muted)'} /></button>
          <button onClick={() => setView('list')} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: view === 'list' ? 'var(--card)' : 'transparent', cursor: 'pointer', display: 'flex' }}><List size={16} color={view === 'list' ? '#22c55e' : 'var(--text-muted)'} /></button>
        </div>
        <button className="topbar-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> <span>Create Task</span>
        </button>
      </div>

      <div className="content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input" style={{ flex: 1, minWidth: '240px', background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search tasks, clients, services, assigned team..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', color: 'var(--text)' }} 
            />
          </div>

          <button 
            className="export-btn"
            onClick={() => setShowAdvFilters(prev => !prev)}
            style={{
              background: showAdvFilters || activeFilterCount > 0 ? 'rgba(0, 208, 132, 0.15)' : 'var(--card)',
              color: showAdvFilters || activeFilterCount > 0 ? '#00D084' : 'var(--text)',
              border: `1px solid ${showAdvFilters || activeFilterCount > 0 ? 'rgba(0, 208, 132, 0.3)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', gap: 8, height: '42px', padding: '0 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Filter size={16} /> 
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{ background: '#00D084', color: '#091a10', width: 18, height: 18, borderRadius: '50%', fontSize: 11, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Drawer */}
        {showAdvFilters && (
          <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '0 1 220px', minWidth: '180px' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Priority Filter</label>
                <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ width: '100%', height: '40px', lineHeight: '40px', padding: '0 30px 0 12px', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, border: '1px solid var(--border)', boxSizing: 'border-box' }}>
                  <option value="all">Priority: All</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div style={{ flex: '0 1 220px', minWidth: '180px' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Status Filter</label>
                <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%', height: '40px', lineHeight: '40px', padding: '0 30px 0 12px', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, border: '1px solid var(--border)', boxSizing: 'border-box' }}>
                  <option value="all">Status: All</option>
                  <option value="active">Active / Pending</option>
                  <option value="in_process">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Filters:</span>
                {priorityFilter !== 'all' && (
                  <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    Priority: {priorityFilter} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setPriorityFilter('all')} />
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span style={{ background: 'rgba(0,208,132,0.15)', color: '#00D084', padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    Status: {statusFilter} <X size={13} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('all')} />
                  </span>
                )}
                <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                  <RotateCcw size={12} /> Clear All
                </button>
              </div>
            )}
          </div>
        )}

        <div className="stats-row cols-4" style={{ marginBottom: '32px' }}>
            <div className="stat-card" style={{ borderBottom: '4px solid #15803d' }}><div className="stat-label">OPEN JOBS</div><div className="stat-value">{tasks.filter(t => t.status === 'active').length}</div></div>
            <div className="stat-card" style={{ borderBottom: '4px solid #3b82f6' }}><div className="stat-label">IN PROGRESS</div><div className="stat-value">{tasks.filter(t => t.status === 'in_process').length}</div></div>
            <div className="stat-card" style={{ borderBottom: '4px solid #10b981' }}><div className="stat-label">COMPLETED</div><div className="stat-value">{tasks.filter(t => ['completed', 'closed'].includes(t.status)).length}</div></div>
            <div className="stat-card" style={{ borderBottom: '4px solid #ef4444' }}><div className="stat-label">TOTAL TASKS</div><div className="stat-value">{tasks.length}</div></div>
        </div>

        {view === 'grid' ? (
          <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: 'var(--text-muted)' }}>Loading real-time tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: 'var(--text-muted)' }}>No tasks found in the pipeline.</div>
            ) : filteredTasks.map((task, i) => {
              const display = getStatusDisplay(task.status);
              return (
              <div key={task._id} className="card card-hover stagger-card" style={{ padding: '20px', animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: `${getPriorityColor(task.priority)}15`, color: getPriorityColor(task.priority), border: `1px solid ${getPriorityColor(task.priority)}30` }}>
                    {task.priority} Priority
                  </div>
                  <MoreVertical size={16} color="#94a3b8" cursor="pointer" />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text)' }}>{task.service}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Client: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{task.client?.name || 'Unknown'}</span></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>{display.label}</span>
                  <span style={{ color: '#15803d' }}>{display.progress}%</span>
                </div>
                <div className="task-progress">
                  <div className="task-progress-bar" style={{ width: `${display.progress}%`, background: display.progress === 100 ? '#10b981' : 'linear-gradient(90deg, #15803d, #22c55e)' }}></div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '-8px' }}>
                     {task.assignedTo && task.assignedTo.name ? (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--border)', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                          {task.assignedTo.name.substring(0, 2).toUpperCase()}
                        </div>
                     ) : (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--border)', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          --
                        </div>
                     )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {new Date(task.dueDate || task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Task Details</th><th>Priority</th><th>Status</th><th>Progress</th><th>Due Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No tasks found in this view.</td></tr>
                  ) : filteredTasks.map((task, i) => {
                    const display = getStatusDisplay(task.status);
                    return (
                    <tr key={task._id} className="stagger-card" style={{ animationDelay: `${i * 0.02}s` }}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{task.service}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Client: {task.client?.name || 'Unknown'}</div>
                      </td>
                      <td><span className="custom-badge" style={{ background: `${getPriorityColor(task.priority)}10`, color: getPriorityColor(task.priority), textTransform: 'uppercase' }}>{task.priority}</span></td>
                      <td><span className="custom-badge badge-green">{display.label}</span></td>
                      <td style={{ width: '150px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <div className="task-progress" style={{ width: '100px', margin: 0 }}><div className="task-progress-bar" style={{ width: `${display.progress}%`, background: display.progress === 100 ? '#10b981' : '#15803d' }}></div></div>
                           <span style={{ fontSize: '11px', fontWeight: 700 }}>{display.progress}%</span>
                         </div>
                      </td>
                      <td><div style={{ fontSize: '13px' }}>{new Date(task.dueDate || task.createdAt).toLocaleDateString()}</div></td>
                      <td><div className="action-icons"><div className="action-icon"><AlertCircle size={14}/></div></div></td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Select Client *</label>
                <select 
                  value={formData.clientId} 
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Service Name / Task Description *</label>
                <input 
                  type="text" 
                  value={formData.service} 
                  onChange={e => setFormData({...formData, service: e.target.value})}
                  required
                  placeholder="e.g. IT Return Filing, GST Registration"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Assign To (Partner / Staff)</label>
                  <select 
                    value={formData.assignedTo} 
                    onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                  >
                    <option value="">-- Unassigned --</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} {emp.role ? `(${emp.role.replace('_', ' ').toUpperCase()})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional instructions..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: creating ? 0.7 : 1 }}>
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;

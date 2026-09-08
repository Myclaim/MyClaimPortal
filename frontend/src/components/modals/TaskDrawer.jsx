import React, { useState, useEffect } from 'react';
import { FileText, Calendar as CalendarIcon, Clock, Paperclip, MoreHorizontal, Plus, X, Trash2, CheckCircle, Search, Filter, Tag, Repeat, ChevronRight, ChevronDown, Check, Folder, PanelRight, Copy, Link2, Building2, Ticket, CheckSquare, Settings, Bookmark, Play, Pause, Flag } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const toLocalDateStr = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10);
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function TaskDrawer({ isOpen, onClose, task, defaultClientId, onSave }) {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(isOpen);

  const [formData, setFormData] = useState({
    client: defaultClientId || '',
    ticket: '',
    mainHeading: '',
    status: 'Active',
    type: 'Service',
    dateInitiated: toLocalDateStr(new Date()),
    dateCompleted: '',
    assignedTo: '',
    description: '',
    repeatTask: 'Never',
    subtasks: [],
    attachments: [],
    tags: [],
    estimatedTimeHours: 1,
    spentTimeHours: 0
  });

  const [drawerLayout, setDrawerLayout] = useState('sidebar');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLayoutSubmenu, setShowLayoutSubmenu] = useState(false);
  const [showMoveToSubmenu, setShowMoveToSubmenu] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [clientTickets, setClientTickets] = useState([]);

  useEffect(() => { setIsDrawerOpen(isOpen); }, [isOpen]);
  useEffect(() => { if (!isDrawerOpen) onClose(); }, [isDrawerOpen, onClose]);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        client: task.client?._id || task.client || '',
        ticket: task.ticket?._id || task.ticket || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        dateInitiated: toLocalDateStr(task.dateInitiated),
        dateCompleted: toLocalDateStr(task.dateCompleted)
      });
    } else {
      setFormData(prev => ({ ...prev, client: defaultClientId || '' }));
    }
  }, [task, defaultClientId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, uRes, tRes] = await Promise.all([
          api.get('/users?role=client'),
          api.get('/users'),
          api.get('/tickets')
        ]);
        setClients(cRes.data || []);
        setEmployees((uRes.data || []).filter(u => u.role !== 'client'));
        setAllTickets(tRes.data || []);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.client) {
      api.get(`/tickets?client_id=${formData.client}`).then(res => {
        const tks = res.data || [];
        setClientTickets(tks);
        if (!formData.ticket && tks.length > 0) {
          setFormData(prev => ({ ...prev, ticket: tks[0]._id }));
        }
      }).catch(e => console.error(e));
    } else {
      setClientTickets([]);
    }
  }, [formData.client]);

  const formatTimer = (secs) => `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { id: Date.now(), title: newSubtaskText, completed: false }]
    }));
    setNewSubtaskText('');
    setShowSubtaskInput(false);
  };

  const toggleSubtask = (id) => {
    setFormData(prev => ({
      ...prev,
      subtasks: (prev.subtasks || []).map(st => st.id === id ? { ...st, completed: !st.completed } : st)
    }));
  };

  const removeSubtask = (id) => {
    setFormData(prev => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter(st => st.id !== id)
    }));
  };

  const removeAttachment = (idx) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== idx)
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await api.post('/ticket-tasks/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), { name: res.data.name, url: res.data.url }]
        }));
      } catch (err) {
        console.error('File upload failed', err);
        alert('File upload failed');
      }
    }
    // Clear the input so the same file can be uploaded again if needed
    e.target.value = null;
  };

  const handleDeleteTask = async () => {
    if (!task || !task._id) return;
    if (!window.confirm('Delete task?')) return;
    try {
      await api.delete(`/ticket-tasks/${task._id}`);
      if (onSave) onSave();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveTask = async () => {
    try {
      const taskHeading = formData.mainHeading?.trim() || formData.description?.trim();
      if (!taskHeading) {
        alert('Please enter a task heading');
        return;
      }
      if (!formData.client) {
        alert('Please select a client for this task');
        return;
      }
      const payload = {
        ...formData,
        mainHeading: taskHeading,
        description: formData.description || taskHeading,
        boardColumn: formData.status,
        assignedTo: formData.assignedTo || undefined,
        ticket: formData.ticket || undefined,
        dateCompleted: formData.dateCompleted || undefined,
        dateInitiated: formData.dateInitiated || undefined,
        estimatedTimeHours: Number(formData.estimatedTimeHours) || 0,
        spentTimeHours: Number(formData.spentTimeHours) || 0
      };

      if (!payload.ticket) {
        delete payload.ticket;
      }
      if (!payload.assignedTo) {
        delete payload.assignedTo;
      }

      if (task && task._id) {
        await api.put(`/ticket-tasks/${task._id}`, payload);
      } else {
        await api.post('/ticket-tasks', payload);
      }
      if (onSave) onSave();
      setIsDrawerOpen(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert(error.response?.data?.message || 'Failed to save task. Please check the inputs.');
    }
  };

  const selectedTask = task;

  return (
      <>
        <div 
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            drawerLayout === 'expanded' 
              ? 'flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in' 
              : 'flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in'
          }`} 
          onClick={() => { setIsDrawerOpen(false); setShowMoreMenu(false); setShowLayoutSubmenu(false); setShowMoveToSubmenu(false); }}
        >
          <div 
            className={`bg-[#1a1b1f] text-[#f1f3f7] flex flex-col shadow-2xl relative overflow-hidden transition-all duration-300 ${
              drawerLayout === 'expanded'
                ? 'w-full max-w-5xl h-[92vh] rounded-2xl border border-[#282a32] animate-scale-in'
                : 'w-full max-w-[560px] h-full border-l border-[#26282f] animate-slide-left'
            }`}
            onClick={e => e.stopPropagation()}
          >
            
            {/* 1. Top Breadcrumb & More Actions Menu (Exact Bordio layout) */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#24252c] bg-[#17181c]">
              <div className="text-xs text-[#7b808e] font-medium flex items-center gap-1.5 truncate select-none">
                <span>my claim india</span>
                <span>/</span>
                <span className="text-[#a6abb8] font-semibold truncate">
                  {formData.client ? (clients.find(c => c._id === formData.client)?.name || 'Client') : 'Core team'}
                </span>
                {formData.ticket && (
                  <>
                    <span>/</span>
                    <span className="text-blue-400 font-mono font-semibold">
                      #{clientTickets.find(t => t._id === formData.ticket)?.ticketNo || allTickets.find(t => t._id === formData.ticket)?.ticketNo || 'Ticket'}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 relative">
                {/* More Actions (•••) */}
                <button 
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                    setShowLayoutSubmenu(false);
                    setShowMoveToSubmenu(false);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${showMoreMenu ? 'bg-[#282a32] text-white' : 'text-[#8c919c] hover:text-white hover:bg-[#24252c]'}`}
                  title="More actions"
                >
                  <MoreHorizontal size={17} />
                </button>

                {/* More Actions Dropdown Menu (Exact match to screenshot 1 & 2 popup) */}
                {showMoreMenu && (
                  <div className="absolute top-9 right-16 z-50 w-48 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95">
                    {/* Duplicate task */}
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, mainHeading: `${prev.mainHeading || 'Task'} (Copy)` }));
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#e1e4ea] hover:bg-[#282a32] text-left transition-colors"
                    >
                      <Copy size={14} className="text-[#8c919c]" />
                      <span>Duplicate task</span>
                    </button>

                    {/* Move to > with Submenu */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowMoveToSubmenu(true)}
                      onMouseLeave={() => setShowMoveToSubmenu(false)}
                    >
                      <button 
                        type="button"
                        onClick={() => setShowMoveToSubmenu(!showMoveToSubmenu)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors ${
                          showMoveToSubmenu ? 'bg-[#1f2d3d] text-sky-400' : 'text-[#e1e4ea] hover:bg-[#282a32]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Folder size={14} className={showMoveToSubmenu ? 'text-sky-400' : 'text-[#8c919c]'} />
                          <span>Move to</span>
                        </span>
                        <ChevronRight size={13} className={showMoveToSubmenu ? 'text-sky-400' : 'text-[#737885]'} />
                      </button>

                      {showMoveToSubmenu && (
                        <div 
                          className="absolute top-0 right-full mr-1.5 z-50 w-44 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl p-1 text-xs animate-in fade-in"
                          onMouseEnter={() => setShowMoveToSubmenu(true)}
                        >
                          {['Active', 'Pending', 'Completed'].map(statusOption => (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  status: statusOption,
                                  dateCompleted: statusOption === 'Completed' && !prev.dateCompleted ? toLocalDateStr(new Date()) : prev.dateCompleted
                                }));
                                setShowMoreMenu(false);
                                setShowMoveToSubmenu(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                formData.status === statusOption ? 'bg-[#1d3350] text-sky-400 font-bold' : 'text-[#e1e4ea] hover:bg-[#282a32]'
                              }`}
                            >
                              <span>{statusOption === 'Active' ? 'Open tasks (Active)' : statusOption}</span>
                              {formData.status === statusOption && <Check size={13} className="text-sky-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Change layout > with Submenu (Exact match to Screenshot 2) */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowLayoutSubmenu(true)}
                      onMouseLeave={() => setShowLayoutSubmenu(false)}
                    >
                      <button 
                        type="button"
                        onClick={() => setShowLayoutSubmenu(!showLayoutSubmenu)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors ${
                          showLayoutSubmenu ? 'bg-[#1f2d3d] text-sky-400' : 'text-[#e1e4ea] hover:bg-[#282a32]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <PanelRight size={14} className={showLayoutSubmenu ? 'text-sky-400' : 'text-[#8c919c]'} />
                          <span>Change layout</span>
                        </span>
                        <ChevronRight size={13} className={showLayoutSubmenu ? 'text-sky-400' : 'text-[#737885]'} />
                      </button>

                      {showLayoutSubmenu && (
                        <div 
                          className="absolute top-0 right-full mr-1.5 z-50 w-44 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl p-1 text-xs animate-in fade-in"
                          onMouseEnter={() => setShowLayoutSubmenu(true)}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setDrawerLayout('sidebar');
                              try { localStorage.setItem('bordio_task_layout', 'sidebar'); } catch(e){}
                              setShowMoreMenu(false);
                              setShowLayoutSubmenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                              drawerLayout === 'sidebar' 
                                ? 'bg-[#1d3350] text-sky-400 font-bold' 
                                : 'text-[#e1e4ea] hover:bg-[#282a32]'
                            }`}
                          >
                            <span>Sidebar</span>
                            {drawerLayout === 'sidebar' && <Check size={13} className="text-sky-400" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDrawerLayout('expanded');
                              try { localStorage.setItem('bordio_task_layout', 'expanded'); } catch(e){}
                              setShowMoreMenu(false);
                              setShowLayoutSubmenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                              drawerLayout === 'expanded' 
                                ? 'bg-[#1d3350] text-sky-400 font-bold' 
                                : 'text-[#e1e4ea] hover:bg-[#282a32]'
                            }`}
                          >
                            <span>Expanded view</span>
                            {drawerLayout === 'expanded' && <Check size={13} className="text-sky-400" />}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#2d3038] my-1"></div>
                    {selectedTask && (
                      <button 
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          handleDeleteTask();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-400 hover:bg-red-500/10 text-left font-medium transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Delete task</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Copy Link Button (shown in user screenshot) */}
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${copiedLink ? 'text-emerald-400 bg-emerald-500/10' : 'text-[#8c919c] hover:text-white hover:bg-[#24252c]'}`}
                  title={copiedLink ? 'Link copied!' : 'Copy link'}
                >
                  {copiedLink ? <Check size={16} /> : <Link2 size={16} />}
                </button>

                {/* Close X */}
                <button 
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-[#8c919c] hover:text-white rounded-lg hover:bg-[#24252c] transition-colors ml-1"
                  title="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Drawer Body Form */}
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">
              
              {/* 2. Main Heading (Large Bordio title matching "vasu" in screenshot) */}
              <div>
                <input 
                  type="text"
                  placeholder="Task title..."
                  value={formData.mainHeading}
                  onChange={e => setFormData({ ...formData, mainHeading: e.target.value })}
                  className="w-full bg-transparent text-[26px] font-bold text-white outline-none placeholder-[#505462] tracking-tight leading-tight"
                />
              </div>

              {/* 3. 2-Column Key-Value Info Grid (Exact Bordio visual format with user-requested fields) */}
              <div className="space-y-2 pt-1 text-xs">
                
                {/* 3.1 Status */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Status</span>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                      className="flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg hover:bg-[#23242a] text-[#e1e4ea] cursor-pointer transition-colors"
                    >
                      <div className="w-4 h-4 rounded bg-[#9b72cf]/20 text-[#c084fc] flex items-center justify-center text-[10px]">
                        <Tag size={11} />
                      </div>
                      <span className="font-medium">
                        {formData.status === 'Active' ? 'New task' : (formData.status || 'New task')}
                      </span>
                    </button>

                    {activeDropdown === 'status' && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-44 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl py-1 text-xs animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, status: 'Active' }));
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[#e1e4ea] hover:bg-[#282a32] text-left"
                        >
                          <span className="w-3.5 h-3.5 rounded bg-[#9b72cf]/30 text-[#c084fc] flex items-center justify-center text-[9px]">✉</span>
                          <span>New task (Active)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, status: 'Pending' }));
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[#e1e4ea] hover:bg-[#282a32] text-left"
                        >
                          <span className="w-3.5 h-3.5 rounded bg-amber-500/30 text-amber-400 flex items-center justify-center text-[9px]">⚡</span>
                          <span>Pending</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ 
                              ...prev, 
                              status: 'Completed',
                              dateCompleted: !prev.dateCompleted ? toLocalDateStr(new Date()) : prev.dateCompleted
                            }));
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[#e1e4ea] hover:bg-[#282a32] text-left"
                        >
                          <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 text-emerald-400 flex items-center justify-center text-[9px]">✓</span>
                          <span>Completed</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3.2 Type (Claim, Service, Store) */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Type</span>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                      className="flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg hover:bg-[#23242a] text-[#e1e4ea] cursor-pointer transition-colors"
                    >
                      <div className="w-3.5 h-3.5 rounded bg-emerald-600/40 border border-emerald-500/80"></div>
                      <span className="font-medium">{formData.type || 'Operational'}</span>
                    </button>

                    {activeDropdown === 'type' && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-40 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl py-1 text-xs animate-in fade-in">
                        {['Claim', 'Service', 'Store'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, type: t }));
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#282a32] ${formData.type === t ? 'text-emerald-400 font-bold' : 'text-[#e1e4ea]'}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded bg-emerald-500/50"></span>
                              <span>{t}</span>
                            </span>
                            {formData.type === t && <Check size={13} className="text-emerald-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3.3 Select Client */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Client</span>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => !defaultClientId && setActiveDropdown(activeDropdown === 'client' ? null : 'client')}
                      className={`flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg text-[#e1e4ea] transition-colors max-w-xs truncate ${defaultClientId ? 'cursor-default opacity-80' : 'hover:bg-[#23242a] cursor-pointer'}`}
                    >
                      <Building2 size={13} className="text-blue-400 shrink-0" />
                      <span className="font-medium truncate">
                        {formData.client ? (clients.find(c => c._id === formData.client)?.name || 'Selected Client') : <span className="text-[#656a78]">Select client...</span>}
                      </span>
                    </button>

                    {activeDropdown === 'client' && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl py-2 text-xs animate-in fade-in max-h-64 flex flex-col">
                        <div className="px-3 pb-2 border-b border-[#2d3038]">
                          <div className="flex items-center gap-2 bg-[#17181c] px-2.5 py-1.5 rounded-lg border border-[#2c2f38]">
                            <Search size={12} className="text-[#8c919c]" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search client..."
                              value={clientSearch}
                              onChange={e => setClientSearch(e.target.value)}
                              className="bg-transparent text-xs text-white outline-none w-full placeholder-[#656a78]"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 divide-y divide-[#262830]">
                          {clients
                            .filter(c => {
                              const q = clientSearch.toLowerCase();
                              return !q || (c.name && c.name.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q)) || (c.companyName && c.companyName.toLowerCase().includes(q));
                            })
                            .map(c => (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, client: c._id, ticket: '' }));
                                  setActiveDropdown(null);
                                  setClientSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-[#282a32] ${formData.client === c._id ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-[#e1e4ea]'}`}
                              >
                                <div className="truncate pr-2">
                                  <div className="font-medium truncate">{c.name || `${c.firstName || ''} ${c.lastName || ''}`}</div>
                                  <div className="text-[10px] text-[#737885] truncate">{c.companyName || c.email || 'Client'}</div>
                                </div>
                                {formData.client === c._id && <Check size={13} className="text-blue-400 shrink-0" />}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3.4 Select Ticket ID */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Ticket ID</span>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'ticket' ? null : 'ticket')}
                      className="flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg hover:bg-[#23242a] text-[#e1e4ea] cursor-pointer transition-colors max-w-xs truncate"
                    >
                      <Ticket size={13} className="text-sky-400 shrink-0" />
                      <span className="font-medium truncate">
                        {formData.ticket ? (
                          (() => {
                            const t = (formData.client ? clientTickets : allTickets).find(x => x._id === formData.ticket);
                            return t ? `#${t.ticketNo} - ${t.subject || t.service || 'Ticket'}` : 'Selected Ticket';
                          })()
                        ) : (
                          <span className="text-[#656a78]">Select ticket ID...</span>
                        )}
                      </span>
                    </button>

                    {activeDropdown === 'ticket' && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-80 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl py-2 text-xs animate-in fade-in max-h-64 flex flex-col">
                        <div className="px-3 pb-2 border-b border-[#2d3038]">
                          <div className="flex items-center gap-2 bg-[#17181c] px-2.5 py-1.5 rounded-lg border border-[#2c2f38]">
                            <Search size={12} className="text-[#8c919c]" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search ticket..."
                              value={ticketSearch}
                              onChange={e => setTicketSearch(e.target.value)}
                              className="bg-transparent text-xs text-white outline-none w-full placeholder-[#656a78]"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 divide-y divide-[#262830]">
                          {(() => {
                            const ticketsToShow = formData.client ? clientTickets : allTickets;
                            const filteredTickets = ticketsToShow.filter(t => {
                              const q = ticketSearch.toLowerCase();
                              return !q || (t.ticketNo && String(t.ticketNo).includes(q)) || (t.subject && t.subject.toLowerCase().includes(q)) || (t.service && t.service.toLowerCase().includes(q));
                            });

                            if (filteredTickets.length === 0) {
                              return (
                                <div className="p-4 text-center text-[#656a78] text-xs">
                                  No tickets found {formData.client && 'for this client'}.
                                </div>
                              );
                            }

                            return filteredTickets.map(t => (
                              <button
                                key={t._id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    ticket: t._id,
                                    mainHeading: prev.mainHeading || t.subject || ''
                                  }));
                                  setActiveDropdown(null);
                                  setTicketSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-[#282a32] ${formData.ticket === t._id ? 'text-sky-400 font-bold bg-sky-500/10' : 'text-[#e1e4ea]'}`}
                              >
                                <div className="truncate pr-2">
                                  <div className="font-semibold text-white">#{t.ticketNo} - {t.subject || t.service}</div>
                                  <div className="text-[10px] text-[#737885]">{t.service || 'Support'} • {t.client?.name || 'Client'}</div>
                                </div>
                                {formData.ticket === t._id && <Check size={13} className="text-sky-400 shrink-0" />}
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3.5 Date Initiated */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Date initiated</span>
                  <div className="relative flex-1 flex items-center">
                    <label className="flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg hover:bg-[#23242a] text-[#e1e4ea] cursor-pointer transition-colors relative">
                      <CalendarIcon size={13} className="text-[#8c919c]" />
                      <span className="font-medium">
                        {formatDisplayDate(formData.dateInitiated) || 'No date'}
                      </span>
                      <input 
                        type="date" 
                        value={formData.dateInitiated} 
                        onChange={e => setFormData({ ...formData, dateInitiated: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </label>
                  </div>
                </div>

                {/* 3.6 Date Completed On (matching "Due date / No due date" in screenshot) */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Date completed on</span>
                  <div className="relative flex-1 flex items-center gap-2">
                    <label className="flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg hover:bg-[#23242a] text-[#e1e4ea] cursor-pointer transition-colors relative">
                      <CalendarIcon size={13} className="text-[#8c919c]" />
                      <span className={`font-medium ${!formData.dateCompleted ? 'text-[#656a78]' : 'text-[#e1e4ea]'}`}>
                        {formatDisplayDate(formData.dateCompleted) || 'No due date'}
                      </span>
                      <input 
                        type="date" 
                        value={formData.dateCompleted} 
                        onChange={e => setFormData({ ...formData, dateCompleted: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </label>
                    {formData.dateCompleted && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, dateCompleted: '' })}
                        className="text-[10px] text-[#737885] hover:text-white px-1"
                        title="Clear completed date"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3.7 Assignee (Avatar + "Me" / Name, matching screenshot) */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Assignee</span>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'assignee' ? null : 'assignee')}
                      className="flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg hover:bg-[#23242a] text-[#e1e4ea] cursor-pointer transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">
                        {formData.assignedTo 
                          ? (employees.find(e => e._id === formData.assignedTo)?.name?.charAt(0) || 'U')
                          : (user?.name?.charAt(0) || 'M')
                        }
                      </div>
                      <span className="font-medium">
                        {formData.assignedTo ? (
                          employees.find(e => e._id === formData.assignedTo)?.name || 'Assigned'
                        ) : (
                          'Me'
                        )}
                      </span>
                    </button>

                    {activeDropdown === 'assignee' && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl py-2 text-xs animate-in fade-in max-h-64 flex flex-col">
                        <div className="px-3 pb-2 border-b border-[#2d3038]">
                          <div className="flex items-center gap-2 bg-[#17181c] px-2.5 py-1.5 rounded-lg border border-[#2c2f38]">
                            <Search size={12} className="text-[#8c919c]" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search assignee..."
                              value={assigneeSearch}
                              onChange={e => setAssigneeSearch(e.target.value)}
                              className="bg-transparent text-xs text-white outline-none w-full placeholder-[#656a78]"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 divide-y divide-[#262830]">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, assignedTo: user?._id || '' }));
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-[#282a32] text-[#e1e4ea]"
                          >
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                              {user?.name?.charAt(0) || 'M'}
                            </div>
                            <span className="font-medium">Me ({user?.name || 'Current User'})</span>
                          </button>

                          {employees
                            .filter(e => {
                              const q = assigneeSearch.toLowerCase();
                              return !q || (e.name && e.name.toLowerCase().includes(q)) || (e.email && e.email.toLowerCase().includes(q));
                            })
                            .map(e => (
                              <button
                                key={e._id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, assignedTo: e._id }));
                                  setActiveDropdown(null);
                                  setAssigneeSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-[#282a32] ${formData.assignedTo === e._id ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-[#e1e4ea]'}`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {e.name?.charAt(0) || 'U'}
                                  </div>
                                  <div className="truncate">
                                    <div className="font-medium truncate">{e.name}</div>
                                    <div className="text-[10px] text-[#737885]">{e.role || 'Member'}</div>
                                  </div>
                                </div>
                                {formData.assignedTo === e._id && <Check size={13} className="text-blue-400 shrink-0" />}
                              </button>
                            ))}

                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, assignedTo: '' }));
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-[#282a32] text-[#8c919c]"
                          >
                            <div className="w-5 h-5 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-[10px]">?</div>
                            <span>Unassigned</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3.8 Estimated time */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Estimated time</span>
                  <div className="relative flex-1 flex items-center gap-1.5 text-[#e1e4ea]">
                    <Clock size={13} className="text-[#8c919c]" />
                    <input 
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.estimatedTimeHours}
                      onChange={e => setFormData({ ...formData, estimatedTimeHours: Number(e.target.value) })}
                      className="w-12 bg-transparent text-[#e1e4ea] font-medium text-xs outline-none hover:bg-[#23242a] focus:bg-[#23242a] px-1 py-0.5 rounded transition-colors"
                    />
                    <span className="text-[#8c919c] text-xs">h</span>
                  </div>
                </div>

                {/* 3.9 Priority */}
                <div className="flex items-center min-h-[34px] relative property-dropdown-container">
                  <span className="w-36 shrink-0 text-[#8c919c] font-medium text-xs select-none">Priority</span>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                      className="flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-lg hover:bg-[#23242a] text-[#e1e4ea] cursor-pointer transition-colors"
                    >
                      <span className="font-medium">{formData.tags?.[0] || 'None'}</span>
                    </button>

                    {activeDropdown === 'priority' && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-36 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl py-1 text-xs animate-in fade-in">
                        {['None', 'Low', 'Medium', 'High', 'Urgent'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, tags: [p] }));
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#282a32] ${(formData.tags?.[0] || 'None') === p ? 'text-blue-400 font-bold' : 'text-[#e1e4ea]'}`}
                          >
                            <span>{p}</span>
                            {(formData.tags?.[0] || 'None') === p && <Check size={13} className="text-blue-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* 4. Action Buttons Row (Add subtask, Attach file, Start timer, Log time, •••) - EXACT match to screenshot */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#24252c]">
                <button 
                  type="button"
                  onClick={() => setShowSubtaskInput(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222327] hover:bg-[#282a32] text-xs text-[#d1d5db] font-medium transition-colors border border-white/5"
                >
                  <Check size={13} className="text-[#8c919c]" />
                  <span>Add subtask</span>
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222327] hover:bg-[#282a32] text-xs text-[#d1d5db] font-medium cursor-pointer transition-colors border border-white/5">
                  <Paperclip size={13} className="text-[#8c919c]" />
                  <span>Attach file</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>

                <button 
                  type="button"
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    isTimerActive 
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm' 
                      : 'bg-[#222327] hover:bg-[#282a32] text-[#d1d5db] border-white/5'
                  }`}
                >
                  <Clock size={13} className={isTimerActive ? 'text-blue-400 animate-pulse' : 'text-[#8c919c]'} />
                  <span>{isTimerActive ? `Stop timer (${formatTimer(timerSeconds)})` : 'Start timer'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    const hrs = prompt('Enter hours logged:', formData.spentTimeHours || '0');
                    if (hrs !== null) setFormData({ ...formData, spentTimeHours: Number(hrs) || 0 });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222327] hover:bg-[#282a32] text-xs text-[#d1d5db] font-medium transition-colors border border-white/5"
                >
                  <Repeat size={13} className="text-[#8c919c]" />
                  <span>Log time</span>
                </button>

                {/* Add Tag Button (matching Screenshot 3) */}
                <button 
                  type="button"
                  onClick={() => {
                    const tag = prompt('Enter tag:');
                    if (tag && tag.trim()) {
                      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag.trim()] }));
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222327] hover:bg-[#282a32] text-xs text-[#d1d5db] font-medium transition-colors border border-white/5"
                >
                  <Bookmark size={13} className="text-[#8c919c]" />
                  <span>Add tag</span>
                </button>

                {/* Repeat Task Button (matching Screenshot 3) */}
                <button 
                  type="button"
                  onClick={() => {
                    const intervals = ['Never', 'Daily', 'Weekly', 'Monthly'];
                    const currentIdx = intervals.indexOf(formData.repeatTask || 'Never');
                    const nextInterval = intervals[(currentIdx + 1) % intervals.length];
                    setFormData(prev => ({ ...prev, repeatTask: nextInterval }));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    formData.repeatTask && formData.repeatTask !== 'Never'
                      ? 'bg-purple-600/20 text-purple-400 border-purple-500/40'
                      : 'bg-[#222327] hover:bg-[#282a32] text-[#d1d5db] border-white/5'
                  }`}
                  title={`Repeat schedule: ${formData.repeatTask || 'Never'}`}
                >
                  <Repeat size={13} className={formData.repeatTask && formData.repeatTask !== 'Never' ? 'text-purple-400' : 'text-[#8c919c]'} />
                  <span>{formData.repeatTask && formData.repeatTask !== 'Never' ? `Repeats ${formData.repeatTask}` : 'Repeat task'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 rounded-lg bg-[#222327] hover:bg-[#282a32] text-[#8c919c] hover:text-white transition-colors border border-white/5"
                  title="More actions"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>

              {/* Subtask Input Field (if toggled) */}
              {showSubtaskInput && (
                <div className="flex items-center gap-2 p-2 bg-[#202126] rounded-lg border border-[#2c2f38]">
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Enter subtask title..."
                    value={newSubtaskText}
                    onChange={e => setNewSubtaskText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder-[#656a78]"
                  />
                  <button type="button" onClick={addSubtask} className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded font-bold hover:bg-blue-700">Add</button>
                  <button type="button" onClick={() => setShowSubtaskInput(false)} className="text-xs text-[#7b808e] hover:text-white px-1.5">Cancel</button>
                </div>
              )}

              {/* Subtasks List */}
              {formData.subtasks?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-[#7b808e] uppercase tracking-wider">Subtasks</div>
                  {formData.subtasks.map((st, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between p-2 rounded-lg bg-[#202126] text-xs">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input 
                          type="checkbox" 
                          checked={st.isCompleted} 
                          onChange={e => toggleSubtask(sIdx, e.target.checked)} 
                          className="rounded border-[#2c2f38] accent-blue-600"
                        />
                        <span className={st.isCompleted ? 'line-through text-[#7b808e]' : 'text-[#e1e4ea]'}>{st.title}</span>
                      </label>
                      <button type="button" onClick={() => removeSubtask(sIdx)} className="text-[#7b808e] hover:text-red-400">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments List */}
              {formData.attachments?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-[#7b808e] uppercase tracking-wider">Attachments</div>
                  {formData.attachments.map((att, aIdx) => (
                    <div key={aIdx} className="flex items-center justify-between p-2 rounded-lg bg-[#202126] text-xs">
                      <span className="text-[#e1e4ea] truncate">{att.name}</span>
                      <button type="button" onClick={() => removeAttachment(aIdx)} className="text-[#7b808e] hover:text-red-400">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. Description Section - Exact match to screenshot */}
              <div className="space-y-2 pt-2 border-t border-[#24252c]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8c919c]">
                  <FileText size={14} />
                  <span>Description</span>
                </div>
                <textarea 
                  rows={3}
                  placeholder="Task description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-transparent hover:bg-[#202126] focus:bg-[#202126] rounded-xl p-3 text-xs text-[#e1e4ea] outline-none border border-transparent focus:border-[#2f3138] placeholder-[#505462] resize-y transition-colors"
                />
              </div>

              {/* 6. Scheduled Work Section - EXACT match to screenshot */}
              <div className="space-y-2 pt-2 border-t border-[#24252c]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8c919c]">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} />
                    <span>Scheduled work</span>
                    <span className="bg-[#24252b] text-[#8c919c] text-[10px] px-1.5 py-0.2 rounded-full font-bold">1</span>
                  </div>
                  <ChevronDown size={14} className="text-[#737885] cursor-pointer hover:text-white" />
                </div>

                <div className="border border-[#262830] rounded-xl overflow-hidden bg-[#1a1b1f] text-xs">
                  <div className="grid grid-cols-[60px_60px_1fr_130px] px-4 py-2.5 text-[11px] font-semibold text-[#737885] border-b border-[#262830]">
                    <div>Date</div>
                    <div>User</div>
                    <div>Planned time</div>
                    <div className="text-right pr-2">Timer</div>
                  </div>
                  <div className="grid grid-cols-[60px_60px_1fr_130px] items-center px-4 py-3 text-xs text-[#e1e4ea]">
                    <div className="font-bold text-[#8c919c]">WT</div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div className="text-[#656a78]">-</div>
                    <div className="flex items-center justify-end gap-2.5">
                      <button 
                        type="button" 
                        onClick={() => setIsTimerActive(!isTimerActive)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm ${
                          isTimerActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        title={isTimerActive ? 'Pause timer' : 'Start timer'}
                      >
                        {isTimerActive ? <Pause size={11} /> : <Play size={11} className="ml-0.5" />}
                      </button>
                      <span className="font-mono font-bold text-white text-xs tracking-wider">
                        {formatTimer(timerSeconds)}
                      </span>
                      <Flag size={13} className="text-[#555964] cursor-pointer hover:text-[#8c919c]" />
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => alert('Schedule more work clicked')}
                  className="flex items-center gap-1.5 text-xs text-[#737885] hover:text-[#e1e4ea] pt-1 transition-colors select-none font-medium"
                >
                  <Plus size={13} />
                  <span>Schedule more work</span>
                </button>
              </div>

            </div>

            {/* 7. Drawer Footer Buttons */}
            <div className="p-4 border-t border-[#24252c] bg-[#17181c] flex items-center justify-between">
              {selectedTask ? (
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="px-3.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Delete task</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#2c2f38] text-[#8c919c] hover:text-white font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
              )}

              <button 
                type="button"
                onClick={handleSaveTask} 
                disabled={!formData.client || !(formData.mainHeading?.trim() || formData.description?.trim())} 
                className={`px-6 py-2 font-bold text-xs rounded-lg transition-all ${
                  (!formData.client || !(formData.mainHeading?.trim() || formData.description?.trim())) 
                    ? 'bg-[#222327] text-[#555964] cursor-not-allowed' 
                    : 'bg-[#1d72f2] hover:bg-[#1a64d6] text-white shadow-lg active:scale-95'
                }`}
              >
                Save Task
              </button>
            </div>

          </div>
        </div>
      </>
  );
}

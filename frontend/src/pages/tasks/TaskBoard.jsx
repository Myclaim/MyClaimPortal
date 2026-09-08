import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Calendar as CalendarIcon, Clock, Paperclip, MoreHorizontal, Plus, X, 
  Trash2, CheckCircle, Search, Filter, Users, LayoutGrid, List, MessageSquare, 
  Tag, Repeat, Edit2, ChevronLeft, ChevronRight, CalendarDays, ChevronDown, 
  ChevronUp, Check, ArrowRight, FileText, CheckSquare, Briefcase, BarChart2, 
  Bell, Settings, SlidersHorizontal, User, FolderPlus, UserPlus, StickyNote,
  AlertCircle, Link2, Flag, Play, Pause, Building2, Ticket, Folder, Layers, Copy,
  PanelRight, Bookmark, ArrowDown, ArrowUp, ArrowLeft, EyeOff, PanelLeft
} from 'lucide-react';
import io from 'socket.io-client';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import TaskDrawer from '../../components/modals/TaskDrawer';

const COLUMNS = {
  'Active': { id: 'Active', title: 'Active', bg: 'bg-[#1a1b1f]', countBg: 'bg-[#25272e]' },
  'Pending': { id: 'Pending', title: 'Pending', bg: 'bg-[#1a1b1f]', countBg: 'bg-[#25272e]' },
  'Completed': { id: 'Completed', title: 'Completed', bg: 'bg-[#1a1b1f]', countBg: 'bg-[#25272e]' }
};

const DEFAULT_TABLE_COLUMNS = [
  { id: 'title', label: 'Task title', width: 'minmax(200px, 1fr)' },
  { id: 'status', label: 'Status', width: '100px' },
  { id: 'type', label: 'Type', width: '90px' },
  { id: 'dueDate', label: 'Due date', width: '110px' },
  { id: 'priority', label: 'Priority', width: '90px' },
  { id: 'assignee', label: 'Assignee', width: '150px' },
  { id: 'estimatedTime', label: 'Estimated time', width: '100px' },
  { id: 'loggedTime', label: 'Logged time', width: '90px' },
  { id: 'ticket', label: 'Ticket', width: '130px' }
];

// ── Timezone-Safe Date Helpers ──
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

const getStartOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const result = new Date(date.getFullYear(), date.getMonth(), diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const isSameDay = (d1, d2) => {
  return toLocalDateStr(d1) === toLocalDateStr(d2);
};

const isToday = (date) => {
  return isSameDay(date, new Date());
};

const TaskBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Navigation state matching Bordio screenshot:
  // Left Nav: 'my_work', 'all_projects', 'reports'
  const [primaryNav, setPrimaryNav] = useState('my_work');
  // Tools Panel: 'tasks', 'calendar', 'notes'
  const [activeTool, setActiveTool] = useState('tasks');
  // Tasks views: 'table' or 'kanban'
  const [tasksView, setTasksView] = useState('table');
  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Calendar modes: 'week', 'month', 'day'
  const [calendarMode, setCalendarMode] = useState('week');
  const [weekDaysCount, setWeekDaysCount] = useState(7);
  const [loading, setLoading] = useState(true);

  // Accordion toggles
  const [teamsExpanded, setTeamsExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [openTasksExpanded, setOpenTasksExpanded] = useState(true);
  const [completedTasksExpanded, setCompletedTasksExpanded] = useState(true);

  // Quick inline task creation in Table view
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  // Real-Time Calendar Date Navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  
  // Date Picker Dropdown State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const datePickerRef = useRef(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [waitingListSearch, setWaitingListSearch] = useState('');

  // Modal / Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Drawer Section Toggles
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showFilesSection, setShowFilesSection] = useState(true);
  const [showTimeBlocksSection, setShowTimeBlocksSection] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Form Data States
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clientTickets, setClientTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [selectedTicketFilter, setSelectedTicketFilter] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else if (!isTimerActive && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const [formData, setFormData] = useState({
    client: '',
    ticket: '',
    mainHeading: '',
    status: 'Active',
    type: 'Service', // 'Claim', 'Service', 'Store'
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

  // Drawer property popover state
  const [activeDropdown, setActiveDropdown] = useState(null); // 'status' | 'type' | 'client' | 'ticket' | 'assignee' | 'priority' | null
  const [clientSearch, setClientSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [drawerLayout, setDrawerLayout] = useState(() => localStorage.getItem('bordio_task_layout') || 'sidebar');
  const [showLayoutSubmenu, setShowLayoutSubmenu] = useState(false);
  const [showMoveToSubmenu, setShowMoveToSubmenu] = useState(false);

  // Table Columns, Order, Visibility & Sorting (Bordio Column Header System)
  const [tableColumns, setTableColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('bordio_table_columns_order');
      if (saved) {
        const order = JSON.parse(saved);
        const map = new Map(DEFAULT_TABLE_COLUMNS.map(c => [c.id, c]));
        const ordered = order.map(id => map.get(id)).filter(Boolean);
        DEFAULT_TABLE_COLUMNS.forEach(c => {
          if (!ordered.some(o => o.id === c.id)) ordered.push(c);
        });
        return ordered;
      }
    } catch (e) {}
    return DEFAULT_TABLE_COLUMNS;
  });

  const [hiddenColumns, setHiddenColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('bordio_table_hidden_columns');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [sortConfig, setSortConfig] = useState(null); // { key: string, direction: 'asc' | 'desc' } | null
  const [activeColumnMenu, setActiveColumnMenu] = useState(null); // columnId | null
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Close table column menu & settings on outside click
  useEffect(() => {
    const handleColumnMenuOutside = (e) => {
      if (!e.target.closest('.column-menu-container') && !e.target.closest('.column-settings-container')) {
        setActiveColumnMenu(null);
        setShowColumnSettings(false);
      }
    };
    if (activeColumnMenu || showColumnSettings) {
      document.addEventListener('mousedown', handleColumnMenuOutside);
    }
    return () => document.removeEventListener('mousedown', handleColumnMenuOutside);
  }, [activeColumnMenu, showColumnSettings]);

  const handleMoveColumnLeft = (colId) => {
    setTableColumns(prev => {
      const idx = prev.findIndex(c => c.id === colId);
      if (idx <= 0) return prev;
      const next = [...prev];
      const temp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = temp;
      try { localStorage.setItem('bordio_table_columns_order', JSON.stringify(next.map(c => c.id))); } catch(e){}
      return next;
    });
    setActiveColumnMenu(null);
  };

  const handleMoveColumnRight = (colId) => {
    setTableColumns(prev => {
      const idx = prev.findIndex(c => c.id === colId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = temp;
      try { localStorage.setItem('bordio_table_columns_order', JSON.stringify(next.map(c => c.id))); } catch(e){}
      return next;
    });
    setActiveColumnMenu(null);
  };

  const handleHideColumn = (colId) => {
    setHiddenColumns(prev => {
      const next = [...prev, colId];
      try { localStorage.setItem('bordio_table_hidden_columns', JSON.stringify(next)); } catch(e){}
      return next;
    });
    setActiveColumnMenu(null);
  };

  const toggleColumnVisibility = (colId) => {
    setHiddenColumns(prev => {
      const next = prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId];
      try { localStorage.setItem('bordio_table_hidden_columns', JSON.stringify(next)); } catch(e){}
      return next;
    });
  };

  const resetTableColumns = () => {
    setTableColumns(DEFAULT_TABLE_COLUMNS);
    setHiddenColumns([]);
    setSortConfig(null);
    try {
      localStorage.removeItem('bordio_table_columns_order');
      localStorage.removeItem('bordio_table_hidden_columns');
    } catch(e){}
  };

  const sortTasks = (taskList) => {
    if (!sortConfig || !sortConfig.key) return taskList;
    const { key, direction } = sortConfig;
    return [...taskList].sort((a, b) => {
      let valA, valB;
      switch (key) {
        case 'title':
          valA = (a.mainHeading || a.description || a.ticket?.subject || '').toLowerCase();
          valB = (b.mainHeading || b.description || b.ticket?.subject || '').toLowerCase();
          break;
        case 'status':
          valA = (a.status || a.boardColumn || '').toLowerCase();
          valB = (b.status || b.boardColumn || '').toLowerCase();
          break;
        case 'type':
          valA = (a.type || '').toLowerCase();
          valB = (b.type || '').toLowerCase();
          break;
        case 'dueDate':
          valA = new Date(a.dateCompleted || a.dateInitiated || a.dueDate || 0).getTime();
          valB = new Date(b.dateCompleted || b.dateInitiated || b.dueDate || 0).getTime();
          break;
        case 'priority': {
          const pOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0 };
          valA = pOrder[a.tags?.[0]] || 0;
          valB = pOrder[b.tags?.[0]] || 0;
          break;
        }
        case 'assignee':
          valA = (a.assignedTo?.name || '').toLowerCase();
          valB = (b.assignedTo?.name || '').toLowerCase();
          break;
        case 'estimatedTime':
          valA = Number(a.estimatedTimeHours || 0);
          valB = Number(b.estimatedTimeHours || 0);
          break;
        case 'loggedTime':
          valA = Number(a.spentTimeHours || 0);
          valB = Number(b.spentTimeHours || 0);
          break;
        case 'ticket':
          valA = Number(a.ticket?.ticketNo || 0);
          valB = Number(b.ticket?.ticketNo || 0);
          break;
        default:
          return 0;
      }
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Close property dropdowns on outside click
  useEffect(() => {
    const handleDropdownOutside = (e) => {
      if (!e.target.closest('.property-dropdown-container')) {
        setActiveDropdown(null);
      }
      if (!e.target.closest('.notification-dropdown-container')) {
        setShowNotifications(false);
      }
    };
    if (activeDropdown || showNotifications) {
      document.addEventListener('mousedown', handleDropdownOutside);
    }
    return () => document.removeEventListener('mousedown', handleDropdownOutside);
  }, [activeDropdown, showNotifications]);

  // Load initial data
  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchAllTickets();
    fetchNotifications();
  }, []);

  // Close mini-calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // Real-Time Socket.io connection for live updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
      : (import.meta.env.DEV ? 'http://localhost:5005' : 'https://myclaimportal.onrender.com');
    
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('ticket_task_created', (newTask) => {
      setTasks((prev) => {
        if (prev.some(t => t._id === newTask._id)) return prev;
        return [newTask, ...prev];
      });
    });

    socket.on('ticket_task_updated', (updatedTask) => {
      setTasks((prev) => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    });

    socket.on('ticket_task_deleted', (taskId) => {
      setTasks((prev) => prev.filter(t => t._id !== taskId));
    });

    socket.on('notification_created', (payload) => {
      fetchNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/ticket-tasks');
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching ticket tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const [clientRes, userRes] = await Promise.all([
        api.get('/users?role=client'),
        api.get('/users')
      ]);
      setClients(clientRes.data || []);
      setEmployees((userRes.data || []).filter(u => u.role !== 'client'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllTickets = async () => {
    try {
      const { data } = await api.get('/tickets');
      setAllTickets(data || []);
    } catch (error) {
      console.error('Error fetching all tickets:', error);
    }
  };

  useEffect(() => {
    if (formData.client) {
      const fetchTickets = async () => {
        try {
          const { data } = await api.get(`/tickets?client=${formData.client}`);
          setClientTickets(data || []);
        } catch (error) {
          console.error('Error fetching tickets:', error);
        }
      };
      fetchTickets();
    } else {
      setClientTickets([]);
    }
  }, [formData.client]);

  // Toggle completed status directly from checkbox
  const handleToggleTaskStatus = async (task, e) => {
    e.stopPropagation();
    const newStatus = task.status === 'Completed' ? 'Active' : 'Completed';
    const newDateCompleted = newStatus === 'Completed' ? toLocalDateStr(new Date()) : '';

    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus, dateCompleted: newDateCompleted } : t));

    try {
      await api.put(`/ticket-tasks/${task._id}`, {
        status: newStatus,
        boardColumn: newStatus,
        dateCompleted: newDateCompleted || undefined
      });
    } catch (error) {
      console.error('Error toggling task status:', error);
      fetchTasks();
    }
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => {
      const matchTicket = selectedTicketFilter 
        ? String(task.ticket?._id || task.ticket) === String(selectedTicketFilter) || String(task.ticket?.ticketNo) === String(selectedTicketFilter)
        : true;
      const matchSearch = searchQuery ? (
        (task.ticket?.subject && task.ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.ticket?.ticketNo && String(task.ticket.ticketNo).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.mainHeading && task.mainHeading.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.client?.name && task.client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.assignedTo?.name && task.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;
      return (task.boardColumn === columnId || task.status === columnId) && matchSearch && matchTicket;
    });
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newTasks = Array.from(tasks);
    const taskIndex = newTasks.findIndex(t => t._id === draggableId);
    if (taskIndex === -1) return;
    let updatedTask = { ...newTasks[taskIndex] };

    // Determine context (Kanban vs Calendar)
    if (destination.droppableId.startsWith('cal_')) {
      const parts = destination.droppableId.split('_');
      if (parts[1] === 'waiting') {
        updatedTask.dueDate = null;
        updatedTask.dateInitiated = null;
      } else {
        const assigneeId = parts[1] === 'unassigned' ? null : parts[1];
        const dateStr = parts[2];
        updatedTask.assignedTo = assigneeId ? (employees.find(e => String(e._id) === String(assigneeId)) || { _id: assigneeId }) : null;
        updatedTask.dueDate = dateStr;
        if (!updatedTask.dateInitiated) updatedTask.dateInitiated = dateStr;
      }
    } else {
      // Kanban drop
      updatedTask.boardColumn = destination.droppableId;
      updatedTask.status = destination.droppableId;
      if (destination.droppableId === 'Completed' && !updatedTask.dateCompleted) {
        updatedTask.dateCompleted = toLocalDateStr(new Date());
      }
    }

    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);

    try {
      const payload = { 
        ...updatedTask, 
        assignedTo: updatedTask.assignedTo?._id || (typeof updatedTask.assignedTo === 'string' ? updatedTask.assignedTo : null),
        client: updatedTask.client?._id || (typeof updatedTask.client === 'string' ? updatedTask.client : null),
        ticket: updatedTask.ticket?._id || (typeof updatedTask.ticket === 'string' ? updatedTask.ticket : null)
      };

      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.client) delete payload.client;
      if (!payload.ticket) delete payload.ticket;
      if (!payload.dateCompleted) delete payload.dateCompleted;
      if (!payload.dateInitiated) delete payload.dateInitiated;

      await api.put(`/ticket-tasks/${draggableId}`, payload);
    } catch (error) {
      console.error('Error updating task:', error);
      fetchTasks(); 
    }
  };

  const openDrawer = (task = null, defaultDate = null) => {
    setSelectedTask(task);
    if (task) {
      setFormData({
        client: task.client?._id || (typeof task.client === 'string' ? task.client : ''),
        ticket: task.ticket?._id || (typeof task.ticket === 'string' ? task.ticket : ''),
        mainHeading: task.mainHeading || task.description || task.ticket?.subject || '',
        description: task.description || '',
        status: task.status || task.boardColumn || 'Active',
        type: task.type || 'Service',
        dateInitiated: task.dateInitiated ? toLocalDateStr(task.dateInitiated) : toLocalDateStr(new Date()),
        dateCompleted: task.dateCompleted ? toLocalDateStr(task.dateCompleted) : '',
        assignedTo: task.assignedTo?._id || (typeof task.assignedTo === 'string' ? task.assignedTo : ''),
        repeatTask: task.repeatTask || 'Never',
        subtasks: task.subtasks || [],
        attachments: task.attachments || [],
        tags: task.tags || [],
        estimatedTimeHours: task.estimatedTimeHours || 1,
        spentTimeHours: task.spentTimeHours || 0
      });
    } else {
      const todayStr = toLocalDateStr(defaultDate || currentCalendarDate || new Date());
      setFormData({
        client: clients[0]?._id || '', 
        ticket: '', 
        mainHeading: '',
        description: '', 
        status: 'Active', 
        type: 'Service', 
        dateInitiated: todayStr,
        dateCompleted: '',
        assignedTo: '',
        repeatTask: 'Never',
        subtasks: [],
        attachments: [],
        tags: [],
        estimatedTimeHours: 1,
        spentTimeHours: 0
      });
    }
    setIsDrawerOpen(true);
  };

  // Quick inline task creation from the "+ Create task" row
  const handleQuickCreateSubmit = async (e) => {
    e.preventDefault();
    if (!inlineTaskTitle.trim()) return;

    try {
      const defaultClient = clients[0]?._id || null;
      let defaultTicket = null;
      if (defaultClient) {
        const { data } = await api.get(`/tickets?client=${defaultClient}`);
        if (data && data.length > 0) defaultTicket = data[0]._id;
      }

      const payload = {
        mainHeading: inlineTaskTitle.trim(),
        description: inlineTaskTitle.trim(),
        status: 'Active',
        boardColumn: 'Active',
        type: 'Service',
        dateInitiated: toLocalDateStr(new Date()),
        dueDate: toLocalDateStr(new Date()),
        client: defaultClient,
        ticket: defaultTicket,
        assignedTo: user?._id || undefined
      };

      await api.post('/ticket-tasks', payload);
      setInlineTaskTitle('');
      setShowInlineCreate(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating inline task:', error);
      // Fallback to opening the full drawer
      setFormData(prev => ({ ...prev, mainHeading: inlineTaskTitle }));
      setShowInlineCreate(false);
      setIsDrawerOpen(true);
    }
  };

  const handleSaveTask = async (e) => {
    e?.preventDefault();
    try {
      if (!formData.client) {
        alert('Please select a client');
        return;
      }
      if (!formData.ticket) {
        alert('Please select a ticket');
        return;
      }
      const taskHeading = formData.mainHeading?.trim() || formData.description?.trim();
      if (!taskHeading) {
        alert('Please enter a main heading');
        return;
      }

      const effDueDate = formData.dateCompleted || formData.dateInitiated || toLocalDateStr(new Date());

      const payload = { 
        client: formData.client,
        ticket: formData.ticket,
        mainHeading: taskHeading,
        description: formData.description || taskHeading,
        status: formData.status,
        boardColumn: formData.status,
        type: formData.type,
        dateInitiated: formData.dateInitiated || undefined,
        dateCompleted: formData.dateCompleted || undefined,
        dueDate: effDueDate,
        assignedTo: formData.assignedTo || undefined,
        repeatTask: formData.repeatTask || 'Never',
        subtasks: formData.subtasks || [],
        attachments: formData.attachments || [],
        tags: formData.tags || [],
        estimatedTimeHours: Number(formData.estimatedTimeHours) || 0,
        spentTimeHours: Number(formData.spentTimeHours) || 0
      };
      
      if (!payload.dueDate) delete payload.dueDate; 
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dateCompleted) delete payload.dateCompleted;
      if (!payload.dateInitiated) delete payload.dateInitiated;

      if (selectedTask) {
        await api.put(`/ticket-tasks/${selectedTask._id}`, payload);
      } else {
        await api.post('/ticket-tasks', payload);
      }
      setIsDrawerOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/ticket-tasks/${selectedTask._id}`);
      setIsDrawerOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  // Subtask Handlers
  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { title: newSubtaskText.trim(), isCompleted: false }]
    }));
    setNewSubtaskText('');
  };

  const toggleSubtask = (index, checked) => {
    setFormData(prev => {
      const updated = [...prev.subtasks];
      updated[index].isCompleted = checked;
      return { ...prev, subtasks: updated };
    });
  };

  const removeSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  // Tag Handlers
  const handleAddTag = () => {
    const tag = prompt("Enter a new tag:");
    if (tag && tag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // File Upload Handlers
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAttachments = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
    setShowFilesSection(true);
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Type Badges styling
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Claim': 
        return 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
      case 'Service': 
        return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
      case 'Store': 
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default: 
        return 'bg-slate-700/30 text-slate-300 border border-slate-600/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    }
  };

  // Calendar Days Calculations
  const calendarDays = useMemo(() => {
    return Array.from({ length: weekDaysCount }).map((_, i) => addDays(weekStart, i));
  }, [weekStart, weekDaysCount]);

  // Robust Assignees with tasks (derived from real tasks and employees list)
  const assignees = useMemo(() => {
    const map = new Map();
    let hasUnassigned = false;

    tasks.forEach(t => {
      if (t.assignedTo) {
        const id = String(t.assignedTo._id || t.assignedTo);
        if (!map.has(id)) {
          const emp = employees.find(e => String(e._id) === id);
          const name = t.assignedTo?.name || emp?.name || 'Assigned User';
          const email = t.assignedTo?.email || emp?.email || '';
          const role = t.assignedTo?.role || emp?.role || 'team';
          map.set(id, { _id: id, name, email, role });
        }
      } else {
        hasUnassigned = true;
      }
    });

    const list = Array.from(map.values());
    if (hasUnassigned || list.length === 0) {
      list.push({ _id: 'unassigned', name: 'Unassigned' });
    }
    return list;
  }, [employees, tasks]);

  // Calendar Navigation Handlers
  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentCalendarDate(today);
    setWeekStart(getStartOfWeek(today));
    setPickerMonth(today);
    setShowDatePicker(false);
  };

  const handlePrev = () => {
    if (calendarMode === 'month') {
      const newD = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1);
      setCurrentCalendarDate(newD);
    } else if (calendarMode === 'day') {
      const newD = addDays(currentCalendarDate, -1);
      setCurrentCalendarDate(newD);
    } else {
      const newStart = addDays(weekStart, -7);
      setWeekStart(newStart);
      setCurrentCalendarDate(newStart);
    }
  };

  const handleNext = () => {
    if (calendarMode === 'month') {
      const newD = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1);
      setCurrentCalendarDate(newD);
    } else if (calendarMode === 'day') {
      const newD = addDays(currentCalendarDate, 1);
      setCurrentCalendarDate(newD);
    } else {
      const newStart = addDays(weekStart, 7);
      setWeekStart(newStart);
      setCurrentCalendarDate(newStart);
    }
  };

  // Month grid generator
  const monthGridDays = useMemo(() => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days = [];
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), currentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
    return days;
  }, [pickerMonth]);

  const calendarHeaderTitle = useMemo(() => {
    if (calendarMode === 'day') {
      return currentCalendarDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (calendarMode === 'month') {
      return currentCalendarDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    }
    const firstDate = calendarDays[0];
    const lastDate = calendarDays[calendarDays.length - 1];
    if (firstDate.getMonth() === lastDate.getMonth()) {
      return `${firstDate.toLocaleDateString('default', { month: 'long' })} ${firstDate.getFullYear()}`;
    }
    return `${firstDate.toLocaleDateString('default', { month: 'short' })} - ${lastDate.toLocaleDateString('default', { month: 'short' })} ${lastDate.getFullYear()}`;
  }, [calendarMode, currentCalendarDate, calendarDays]);

  const waitingListTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchTicket = selectedTicketFilter 
        ? String(t.ticket?._id || t.ticket) === String(selectedTicketFilter) || String(t.ticket?.ticketNo) === String(selectedTicketFilter)
        : true;
      const matchSearch = waitingListSearch ? (
        (t.ticket?.subject && t.ticket.subject.toLowerCase().includes(waitingListSearch.toLowerCase())) ||
        (t.mainHeading && t.mainHeading.toLowerCase().includes(waitingListSearch.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(waitingListSearch.toLowerCase())) ||
        (t.client?.name && t.client.name.toLowerCase().includes(waitingListSearch.toLowerCase())) ||
        (t.assignedTo?.name && t.assignedTo.name.toLowerCase().includes(waitingListSearch.toLowerCase()))
      ) : true;
      return !t.dueDate && !t.dateInitiated && matchSearch && matchTicket;
    });
  }, [tasks, waitingListSearch, selectedTicketFilter]);

  // Tasks Filtered for Table View (Open vs Completed)
  const openTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchTicket = selectedTicketFilter 
        ? String(t.ticket?._id || t.ticket) === String(selectedTicketFilter) || String(t.ticket?.ticketNo) === String(selectedTicketFilter)
        : true;
      const matchSearch = searchQuery ? (
        (t.mainHeading && t.mainHeading.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.ticket?.ticketNo && String(t.ticket.ticketNo).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.assignedTo?.name && t.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.client?.name && t.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;
      return t.status !== 'Completed' && matchSearch && matchTicket;
    });
  }, [tasks, searchQuery, selectedTicketFilter]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchTicket = selectedTicketFilter 
        ? String(t.ticket?._id || t.ticket) === String(selectedTicketFilter) || String(t.ticket?.ticketNo) === String(selectedTicketFilter)
        : true;
      const matchSearch = searchQuery ? (
        (t.mainHeading && t.mainHeading.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.ticket?.ticketNo && String(t.ticket.ticketNo).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.assignedTo?.name && t.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.client?.name && t.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;
      return t.status === 'Completed' && matchSearch && matchTicket;
    });
  }, [tasks, searchQuery, selectedTicketFilter]);

  return (
    <div className="flex h-screen w-full bg-[#131417] text-[#e1e4ea] font-sans overflow-hidden select-none" style={{ minHeight: '100vh' }}>
      
      {isSidebarOpen && (
        <>
          {/* ═══════════════════════════════════════════════════════════════
              PANEL 1: BORDIO PRIMARY LEFT SIDEBAR (My work, Projects, Teams)
             ═══════════════════════════════════════════════════════════════ */}
          <aside className="w-48 shrink-0 bg-[#121316] border-r border-[#202226] flex flex-col p-3 z-20">
            {/* Search in Left Sidebar */}
        <div className="relative flex items-center mb-3">
          <Search size={14} className="absolute left-2.5 text-[#737885]" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#1c1d22] text-xs text-[#e1e4ea] placeholder-[#737885] pl-8 pr-2.5 py-1.5 rounded-lg border border-[#282a30] outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Primary Navigation Items */}
        <nav className="space-y-1 mb-4">
          <button 
            onClick={() => setPrimaryNav('my_work')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              primaryNav === 'my_work' 
                ? 'bg-[#25272e] text-white shadow-sm font-semibold' 
                : 'text-[#8c919c] hover:bg-[#1c1d22] hover:text-white'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span>My work</span>
          </button>

          <button 
            onClick={() => {
              setPrimaryNav('all_projects');
              setSelectedTicketFilter(null);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              primaryNav === 'all_projects' && !selectedTicketFilter
                ? 'bg-[#25272e] text-white shadow-sm font-semibold' 
                : 'text-[#8c919c] hover:bg-[#1c1d22] hover:text-white'
            }`}
          >
            <Briefcase size={15} className={primaryNav === 'all_projects' && !selectedTicketFilter ? 'text-blue-400' : 'text-[#737885]'} />
            <span>All tickets</span>
          </button>

        </nav>


        {/* Collapsible Section: Tickets (Projects) */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 text-[#8c919c] hover:text-white cursor-pointer group">
            <div 
              className="flex items-center gap-1 text-xs font-semibold"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
            >
              {projectsExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>Tickets</span>
              <span className="text-[10px] text-[#5e6370] font-normal">({allTickets.length})</span>
            </div>
            <button 
              onClick={() => openDrawer()}
              className="opacity-60 group-hover:opacity-100 hover:text-white text-[#737885] p-0.5 rounded"
              title="Add task for ticket"
            >
              <Plus size={13} />
            </button>
          </div>
          {projectsExpanded && (
            <div className="pl-2 pr-1 py-1 space-y-0.5">
              {/* All Tickets Option */}
              <div 
                onClick={() => setSelectedTicketFilter(null)}
                className={`flex items-center gap-2 py-1 px-1.5 text-[11px] rounded truncate cursor-pointer transition-colors ${
                  !selectedTicketFilter 
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30' 
                    : 'text-[#8c919c] hover:text-white hover:bg-[#1a1b1f]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${!selectedTicketFilter ? 'bg-blue-400' : 'bg-[#5e6370]'}`}></span>
                <span className="truncate">All Tickets</span>
              </div>

              {allTickets.map(tkt => {
                const isSelected = selectedTicketFilter === tkt._id;
                const label = tkt.ticketNo ? `#${tkt.ticketNo}` : 'Ticket';
                const sub = tkt.subject || tkt.service || tkt.client?.name || '';
                return (
                  <div 
                    key={tkt._id} 
                    onClick={() => setSelectedTicketFilter(isSelected ? null : tkt._id)}
                    className={`flex items-center gap-2 py-1 px-1.5 text-[11px] rounded truncate cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30' 
                        : 'text-[#8c919c] hover:text-white hover:bg-[#1a1b1f]'
                    }`}
                    title={`${label} - ${sub}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-blue-400' : 'bg-emerald-500'}`}></span>
                    <span className="truncate font-medium">{label} {sub ? `• ${sub}` : ''}</span>
                  </div>
                );
              })}

              {allTickets.length === 0 && (
                <div className="text-[10px] text-[#5e6370] py-1 italic pl-2">No tickets found</div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
          PANEL 2: BORDIO "TOOLS" SUB-SIDEBAR (Tasks, Calendar, Notes)
         ═══════════════════════════════════════════════════════════════ */}
      <aside className="w-40 shrink-0 bg-[#16171b] border-r border-[#202226] flex flex-col p-2.5 z-10">
        <div className="text-[11px] font-bold text-[#737885] uppercase tracking-wider px-2.5 py-1.5 mb-1">
          Tools
        </div>

        <div className="space-y-1">
          {/* Tasks Tool */}
          <button 
            onClick={() => setActiveTool('tasks')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              activeTool === 'tasks' 
                ? 'bg-[#25272e] text-white font-semibold shadow-sm border border-[#2e313b]' 
                : 'text-[#8c919c] hover:bg-[#1c1d22] hover:text-white'
            }`}
          >
            <CheckSquare size={15} className={activeTool === 'tasks' ? 'text-blue-400' : 'text-[#737885]'} />
            <span>Tasks</span>
          </button>

          {/* Calendar Tool */}
          <button 
            onClick={() => setActiveTool('calendar')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              activeTool === 'calendar' 
                ? 'bg-[#25272e] text-white font-semibold shadow-sm border border-[#2e313b]' 
                : 'text-[#8c919c] hover:bg-[#1c1d22] hover:text-white'
            }`}
          >
            <CalendarIcon size={15} className={activeTool === 'calendar' ? 'text-blue-400' : 'text-[#737885]'} />
            <span>Calendar</span>
          </button>

          {/* Notes Tool */}
          <button 
            onClick={() => setActiveTool('notes')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              activeTool === 'notes' 
                ? 'bg-[#25272e] text-white font-semibold shadow-sm border border-[#2e313b]' 
                : 'text-[#8c919c] hover:bg-[#1c1d22] hover:text-white'
            }`}
          >
            <FileText size={15} className={activeTool === 'notes' ? 'text-blue-400' : 'text-[#737885]'} />
            <span>Notes</span>
          </button>
        </div>
      </aside>
      </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MAIN WORKSPACE AREA (TOPBAR + CONTENT VIEW)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#141518] overflow-hidden">
        
        {/* TOP BAR matching Bordio Screenshot */}
        <header className="h-12 shrink-0 bg-[#16171b] border-b border-[#202226] flex items-center justify-between px-4 gap-3 z-10">
          <div className="flex items-center gap-2.5">
            {/* Sidebar Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-[#8c919c] hover:text-white hover:bg-[#202227] rounded-md transition-colors mr-1"
              title="Toggle sidebar"
            >
              <PanelLeft size={16} />
            </button>

            {/* "+ Add new" vibrant blue pill button */}
            <button 
              onClick={() => openDrawer()}
              className="bg-[#1d72f2] hover:bg-[#1a64d4] text-white font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Plus size={15} />
              <span>Add new</span>
            </button>

            {/* If in Tasks Tool: Table View & Kanban Board switchers */}
            {activeTool === 'tasks' && (
              <div className="flex items-center bg-[#1c1d22] p-0.5 rounded-lg border border-[#25272e]">
                <button 
                  onClick={() => setTasksView('table')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    tasksView === 'table' 
                      ? 'bg-[#25272e] text-white shadow-sm border border-[#30333c]' 
                      : 'text-[#8c919c] hover:text-white'
                  }`}
                >
                  <List size={14} />
                  <span>Table view</span>
                </button>

                <button 
                  onClick={() => setTasksView('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    tasksView === 'kanban' 
                      ? 'bg-[#25272e] text-white shadow-sm border border-[#30333c]' 
                      : 'text-[#8c919c] hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Kanban board</span>
                </button>

                <button 
                  className="p-1 text-[#8c919c] hover:text-white hover:bg-[#25272e] rounded-md transition-colors ml-0.5" 
                  title="Filter options"
                >
                  <SlidersHorizontal size={13} />
                </button>
              </div>
            )}

            {/* If in Calendar Tool: Bordio Calendar controls */}
            {activeTool === 'calendar' && (
              <div className="flex items-center gap-2" ref={datePickerRef}>
                <div className="flex items-center bg-[#1c1d22] p-0.5 rounded-lg border border-[#25272e]">
                  <button 
                    onClick={() => setCalendarMode('week')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${calendarMode === 'week' ? 'bg-[#25272e] text-white' : 'text-[#8c919c] hover:text-white'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setCalendarMode('month')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${calendarMode === 'month' ? 'bg-[#25272e] text-white' : 'text-[#8c919c] hover:text-white'}`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setCalendarMode('day')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${calendarMode === 'day' ? 'bg-[#25272e] text-white' : 'text-[#8c919c] hover:text-white'}`}
                  >
                    Day
                  </button>
                  {calendarMode === 'week' && (
                    <button 
                      onClick={() => setWeekDaysCount(weekDaysCount === 7 ? 5 : 7)}
                      className="px-2 py-0.5 text-[10px] text-blue-400 font-bold border-l border-[#282a30]"
                    >
                      {weekDaysCount}d
                    </button>
                  )}
                </div>

                {/* Today Jump & Navigation */}
                <div className="flex items-center gap-1 bg-[#1c1d22] px-2 py-1 rounded-lg border border-[#25272e]">
                  <button onClick={handleJumpToToday} className="text-xs font-semibold text-[#8c919c] hover:text-white px-1">
                    Today
                  </button>
                  <button onClick={handlePrev} className="text-[#8c919c] hover:text-white p-0.5">
                    <ChevronLeft size={14}/>
                  </button>
                  <button onClick={handleNext} className="text-[#8c919c] hover:text-white p-0.5">
                    <ChevronRight size={14}/>
                  </button>
                  <span className="text-xs font-bold text-[#e1e4ea] px-1 border-l border-[#282a30]">
                    {calendarHeaderTitle}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Controls: Search, Notifications, Profile Avatar */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-[#737885]" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-40 bg-[#1c1d22] text-xs text-[#e1e4ea] placeholder-[#737885] pl-8 pr-2.5 py-1 rounded-full border border-[#282a30] outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative notification-dropdown-container">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-[#8c919c] hover:text-white p-1 rounded-full hover:bg-[#202227] transition-colors" 
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#16171b] border border-[#202226] rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#202226]">
                    <span className="font-bold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div key={notif._id} className={`p-4 border-b border-[#202226] transition-colors hover:bg-[#1a1b20] ${!notif.isRead ? 'bg-[#1c1d22]' : ''}`}>
                        <div className="text-xs font-semibold text-[#e1e4ea] mb-1">{notif.title}</div>
                        <div className="text-[11px] text-[#8c919c]">{notif.message}</div>
                        <div className="text-[10px] text-[#5e6370] mt-2">{new Date(notif.createdAt).toLocaleString()}</div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-xs text-[#5e6370]">No recent notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>


          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
            MAIN CONTENT VIEWS:
            1. Table View (AS SHOWN IN USER SCREENSHOT)
            2. Kanban Board View
            3. Calendar View (Week / Month / Day + Waiting list)
            4. Notes View
           ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-auto bg-[#141518]">

          {/* ── 1. TABLE VIEW (Exact Bordio Screenshot Structure with Dynamic Column Menu) ── */}
          {activeTool === 'tasks' && tasksView === 'table' && (() => {
            const visibleColumns = tableColumns.filter(c => !hiddenColumns.includes(c.id));
            const gridColsStyle = { gridTemplateColumns: `36px ${visibleColumns.map(c => c.width).join(' ')} 36px` };
            const sortedOpenTasks = sortTasks(openTasks);
            const sortedCompletedTasks = sortTasks(completedTasks);

            const renderTableCell = (task, colId, isCompleted = false) => {
              switch (colId) {
                case 'title':
                  return (
                    <div className={`font-medium truncate pr-3 group-hover:text-blue-400 transition-colors ${isCompleted ? 'text-[#8c919c] line-through' : 'text-[#f1f3f7]'}`}>
                      {task.mainHeading || task.description || task.ticket?.subject || 'Untitled task'}
                    </div>
                  );
                case 'status':
                  return (
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : getStatusBadge(task.status)
                      }`}>
                        {isCompleted ? 'Completed' : (task.status || 'Active')}
                      </span>
                    </div>
                  );
                case 'type':
                  return (
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTypeBadge(task.type)}`}>
                        {task.type || 'Service'}
                      </span>
                    </div>
                  );
                case 'dueDate':
                  return (
                    <div className={`text-[11px] flex items-center gap-1.5 truncate ${isCompleted ? 'text-[#737885]' : 'text-[#8c919c]'}`}>
                      <CalendarIcon size={12} className="text-[#5e6370] shrink-0" />
                      <span>{formatDisplayDate(task.dateCompleted || task.dateInitiated || task.dueDate) || '-'}</span>
                    </div>
                  );
                case 'priority':
                  return (
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.tags?.[0] === 'Urgent' || task.tags?.[0] === 'High' ? 'bg-red-500/15 text-red-400' :
                        task.tags?.[0] === 'Medium' ? 'bg-amber-500/15 text-amber-400' :
                        task.tags?.[0] === 'Low' ? 'bg-blue-500/15 text-blue-400' :
                        'text-[#737885]'
                      }`}>
                        {task.tags?.[0] || 'None'}
                      </span>
                    </div>
                  );
                case 'assignee':
                  return (
                    <div className="truncate">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                            {task.assignedTo.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className={`font-semibold truncate text-[11px] ${isCompleted ? 'text-[#8c919c]' : 'text-[#e1e4ea]'}`}>
                            {task.assignedTo.name || 'Assigned'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#5e6370] italic text-[11px]">Unassigned</span>
                      )}
                    </div>
                  );
                case 'estimatedTime':
                  return (
                    <div className={`text-[11px] ${isCompleted ? 'text-[#737885]' : 'text-[#8c919c]'}`}>
                      {task.estimatedTimeHours ? `${task.estimatedTimeHours}h` : '1h'}
                    </div>
                  );
                case 'loggedTime':
                  return (
                    <div className={`text-[11px] font-mono ${isCompleted ? 'text-[#737885]' : 'text-[#8c919c]'}`}>
                      {task.spentTimeHours ? `${task.spentTimeHours}h` : '0h'}
                    </div>
                  );
                case 'ticket':
                  return (
                    <div className={`truncate font-mono text-[11px] ${isCompleted ? 'text-[#737885]' : 'text-blue-400 font-semibold'}`}>
                      {task.ticket?.ticketNo ? `#${task.ticket.ticketNo}` : (task.client?.name || '-')}
                    </div>
                  );
                default:
                  return null;
              }
            };

            const renderTableHeader = () => (
              <div 
                style={gridColsStyle}
                className="grid items-center px-4 py-2.5 border-b border-[#202226] text-xs font-semibold text-[#8c919c] bg-[#17181c] rounded-t-xl select-none"
              >
                <div></div>
                {visibleColumns.map((col, cIdx) => (
                  <div key={col.id} className="relative column-menu-container">
                    <div 
                      onClick={() => setActiveColumnMenu(activeColumnMenu === col.id ? null : col.id)}
                      className={`flex items-center gap-1.5 cursor-pointer py-1 px-1.5 -ml-1.5 rounded-md hover:bg-[#202228] transition-colors group ${
                        activeColumnMenu === col.id ? 'bg-[#202228] text-white' : 'text-[#8c919c] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{col.label}</span>
                      {sortConfig?.key === col.id && (
                        <span className="text-blue-400 font-bold ml-0.5">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                      <ChevronDown 
                        size={13} 
                        className={`text-[#6b7280] group-hover:text-white transition-colors shrink-0 ${activeColumnMenu === col.id ? 'text-white' : ''}`} 
                      />
                    </div>

                    {/* Context Menu matching User Screenshot EXACTLY */}
                    {activeColumnMenu === col.id && (
                      <div 
                        className={`absolute top-full mt-1.5 z-50 w-52 bg-[#222429] border border-[#34373f] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.65)] py-1.5 text-left font-normal animate-in fade-in ${
                          cIdx >= visibleColumns.length - 2 ? 'right-0' : 'left-0'
                        }`}
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Sort descending */}
                        <button
                          type="button"
                          onClick={() => {
                            if (sortConfig?.key === col.id && sortConfig.direction === 'desc') {
                              setSortConfig(null);
                            } else {
                              setSortConfig({ key: col.id, direction: 'desc' });
                            }
                            setActiveColumnMenu(null);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left transition-colors ${
                            sortConfig?.key === col.id && sortConfig.direction === 'desc' 
                              ? 'bg-[#1b2b40] text-sky-400 font-semibold' 
                              : 'text-[#e5e7eb] hover:bg-[#2c2f37]'
                          }`}
                        >
                          <ArrowDown size={16} strokeWidth={1.75} className={sortConfig?.key === col.id && sortConfig.direction === 'desc' ? 'text-sky-400' : 'text-[#9ca3af]'} />
                          <span>Sort descending</span>
                        </button>

                        {/* Sort ascending */}
                        <button
                          type="button"
                          onClick={() => {
                            if (sortConfig?.key === col.id && sortConfig.direction === 'asc') {
                              setSortConfig(null);
                            } else {
                              setSortConfig({ key: col.id, direction: 'asc' });
                            }
                            setActiveColumnMenu(null);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left transition-colors ${
                            sortConfig?.key === col.id && sortConfig.direction === 'asc' 
                              ? 'bg-[#1b2b40] text-sky-400 font-semibold' 
                              : 'text-[#e5e7eb] hover:bg-[#2c2f37]'
                          }`}
                        >
                          <ArrowUp size={16} strokeWidth={1.75} className={sortConfig?.key === col.id && sortConfig.direction === 'asc' ? 'text-sky-400' : 'text-[#9ca3af]'} />
                          <span>Sort ascending</span>
                        </button>

                        <div className="border-t border-[#34373f] my-1"></div>

                        {/* Move left */}
                        <button
                          type="button"
                          onClick={() => handleMoveColumnLeft(col.id)}
                          disabled={cIdx === 0}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left transition-colors ${
                            cIdx === 0 
                              ? 'text-[#505462] cursor-not-allowed opacity-50' 
                              : 'text-[#e5e7eb] hover:bg-[#2c2f37]'
                          }`}
                        >
                          <ArrowLeft size={16} strokeWidth={1.75} className={cIdx === 0 ? 'text-[#505462]' : 'text-[#9ca3af]'} />
                          <span>Move left</span>
                        </button>

                        {/* Move right */}
                        <button
                          type="button"
                          onClick={() => handleMoveColumnRight(col.id)}
                          disabled={cIdx === visibleColumns.length - 1}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left transition-colors ${
                            cIdx === visibleColumns.length - 1 
                              ? 'text-[#505462] cursor-not-allowed opacity-50' 
                              : 'text-[#e5e7eb] hover:bg-[#2c2f37]'
                          }`}
                        >
                          <ArrowRight size={16} strokeWidth={1.75} className={cIdx === visibleColumns.length - 1 ? 'text-[#505462]' : 'text-[#9ca3af]'} />
                          <span>Move right</span>
                        </button>

                        <div className="border-t border-[#34373f] my-1"></div>

                        {/* Hide column */}
                        <button
                          type="button"
                          onClick={() => handleHideColumn(col.id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#e5e7eb] hover:bg-[#2c2f37] text-left transition-colors"
                        >
                          <EyeOff size={16} strokeWidth={1.75} className="text-[#9ca3af]" />
                          <span>Hide column</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Settings icon to customize & restore columns */}
                <div className="text-right relative column-settings-container">
                  <button 
                    type="button"
                    onClick={() => setShowColumnSettings(!showColumnSettings)}
                    className="p-1 hover:bg-[#202228] rounded text-[#737885] hover:text-white transition-colors inline-block"
                    title="Customize columns"
                  >
                    <Settings size={13} />
                  </button>

                  {showColumnSettings && (
                    <div 
                      className="absolute top-full right-0 mt-1 z-50 w-56 bg-[#1f2026] border border-[#2d3038] rounded-xl shadow-2xl p-2.5 text-xs text-left animate-in fade-in"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d3038]">
                        <span className="font-bold text-white text-xs">Visible Columns</span>
                        <button 
                          type="button" 
                          onClick={resetTableColumns}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {tableColumns.map(col => {
                          const isVisible = !hiddenColumns.includes(col.id);
                          return (
                            <label 
                              key={col.id} 
                              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#282a32] cursor-pointer text-[#e1e4ea]"
                            >
                              <span className="font-medium text-xs">{col.label}</span>
                              <input 
                                type="checkbox"
                                checked={isVisible}
                                disabled={col.id === 'title'}
                                onChange={() => toggleColumnVisibility(col.id)}
                                className="rounded border-[#2d3038] accent-blue-600 cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );

            return (
              <div className="p-6 max-w-[1600px] mx-auto space-y-6">
                
                {/* Active Ticket Filter Banner */}
                {selectedTicketFilter && (
                  <div className="flex items-center justify-between bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2.5 text-xs text-blue-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span>
                        Filtered by Ticket: <strong className="text-white font-mono">#{allTickets.find(t => t._id === selectedTicketFilter)?.ticketNo || selectedTicketFilter}</strong>
                        {allTickets.find(t => t._id === selectedTicketFilter)?.subject ? ` - ${allTickets.find(t => t._id === selectedTicketFilter).subject}` : ''}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedTicketFilter(null)}
                      className="flex items-center gap-1 bg-[#202227] hover:bg-[#25272e] text-white px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
                    >
                      <X size={12} /> Clear filter (Show all)
                    </button>
                  </div>
                )}

                {/* Section 1: OPEN TASKS */}
                <div className="space-y-2">
                  <div 
                    className="flex items-center gap-2 cursor-pointer text-[#e1e4ea] hover:text-white select-none py-1 group"
                    onClick={() => setOpenTasksExpanded(!openTasksExpanded)}
                  >
                    <span className="text-[#8c919c] group-hover:text-white transition-transform">
                      {openTasksExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                    <span className="font-bold text-sm tracking-wide">Open tasks</span>
                    <span className="bg-[#22242b] text-[#8c919c] text-xs font-bold px-2 py-0.5 rounded-full">
                      {openTasks.length}
                    </span>
                  </div>

                  {openTasksExpanded && (
                    <div className="border border-[#202226] rounded-xl bg-[#16171a] shadow-sm w-fit min-w-full">
                      {/* Dynamic Table Header with Column Menu */}
                      {renderTableHeader()}

                      {/* "+ Create task" inline row immediately below header */}
                      {!showInlineCreate ? (
                        <div 
                          onClick={() => setShowInlineCreate(true)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#737885] hover:text-blue-400 hover:bg-[#1a1b20] cursor-pointer border-b border-[#202226] transition-colors"
                        >
                          <Plus size={14} className="text-blue-500" />
                          <span className="font-medium">Create task</span>
                        </div>
                      ) : (
                        <form onSubmit={handleQuickCreateSubmit} className="flex items-center gap-2 px-4 py-2 border-b border-[#202226] bg-[#1a1b20]">
                          <div className="w-4 h-4 border border-[#3e424d] rounded shrink-0"></div>
                          <input 
                            type="text"
                            autoFocus
                            placeholder="Task title (press Enter to create or Esc to cancel)..."
                            value={inlineTaskTitle}
                            onChange={e => setInlineTaskTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Escape') setShowInlineCreate(false);
                            }}
                            className="flex-1 bg-transparent text-xs text-white placeholder-[#737885] outline-none"
                          />
                          <button type="submit" className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded font-bold hover:bg-blue-700">Add</button>
                          <button type="button" onClick={() => setShowInlineCreate(false)} className="text-xs text-[#737885] hover:text-white px-2">Cancel</button>
                        </form>
                      )}

                      {/* Open Tasks List with Dynamic Columns */}
                      <div className="divide-y divide-[#202226]">
                        {sortedOpenTasks.map(task => (
                          <div 
                            key={task._id} 
                            onClick={() => openDrawer(task)}
                            style={gridColsStyle}
                            className="grid items-center px-4 py-2.5 text-xs hover:bg-[#1c1d22] cursor-pointer transition-colors group"
                          >
                            {/* Checkbox */}
                            <div onClick={(e) => handleToggleTaskStatus(task, e)}>
                              <div className="w-4 h-4 rounded border border-[#3e424d] group-hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors bg-[#131417]">
                                {task.status === 'Completed' && <Check size={11} className="text-emerald-400" />}
                              </div>
                            </div>

                            {/* Visible Columns */}
                            {visibleColumns.map(col => (
                              <div key={col.id} className="min-w-0">
                                {renderTableCell(task, col.id, false)}
                              </div>
                            ))}

                            {/* Actions */}
                            <div className="text-right">
                              <MoreHorizontal size={14} className="text-[#5e6370] hover:text-white inline" />
                            </div>
                          </div>
                        ))}

                        {openTasks.length === 0 && !showInlineCreate && (
                          <div className="p-8 text-center text-[#5e6370] text-xs">
                            No open tasks found. Click "+ Create task" above to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: COMPLETED TASKS */}
                {completedTasks.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div 
                      className="flex items-center gap-2 cursor-pointer text-[#8c919c] hover:text-white select-none py-1 group"
                      onClick={() => setCompletedTasksExpanded(!completedTasksExpanded)}
                    >
                      <span className="text-[#737885] group-hover:text-white transition-transform">
                        {completedTasksExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </span>
                      <span className="font-bold text-sm tracking-wide">Completed tasks</span>
                      <span className="bg-[#22242b] text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {completedTasks.length}
                      </span>
                    </div>

                    {completedTasksExpanded && (
                      <div className="border border-[#202226] rounded-xl bg-[#16171a]/70 shadow-sm w-fit min-w-full">
                        {/* Dynamic Table Header for Completed Tasks as well */}
                        {renderTableHeader()}

                        <div className="divide-y divide-[#202226]">
                          {sortedCompletedTasks.map(task => (
                            <div 
                              key={task._id} 
                              onClick={() => openDrawer(task)}
                              style={gridColsStyle}
                              className="grid items-center px-4 py-2.5 text-xs hover:bg-[#1c1d22] cursor-pointer transition-colors opacity-70 hover:opacity-100 group"
                            >
                              <div onClick={(e) => handleToggleTaskStatus(task, e)}>
                                <div className="w-4 h-4 rounded border border-emerald-500 bg-emerald-500/20 flex items-center justify-center cursor-pointer">
                                  <Check size={11} className="text-emerald-400" />
                                </div>
                              </div>

                              {visibleColumns.map(col => (
                                <div key={col.id} className="min-w-0">
                                  {renderTableCell(task, col.id, true)}
                                </div>
                              ))}

                              <div className="text-right">
                                <MoreHorizontal size={14} className="text-[#5e6370] hover:text-white inline" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })()}

          {/* ── 2. KANBAN BOARD VIEW ── */}
          {activeTool === 'tasks' && tasksView === 'kanban' && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex h-full p-6 gap-5 min-w-max">
                {Object.values(COLUMNS).map((column) => {
                  const columnTasks = getTasksByColumn(column.id);
                  return (
                    <div key={column.id} className="w-[330px] flex flex-col">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#f1f3f7] text-xs uppercase tracking-wider">{column.title}</h3>
                          <span className="bg-[#25272e] text-[#8c919c] text-xs font-bold py-0.5 px-2 rounded-full">
                            {columnTasks.length}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setFormData(prev => ({ ...prev, status: column.id }));
                            openDrawer();
                          }}
                          className="p-1 text-[#8c919c] hover:text-white rounded-md hover:bg-[#202227] transition-colors"
                        >
                          <Plus size={15}/>
                        </button>
                      </div>

                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 min-h-[300px] rounded-2xl p-2 transition-colors border border-[#202226] ${snapshot.isDraggingOver ? 'bg-[#1f2128]' : 'bg-[#16171a]'}`}
                          >
                            {columnTasks.map((task, index) => (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => openDrawer(task)}
                                    className={`mb-3 p-3.5 rounded-xl border border-[#282a32] bg-[#1c1d22] text-[#f1f3f7] shadow-sm cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-lg ${snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105 z-50 border-blue-500' : ''}`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getTypeBadge(task.type)}`}>
                                        {task.type || 'Service'}
                                      </span>
                                      <div 
                                        className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                                        title={task.assignedTo?.name || 'Unassigned'}
                                      >
                                        {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                                      </div>
                                    </div>

                                    <h4 className="font-bold text-[#f1f3f7] text-xs mb-2 leading-snug">
                                      {task.mainHeading || task.description || task.ticket?.subject || 'Task'}
                                    </h4>

                                    {/* Assignee & Client Badges */}
                                    <div className="my-2 p-2 bg-[#141518] rounded-lg border border-[#24262e] text-[10px] space-y-1">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="font-extrabold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded text-[9px] shrink-0">👤 Assigned To</span>
                                        <span className="font-semibold text-[#e1e4ea] truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded text-[9px] shrink-0">🏢 Client</span>
                                        <span className="font-semibold text-[#e1e4ea] truncate">{task.client?.name || 'Client'}</span>
                                      </div>
                                      {task.ticket?.ticketNo && (
                                        <div className="text-[9px] text-blue-400 font-mono font-semibold truncate pt-1 border-t border-[#24262e]">
                                          🎫 TIC #{task.ticket.ticketNo}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-[#24262e] text-[10px] text-[#737885]">
                                      <span>Init: {task.dateInitiated ? new Date(task.dateInitiated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</span>
                                      {task.dateCompleted && (
                                        <span className="text-emerald-400 font-bold">Done: {new Date(task.dateCompleted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}

          {/* ── 3. CALENDAR VIEW (Bordio Week / Month / Day + Waiting List) ── */}
          {activeTool === 'calendar' && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex h-full min-w-max">
                
                {/* 1. WEEK VIEW */}
                {calendarMode === 'week' && (
                  <div className="flex-1 flex flex-col overflow-x-auto">
                    {/* Header Row */}
                    <div className="flex border-b border-[#202226] sticky top-0 bg-[#16171b] z-10">
                      <div className="w-48 p-3 shrink-0 border-r border-[#202226] flex flex-col justify-center">
                        <span className="text-xs font-bold text-[#737885] uppercase tracking-wider">Responsible</span>
                      </div>

                      {calendarDays.map((day, idx) => {
                        const isCurrentDay = isToday(day);
                        const dateStr = toLocalDateStr(day);
                        const dayTasksCount = tasks.filter(t => (t.dueDate && toLocalDateStr(t.dueDate) === dateStr) || (t.dateInitiated && toLocalDateStr(t.dateInitiated) === dateStr)).length;

                        return (
                          <div 
                            key={idx} 
                            className={`flex-1 min-w-[210px] p-2.5 text-center border-r border-[#202226] transition-colors ${isCurrentDay ? 'bg-blue-500/10' : ''}`}
                          >
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              <span className={`text-xs font-bold ${isCurrentDay ? 'text-blue-400' : 'text-[#f1f3f7]'}`}>
                                {day.getDate()} {day.toLocaleString('default', { weekday: 'short' })}
                              </span>
                              {isCurrentDay && (
                                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#737885]">
                              {dayTasksCount > 0 ? `${dayTasksCount} tasks` : '-'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Assignee Rows */}
                    <div className="flex-1 divide-y divide-[#202226] overflow-y-auto">
                      {assignees.map((assignee) => {
                        return (
                          <div key={assignee._id} className="flex min-h-[140px] hover:bg-[#16171c]/50 transition-colors">
                            {/* Responsible Column */}
                            <div className="w-48 p-3 shrink-0 border-r border-[#202226] bg-[#141518] flex items-start gap-2 sticky left-0 z-10">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {assignee.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-xs font-bold text-[#f1f3f7] truncate">{assignee.name}</div>
                                <div className="text-[10px] text-[#737885] truncate">{assignee.role || (assignee._id === 'unassigned' ? 'Unassigned tasks' : 'Team member')}</div>
                              </div>
                            </div>
                            
                            {/* Day Cells */}
                            {calendarDays.map((day) => {
                              const dateStr = toLocalDateStr(day);
                              const dropId = `cal_${assignee._id}_${dateStr}`;
                              const isCurrentDay = isToday(day);
                              
                              const cellTasks = tasks.filter(t => {
                                const tDate = t.dueDate ? toLocalDateStr(t.dueDate) : (t.dateInitiated ? toLocalDateStr(t.dateInitiated) : null);
                                const tAssigneeId = String(t.assignedTo?._id || (typeof t.assignedTo === 'string' ? t.assignedTo : '') || 'unassigned');
                                const assigneeId = String(assignee._id);
                                return tDate === dateStr && tAssigneeId === assigneeId;
                              });

                              return (
                                <Droppable key={dropId} droppableId={dropId}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`flex-1 min-w-[210px] p-2 border-r border-[#202226] min-h-[140px] transition-colors relative group/cell ${isCurrentDay ? 'bg-blue-500/5' : ''} ${snapshot.isDraggingOver ? 'bg-blue-500/20' : ''}`}
                                    >
                                      <button
                                        onClick={() => openDrawer(null, day)}
                                        className="opacity-0 group-hover/cell:opacity-100 absolute top-1 right-1 p-1 bg-[#202227] hover:bg-blue-600 text-[#8c919c] hover:text-white rounded border border-[#282a30] transition-all z-10"
                                        title="Add task"
                                      >
                                        <Plus size={11} />
                                      </button>

                                      {cellTasks.map((task, tIndex) => (
                                        <Draggable key={task._id} draggableId={task._id} index={tIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              onClick={() => openDrawer(task)}
                                              className={`mb-2 p-2.5 rounded-lg border border-[#282a32] bg-[#1c1d22] text-[#f1f3f7] shadow-sm cursor-pointer transition-all hover:border-blue-500/60 ${snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105 z-50 border-blue-500' : ''}`}
                                            >
                                              <div className="flex items-center justify-between mb-1">
                                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${getTypeBadge(task.type)}`}>
                                                  {task.type || 'Service'}
                                                </span>
                                              </div>

                                              <div className="font-bold text-[#f1f3f7] text-xs mb-1.5 leading-snug truncate">
                                                {task.mainHeading || task.description || 'Task'}
                                              </div>

                                              <div className="text-[10px] space-y-0.5 text-[#8c919c] p-1 bg-[#141518] rounded border border-[#24262e]">
                                                <div className="truncate text-blue-400 font-semibold">👤 {task.assignedTo?.name || 'Unassigned'}</div>
                                                <div className="truncate text-emerald-400 font-semibold">🏢 {task.client?.name || 'Client'}</div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. MONTH VIEW */}
                {calendarMode === 'month' && (
                  <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="grid grid-cols-7 border-b border-[#202226] pb-2 mb-2 text-center text-xs font-bold text-[#737885] uppercase">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 auto-rows-fr">
                      {monthGridDays.map(({ date, currentMonth }, idx) => {
                        const dateStr = toLocalDateStr(date);
                        const dayTasks = tasks.filter(t => (t.dueDate && toLocalDateStr(t.dueDate) === dateStr) || (t.dateInitiated && toLocalDateStr(t.dateInitiated) === dateStr));

                        return (
                          <div 
                            key={idx}
                            className={`min-h-[110px] rounded-xl border p-2 flex flex-col transition-all relative group/mcell
                              ${!currentMonth ? 'bg-[#16171b]/40 border-[#1f2025] opacity-40' : 'bg-[#18191d] border-[#22242b] hover:border-blue-500/50'}
                            `}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <button onClick={() => openDrawer(null, date)} className="opacity-0 group-hover/mcell:opacity-100 text-[#737885] hover:text-white">
                                <Plus size={11} />
                              </button>
                              <span className="text-xs font-bold text-[#e1e4ea]">{date.getDate()}</span>
                            </div>
                            <div className="space-y-1 overflow-y-auto">
                              {dayTasks.slice(0, 2).map(tk => (
                                <div key={tk._id} onClick={() => openDrawer(tk)} className="p-1 rounded bg-[#202227] text-[10px] truncate border border-[#282a32] cursor-pointer">
                                  <span className="text-blue-400 font-bold">{tk.mainHeading || 'Task'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. DAY VIEW */}
                {calendarMode === 'day' && (
                  <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto">
                    <h2 className="text-lg font-bold text-[#f1f3f7] mb-4">
                      {currentCalendarDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    <div className="space-y-2">
                      {tasks.filter(t => (t.dueDate && toLocalDateStr(t.dueDate) === toLocalDateStr(currentCalendarDate)) || (t.dateInitiated && toLocalDateStr(t.dateInitiated) === toLocalDateStr(currentCalendarDate))).map(task => (
                        <div key={task._id} onClick={() => openDrawer(task)} className="p-3.5 rounded-xl border border-[#25272e] bg-[#18191d] flex items-center justify-between cursor-pointer hover:border-blue-500">
                          <div className="font-bold text-[#f1f3f7] text-xs">{task.mainHeading || 'Task'}</div>
                          <div className="text-xs text-blue-400">👤 {task.assignedTo?.name || 'Unassigned'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bordio Waiting List Sidebar */}
                <div className="w-72 border-l border-[#202226] bg-[#16171b] flex flex-col shrink-0 h-full">
                  <div className="p-3 border-b border-[#202226] flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#f1f3f7]">
                      Waiting list
                      <span className="bg-[#22242b] text-[#8c919c] text-[10px] px-1.5 py-0.2 rounded-full">
                        {waitingListTasks.length}
                      </span>
                    </div>
                    <button onClick={() => openDrawer()} className="text-[#737885] hover:text-white p-1">
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <Droppable droppableId="cal_waiting">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-500/10' : ''}`}
                      >
                        {waitingListTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openDrawer(task)}
                                className={`mb-2.5 p-2.5 rounded-lg border border-[#282a32] bg-[#1c1d22] text-xs cursor-pointer hover:border-blue-500 ${snapshot.isDragging ? 'shadow-xl rotate-1 scale-105 z-50 border-blue-500' : ''}`}
                              >
                                <div className="font-bold text-[#f1f3f7] truncate mb-1">{task.mainHeading || 'Task'}</div>
                                <div className="text-[10px] text-blue-400 truncate">👤 {task.assignedTo?.name || 'Unassigned'}</div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {waitingListTasks.length === 0 && (
                          <div className="text-center py-8 text-[11px] text-[#5e6370]">
                            No waiting tasks. Drag any task here to unschedule.
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          )}

          {/* ── 4. NOTES VIEW ── */}
          {activeTool === 'notes' && (
            <div className="p-8 max-w-4xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-[#f1f3f7] flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                <span>Notes & Scratchpad</span>
              </h2>
              <div className="p-4 rounded-xl border border-[#202226] bg-[#16171b] space-y-3">
                <textarea 
                  rows={10} 
                  placeholder="Type meeting notes, quick ideas, or scratchpad text..." 
                  className="w-full bg-transparent text-xs text-[#e1e4ea] outline-none resize-y placeholder-[#5e6370]"
                />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BORDIO SLIDE-OVER DRAWER FOR ADD / EDIT TASK
         ═══════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════
          BORDIO EXACT TASK DETAILS DRAWER (Matching User Screenshot)
         ═══════════════════════════════════════════════════════════════ */}
      {isDrawerOpen && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          task={selectedTask}
          onSave={fetchTasks}
        />
      )}

    </div>
  );
};

export default TaskBoard;

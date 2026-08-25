import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import {
  Home,
  Shield,
  Briefcase,
  BarChart3,
  FileText,
  Activity,
  LogOut,
  Box,
  Wrench,
  TrendingUp,
  UserCircle,
  Users2,
  Building2,
  Users,
  Ticket,
  Bell,
  CalendarDays,
  ShoppingBag,
  Sparkles,
  Layers,
  Search,
  TreeDeciduous,
  Gift,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';


// Sidebar config (strict final structure)
const SECTIONS = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'user-management', label: 'USER MANAGEMENT' },
  { id: 'user-list', label: 'USER LIST' },
  { id: 'crm', label: 'CRM' },
  { id: 'store', label: 'STORE' },
  { id: 'task-board', label: 'TASK BOARD' },
  { id: 'operations', label: 'OPERATIONS' },
  { id: 'communication-log', label: 'COMMUNICATION LOG' },
  { id: 'department-board', label: 'DEPARTMENT BOARD' },
  { id: 'security', label: 'SECURITY' },
  { id: 'company-database', label: 'COMPANY DATABASE' },
  { id: 'document-management', label: 'DOCUMENT MANAGEMENT' },
  { id: 'resources', label: 'RESOURCES' },
  { id: 'support', label: 'SUPPORT' },
  { id: 'automation', label: 'AUTOMATION' },
  { id: 'client-main', label: 'CLIENT PORTAL' },
  { id: 'client-tools', label: 'CLIENT TOOLS' },
  { id: 'client-account', label: 'ACCOUNT & SUPPORT' },
];


const ITEMS = [
  // DASHBOARD
  {
    id: 'home',
    section: 'dashboard',
    label: 'Home',
    path: '/',
    icon: Home,
  },
  {
    id: 'analytics',
    section: 'dashboard',
    label: 'Advanced Analytics',
    path: '/super-admin/analytics',
    icon: BarChart3,
  },
  {
    id: 'admin-reports',
    section: 'dashboard',
    label: 'Reports',
    path: '/admin-reports',
    icon: BarChart3,
  },
  {
    id: 'super-admin-ai',
    section: 'dashboard',
    label: 'MyClaim AI',
    path: '/super-admin/ai-workspace',
    icon: Sparkles,
  },

  // USER MANAGEMENT
  {
    id: 'user-control',
    section: 'user-management',
    label: 'User Control',
    path: '/users',
    icon: Users,
  },

  // CRM
  {
    id: 'lead-centre',
    section: 'crm',
    label: 'Lead Centre',
    path: '/leads',
    icon: BarChart3,
    supportsBadge: true,
  },
  {
    id: 'proposal-centre',
    section: 'crm',
    label: 'Proposal Centre',
    path: '/proposals',
    icon: FileText,
    supportsBadge: true,
  },
  {
    id: 'activity-log-system',
    section: 'crm',
    label: 'System Log',
    path: '/activity',
    icon: Activity,
    supportsBadge: true,
  },
  {
    id: 'activity-log-tickets',
    section: 'crm',
    label: 'Activity Log',
    path: '/super-admin/tickets',
    icon: Briefcase,
    supportsBadge: true,
  },

  // STORE
  {
    id: 'store-claim',
    section: 'store',
    label: 'Claim Store',
    path: '/store/claim',
    icon: Box,
  },
  {
    id: 'store-service',
    section: 'store',
    label: 'Service Store',
    path: '/store/service',
    icon: Wrench,
  },
  {
    id: 'store-pre-ipo',
    section: 'store',
    label: 'Store Pre-IPO',
    path: '/store/pre-ipo',
    icon: TrendingUp,
  },

  // USER LIST
  {
    id: 'internal-client-list',
    section: 'user-list',
    label: 'Client List',
    path: '/client-list',
    icon: UserCircle,
  },
  {
    id: 'admin-list',
    section: 'user-list',
    label: 'Admin List',
    path: '/admin-list',
    icon: Users2,
  },
  {
    id: 'employee-list',
    section: 'user-list',
    label: 'Employee List',
    path: '/employee-list',
    icon: Briefcase,
  },
  {
    id: 'super-partner-list',
    section: 'user-list',
    label: 'Super Partner List',
    path: '/super-partner-list',
    icon: Building2,
  },
  {
    id: 'partner-list',
    section: 'user-list',
    label: 'Partner List',
    path: '/partner-list',
    icon: Users,
  },

  // TASK BOARD
  {
    id: 'task-board-main',
    section: 'task-board',
    label: 'Task Board (Jobs)',
    path: '/task-board-main',
    icon: '📌',
    supportsBadge: true,
  },
  {
    id: 'task-claim-hub',
    section: 'task-board',
    label: 'Claim Hub',
    path: '/task-claim-hub',
    icon: '⚖️',
  },
  {
    id: 'task-service-hub',
    section: 'task-board',
    label: 'Service Hub',
    path: '/task-service-hub',
    icon: '🔧',
  },
  {
    id: 'task-store-hub',
    section: 'task-board',
    label: 'Store Hub',
    path: '/task-store-hub',
    icon: '🛒',
  },
  {
    id: 'task-support-hub',
    section: 'task-board',
    label: 'Support Hub',
    path: '/task-support-hub',
    icon: '🆘',
  },
  {
    id: 'admin-tickets',
    section: 'task-board',
    label: 'Ticket Management',
    path: '/admin-tickets',
    icon: Ticket,
    supportsBadge: true,
  },

  // OPERATIONS
  {
    id: 'op-claim-hub',
    section: 'operations',
    label: 'Claim Hub',
    path: '/operations/claim-hub',
    icon: '⚖️',
  },
  {
    id: 'op-service-hub',
    section: 'operations',
    label: 'Service Hub',
    path: '/operations/service-hub',
    icon: '🔧',
  },
  {
    id: 'op-store',
    section: 'operations',
    label: 'Store',
    path: '/operations/store',
    icon: '🛒',
  },

  // COMMUNICATION LOG
  {
    id: 'operations-email',
    section: 'communication-log',
    label: 'Email Log',
    path: '/operations/email-log',
    icon: '📧',
  },
  {
    id: 'operations-letter',
    section: 'communication-log',
    label: 'Letter / Courier Log',
    path: '/operations/letter-log',
    icon: '📫',
  },
  {
    id: 'operations-call',
    section: 'communication-log',
    label: 'Call Log',
    path: '/operations/call-log',
    icon: '📞',
  },

  // DEPARTMENT BOARD
  {
    id: 'dept-claim-hub',
    section: 'department-board',
    label: 'Claim Dept.',
    path: '/dept-claim',
    icon: '⚖️',
  },
  {
    id: 'dept-service-hub',
    section: 'department-board',
    label: 'Service Dept.',
    path: '/dept-service',
    icon: '🔧',
  },
  {
    id: 'dept-store-hub',
    section: 'department-board',
    label: 'Store Dept.',
    path: '/dept-store',
    icon: '🛒',
  },
  {
    id: 'dept-support-hub',
    section: 'department-board',
    label: 'Support Dept.',
    path: '/dept-support',
    icon: '🆘',
  },

  // SECURITY
  {
    id: 'users',
    section: 'security',
    label: 'Accounts & Credentials',
    path: '/users',
    icon: '🔑',
  },

  // COMPANY DATABASE
  {
    id: 'internal-company-list',
    section: 'company-database',
    label: 'Company Master List',
    path: '/client-list',
    icon: '🏛️',
  },

  // DOCUMENT MANAGEMENT
  {
    id: 'operations-docs',
    section: 'document-management',
    label: 'Documents',
    path: '/operations/documents',
    icon: '📁',
  },
  {
    id: 'admin-documents',
    section: 'document-management',
    label: 'Document Verification',
    path: '/admin-documents',
    icon: FileText,
  },

  // RESOURCES
  {
    id: 'operations-resources',
    section: 'resources',
    label: 'Resources',
    path: '/operations/resources',
    icon: '📚',
  },

  // SUPPORT
  {
    id: 'task-support-hub',
    section: 'support',
    label: 'Support (Tickets)',
    path: '/task-support-hub',
    icon: '🎫',
  },

  // AUTOMATION
  {
    id: 'operations-automation',
    section: 'automation',
    label: 'Automation',
    path: '/operations/automation',
    icon: '🤖',
  },

  // ─── EMPLOYEE PORTAL SPECIFIC ───
  {
    id: 'emp-home',
    section: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: Home,
  },
  {
    id: 'emp-tasks',
    section: 'task-board',
    label: 'My Tasks',
    path: '/?tab=tasks',
    icon: '📌',
  },
  {
    id: 'emp-tickets',
    section: 'task-board',
    label: 'Assigned Tickets',
    path: '/?tab=tickets',
    icon: Ticket,
  },
  {
    id: 'emp-docs',
    section: 'document-management',
    label: 'Documents',
    path: '/?tab=docs',
    icon: '📁',
  },
  {
    id: 'emp-activity',
    section: 'communication-log',
    label: 'Activity Log',
    path: '/?tab=activity',
    icon: Activity,
  },
  {
    id: 'emp-profile',
    section: 'security',
    label: 'Profile',
    path: '/?tab=profile',
    icon: UserCircle,
  },
  {
    id: 'emp-calendar',
    section: 'task-board',
    label: 'Work Calendar',
    path: '/?tab=calendar',
    icon: CalendarDays,
  },
  {
    id: 'emp-notifications',
    section: 'communication-log',
    label: 'Notifications',
    path: '/?tab=notifications',
    icon: Bell,
    supportsBadge: true,
  },
  
  // CLIENT PORTAL SPECIFIC (Prefix client- to easily filter)
  {
    id: 'client-dashboard',
    section: 'client-main',
    label: 'Dashboard',
    path: '/client',
    icon: Home,
  },
  {
    id: 'client-my-services',
    section: 'client-main',
    label: 'My Services',
    path: '/client?tab=services',
    icon: Box,
  },
  {
    id: 'client-my-tickets',
    section: 'client-main',
    label: 'My Tickets',
    path: '/client?tab=tickets',
    icon: Briefcase,
  },
  {
    id: 'client-documents',
    section: 'client-main',
    label: 'Documents',
    path: '/client?tab=documents',
    icon: FileText,
    badgeSource: 'documents'
  },
  {
    id: 'client-track-progress',
    section: 'client-main',
    label: 'Track Progress',
    path: '/client?tab=track-progress',
    icon: Activity,
  },
  {
    id: 'client-notifications',
    section: 'client-main',
    label: 'Notifications',
    path: '/client?tab=notifications',
    icon: Bell,
    supportsBadge: true,
  },
  {
    id: 'client-service-hub',
    section: 'client-main',
    label: 'Claim Hub',
    path: '/client?tab=service-hub',
    icon: Activity,
  },
  {
    id: 'client-my-claims',
    section: 'client-main',
    label: 'My Claims',
    path: '/client?tab=claims',
    icon: Layers,
    badgeSource: 'claims'
  },
  {
    id: 'client-store-proposals',
    section: 'client-main',
    label: 'Store Proposals',
    path: '/client?tab=store-proposals',
    icon: ShoppingBag,
  },
  {
    id: 'client-family-tree',
    section: 'client-tools',
    label: 'Family Tree',
    path: '/client?tab=family-tree',
    icon: TreeDeciduous,
  },
  {
    id: 'client-iepf-search',
    section: 'client-tools',
    label: 'IEPF Search',
    path: '/client?tab=iepf-search',
    icon: Search,
  },
  {
    id: 'client-refer-earn',
    section: 'client-tools',
    label: 'Refer a Friend',
    path: '/client?tab=refer-friend',
    icon: Gift,
  },
];

// Client-specific ordered menu (keeps IDs in ITEMS)
const CLIENT_MENU_ORDER = {
  main: ['client-dashboard', 'client-my-claims', 'client-my-services', 'client-service-hub', 'client-store-proposals', 'client-documents'],
  tools: ['client-family-tree', 'client-iepf-search', 'client-refer-earn'],
  account: []
};

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [sidebarStats, setSidebarStats] = React.useState(null);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setSidebarStats(data);
      } catch (err) {
        console.error('Failed to fetch sidebar stats:', err);
      }
    };
    if (user?.token) fetchStats();
  }, [user]);

  React.useEffect(() => {
    if ((user?.role === 'employee' || user?.role === 'client') && user?.token) {
      api.get('/notifications').then(res => {
        if (res.data) setUnreadNotifications(res.data.unreadCount || 0);
      }).catch(err => console.error('Failed to fetch initial notification count:', err));
    }
    
    const handleUpdate = (e) => setUnreadNotifications(e.detail);
    window.addEventListener('notificationCountUpdate', handleUpdate);
    return () => window.removeEventListener('notificationCountUpdate', handleUpdate);
  }, [user]);

  // Map path -> item id so only one item is active at a time
  // Prefer full-path match (pathname+search) so ?tab= links highlight correctly
  const activeId = useMemo(() => {
    const fullPath = location.pathname + location.search;
    // 1. Try exact full path match first (includes query string)
    const exactMatch = ITEMS.find(i => i.path === fullPath);
    if (exactMatch) return exactMatch.id;
    // 2. Fall back to pathname-only match (ignore query string)
    const pathMatch = ITEMS.find(i => i.path === location.pathname);
    return pathMatch ? pathMatch.id : 'home';
  }, [location]);

  // Track which item was just clicked for the blink animation
  const [pressedId, setPressedId] = React.useState(null);

  // nav(pageId) -> navigate to configured path
  const nav = (pageId) => {
    const item = ITEMS.find((i) => i.id === pageId);
    if (!item) return;
    // Trigger blink animation
    setPressedId(pageId);
    setTimeout(() => setPressedId(null), 400);
    navigate(item.path);
    // Close sidebar on mobile after navigation
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeId === item.id;
    
    // Dynamic real-time badge calculation
    let badge = null;
    if (item.supportsBadge && sidebarStats) {
      if (item.id === 'lead-centre') badge = sidebarStats.leads?.total;
      if (item.id === 'proposal-centre') badge = sidebarStats.proposals?.total;
      if (item.id === 'activity-log-system') badge = sidebarStats.activity?.length;
      if (item.id === 'activity-log-tickets') badge = sidebarStats.tickets?.total;
      if (item.id === 'task-board-main') badge = sidebarStats.tickets?.total;
    }
    if (item.badgeSource && sidebarStats) {
      if (item.badgeSource === 'claims') badge = sidebarStats.claims?.total;
      if (item.badgeSource === 'documents') badge = sidebarStats.documents?.pending;
    }
    if (item.badgeLabel) {
      badge = item.badgeLabel;
    }
    if ((item.id === 'emp-notifications' || item.id === 'client-notifications') && unreadNotifications > 0) {
      badge = unreadNotifications;
    }

    const isPressed = pressedId === item.id;

    return (
      <>
        <style>{`
          @keyframes sidebarBlink {
            0%   { background: rgba(16, 185, 129, 0.30); box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
            40%  { background: rgba(16, 185, 129, 0.15); box-shadow: 0 0 8px 4px rgba(16,185,129,0.15); }
            100% { background: rgba(34, 197, 94, 0.08);  box-shadow: none; }
          }
          .sidebar-item-pressed {
            animation: sidebarBlink 0.38s ease forwards !important;
            transform: scale(0.97);
          }
          .sidebar-item:hover:not(.active) {
            background: rgba(255,255,255,0.04) !important;
            color: var(--text-primary) !important;
          }
        `}</style>
        <button
          type="button"
          className={`sidebar-item ${isActive ? 'active' : ''} ${isPressed ? 'sidebar-item-pressed' : ''}`}
          onClick={() => nav(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', width: 'calc(100% - 24px)',
            margin: '4px 12px', padding: '10px 16px', borderRadius: '12px',
            background: isActive ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
            color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: isPressed ? 'none' : 'all 0.3s ease',
            textAlign: 'left',
            position: 'relative', overflow: 'hidden',
            border: isActive ? '1px solid rgba(34, 197, 94, 0.15)' : '1px solid transparent',
          }}
        >
          {isActive && <motion.div layoutId="active-indicator" style={{ position: 'absolute', left: 0, top: '25%', height: '50%', width: '3px', background: 'var(--accent-green)', borderRadius: '0 4px 4px 0' }} />}
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'var(--accent-green)' : 'var(--muted)', fontSize: typeof Icon === 'string' ? '16px' : 'inherit' }}>
            {typeof Icon === 'string' ? Icon : <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
          </span>
          <span style={{ fontSize: '13.5px', fontWeight: isActive ? 700 : 500, letterSpacing: '0.01em' }}>{item.label}</span>
          {badge && (
            <span style={{ 
              marginLeft: 'auto', fontSize: '10px', fontWeight: 800, 
              background: isActive ? 'var(--accent-green)' : 'rgba(34, 197, 94, 0.1)', 
              color: isActive ? '#000' : 'var(--accent-green)', 
              padding: '2px 6px', borderRadius: '6px' 
            }}>
              {badge}
            </span>
          )}
        </button>
      </>
    );
  };

  const itemsBySection = useMemo(() => {
    const grouped = {};
    SECTIONS.forEach((s) => {
      grouped[s.id] = [];
    });

    const filteredItems = ITEMS.filter(item => {
      if (!user) return false;
      const role = user.role;
      const isEmployeeItem = item.id.startsWith('emp-');
      const isClientItem = item.id.startsWith('client-');

      // Employee Portal: sees ONLY employee items
      if (role === 'employee') {
        return isEmployeeItem;
      }
      
      // Client Portal: sees ONLY client items
      if (role === 'client') {
        return isClientItem;
      }

      // Other roles should not see role-specific duplicates
      if (isEmployeeItem || isClientItem) return false;

      // Super Admins see everything else
      if (role === 'super_admin') return true;

      // Admins see only their allowed sidebar items (RBAC)
      if (role === 'admin') {
        // Admin Portal: only Tickets, Employees, Documents, Tasks, Logs, Reports
        const ADMIN_ALLOWED = [
          'home', 'admin-reports',
          'task-board-main', 'task-claim-hub', 'task-service-hub', 'task-store-hub',
          'admin-tickets', 'admin-documents',
          'operations-email', 'operations-letter', 'operations-call',
          'employee-list',
        ];
        return ADMIN_ALLOWED.includes(item.id);
      }

      // Partners & Super Partners see CRM, Task Board, and Dashboard
      if (['partner', 'super_partner'].includes(role)) {
        return ['dashboard', 'crm', 'task-board', 'operations', 'department-board', 'communication-log', 'document-management', 'resources', 'automation'].includes(item.section);
      }

      return true;
    });

    filteredItems.forEach((item) => {
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    });
    return grouped;
  }, [user]);

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`} style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--glass-border)', boxShadow: '4px 0 24px rgba(0,0,0,0.2)' }}>
      <div className="sidebar-logo" style={{ padding: '28px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/logo.png" alt="MyClaim India" style={{ width: '160px', height: 'auto', maxHeight: '72px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="sidebar-logo-text" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em' }}>MyClaim India</div>
          <div className="sidebar-logo-sub" style={{ color: 'var(--accent-green)', fontWeight: 800, fontSize: '10px', letterSpacing: '0.12em', marginTop: '4px' }}>
            {user?.role === 'client' ? 'CLIENT PORTAL' : `${user?.role?.replace('_', ' ').toUpperCase()} PORTAL`}
          </div>
        </div>
      </div>



      {/* Render a focused client navbar layout when role is client */}
      {user?.role === 'client' ? (
        <>
          <div className="sidebar-section" style={{ marginTop: 8 }}>
            <div className="sidebar-section-label">MAIN</div>
            {CLIENT_MENU_ORDER.main.map((id) => {
              const it = ITEMS.find(i => i.id === id);
              if (!it) return null;
              return <SidebarItem key={it.id} item={it} />;
            })}
          </div>

          <div style={{ height: 10 }} />

          <div className="sidebar-section">
            <div className="sidebar-section-label">TOOLS</div>
            {CLIENT_MENU_ORDER.tools.map((id) => {
              const it = ITEMS.find(i => i.id === id);
              if (!it) return null;
              return <SidebarItem key={it.id} item={it} />;
            })}
          </div>

        </>
      ) : (
        SECTIONS.map((section) => {
          const sectionItems = itemsBySection[section.id] || [];
          if (!sectionItems.length) return null;
          return (
            <div key={section.id} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              {sectionItems.map((item) => (
                <SidebarItem key={item.id} item={item} />
              ))}
            </div>
          );
        })
      )}

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Dark/Light Mode Theme Toggle Row */}
        <div 
          onClick={toggleTheme}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-primary, rgba(255,255,255,0.03))', padding: '10px 16px', 
            borderRadius: '14px', border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
            cursor: 'pointer', transition: 'all 0.2s ease', userSelect: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-green)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border, rgba(255,255,255,0.08))'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
            {theme === 'dark' ? 'DARK' : 'LIGHT'}
          </span>
        </div>

        {user?.role !== 'client' && (
          <div 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', 
              background: 'rgba(34, 197, 94, 0.05)', padding: '10px 16px', 
              borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.1)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
              e.currentTarget.querySelector('.logout-icon').style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
              e.currentTarget.querySelector('.logout-icon').style.color = 'var(--accent-green)';
            }}
          >
            <div style={{ width: 36, height: 36, background: 'var(--accent-green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AV'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.role === 'super_admin' ? 'Super Admin' : user?.name || 'Akash Verma'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase' }}>
                {user?.role?.replace('_', ' ') || 'User'}
              </span>
            </div>
            <span className="logout-icon" style={{ color: 'var(--accent-green)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}>
              <LogOut size={16} />
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;

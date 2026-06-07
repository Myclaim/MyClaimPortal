import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldCheck, UserCircle, Briefcase, Building2, Link, Users as UsersIcon, Search, Download, Eye, Edit2, Trash2, Shield, ClipboardList, Lock, X, CheckCircle, AlertCircle, Loader, ChevronRight, ChevronLeft, UserPlus, FileText, Settings, LayoutDashboard, KeyRound } from 'lucide-react';
import api from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VARIANTS } from '../../styles/motion-variants';
import { EnhancedFormInput } from '../../components/forms/EnhancedFormInput';

const ROLE_MAP = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  claim_admin: 'Admin',
  service_admin: 'Admin',
  store_admin: 'Admin',
  team: 'Admin',
  employee: 'Employee',
  staff: 'Employee',
};

/** System access role for Employee collection (employee | team | staff) */
const EMPLOYEE_SYS_ROLE_LABEL = {
  employee: 'Employee',
  team: 'Team',
  staff: 'Staff',
};

let _usersCache = null;
let _usersCacheTime = 0;
const USERS_CACHE_TTL = 3 * 60 * 1000;

const CountUp = ({ value, duration = 1200 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) { setCount(0); return; }
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) window.requestAnimationFrame(step);
      else setCount(end);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  return <>{count}</>;
};

const Users = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [roleContext, setRoleContext] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const location = useLocation();
  const [viewRole, setViewRole] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', username: '', password: '', role: '',
    name: '', dob: '', gender: 'Male', maritalStatus: '', citizenship: 'Indian',
    email: '', phone: '', department: '', address: { country: 'India', state: '', city: '', pincode: '', permanentAddress: '' },
    aadharNo: '', panNo: '', relation: 'Direct', relationWithHolder: '', reference: 'Indirect', referenceName: '',
    nomineeName: '', nomineeRelation: '', profession: '', companyName: '', notes: '', manager: '', status: 'active'
  });

  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [viewVariant, setViewVariant] = useState('simple');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all | super_admin | admin | employee | super_partner | partner | client | client_direct | client_indirect
  const [collapsedSections, setCollapsedSections] = useState({});

  const [advFilters, setAdvFilters] = useState({
    role: '', store: '', department: '', status: '', dateFrom: '', dateTo: '', serviceType: ''
  });
  const [showAdvFilters, setShowAdvFilters] = useState(false);

  useEffect(() => {
    const fetchUsers = async (silent = false) => {
      if (!silent) setLoadingUsers(true);
      try {
        const { data } = await api.get('/users');
        _usersCache = data;
        _usersCacheTime = Date.now();
        setAllUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        if (!silent) setLoadingUsers(false);
      }
    };

    if (_usersCache && (Date.now() - _usersCacheTime) < USERS_CACHE_TTL) {
      setAllUsers(_usersCache);
      setLoadingUsers(false);
      fetchUsers(true);
    } else {
      fetchUsers(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    const allowed = ['super_admin', 'admin', 'employee', 'super_partner', 'partner', 'client'];
    setViewRole(allowed.includes(roleParam || '') ? roleParam : '');
  }, [location.search]);

  const closeModal = () => {
    setActiveModal(null);
    setModalStep(1);
    setErrorMsg('');
    setSuccessMsg('');
    setEditMode(false);
    setViewMode(false);
  };

  const handleCreateUser = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const payload = { ...formData, parent_id: formData.manager || undefined };
      if (editMode) {
        const { data } = await api.patch(`/users/${selectedUser._id}`, payload);
        _usersCache = null;
        setAllUsers(prev => prev.map(u => String(u._id) === String(data._id) ? { ...u, ...data } : u));
        setSuccessMsg(`✅ Updated successfully!`);
      }
      setTimeout(closeModal, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    if (user.role === 'client') {
      navigate(`/clients/${user._id}`);
      return;
    }
    setActiveModal('edit_user');
    setEditForm({
      ...user,
      _id: user._id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      username: user.username || '',
      role: user.role,
      status: user.is_active === false ? 'inactive' : 'active',
      companyName: user.companyName || '',
      profession: user.profession || '',
      department: user.department || '',
      entity: user.entity || '',
      skills: user.skills || '',
      designation: user.designation || '',
      specialization: user.specialization || '',
      category: user.category || '',
      city: user.city || user.kyc_data?.address || ''
    });
  };

  const handleSaveUser = async () => {
    if (!editForm?._id) return;
    setSavingEdit(true);
    try {
      const { password: _pw, status: _status, ...rest } = editForm;
      const payload = { ...rest, is_active: editForm.status !== 'inactive' };
      const { data } = await api.patch(`/users/${editForm._id}`, payload);
      _usersCache = null;
      setAllUsers(prev => prev.map(u => String(u._id) === String(data._id) ? { ...u, ...data } : u));
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };

  const getSelectedUserValue = (key) => {
    if (!selectedUser) return '—';
    if (selectedUser[key] !== undefined && selectedUser[key] !== null && selectedUser[key] !== '') return selectedUser[key];
    if (selectedUser.address && selectedUser.address[key] !== undefined && selectedUser.address[key] !== null && selectedUser.address[key] !== '') return selectedUser.address[key];
    return '—';
  };

  const handleView = async (user, variant = 'simple') => {
    setViewVariant(variant);
    setViewMode(true); setEditMode(false); setSelectedUser(user);
    setFormData({ ...user, manager: user.parent_id || '', status: user.is_active === false ? 'inactive' : 'active' });
    setRoleContext(ROLE_MAP[user.role] || user.role);
    setModalStep(1); setActiveModal('view_user');

    setLoadingUserDetails(true);
    try {
      const { data } = await api.get(`/users/${user._id}`);
      setSelectedUser(data);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const {
    superAdmins,
    admins,
    employees,
    superPartners,
    partners,
    clients,
    directClients,
    indirectClients,
  } = useMemo(() => {
    const sa = allUsers.filter((u) => u.role === 'super_admin');
    const ad = allUsers.filter((u) => ['admin', 'claim_admin', 'service_admin', 'store_admin'].includes(u.role));
    const em = allUsers.filter((u) => ['employee', 'team', 'staff'].includes(u.role));
    const sp = allUsers.filter((u) => u.role === 'super_partner');
    const pa = allUsers.filter((u) => u.role === 'partner');
    const cl = allUsers.filter((u) => u.role === 'client');
    const dir = cl.filter((c) => c.relation === 'Direct' || c.relation === 'direct');
    const ind = cl.filter((c) => c.relation !== 'Direct' && c.relation !== 'direct');
    return {
      superAdmins: sa,
      admins: ad,
      employees: em,
      superPartners: sp,
      partners: pa,
      clients: cl,
      directClients: dir,
      indirectClients: ind,
    };
  }, [allUsers]);

  const uniqueStores = useMemo(() => [...new Set(allUsers.map(u => u.store).filter(Boolean))], [allUsers]);
  const uniqueDepartments = useMemo(() => [...new Set(allUsers.map(u => u.department).filter(Boolean))], [allUsers]);
  const uniqueServices = useMemo(() => [...new Set(allUsers.map(u => u.service || u.serviceType).filter(Boolean))], [allUsers]);

  const applyFilters = (list) => {
    let result = list;
    if (advFilters.status === 'active') result = result.filter(u => u.is_active !== false);
    if (advFilters.status === 'inactive') result = result.filter(u => u.is_active === false);
    if (advFilters.role) result = result.filter(u => u.role === advFilters.role);
    if (advFilters.store) result = result.filter(u => u.store === advFilters.store);
    if (advFilters.department) result = result.filter(u => u.department === advFilters.department);
    if (advFilters.serviceType) result = result.filter(u => (u.service === advFilters.serviceType || u.serviceType === advFilters.serviceType));
    if (advFilters.dateFrom) result = result.filter(u => new Date(u.createdAt) >= new Date(advFilters.dateFrom));
    if (advFilters.dateTo) {
      const toDate = new Date(advFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(u => new Date(u.createdAt) <= toDate);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(u => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        const dept = (u.department || '').toLowerCase();
        const skills = (u.skills || '').toLowerCase();
        const id = (u.client_id_ref || u._id || '').toString().toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q) || dept.includes(q) || skills.includes(q) || id.includes(q);
      });
    }
    return result;
  };

  const filteredSuperAdmins = useMemo(() => applyFilters(superAdmins), [superAdmins, query, advFilters]);
  const filteredAdmins = useMemo(() => applyFilters(admins), [admins, query, advFilters]);
  const filteredEmployees = useMemo(() => applyFilters(employees), [employees, query, advFilters]);
  const filteredSuperPartners = useMemo(() => applyFilters(superPartners), [superPartners, query, advFilters]);
  const filteredPartners = useMemo(() => applyFilters(partners), [partners, query, advFilters]);
  const filteredClients = useMemo(() => applyFilters(clients), [clients, query, advFilters]);

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      _usersCache = null;
      const removedId = String(user._id);
      setAllUsers((prev) =>
        prev
          .filter((u) => String(u._id) !== removedId)
          .map((u) =>
            u.parent_id != null && String(u.parent_id) === removedId ? { ...u, parent_id: null } : u
          )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleExport = () => {
    const allFiltered = [...filteredSuperAdmins, ...filteredAdmins, ...filteredEmployees, ...filteredSuperPartners, ...filteredPartners, ...filteredClients];
    if (allFiltered.length === 0) return alert('No users to export');
    const headers = ['ID', 'Name', 'Role', 'Email', 'Phone', 'Status', 'Created'];
    const rows = allFiltered.map(u => [
      u.client_id_ref || u._id,
      u.name,
      ROLE_MAP[u.role] || u.role,
      u.email,
      u.phone || '',
      u.is_active === false ? 'Inactive' : 'Active',
      new Date(u.createdAt).toLocaleDateString('en-GB')
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getModalSteps = (role) => {
    const steps = [
      { id: 1, label: 'Basic' }, { id: 2, label: 'Personal' }, { id: 4, label: 'ID' }, 
      { id: 3, label: 'Contact' }, { id: 5, label: 'Relation' }, { id: 6, label: 'Reference' }, 
      { id: 7, label: 'Nominee' }, { id: 8, label: 'Finalize' }
    ];
    if (role === 'client') return steps;
    
    // Unified 6-step form for Admin, Employee, Partner, Super Partner
    // (Basic, Personal, ID, Contact, Reference, Finalize)
    return steps.filter(s => [1, 2, 4, 3, 6, 8].includes(s.id));
  };

  const activeSteps = getModalSteps(formData.role);
  const totalModalSteps = activeSteps.length;
  const currentStepData = activeSteps[modalStep - 1] || activeSteps[0];
  const activeStepId = currentStepData.id;

  const ROLE_PERMISSIONS = {
    super_admin: [
      { label: 'Create Leads', on: true },
      { label: 'Assign Tasks', on: true },
      { label: 'View Reports', on: true },
      { label: 'Approve Agreements', on: true },
      { label: 'Upload Documents', on: true },
      { label: 'Manage Commission', on: true },
      { label: 'Delete Users', on: true },
      { label: 'System Settings', on: true },
      { label: 'Access Billing', on: false },
      { label: 'View All Clients', on: true },
    ],
    admin: [
      { label: 'Create Leads', on: true },
      { label: 'Assign Tasks', on: true },
      { label: 'View Reports', on: true },
      { label: 'Approve Agreements', on: true },
      { label: 'Upload Documents', on: true },
      { label: 'Manage Commission', on: true },
      { label: 'Delete Users', on: true },
      { label: 'System Settings', on: true },
      { label: 'Access Billing', on: false },
      { label: 'View All Clients', on: true },
    ],
    employee: [
      { label: 'Create Leads', on: true },
      { label: 'Assign Tasks', on: false },
      { label: 'View Reports', on: false },
      { label: 'Approve Agreements', on: false },
      { label: 'Upload Documents', on: true },
      { label: 'Manage Commission', on: false },
      { label: 'Delete Users', on: false },
      { label: 'System Settings', on: false },
      { label: 'Access Billing', on: false },
      { label: 'View All Clients', on: false },
    ],
    super_partner: [
      { label: 'Create Leads', on: true },
      { label: 'Assign Tasks', on: true },
      { label: 'View Reports', on: true },
      { label: 'Approve Agreements', on: false },
      { label: 'Upload Documents', on: true },
      { label: 'Manage Commission', on: true },
      { label: 'Delete Users', on: false },
      { label: 'System Settings', on: false },
      { label: 'Access Billing', on: false },
      { label: 'View All Clients', on: true },
    ],
    partner: [
      { label: 'Create Leads', on: true },
      { label: 'Assign Tasks', on: false },
      { label: 'View Reports', on: true },
      { label: 'Approve Agreements', on: false },
      { label: 'Upload Documents', on: true },
      { label: 'Manage Commission', on: true },
      { label: 'Delete Users', on: false },
      { label: 'System Settings', on: false },
      { label: 'Access Billing', on: false },
      { label: 'View All Clients', on: false },
    ],
    client: [
      { label: 'Create Leads', on: false },
      { label: 'Assign Tasks', on: false },
      { label: 'View Reports', on: false },
      { label: 'Approve Agreements', on: false },
      { label: 'Upload Documents', on: true },
      { label: 'Manage Commission', on: false },
      { label: 'Delete Users', on: false },
      { label: 'System Settings', on: false },
      { label: 'Access Billing', on: true },
      { label: 'View All Clients', on: false },
    ],
    client_indirect: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: false },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: false },
      { label: 'Task Board', on: false },
      { label: 'Store Hub', on: false },
    ],
    default: [
      { label: 'Create Leads', on: true },
      { label: 'Assign Tasks', on: false },
      { label: 'View Reports', on: false },
      { label: 'Approve Agreements', on: false },
      { label: 'Upload Documents', on: true },
      { label: 'Manage Commission', on: false },
      { label: 'Delete Users', on: false },
      { label: 'System Settings', on: false },
      { label: 'Access Billing', on: false },
      { label: 'View All Clients', on: false },
    ],
  };

  const ROLE_SIDEBAR_ACCESS = {
    super_admin: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: true },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: true },
      { label: 'Task Board', on: true },
      { label: 'Store Hub', on: false },
    ],
    admin: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: true },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: true },
      { label: 'Task Board', on: true },
      { label: 'Store Hub', on: false },
    ],
    employee: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: true },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: false },
      { label: 'Task Board', on: true },
      { label: 'Store Hub', on: false },
    ],
    super_partner: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: true },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: true },
      { label: 'Task Board', on: true },
      { label: 'Store Hub', on: false },
    ],
    partner: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: true },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: false },
      { label: 'Task Board', on: true },
      { label: 'Store Hub', on: false },
    ],
    client: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: false },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: false },
      { label: 'Task Board', on: false },
      { label: 'Store Hub', on: false },
    ],
    default: [
      { label: 'Dashboard', on: true },
      { label: 'Lead Centre', on: false },
      { label: 'Activity Log', on: true },
      { label: 'Client List', on: false },
      { label: 'Task Board', on: false },
      { label: 'Store Hub', on: false },
    ],
  };

  useEffect(() => {
    if (roleFilter === 'export_csv') {
      handleExport();
      setRoleFilter('all');
    }
  }, [roleFilter]);
    const SectionWrapper = ({ title, icon, count, role, children }) => {
       const isCollapsed = collapsedSections[role] || false;
    return (
      <div className="fintech-section">
        <div className="fintech-section-header" onClick={() => setCollapsedSections(prev => ({ ...prev, [role]: !prev[role] }))}>
          <div className="section-title">
            <span className="section-icon">{icon}</span>
            {title}
            <span className="section-count">{count}</span>
          </div>
          <ChevronRight size={16} style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: '0.3s', color: 'var(--text-light)' }} />
        </div>
        {!isCollapsed && <div className="animate-fade">{children}</div>}
      </div>
    );
  };

  const TableComponent = ({ headers, rows }) => (
    <div style={{ overflowX: 'auto' }}>
      <table className="fintech-table">
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );

  const StatusBadge = ({ status }) => (
    <span className={`status-badge ${status !== false ? 'status-active' : 'status-inactive'}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
      {status !== false ? 'Active' : 'Suspended'}
    </span>
  );

  const ActionButtons = ({ user }) => (
    <div className="action-btn-wrap">
      <button className="action-btn-circle" title="Quick View" onClick={(e) => { e.stopPropagation(); handleView(user, 'simple'); }}><Eye size={14} /></button>
      <button className="action-btn-circle" title="Edit Profile" onClick={(e) => { e.stopPropagation(); handleEdit(user); }}><Edit2 size={14} /></button>
      <button className="action-btn-circle" title="Delete User" style={{ color: 'rgba(244, 63, 94, 0.7)' }} onClick={(e) => { e.stopPropagation(); handleDeleteUser(user); }}><Trash2 size={14} /></button>
    </div>
  );

  const activeCount = (list) => list.filter(u => u.is_active !== false).length;

  const statCards = [
    { key: 'total', label: 'Total Users', value: allUsers.length, active: activeCount(allUsers), icon: <LayoutDashboard size={20} />, iconBg: 'transparent', filter: 'all' },
    { key: 'super_admin', label: 'Super Admin', value: superAdmins.length, active: activeCount(superAdmins), icon: <ShieldCheck size={20} />, iconBg: 'transparent', filter: 'super_admin' },
    { key: 'admin', label: 'Admin', value: admins.length, active: activeCount(admins), icon: <UserCircle size={20} />, iconBg: 'transparent', filter: 'admin' },
    { key: 'employee', label: 'Employee', value: employees.length, active: activeCount(employees), icon: <Briefcase size={20} />, iconBg: 'transparent', filter: 'employee' },
    { key: 'super_partner', label: 'Super Partner', value: superPartners.length, active: activeCount(superPartners), icon: <Building2 size={20} />, iconBg: 'transparent', filter: 'super_partner' },
    { key: 'partner', label: 'Partner', value: partners.length, active: activeCount(partners), icon: <Link size={20} />, iconBg: 'transparent', filter: 'partner' },
    { key: 'client_direct', label: 'Client (Direct)', value: directClients.length, active: activeCount(directClients), icon: <UsersIcon size={20} />, iconBg: 'transparent', filter: 'client_direct' },
    { key: 'client_indirect', label: 'Client (Indirect)', value: indirectClients.length, active: activeCount(indirectClients), icon: <UsersIcon size={20} />, iconBg: 'transparent', filter: 'client_indirect' },
  ];

  const clientSubStats = [
    { key: 'client_direct', label: 'Client (Direct)', value: directClients.length, icon: <UsersIcon size={18} strokeWidth={2.5} color="#000" />, iconBg: '#22c55e', filter: 'client_direct' },
    { key: 'client_indirect', label: 'Client (Indirect)', value: indirectClients.length, icon: <UsersIcon size={18} strokeWidth={2.5} color="#000" />, iconBg: '#22c55e', filter: 'client_indirect' },
  ];

  const formCards = [
    { role: 'super_admin', label: 'Super Admin Form', sub: 'Account · Profile · Security', icon: <ShieldCheck size={18} color="#000" strokeWidth={2.5} />, bg: '#22c55e', borderHover: '#22c55e' },
    { role: 'admin', label: 'Admin Form', sub: 'Dept · Permissions · Documents', icon: <UserCircle size={18} color="#000" strokeWidth={2.5} />, bg: '#22c55e', borderHover: '#22c55e' },
    { role: 'employee', label: 'Employee Form', sub: 'Skills · Agreement · Roles', icon: <Briefcase size={18} color="#000" strokeWidth={2.5} />, bg: '#22c55e', borderHover: '#22c55e' },
    { role: 'super_partner', label: 'Super Partner Form', sub: 'Company Info · Responsible Person', icon: <Building2 size={18} color="#000" strokeWidth={2.5} />, bg: '#22c55e', borderHover: '#22c55e' },
    { role: 'partner', label: 'Partner Form', sub: 'Business · Node · System Access', icon: <Link size={18} color="#000" strokeWidth={2.5} />, bg: '#22c55e', borderHover: '#22c55e' },
    { role: 'client', label: 'Client Form', sub: 'Personal · Contact · Nominee', icon: <UsersIcon size={18} color="#000" strokeWidth={2.5} />, bg: '#22c55e', borderHover: '#22c55e' },
  ];

  const shouldShowSection = (role) => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'client_direct' || roleFilter === 'client_indirect') return role === 'client';
    return roleFilter === role;
  };

  return (
    <div className="um-page" style={{ background: 'var(--bg)', minHeight: '100vh', padding: '24px 32px', color: 'var(--text)', boxSizing: 'border-box', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <style>{`
        /* ✨ Fintech Theme Overrides */
        .um-topbar { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 32px; background: var(--card); 
          padding: 20px 32px; border-radius: 24px; 
          border: 1px solid var(--border); 
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          position: relative; overflow: hidden;
        }
        .um-topbar::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at top left, rgba(34, 197, 94, 0.05), transparent 40%);
          pointer-events: none;
        }
        
        .um-title-wrap { display: flex; align-items: center; gap: 18px; }
        .um-icon-badge { 
          width: 48px; height: 48px; background: var(--green); 
          border-radius: 14px; display: flex; align-items: center; 
          justify-content: center; color: #ffffff; 
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }
        .um-title { 
          font-family: 'Syne', sans-serif; font-size: 1.6rem; 
          font-weight: 800; color: var(--text); 
          letter-spacing: -0.02em; margin: 0;
        }
        
        .um-actions { display: flex; gap: 14px; }
        .fintech-btn {
          display: flex; align-items: center; gap: 10px; 
          padding: 12px 24px; border-radius: 12px; 
          font-size: 14px; font-weight: 600; cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
        }
        .btn-primary { 
          background: linear-gradient(135deg, var(--green), var(--blue));
          color: #ffffff; border: none;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }
        .btn-primary:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
          filter: brightness(1.1);
        }
        .btn-secondary { 
          background: var(--card); 
          color: var(--text); 
          border: 1px solid var(--border);
          backdrop-filter: blur(8px);
        }
        .btn-secondary:hover { 
          background: rgba(34, 197, 94, 0.05); 
          border-color: var(--green);
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.1);
        }

        .um-toolbar { 
          display: flex; gap: 18px; margin-bottom: 32px; 
          background: var(--card); padding: 16px; 
          border-radius: 20px; border: 1px solid var(--border);
        }
        .um-search-wrap { flex: 1; position: relative; }
        .um-search-wrap svg { 
          position: absolute; left: 16px; top: 50%; 
          transform: translateY(-50%); color: var(--text-light); 
        }
        .um-search-input { 
          width: 100%; height: 48px; background: var(--bg); 
          border: 1px solid var(--border); border-radius: 12px; 
          padding: 0 16px 0 48px; font-size: 14px; 
          color: var(--text); outline: none; 
          transition: all 0.3s ease; 
        }
        .um-search-input:focus { 
          border-color: var(--green); 
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1); 
          background: var(--bg);
        }

        .um-filter-select { 
          height: 48px; background: var(--bg); 
          border: 1px solid var(--border); border-radius: 12px; 
          padding: 0 16px; font-size: 14px; font-weight: 600; 
          color: var(--text); outline: none; 
          cursor: pointer; transition: all 0.3s; 
        }
        .um-filter-select:focus { border-color: var(--green); }

        .um-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 32px; align-items: start; }
        
        .fintech-section { 
          background: var(--card); border-radius: 24px; 
          border: 1px solid var(--border); 
          box-shadow: 0 4px 24px rgba(0,0,0,0.3); 
          margin-bottom: 32px; overflow: hidden;
          transition: all 0.3s ease;
        }
        .fintech-section:hover {
          border-color: rgba(34, 197, 94, 0.2);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .fintech-section-header { 
          padding: 20px 28px; background: var(--bg); 
          border-bottom: 1px solid var(--border); 
          display: flex; justify-content: space-between; 
          align-items: center; cursor: pointer;
        }
        .section-title { 
          font-size: 14px; font-weight: 700; color: var(--text); 
          letter-spacing: 0.05em; text-transform: uppercase; 
          display: flex; align-items: center; gap: 12px;
        }
        .section-icon { color: var(--green); }
        .section-count { 
          font-size: 11px; font-weight: 800; background: rgba(34, 197, 94, 0.1); 
          color: var(--green); padding: 4px 10px; 
          border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.2);
        }

        /* 📊 Premium Table */
        .fintech-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .fintech-table th { 
          padding: 18px 28px; font-size: 11px; font-weight: 700; 
          color: var(--text-muted); text-transform: uppercase; 
          letter-spacing: 1.5px; border-bottom: 1px solid var(--border);
          background: var(--bg);
        }
        .fintech-table td { 
          padding: 16px 28px; font-size: 14px; 
          color: var(--text); border-bottom: 1px solid var(--border);
          transition: all 0.2s ease;
        }
        .fintech-table tr:hover td { 
          background: var(--sidebar-hover); 
          color: var(--green);
        }
        
        .user-info { display: flex; align-items: center; gap: 14px; }
        .user-avatar { 
          width: 38px; height: 38px; border-radius: 12px; 
          background: var(--card); border: 1px solid var(--border); 
          display: flex; align-items: center; justify-content: center; 
          color: var(--green); font-weight: 700; font-size: 14px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        
        .status-badge { 
          display: inline-flex; align-items: center; gap: 6px; 
          padding: 5px 12px; border-radius: 20px; font-size: 11px; 
          font-weight: 700; text-transform: uppercase;
        }
        .status-active { 
          background: rgba(34, 197, 94, 0.1); color: var(--green); 
          border: 1px solid rgba(34, 197, 94, 0.2);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
        }
        .status-inactive { 
          background: rgba(244, 63, 94, 0.1); color: #f43f5e; 
          border: 1px solid rgba(244, 63, 94, 0.2);
        }

        .action-btn-wrap { display: flex; gap: 10px; }
        .action-btn-circle { 
          width: 34px; height: 34px; border-radius: 10px; 
          border: 1px solid var(--border); background: var(--bg); 
          display: flex; align-items: center; justify-content: center; 
          color: var(--text-muted); cursor: pointer; transition: all 0.3s; 
        }
        .action-btn-circle:hover { 
          border-color: var(--green); color: var(--green); 
          background: rgba(34, 197, 94, 0.05); transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .right-panel-sticky { position: sticky; top: 24px; }
        .panel-label { 
          font-family: 'Syne', sans-serif; font-size: 12px; 
          font-weight: 800; color: var(--green); 
          text-transform: uppercase; letter-spacing: 2px; 
          margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
        }

        /* 📋 Form Cards */
        .fintech-form-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 20px; margin-bottom: 16px;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative; overflow: hidden;
        }
        .fintech-form-card::after {
          content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
          background: var(--green); opacity: 0; transition: 0.3s;
        }
        .fintech-form-card:hover {
          transform: translateX(6px);
          border-color: rgba(34, 197, 94, 0.3);
          background: var(--sidebar-hover);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .fintech-form-card:hover::after { opacity: 1; }

        /* ➕ Create User Rectangle Button */
        .btn-create-rect {
          background: linear-gradient(135deg, var(--green), var(--blue));
          border-radius: 18px;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: none;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
        }
        .btn-create-rect:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
          filter: brightness(1.05);
        }
        .btn-create-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          font-weight: 800;
          font-size: 14px;
          line-height: 1.1;
          letter-spacing: -0.01em;
        }

        /* 📈 Stat Cards */
        .fintech-stat-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px; margin-bottom: 32px;
        }
        .fintech-stat-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 24px; position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
        }
        .fintech-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(34, 197, 94, 0.3);
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
        }
        .fintech-stat-card.active {
          border-color: var(--green);
          background: var(--sidebar-hover);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
        }
        .stat-icon-wrap {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; transition: 0.3s;
          border: 1.5px solid var(--green);
          background: rgba(34, 197, 94, 0.05);
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.1);
        }
        .fintech-stat-card:hover .stat-icon-wrap {
          transform: scale(1.1) rotate(-5deg);
        }
        .stat-value { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
        .stat-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }

        /* 🔄 Toggle Switch Styles */
        .va-toggle-wrap { 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 12px 16px; border: 1px solid var(--border); 
          border-radius: 12px; background: var(--sidebar-hover); 
          transition: all 0.3s ease;
        }
        .va-toggle-wrap:hover { border-color: var(--green); box-shadow: 0 0 15px rgba(34, 197, 94, 0.1); }
        .va-toggle-label { font-size: 12px; font-weight: 700; color: var(--text); }
        .va-toggle { 
          position: relative; width: 40px; height: 22px; appearance: none; 
          background: #1e293b; outline: none; border-radius: 20px; 
          transition: 0.3s; cursor: pointer; flex-shrink: 0; margin: 0; 
          border: 1px solid var(--border);
        }
        .va-toggle:checked { background: var(--green); border-color: var(--green); }
        .va-toggle::before { 
          content: ''; position: absolute; width: 16px; height: 16px; 
          border-radius: 50%; top: 2px; left: 2px; background: #fff; 
          transition: 0.3s; 
        }
        .va-toggle:checked::before { transform: translateX(18px); background: var(--sidebar-hover); }

        /* 🆕 Clean Light Modal Style for Create User */
        .clean-modal {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          max-width: 950px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          font-family: 'DM Sans', sans-serif;
          color: #1e293b;
        }
        .clean-modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .clean-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .clean-modal-sub {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .clean-modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: 0.2s;
        }
        .clean-modal-close:hover { background: #f8fafc; color: #0f172a; }

        .clean-modal-body { padding: 32px; max-height: 75vh; overflow-y: auto; }
        .clean-section-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        .clean-field-group {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 32px;
          margin-bottom: 32px;
        }
        .clean-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .clean-input {
          width: 100%;
          height: 44px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0 16px;
          font-size: 14px;
          color: #1e293b;
          outline: none;
          transition: 0.2s;
        }
        .clean-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .clean-input::placeholder { color: #cbd5e1; }

        .clean-select {
          width: 100%; height: 44px; background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 0 16px; font-size: 14px; color: #1e293b;
          outline: none; cursor: pointer;
        }
        
        .clean-perm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .clean-perm-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border: 1px solid #f1f5f9; border-radius: 10px;
          background: #f8fafc;
        }
        .clean-perm-label { font-size: 13px; font-weight: 600; color: #334155; }
        
        /* Blue Toggle */
        .clean-toggle {
          position: relative; width: 42px; height: 22px; appearance: none;
          background: #e2e8f0; border-radius: 20px; cursor: pointer; transition: 0.3s;
        }
        .clean-toggle:checked { background: #2563eb; }
        .clean-toggle::before {
          content: ''; position: absolute; width: 18px; height: 18px;
          border-radius: 50%; top: 2px; left: 2px; background: #fff; transition: 0.3s;
        }
        .clean-toggle:checked::before { transform: translateX(20px); }

        .clean-modal-footer {
          padding: 20px 32px; border-top: 1px solid #f1f5f9;
          display: flex; justify-content: flex-end; gap: 12px;
          background: #f8fafc;
        }
        .btn-clean-secondary {
          padding: 10px 24px; border-radius: 8px; border: 1px solid #e2e8f0;
          background: #fff; color: #475569; font-weight: 600; cursor: pointer;
        }
        .btn-clean-primary {
          padding: 10px 24px; border-radius: 8px; border: none;
          background: #2563eb; color: #fff; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
      `}</style>

      {/* 🚀 Header Section */}
      <div className="um-topbar animate-seq-1">
        <div className="um-title-wrap">
          <div className="um-icon-badge"><LayoutDashboard size={24} /></div>
          <div>
            <h1 className="um-title">User Management</h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>
              System Users: <span className="fintech-gradient-text" style={{ fontWeight: 800, fontSize: 15 }}><CountUp value={allUsers.length} /></span>
            </div>
          </div>
        </div>
        <div className="um-actions">
          <button className="fintech-btn" onClick={() => setShowAdvFilters(true)} style={{ background: 'var(--green)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800 }}>
            <Settings size={18} /> Advanced Filters
          </button>
        </div>
      </div>

      {/* 📊 Metrics Overview */}
      <div className="fintech-stat-grid animate-seq-2">
        {statCards.map((card) => (
          <div 
            key={card.key} 
            className={`fintech-stat-card ${roleFilter === card.filter ? 'active' : ''}`}
            onClick={() => setRoleFilter(card.filter)}
          >
            <div className="stat-icon-wrap" style={{ background: card.iconBg, color: 'var(--green)' }}>
              {card.icon}
            </div>
            <div className="stat-value"><CountUp value={card.value} /></div>
            <div className="stat-label">{card.label}</div>
            <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 10, fontWeight: 800, color: 'var(--green)', opacity: 0.6 }}>
              {Math.round((card.active / card.value) * 100 || 0)}% LIVE
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 Search & Filters */}
      <div className="um-toolbar animate-seq-2" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
        <div className="um-search-wrap" style={{ flex: 1, position: 'relative' }}>
          <Search size={20} />
          <input type="text" className="um-search-input" placeholder="Search accounts, roles, departments..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="um-grid">
        {/* 📋 Main Content: Tables */}
        <div className="um-left-panel">
          <div className="um-sections-wrapper animate-seq-5">
            {shouldShowSection('super_admin') && (
              <SectionWrapper title="Super Admin Core" icon={<ShieldCheck size={18} />} count={superAdmins.length} role="super_admin">
                <TableComponent headers={['ID', 'System User', 'Username', 'Email', 'Status', 'Actions']} 
                  rows={filteredSuperAdmins.map((u, i) => (
                    <tr key={u._id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--green)' }}>{u.client_id_ref || u._id?.slice(-6).toUpperCase()}</td>
                      <td><div className="user-info"><div className="user-avatar">{u.name?.charAt(0)}</div><b>{u.name}</b></div></td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td><StatusBadge status={u.is_active} /></td>
                      <td><ActionButtons user={u} /></td>
                    </tr>
                  ))}
                />
              </SectionWrapper>
            )}

            {shouldShowSection('admin') && (
              <SectionWrapper title="Administrator Network" icon={<UserCircle size={18} />} count={admins.length} role="admin">
                <TableComponent headers={['ID', 'Administrator', 'Email', 'User Role', 'Status', 'Actions']} 
                  rows={filteredAdmins.map((u, i) => (
                    <tr key={u._id}>
                      <td style={{ fontFamily: 'monospace' }}>{u.client_id_ref || u._id?.slice(-6).toUpperCase()}</td>
                      <td><div className="user-info"><div className="user-avatar">{u.name?.charAt(0)}</div><b>{u.name}</b></div></td>
                      <td>{u.email}</td>
                      <td><span className="fintech-gradient-text" style={{ fontWeight: 700 }}>{ROLE_MAP[u.role] || 'Admin'}</span></td>
                      <td><StatusBadge status={u.is_active} /></td>
                      <td><ActionButtons user={u} /></td>
                    </tr>
                  ))}
                />
              </SectionWrapper>
            )}

            {shouldShowSection('employee') && (
              <SectionWrapper title="Operational Team" icon={<Briefcase size={18} />} count={employees.length} role="employee">
                <TableComponent headers={['ID', 'Staff Member', 'Department', 'Expertise', 'Status', 'Actions']} 
                  rows={filteredEmployees.map((u, i) => (
                    <tr key={u._id}>
                      <td style={{ fontFamily: 'monospace' }}>{u.client_id_ref || u._id?.slice(-6).toUpperCase()}</td>
                      <td><div className="user-info"><div className="user-avatar">{u.name?.charAt(0)}</div><b>{u.name}</b></div></td>
                      <td>{u.department || 'General'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.skills || '—'}</td>
                      <td><StatusBadge status={u.is_active} /></td>
                      <td><ActionButtons user={u} /></td>
                    </tr>
                  ))}
                />
              </SectionWrapper>
            )}

            {shouldShowSection('super_partner') && (
              <SectionWrapper title="Super Partner Entities" icon={<Building2 size={18} />} count={superPartners.length} role="super_partner">
                <TableComponent headers={['ID', 'Entity Name', 'Representative', 'Contact', 'Status', 'Actions']} 
                  rows={filteredSuperPartners.map((u, i) => (
                    <tr key={u._id}>
                      <td style={{ fontFamily: 'monospace' }}>{u.client_id_ref || u._id?.slice(-6).toUpperCase()}</td>
                      <td><div className="user-info"><div className="user-avatar" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>{u.companyName?.charAt(0) || u.name?.charAt(0)}</div><b>{u.companyName || u.name}</b></div></td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><StatusBadge status={u.is_active} /></td>
                      <td><ActionButtons user={u} /></td>
                    </tr>
                  ))}
                />
              </SectionWrapper>
            )}

            {shouldShowSection('partner') && (
              <SectionWrapper title="Business Partner Network" icon={<Link size={18} />} count={partners.length} role="partner">
                <TableComponent headers={['ID', 'Partner Firm', 'Parent Node', 'Contact', 'Status', 'Actions']} 
                  rows={filteredPartners.map((u, i) => (
                    <tr key={u._id}>
                      <td style={{ fontFamily: 'monospace' }}>{u.client_id_ref || u._id?.slice(-6).toUpperCase()}</td>
                      <td><b>{u.companyName || u.name}</b></td>
                      <td style={{ color: 'var(--green)', fontWeight: 600 }}>{allUsers.find(p => p._id === u.parent_id)?.name || 'Direct'}</td>
                      <td>{u.email}</td>
                      <td><StatusBadge status={u.is_active} /></td>
                      <td><ActionButtons user={u} /></td>
                    </tr>
                  ))}
                />
              </SectionWrapper>
            )}

            {shouldShowSection('client') && (
              <SectionWrapper title="Client Portal Accounts" icon={<UsersIcon size={18} />} count={clients.length} role="client">
                <TableComponent headers={['ID', 'Client Name', 'Portfolio Manager', 'Relation', 'Status', 'Actions']} 
                  rows={filteredClients.map((u, i) => (
                    <tr key={u._id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--green)' }}>{u.client_id_ref || u._id?.slice(-6).toUpperCase()}</td>
                      <td><div className="user-info"><div className="user-avatar">{u.name?.charAt(0)}</div><b>{u.name}</b></div></td>
                      <td>{allUsers.find(p => p._id === u.parent_id)?.name || '—'}</td>
                      <td><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{u.relation?.toUpperCase() || 'DIRECT'}</span></td>
                      <td><StatusBadge status={u.is_active} /></td>
                      <td><ActionButtons user={u} /></td>
                    </tr>
                  ))}
                />
              </SectionWrapper>
            )}
          </div>
        </div>

        {/* 🛠️ Right Sidebar: Quick Actions & Forms */}
        <div className="um-right-panel animate-seq-4">
          <div className="right-panel-sticky">
            <div className="panel-label">
              <ClipboardList size={16} /> Form Sections
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Quickly onboard new users via specialized forms.
            </div>

            {formCards.map((card, idx) => (
              <div key={idx} onClick={() => navigate(`/users/add?role=${card.role}`)} className="fintech-form-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '42px', height: '42px', background: 'var(--green)', 
                    borderRadius: '12px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                    flexShrink: 0
                  }}>
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{card.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{card.sub}</div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }}></div>
            
            <div onClick={handleExport} className="fintech-form-card" style={{ background: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '42px', height: '42px', background: 'var(--green)', 
                  borderRadius: '12px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                  flexShrink: 0
                }}>
                  <Download size={20} strokeWidth={2.5} color="#000" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Export CSV</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>Download all user records</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${activeModal ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && closeModal()}>
        {activeModal === 'create_user' && (
          <div className="clean-modal" onClick={(e) => e.stopPropagation()}>
            <div className="clean-modal-header">
              <div>
                <h2 className="clean-modal-title">Create New User</h2>
                <p className="clean-modal-sub">Fill in details to onboard a new user</p>
              </div>
              <button className="clean-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            
            <div className="clean-modal-body">
              <div className="clean-section-label">BASIC INFORMATION</div>
              <div className="clean-field-group">
                <div className="field">
                  <label className="clean-label">FULL NAME</label>
                  <input type="text" className="clean-input" placeholder="Enter full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="clean-label">USER ROLE</label>
                  <select className="clean-select" value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="super_partner">Super Partner</option>
                    <option value="partner">Partner</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <div className="field">
                  <label className="clean-label">EMAIL ADDRESS</label>
                  <input type="email" className="clean-input" placeholder="user@example.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="clean-label">PHONE NUMBER</label>
                  <input type="tel" className="clean-input" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label className="clean-label">ASSIGNED TO (REPORTING)</label>
                  <select className="clean-select" value={formData.manager} onChange={e => setFormData(p => ({ ...p, manager: e.target.value }))}>
                    <option value="">Select Manager</option>
                    {allUsers.filter(u => ['super_admin', 'admin', 'super_partner'].includes(u.role)).map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({ROLE_MAP[m.role] || m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="clean-section-label">LOGIN CREDENTIALS</div>
              <div className="clean-field-group">
                <div className="field">
                  <label className="clean-label">LOGIN USERNAME / EMAIL</label>
                  <input type="text" className="clean-input" placeholder="Auto-generated or enter manually" value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="clean-label">TEMPORARY PASSWORD</label>
                  <input type="password" className="clean-input" placeholder="••••••••" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>User will be asked to change on first login</p>
                </div>
              </div>

              <div className="clean-section-label">PERMISSIONS</div>
              <div className="clean-perm-grid">
                {[
                  { id: 'create_leads', label: 'Create Leads' },
                  { id: 'assign_tasks', label: 'Assign Tasks' },
                  { id: 'view_reports', label: 'View Reports' },
                  { id: 'approve_agreements', label: 'Approve Agreements' },
                  { id: 'upload_documents', label: 'Upload Documents' },
                  { id: 'manage_commission', label: 'Manage Commission' },
                  { id: 'access_billing', label: 'Access Billing' },
                  { id: 'view_all_clients', label: 'View All Clients' },
                  { id: 'system_settings', label: 'System Settings' }
                ].map(perm => (
                  <div key={perm.id} className="clean-perm-item">
                    <span className="clean-perm-label">{perm.label}</span>
                    <input type="checkbox" className="clean-toggle" defaultChecked={['create_leads', 'assign_tasks', 'view_reports', 'upload_documents'].includes(perm.id)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="clean-modal-footer">
              <button className="btn-clean-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-clean-primary" onClick={handleCreateUser} disabled={submitting}>
                {submitting ? 'Processing...' : 'Create User & Send Credentials'}
              </button>
            </div>
          </div>
        )}
        {activeModal === 'edit_user' && editForm && (
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '760px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize: '20px', textTransform: 'capitalize' }}>
                Edit {editForm.role?.replace('_', ' ')} — {(editForm.client_id_ref || editForm._id || '').toString().slice(-6).toUpperCase()}
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#22c55e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: '16px' }}>DETAILS</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <EnhancedFormInput label="FULL NAME" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                {(['admin', 'super_admin', 'claim_admin', 'service_admin', 'store_admin', 'employee', 'team', 'staff'].includes(editForm.role)) && (
                  <EnhancedFormInput label="USERNAME" value={editForm.username} onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))} />
                )}
                {(['partner', 'super_partner'].includes(editForm.role)) && (
                  <EnhancedFormInput label="COMPANY NAME" value={editForm.companyName} onChange={(e) => setEditForm((p) => ({ ...p, companyName: e.target.value }))} />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: 16 }}>
                <EnhancedFormInput label="EMAIL" type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                <EnhancedFormInput label="PHONE" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>

              {['admin', 'super_admin', 'claim_admin', 'service_admin', 'store_admin'].includes(editForm.role) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: 16 }}>
                  <EnhancedFormInput label="DEPARTMENT" value={editForm.department || ''} onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: 16 }}>
                <div className="form-group">
                  <span className="form-label" style={{ marginBottom: '4px' }}>STATUS</span>
                  <select className="form-select" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} style={{ padding: '14px 16px', borderRadius: '10px', background: '#0a0f18', color: '#f8fafc', border: '1px solid #1e293b' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {['employee', 'team', 'staff'].includes(editForm.role) && (
                  <EnhancedFormInput label="DEPARTMENT" value={editForm.department || ''} onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))} />
                )}
                {['admin', 'super_admin', 'claim_admin', 'service_admin', 'store_admin'].includes(editForm.role) && (
                  <div className="form-group">
                    <span className="form-label" style={{ marginBottom: '4px' }}>ROLE</span>
                    <select className="form-select" value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))} style={{ padding: '14px 16px', borderRadius: '10px', background: '#0a0f18', color: '#f8fafc', border: '1px solid #1e293b' }}>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="claim_admin">Claim Admin</option>
                      <option value="service_admin">Service Admin</option>
                      <option value="store_admin">Store Admin</option>
                    </select>
                  </div>
                )}
                {['partner', 'super_partner'].includes(editForm.role) && (
                  <EnhancedFormInput label="PROFESSION" value={editForm.profession} onChange={(e) => setEditForm((p) => ({ ...p, profession: e.target.value }))} />
                )}
                {editForm.role === 'client' && (
                  <EnhancedFormInput label="CITY" value={editForm.city} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} />
                )}
              </div>

              {['employee', 'team', 'staff'].includes(editForm.role) && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: 16 }}>
                    <div className="form-group">
                      <span className="form-label" style={{ marginBottom: '4px' }}>ACCESS ROLE</span>
                      <select className="form-select" value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))} style={{ padding: '14px 16px', borderRadius: '10px', background: '#0a0f18', color: '#f8fafc', border: '1px solid #1e293b' }}>
                        <option value="employee">Employee</option>
                        <option value="team">Team</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    <EnhancedFormInput label="SPECIALIZATION" value={editForm.specialization || ''} onChange={(e) => setEditForm((p) => ({ ...p, specialization: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: 16 }}>
                    <EnhancedFormInput label="SKILLS (comma-separated)" value={editForm.skills || ''} onChange={(e) => setEditForm((p) => ({ ...p, skills: e.target.value }))} placeholder="e.g. KYC, Claims, Ops" />
                    <EnhancedFormInput label="JOB ROLES / TITLE" value={editForm.designation || ''} onChange={(e) => setEditForm((p) => ({ ...p, designation: e.target.value }))} placeholder="As saved from employee form" />
                  </div>
                </>
              )}

            </div>
            <div className="modal-footer" style={{ padding: '20px 24px' }}>
              <button className="topbar-btn secondary" onClick={closeModal} style={{ borderRadius: 8, padding: '10px 22px' }} disabled={savingEdit}>
                Cancel
              </button>
              <button className="topbar-btn primary" onClick={handleSaveUser} style={{ borderRadius: 8, padding: '10px 22px' }} disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
        {activeModal === 'view_user' && selectedUser && (
          <div className="modal" style={{ animation: 'fadeInScale 0.3s forwards', maxWidth: '980px', width: '95%', background: 'transparent', padding: 0, boxShadow: 'none' }} onClick={(e) => e.stopPropagation()}>
            <style>{`
              .va-wrap { padding: 36px 40px; background: #111827; border-radius: 18px; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid #1e293b; }
              .va-grid { display: grid; grid-template-columns: 280px 1fr; gap: 48px; }
              .va-section-title { font-size: 11.5px; font-weight: 800; color: #22c55e; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; }
              .va-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #1e293b; }
              .va-row:last-child { border-bottom: none; }
              .va-label { color: #94a3b8; font-size: 13.5px; font-weight: 600; }
              .va-value { color: #f8fafc; font-weight: 800; font-size: 13.5px; text-align: right; }
              .va-value.blue { color: #22c55e; }
              .va-pill { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; white-space: nowrap; }
              .va-pill.blue-light { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
              .va-pill.green-light { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
              .va-pill.gray-light { background: #111827; color: #94a3b8; }
              .va-perm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 32px; }
              .va-sidebar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
              .va-activity-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
              .va-activity-item { display: flex; gap: 12px; align-items: flex-start; }
              .va-activity-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
              .va-activity-dot.blue { background: #22c55e; }
              .va-activity-dot.green { background: #22c55e; }
              .va-activity-text { font-size: 13.5px; color: #f8fafc; font-weight: 500; line-height: 1.4; }
              .va-activity-text a { color: #22c55e; text-decoration: none; font-weight: 600; }
              .va-activity-time { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 500; }
              .va-footer { display: flex; justify-content: flex-end; align-items: center; gap: 12px; padding-top: 24px; border-top: 1px solid #1e293b; margin-top: 36px; }
              .va-btn { padding: 11px 24px; border-radius: 8px; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; border: none; font-family: inherit; }
              .va-btn.red-outline { background: #111827; border: 1.5px solid #f43f5e; color: #f43f5e; }
              .va-btn.red-outline:hover { background: rgba(244, 63, 94, 0.1); }
              .va-btn.gray-outline { background: #111827; border: 1.5px solid #1e293b; color: #f8fafc; }
              .va-btn.gray-outline:hover { background: #1e293b; }
              .va-btn.blue-solid { background: #22c55e; color: var(--text); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25); }
              .va-btn.blue-solid:hover { background: #16a34a; }
              .va-select { padding: 8px 12px; border: 1.5px solid #1e293b; border-radius: 8px; font-size: 13.5px; font-weight: 700; color: #f8fafc; background: #0a0f18; outline: none; cursor: pointer; font-family: inherit; }
              .va-select:focus { border-color: #22c55e; }
              .view-section { background: #0a0f18; border-radius: 18px; padding: 24px; border: 1px solid #1e293b; }
              .view-section-row { display: flex; justify-content: space-between; gap: 12px; }
              .view-section-label { color: #94a3b8; font-size: 13px; }
              .view-section-value { color: #f8fafc; font-weight: 600; text-align: right; }
            `}</style>
            <div className="va-wrap">
              <div className="va-grid">
                <div>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: '24px', background: '#0a0f18', border: '1px solid #1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', color: '#22c55e' }}>
                    {selectedUser.name?.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="va-section-title">System Status</div>
                  <div className="view-section">
                    <div className="view-section-row"><span className="view-section-label">Account Type</span><span className="view-section-value" style={{ color: '#22c55e' }}>{ROLE_MAP[selectedUser.role] || selectedUser.role}</span></div>
                    <div className="view-section-row" style={{ marginTop: 12 }}><span className="view-section-label">Login Access</span><span className="view-section-value">{selectedUser.is_active !== false ? 'Enabled' : 'Disabled'}</span></div>
                    <div className="view-section-row" style={{ marginTop: 12 }}><span className="view-section-label">Last Login</span><span className="view-section-value">Today, 11:42 AM</span></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                      <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>{selectedUser.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="va-pill blue-light">ID: {(selectedUser.client_id_ref || selectedUser._id || '').toString().slice(-6).toUpperCase()}</span>
                        <span className={`va-pill ${selectedUser.is_active !== false ? 'green-light' : 'gray-light'}`}>{selectedUser.is_active !== false ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <button className="action-btn" onClick={closeModal} style={{ width: 40, height: 40, borderRadius: '50%' }}><X size={20} /></button>
                  </div>

                  <div className="va-section-title">Contact & Security</div>
                  <div className="va-perm-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 40 }}>
                    <div className="va-row"><span className="va-label">Email Address</span><span className="va-value">{selectedUser.email}</span></div>
                    <div className="va-row"><span className="va-label">Phone Number</span><span className="va-value">{selectedUser.phone || '—'}</span></div>
                    <div className="va-row"><span className="va-label">Username</span><span className="va-value">{selectedUser.username || '—'}</span></div>
                    <div className="va-row"><span className="va-label">Department</span><span className="va-value">{selectedUser.department || '—'}</span></div>
                  </div>

                  <div className="va-section-title">System Permissions</div>
                  <div className="va-perm-grid">
                    {ROLE_PERMISSIONS[resolveRoleForPermissions(selectedUser.role)].map((p, i) => (
                      <div key={i} className="va-toggle-wrap">
                        <span className="va-toggle-label">{p.label}</span>
                        <input type="checkbox" className="va-toggle" checked={p.on} readOnly />
                      </div>
                    ))}
                  </div>

                  <div className="va-section-title">Sidebar Visibility</div>
                  <div className="va-sidebar-grid">
                    {ROLE_SIDEBAR_ACCESS[resolveRoleForPermissions(selectedUser.role)].map((p, i) => (
                      <div key={i} className="va-toggle-wrap">
                        <span className="va-toggle-label">{p.label}</span>
                        <input type="checkbox" className="va-toggle" checked={p.on} readOnly />
                      </div>
                    ))}
                  </div>

                  <div className="va-footer">
                    <button className="va-btn gray-outline" onClick={closeModal}>Close</button>
                    <button className="va-btn red-outline" onClick={() => { closeModal(); handleDeleteUser(selectedUser); }}><Trash2 size={16} /> Terminate</button>
                    <button className="va-btn blue-solid" onClick={() => { closeModal(); handleEdit(selectedUser); }}><Edit2 size={16} /> Edit Profile</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Addon: Advanced Filter Modal */}
      {showAdvFilters && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <div style={{ background: 'var(--card)', width: '600px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34, 197, 94, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  <Settings size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Advanced User Filters</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-light)' }}>Apply global filters to the user management lists</p>
                </div>
              </div>
              <button onClick={() => setShowAdvFilters(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>User Role</label>
                  <select className="um-filter-select" value={advFilters.role} onChange={e => setAdvFilters({...advFilters, role: e.target.value})} style={{ width: '100%', height: '44px', background: 'var(--bg)' }}>
                    <option value="">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="super_partner">Super Partner</option>
                    <option value="partner">Partner</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Status (Active/Inactive)</label>
                  <select className="um-filter-select" value={advFilters.status} onChange={e => setAdvFilters({...advFilters, status: e.target.value})} style={{ width: '100%', height: '44px', background: 'var(--bg)' }}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Store Location</label>
                  <select className="um-filter-select" value={advFilters.store} onChange={e => setAdvFilters({...advFilters, store: e.target.value})} style={{ width: '100%', height: '44px', background: 'var(--bg)' }}>
                    <option value="">All Stores</option>
                    {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Department</label>
                  <select className="um-filter-select" value={advFilters.department} onChange={e => setAdvFilters({...advFilters, department: e.target.value})} style={{ width: '100%', height: '44px', background: 'var(--bg)' }}>
                    <option value="">All Departments</option>
                    {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Service Type</label>
                  <select className="um-filter-select" value={advFilters.serviceType} onChange={e => setAdvFilters({...advFilters, serviceType: e.target.value})} style={{ width: '100%', height: '44px', background: 'var(--bg)' }}>
                    <option value="">All Services</option>
                    {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Date From</label>
                  <input type="date" className="um-search-input" value={advFilters.dateFrom} onChange={e => setAdvFilters({...advFilters, dateFrom: e.target.value})} style={{ width: '100%', height: '44px', paddingLeft: 16, paddingRight: 16, background: 'var(--bg)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Date To</label>
                  <input type="date" className="um-search-input" value={advFilters.dateTo} onChange={e => setAdvFilters({...advFilters, dateTo: e.target.value})} style={{ width: '100%', height: '44px', paddingLeft: 16, paddingRight: 16, background: 'var(--bg)' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setAdvFilters({ role: '', store: '', department: '', status: '', dateFrom: '', dateTo: '', serviceType: '' })}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
              >
                Reset Filters
              </button>
              <button 
                onClick={() => setShowAdvFilters(false)}
                style={{ background: 'var(--green)', border: 'none', padding: '10px 32px', borderRadius: 8, color: '#000', cursor: 'pointer', fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}
              >
                Apply Filters <CheckCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;

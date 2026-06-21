import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/home/Dashboard';
import Claims from './pages/claims/Claims';
import ClaimDetail from './pages/claims/ClaimDetail';
import Leads from './pages/crm/Leads';
import Catalog from './pages/catalog/Catalog';
import Users from './pages/hr/Users';
import Activity from './pages/activity/Activity';
import Clients from './pages/clients/Clients';
import ClientProfile from './pages/clients/ClientProfile';
import ClientForm from './pages/user-lists/ClientForm';
import Proposals from './pages/crm/Proposals';
import Employees from './pages/hr/Employees';
import SuperAdmin from './pages/super-admin/Overview';
import Tickets from './pages/super-admin/Tickets';
import MyClaimAI from './pages/super-admin/MyClaimAI';
import AdminList from './pages/user-lists/AdminList';
import PartnerList from './pages/user-lists/PartnerList';
import SuperPartnerList from './pages/user-lists/SuperPartnerList';
import TaskBoard from './pages/tasks/TaskBoard';
import HubPage from './pages/hubs/HubPage';
import StoreMarketplace from './pages/store/StoreMarketplace';
import ClaimStore from './pages/store/ClaimStore';
import ServiceStore from './pages/store/ServiceStore';
import PreIpoStore from './pages/store/PreIpoStore';
import OperationsHub from './pages/operations/OperationsHub';
import KYCHub from './pages/operations/KYCHub';
import StubPage from './pages/stubs/StubPage';
import EnterpriseDashboard from './pages/dashboards/EnterpriseDashboard';
import UserAddForm from './pages/user-lists/UserAddForm';
import AdvancedAnalytics from './pages/analytics/AdvancedAnalytics';
import DepartmentBoard from './pages/departments/DepartmentBoard';
import AdminTicketManagement from './pages/admin/AdminTicketManagement';
import AdminDocumentVerification from './pages/admin/AdminDocumentVerification';
import AdminReports from './pages/admin/AdminReports';

function App() {
  React.useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (e) => {
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(mediaQuery);
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="home" element={<Dashboard />} />
            <Route path="claims" element={<Claims />} />
            <Route path="claims/:id" element={<ClaimDetail />} />

            {/* ── Super Admin only ──────────────────────────────────────── */}
            <Route path="leads" element={<ProtectedRoute superAdminOnly={true}><Leads /></ProtectedRoute>} />
            <Route path="lead-centre" element={<ProtectedRoute superAdminOnly={true}><Leads /></ProtectedRoute>} />
            <Route path="catalog" element={<ProtectedRoute superAdminOnly={true}><Catalog /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute superAdminOnly={true}><Users /></ProtectedRoute>} />
            <Route path="admin-list" element={<ProtectedRoute superAdminOnly={true}><AdminList /></ProtectedRoute>} />
            <Route path="client-list" element={<ProtectedRoute superAdminOnly={true}><Clients /></ProtectedRoute>} />
            <Route path="super-partner-list" element={<ProtectedRoute superAdminOnly={true}><SuperPartnerList /></ProtectedRoute>} />
            <Route path="partner-list" element={<ProtectedRoute superAdminOnly={true}><PartnerList /></ProtectedRoute>} />
            <Route path="super-admin" element={<ProtectedRoute superAdminOnly={true}><SuperAdmin /></ProtectedRoute>} />
            <Route path="super-admin/users" element={<ProtectedRoute superAdminOnly={true}><Users /></ProtectedRoute>} />
            <Route path="super-admin/leads" element={<ProtectedRoute superAdminOnly={true}><Leads /></ProtectedRoute>} />
            <Route path="super-admin/clients" element={<ProtectedRoute superAdminOnly={true}><Clients /></ProtectedRoute>} />
            <Route path="super-admin/tickets" element={<ProtectedRoute superAdminOnly={true}><Tickets /></ProtectedRoute>} />
            <Route path="super-admin/services" element={<ProtectedRoute superAdminOnly={true}><Catalog /></ProtectedRoute>} />
            <Route path="super-admin/analytics" element={<ProtectedRoute superAdminOnly={true}><AdvancedAnalytics /></ProtectedRoute>} />
            <Route path="super-admin/activity" element={<ProtectedRoute superAdminOnly={true}><Activity /></ProtectedRoute>} />
            <Route path="super-admin/ai-workspace" element={<ProtectedRoute superAdminOnly={true}><MyClaimAI /></ProtectedRoute>} />
            <Route path="clients" element={<ProtectedRoute superAdminOnly={true}><Clients /></ProtectedRoute>} />
            <Route path="clients/add" element={<ProtectedRoute superAdminOnly={true}><ClientForm /></ProtectedRoute>} />
            <Route path="clients/:id" element={<ProtectedRoute superAdminOnly={true}><ClientProfile /></ProtectedRoute>} />
            <Route path="proposals" element={<ProtectedRoute superAdminOnly={true}><Proposals /></ProtectedRoute>} />
            <Route path="proposal-centre" element={<ProtectedRoute superAdminOnly={true}><Proposals /></ProtectedRoute>} />
            <Route path="employees" element={<ProtectedRoute superAdminOnly={true}><Employees /></ProtectedRoute>} />
            <Route path="enterprise-dashboard" element={<ProtectedRoute superAdminOnly={true}><EnterpriseDashboard /></ProtectedRoute>} />
            <Route path="dept-claim" element={<ProtectedRoute superAdminOnly={true}><DepartmentBoard initialTab="claim" /></ProtectedRoute>} />
            <Route path="dept-service" element={<ProtectedRoute superAdminOnly={true}><DepartmentBoard initialTab="service" /></ProtectedRoute>} />
            <Route path="dept-store" element={<ProtectedRoute superAdminOnly={true}><DepartmentBoard initialTab="store" /></ProtectedRoute>} />
            <Route path="dept-support" element={<ProtectedRoute superAdminOnly={true}><DepartmentBoard initialTab="support" /></ProtectedRoute>} />
            <Route path="stub-claim-store" element={<ProtectedRoute superAdminOnly={true}><StoreMarketplace vertical="claim" title="Claim Store" /></ProtectedRoute>} />
            <Route path="stub-service-store" element={<ProtectedRoute superAdminOnly={true}><StoreMarketplace vertical="service" title="Service Store" /></ProtectedRoute>} />

            {/* ── Admin + Super Admin ───────────────────────────────────── */}
            <Route path="users/add" element={<ProtectedRoute adminOnly={true}><UserAddForm /></ProtectedRoute>} />
            <Route path="employee-list" element={<ProtectedRoute adminOnly={true}><Employees /></ProtectedRoute>} />
            <Route path="activity" element={<ProtectedRoute adminOnly={true}><Activity /></ProtectedRoute>} />
            <Route path="activity-log" element={<ProtectedRoute adminOnly={true}><Activity /></ProtectedRoute>} />
            <Route path="task-board-main" element={<ProtectedRoute adminOnly={true}><TaskBoard /></ProtectedRoute>} />
            <Route path="task-claim-hub" element={<ProtectedRoute adminOnly={true}><HubPage vertical="claim" title="Claim Hub" subtitle="All IEPF and claim tickets" /></ProtectedRoute>} />
            <Route path="task-service-hub" element={<ProtectedRoute adminOnly={true}><HubPage vertical="service" title="Service Hub" subtitle="All service tickets and controls" /></ProtectedRoute>} />
            <Route path="task-store-hub" element={<ProtectedRoute adminOnly={true}><HubPage vertical="store" title="Store Hub" subtitle="Box & pricing controls" /></ProtectedRoute>} />
            <Route path="task-support-hub" element={<ProtectedRoute adminOnly={true}><HubPage vertical="support" title="Support Hub" subtitle="Support tickets from all users" /></ProtectedRoute>} />
            <Route path="store/claim" element={<ProtectedRoute adminOnly={true}><ClaimStore /></ProtectedRoute>} />
            <Route path="store/service" element={<ProtectedRoute adminOnly={true}><ServiceStore /></ProtectedRoute>} />
            <Route path="store/pre-ipo" element={<ProtectedRoute adminOnly={true}><PreIpoStore /></ProtectedRoute>} />
            <Route path="operations" element={<ProtectedRoute adminOnly={true}><OperationsHub /></ProtectedRoute>} />
            <Route path="operations/kyc" element={<ProtectedRoute adminOnly={true}><KYCHub /></ProtectedRoute>} />
            <Route path="operations/documents" element={<ProtectedRoute adminOnly={true}><AdminDocumentVerification /></ProtectedRoute>} />
            <Route path="operations/:tab" element={<ProtectedRoute adminOnly={true}><OperationsHub /></ProtectedRoute>} />
            <Route path="admin-tickets" element={<ProtectedRoute adminOnly={true}><AdminTicketManagement /></ProtectedRoute>} />
            <Route path="admin-documents" element={<ProtectedRoute adminOnly={true}><AdminDocumentVerification /></ProtectedRoute>} />
            <Route path="admin-reports" element={<ProtectedRoute adminOnly={true}><AdminReports /></ProtectedRoute>} />



          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

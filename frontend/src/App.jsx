import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './contexts/ThemeContext';

import Login from './pages/auth/Login';

const ClientDashboard = React.lazy(() => import('./pages/dashboards/client/ClientDashboard'));
const Dashboard = React.lazy(() => import('./pages/home/Dashboard'));
const Claims = React.lazy(() => import('./pages/claims/Claims'));
const ClaimDetail = React.lazy(() => import('./pages/claims/ClaimDetail'));
const Leads = React.lazy(() => import('./pages/crm/Leads'));
const Catalog = React.lazy(() => import('./pages/catalog/Catalog'));
const Users = React.lazy(() => import('./pages/hr/Users'));
const Activity = React.lazy(() => import('./pages/activity/Activity'));
const Clients = React.lazy(() => import('./pages/clients/Clients'));
const ClientProfile = React.lazy(() => import('./pages/clients/ClientProfile'));
const ClientForm = React.lazy(() => import('./pages/user-lists/ClientForm'));
const Proposals = React.lazy(() => import('./pages/crm/Proposals'));
const Employees = React.lazy(() => import('./pages/hr/Employees'));
const SuperAdmin = React.lazy(() => import('./pages/super-admin/Overview'));
const Tickets = React.lazy(() => import('./pages/super-admin/Tickets'));
const MyClaimAI = React.lazy(() => import('./pages/super-admin/MyClaimAI'));
const AdminList = React.lazy(() => import('./pages/user-lists/AdminList'));
const PartnerList = React.lazy(() => import('./pages/user-lists/PartnerList'));
const PartnerProfile = React.lazy(() => import('./pages/user-lists/PartnerProfile'));
const SuperPartnerList = React.lazy(() => import('./pages/user-lists/SuperPartnerList'));
const SuperPartnerProfile = React.lazy(() => import('./pages/user-lists/SuperPartnerProfile'));
const TaskBoard = React.lazy(() => import('./pages/tasks/TaskBoard'));
const HubPage = React.lazy(() => import('./pages/hubs/HubPage'));
const StoreMarketplace = React.lazy(() => import('./pages/store/StoreMarketplace'));
const ClaimStore = React.lazy(() => import('./pages/store/ClaimStore'));
const ServiceStore = React.lazy(() => import('./pages/store/ServiceStore'));
const PreIpoStore = React.lazy(() => import('./pages/store/PreIpoStore'));
const WealthManagementStore = React.lazy(() => import('./pages/store/WealthManagementStore'));
const OperationsHub = React.lazy(() => import('./pages/operations/OperationsHub'));
const KYCHub = React.lazy(() => import('./pages/operations/KYCHub'));
const StubPage = React.lazy(() => import('./pages/stubs/StubPage'));
const EnterpriseDashboard = React.lazy(() => import('./pages/dashboards/EnterpriseDashboard'));
const UserAddForm = React.lazy(() => import('./pages/user-lists/UserAddForm'));
const AdvancedAnalytics = React.lazy(() => import('./pages/analytics/AdvancedAnalytics'));
const DepartmentBoard = React.lazy(() => import('./pages/departments/DepartmentBoard'));
const AdminTicketManagement = React.lazy(() => import('./pages/admin/AdminTicketManagement'));
const AdminDocumentVerification = React.lazy(() => import('./pages/admin/AdminDocumentVerification'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
import { getPortalType, PORTAL_CONFIG } from './utils/portalConfig';

function App() {
  React.useEffect(() => {
    const portal = getPortalType();
    if (portal === 'client') {
      document.title = 'MyClaim India Portal';
    } else {
      document.title = 'WealthEarth - Management Portal';
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <React.Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', color: '#94a3b8', fontSize: '14px', letterSpacing: '0.5px' }}>
              Loading portal...
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>

            <Route index element={<Dashboard />} />
            <Route path="client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
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
            <Route path="super-partners/:id" element={<ProtectedRoute superAdminOnly={true} partnerAllowed={true}><SuperPartnerProfile /></ProtectedRoute>} />
            <Route path="partner-list" element={<ProtectedRoute superAdminOnly={true}><PartnerList /></ProtectedRoute>} />
            <Route path="partners/:id" element={<ProtectedRoute superAdminOnly={true} partnerAllowed={true}><PartnerProfile /></ProtectedRoute>} />
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
            <Route path="clients/:id" element={<ProtectedRoute superAdminOnly={true} partnerAllowed={true}><ClientProfile /></ProtectedRoute>} />
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
            <Route path="store/wealth" element={<WealthManagementStore />} />
            <Route path="operations" element={<ProtectedRoute adminOnly={true}><OperationsHub /></ProtectedRoute>} />
            <Route path="operations/kyc" element={<ProtectedRoute adminOnly={true}><KYCHub /></ProtectedRoute>} />
            <Route path="operations/documents" element={<ProtectedRoute adminOnly={true}><AdminDocumentVerification /></ProtectedRoute>} />
            <Route path="operations/:tab" element={<ProtectedRoute adminOnly={true}><OperationsHub /></ProtectedRoute>} />
            <Route path="admin-tickets" element={<ProtectedRoute adminOnly={true}><AdminTicketManagement /></ProtectedRoute>} />
            <Route path="admin-documents" element={<ProtectedRoute adminOnly={true}><AdminDocumentVerification /></ProtectedRoute>} />
            <Route path="admin-reports" element={<ProtectedRoute adminOnly={true}><AdminReports /></ProtectedRoute>} />



          </Route>
        </Routes>
          </React.Suspense>
      </AuthProvider>
    </ThemeProvider>
  </Router>
  );
}

export default App;

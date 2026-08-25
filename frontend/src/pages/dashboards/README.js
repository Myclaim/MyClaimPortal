// ============================================================
// DASHBOARD STRUCTURE — ROLE ISOLATION MAP
// ============================================================
// Each role has its OWN folder. Never mix role code across folders.
//
// Folder Structure:
//   src/pages/dashboards/
//   ├── super-admin/
//   │   ├── index.js                  ← barrel export
//   │   └── SuperAdminDashboard.jsx   ← EDIT THIS for super_admin role
//   │
//   ├── admin/
//   │   ├── index.js                  ← barrel export
//   │   └── AdminDashboard.jsx        ← EDIT THIS for admin role
//   │
//   ├── super-partner/
//   │   ├── index.js                  ← barrel export
//   │   └── SuperPartnerDashboard.jsx ← EDIT THIS for super_partner role
//   │
//   ├── partner/
//   │   ├── index.js                  ← barrel export
//   │   └── PartnerDashboard.jsx      ← EDIT THIS for partner role
//   │
//   ├── client/
//   │   ├── index.js                  ← barrel export
//   │   └── ClientDashboard.jsx       ← EDIT THIS for client role
//   │
//   └── employee/
//       ├── index.js                  ← barrel export
//       └── EmployeeDashboard.jsx     ← EDIT THIS for employee role
//
// ROUTER:
//   src/pages/home/Dashboard.jsx      ← ONLY routing logic, no UI
//
// RULE: If you are asked to update a specific role's dashboard,
//       only touch the file inside that role's folder.
// ============================================================

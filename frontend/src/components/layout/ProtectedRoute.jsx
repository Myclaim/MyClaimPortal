import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { isClientPortal, isManagementPortal } from '../../utils/portalConfig';

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false, partnerAllowed = false, clientOnly = false }) => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Cross-portal isolation guard
  if (isClientPortal() && user.role !== 'client') {
    // If an admin/partner has an old token stored in client portal, log them out
    logout();
    return <Navigate to="/login" />;
  }

  if (isManagementPortal() && user.role === 'client') {
    // If a client has a token stored in management portal, log them out
    logout();
    return <Navigate to="/login" />;
  }

  // Client-only route guard
  if (clientOnly && user.role !== 'client') {
    return <Navigate to="/" />;
  }

  // Blocks anyone who is not admin or super_admin, unless partnerAllowed is true and user is partner
  if (adminOnly && !['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Blocks regular admin — only super_admin can access (unless partnerAllowed)
  if (superAdminOnly && user.role !== 'super_admin') {
    if (partnerAllowed && (user.role === 'partner' || user.role === 'super_partner')) {
      // allow partner
    } else {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;

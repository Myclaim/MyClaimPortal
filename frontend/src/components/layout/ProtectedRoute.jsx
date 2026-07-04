import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false, partnerAllowed = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Blocks anyone who is not admin or super_admin, unless partnerAllowed is true and user is partner
  if (adminOnly && !['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Blocks regular admin — only super_admin can access (unless partnerAllowed)
  if (superAdminOnly && user.role !== 'super_admin') {
    if (partnerAllowed && user.role === 'partner') {
      // allow partner
    } else {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;

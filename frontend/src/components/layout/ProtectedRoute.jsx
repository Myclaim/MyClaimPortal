import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Blocks anyone who is not admin or super_admin
  if (adminOnly && !['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Blocks regular admin — only super_admin can access
  if (superAdminOnly && user.role !== 'super_admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

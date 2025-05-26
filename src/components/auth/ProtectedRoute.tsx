import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // If we're coming from signup (stored in location state), redirect to verify-email
  if (location.state?.fromSignup && !user?.emailConfirmed) {
    return <Navigate to="/verify-email" replace />;
  }

  // Allow access to verify-email page even if email is not confirmed
  if (location.pathname === '/verify-email' && user) {
    return <Outlet />;
  }

  // For all other protected routes, require authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

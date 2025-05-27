import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const PublicRoute: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (user) {
    // Redirect to the page they were trying to access, or dashboard as fallback
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

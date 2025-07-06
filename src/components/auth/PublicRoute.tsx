import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const PublicRoute: React.FC = () => {
  const { profile, isLoading } = useAuthStore();
  const location = useLocation();

  // If still loading, don't render anything yet
  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Prevent redirect if showSuccessModal or showIncorrectPasswordModal flag is set in location.state
  if (
    profile &&
    !location.state?.showSuccessModal &&
    !location.state?.showIncorrectPasswordModal
  ) {
    // Redirect to the page they were trying to access, or dashboard as fallback
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

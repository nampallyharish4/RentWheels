import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const VerifyEmailRoute: React.FC = () => {
  const { user } = useAuthStore();

  // If there's no user at all, redirect to signup
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // If user exists and is already verified, redirect to dashboard
  if (user.emailConfirmed) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show the verify email page for unconfirmed users
  return <Outlet />;
};

export default VerifyEmailRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import VerifyEmail from '../components/auth/VerifyEmail';

const VerifyEmailPage: React.FC = () => {
  const { user } = useAuthStore();

  // If there's no user at all, redirect to signup
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // If user exists and is already verified, redirect to dashboard
  if (user.emailConfirmed) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <VerifyEmail />
      </div>
    </div>
  );
};

export default VerifyEmailPage;

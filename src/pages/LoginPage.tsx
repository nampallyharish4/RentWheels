import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
import React from 'react';
import VerifyEmail from '../components/auth/VerifyEmail';

const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <VerifyEmail />
      </div>
    </div>
  );
};

export default VerifyEmailPage;
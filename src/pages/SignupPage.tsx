import React from 'react';
import SignupForm from '../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="container mx-auto px-4">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
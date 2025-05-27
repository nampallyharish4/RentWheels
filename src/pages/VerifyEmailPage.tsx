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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600">We've sent you a verification link</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-800">
              Verify Your Email
            </h2>
            <p className="text-gray-600 text-sm">
              Please check your email inbox and click the verification link to
              activate your account
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <p className="text-sm text-indigo-700">
                  If you don't see the email in your inbox, please check your
                  spam folder. The verification link will expire in 24 hours.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link
              to="/contact"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

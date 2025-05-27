import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const VerifyEmail: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      setResendStatus({});

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      setResendStatus({
        success:
          'Verification email has been resent. Please check your inbox and spam folder.',
      });
      setCountdown(60); // Start 60-second countdown
    } catch (error) {
      setResendStatus({
        error:
          (error as Error).message || 'Failed to resend verification email',
      });
    } finally {
      setIsResending(false);
    }
  };

  // The VerifyEmailRoute component now handles the redirection logic
  return (
    <Card>
      <CardHeader className="text-center">
        <Mail className="w-12 h-12 mx-auto text-primary-500 mb-4" />
        <h1 className="text-2xl font-bold text-secondary-900">
          Verify Your Email
        </h1>
        <p className="text-secondary-600 mt-2">
          We've sent a verification email to <strong>{user?.email}</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {resendStatus.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
            <CheckCircle
              className="text-green-500 mr-2 flex-shrink-0 mt-0.5"
              size={16}
            />
            <span className="text-green-700 text-sm">
              {resendStatus.success}
            </span>
          </div>
        )}

        {resendStatus.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle
              className="text-red-500 mr-2 flex-shrink-0 mt-0.5"
              size={16}
            />
            <span className="text-red-700 text-sm">{resendStatus.error}</span>
          </div>
        )}

        <div className="text-center space-y-4">
          <p className="text-secondary-600">
            Click the verification link in the email to complete your
            registration.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-secondary-500">
              Didn't receive the email? Check your spam folder or click below to
              resend.
            </p>
            <Button
              onClick={handleResendVerification}
              disabled={isResending || countdown > 0}
              isLoading={isResending}
              variant="outline"
              fullWidth
            >
              {countdown > 0
                ? `Resend available in ${countdown}s`
                : 'Resend Verification Email'}
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="text-center">
        <p className="text-secondary-600 text-sm">
          Already verified?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default VerifyEmail;

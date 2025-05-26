import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const VerifyEmail: React.FC = () => {
  const { user } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success?: string;
    error?: string;
  }>({});

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
        success: 'Verification email has been resent. Please check your inbox.',
      });
    } catch (error) {
      setResendStatus({
        error: (error as Error).message || 'Failed to resend verification email',
      });
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto px-4 sm:px-0">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Mail className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Verify Your Email</h1>
        </CardHeader>
        
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-secondary-600 mb-4">
              We've sent a verification email to <span className="font-medium text-secondary-900">{user?.email}</span>.
              Please check your inbox and click the verification link to complete your registration.
            </p>
            
            {resendStatus.success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start mb-4 text-left">
                <CheckCircle className="text-green-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-green-800 text-sm">{resendStatus.success}</span>
              </div>
            )}

            {resendStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start mb-4 text-left">
                <AlertCircle className="text-red-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-red-800 text-sm">{resendStatus.error}</span>
              </div>
            )}
            
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-md flex items-start mb-6 text-left">
              <CheckCircle className="text-primary-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
              <span className="text-primary-800 text-sm">
                Once verified, you'll be able to sign in and start using all features of RentWheels.
              </span>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start text-left">
              <AlertCircle className="text-amber-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
              <span className="text-amber-800 text-sm">
                If you don't see the email, please check your spam folder or request a new verification email.
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              onClick={handleResendVerification}
              isLoading={isResending}
              disabled={isResending}
            >
              Resend Verification Email
            </Button>
            
            <Link to="/login">
              <Button
                variant="ghost"
                fullWidth
              >
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-sm text-secondary-500">
            Need help? <a href="#" className="text-primary-600 hover:text-primary-700">Contact Support</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
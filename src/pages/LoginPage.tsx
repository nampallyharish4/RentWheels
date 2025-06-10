import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Card, {
  CardContent,
  CardHeader,
  CardFooter,
} from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import SuccessModal from '../components/ui/SuccessModal';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showIncorrectPasswordModal, setShowIncorrectPasswordModal] =
    useState(false);
  const [showAccountNotExistModal, setShowAccountNotExistModal] =
    useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Starting login process...');
      await login(formData.email, formData.password);
      console.log('Login completed successfully, showing success modal');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Login error in component:', error);
      
      // Check for Supabase specific error codes and messages
      const errorMessage = error?.message || '';
      const errorCode = error?.code || '';
      
      if (
        errorCode === 'invalid_credentials' || 
        errorMessage.includes('Invalid login credentials') ||
        errorMessage.includes('invalid_credentials')
      ) {
        setShowIncorrectPasswordModal(true);
      } else if (
        errorCode === 'user_not_found' ||
        errorMessage.includes('user not found') ||
        errorMessage.includes('User not found')
      ) {
        setShowAccountNotExistModal(true);
      } else if (
        errorMessage.includes('Email not confirmed') ||
        errorMessage.includes('email not confirmed')
      ) {
        setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
      } else {
        // Generic error message for other cases
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    console.log('Closing success modal and navigating to dashboard');
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-600 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <Card className="bg-white shadow-lg border border-gray-100">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
              <p className="text-gray-600 text-sm">
                Please enter your credentials
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  leftIcon={<Mail size={18} className="text-orange-500" />}
                  required
                  autoComplete="email"
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  labelClassName="text-gray-700"
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  leftIcon={<Lock size={18} className="text-orange-500" />}
                  required
                  autoComplete="current-password"
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  labelClassName="text-gray-700"
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                    ${
                      isLoading
                        ? 'bg-orange-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                    } transition-all duration-200`}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </CardContent>

            <CardFooter className="text-center border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Login Successful!"
        message="Welcome back! You have successfully logged in to your account."
      />
      
      {/* Incorrect Password Modal */}
      <SuccessModal
        isOpen={showIncorrectPasswordModal}
        onClose={() => setShowIncorrectPasswordModal(false)}
        title="Incorrect Password"
        message="The password you entered is incorrect. Please try again."
        error
      />
      
      {/* Account Not Exist Modal */}
      <SuccessModal
        isOpen={showAccountNotExistModal}
        onClose={() => setShowAccountNotExistModal(false)}
        title="Account Doesn't Exist"
        message="No account found with this email address. Please check your email or sign up."
        error
      />
    </>
  );
};

export default LoginPage;
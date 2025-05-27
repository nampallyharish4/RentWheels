import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import Card, {
  CardContent,
  CardHeader,
  CardFooter,
} from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.full_name);
      navigate('/dashboard');
    } catch (error) {
      setError((error as Error).message);
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join us and start renting vehicles today
          </p>
        </div>

        <Card className="bg-white shadow-lg border border-gray-100">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Sign Up</h2>
            <p className="text-gray-600 text-sm">
              Fill in your details to create an account
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="full_name"
                name="full_name"
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleInputChange}
                leftIcon={<User size={18} className="text-orange-500" />}
                required
                autoComplete="name"
                className="bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                labelClassName="text-gray-700"
              />

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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                leftIcon={<Lock size={18} className="text-orange-500" />}
                required
                autoComplete="new-password"
                className="bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                labelClassName="text-gray-700"
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                leftIcon={<Lock size={18} className="text-orange-500" />}
                required
                autoComplete="new-password"
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </CardContent>

          <CardFooter className="text-center border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By signing up, you agree to our{' '}
            <Link
              to="/terms"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

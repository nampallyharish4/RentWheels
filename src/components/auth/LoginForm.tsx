import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import SuccessModal from '../ui/SuccessModal';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { login, isLoading, error, user } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      setShowSuccessModal(true);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  return (
    <>
      <div className="max-w-md mx-auto px-4 sm:px-0">
        <Card className="w-full">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900">
              Welcome Back
            </h1>
            <p className="text-secondary-500 mt-1">
              Sign in to access your account
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                <AlertCircle
                  className="text-red-500 mr-2 flex-shrink-0 mt-0.5"
                  size={16}
                />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  leftIcon={<Mail size={18} />}
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  fullWidth
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-secondary-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Lock size={18} />}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  fullWidth
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />

                <div className="mt-1">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    <div className="relative w-10 h-5 bg-secondary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ms-2 text-sm font-medium text-secondary-700">
                      Show password
                    </span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                className="mt-6"
              >
                Sign In
              </Button>
            </form>
          </CardContent>

          {!user && (
            <CardFooter className="text-center">
              <p className="text-secondary-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Login Successful!"
        message="Welcome back! You have successfully logged in to your account."
      />
    </>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupForm: React.FC = () => {
  const { signup, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();
  
  const password = watch('password');
  
  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.email, data.password);
      navigate('/verify-email');
    } catch (err) {
      // Error is handled by the store
    }
  };
  
  return (
    <div className="max-w-md mx-auto px-4 sm:px-0">
      <Card className="w-full">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900">Create Your Account</h1>
          <p className="text-secondary-500 mt-1">Join RentWheels today</p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
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
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                leftIcon={<Lock size={18} />}
                placeholder="Create a password"
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
            </div>
            
            <div>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                leftIcon={<Lock size={18} />}
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                fullWidth
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
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
                  <span className="ms-2 text-sm font-medium text-secondary-700">Show password</span>
                </label>
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-secondary-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupForm;
import React from 'react';
import { CheckCircle, X, Mail } from 'lucide-react';
import Button from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  error?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  error = false,
}) => {
  if (!isOpen) return null;

  // Check if this is an email verification modal
  const isEmailVerification = title.toLowerCase().includes('verify') || title.toLowerCase().includes('email');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle">
          <div>
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                error ? 'bg-red-100' : isEmailVerification ? 'bg-blue-100' : 'bg-green-100'
              }`}
            >
              {error ? (
                <X className="h-6 w-6 text-red-600" />
              ) : isEmailVerification ? (
                <Mail className="h-6 w-6 text-blue-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3
                className={`text-lg font-bold leading-6 ${
                  error ? 'text-red-700' : isEmailVerification ? 'text-blue-700' : 'text-secondary-900'
                }`}
              >
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-secondary-600">{message}</p>
              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-5 sm:mt-6">
            <Button 
              onClick={onClose} 
              className={`w-full ${
                isEmailVerification 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : error 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isEmailVerification ? 'Continue to Sign In' : 'Got it!'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
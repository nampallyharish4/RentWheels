import React from 'react';
import Button from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  closeButtonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  closeButtonText = 'OK',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-primary-700 mb-4">
          {' '}
          {/* Primary color for success title */}
          {title}
        </h2>
        <p className="text-secondary-600 mb-6 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="primary" onClick={onClose}>
            {' '}
            {/* Primary variant for the button */}
            {closeButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

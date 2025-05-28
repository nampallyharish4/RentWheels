import React, { useState, useEffect } from 'react';
import { User, Phone, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal'; // Assuming a generic Modal component exists
import { useAuthStore } from '../../store/authStore';
import type { Profile } from '../../types'; // Assuming Profile type is defined

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
}) => {
  const { updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: currentProfile?.full_name || '',
    phone_number: currentProfile?.phone_number || '',
    avatar_url: currentProfile?.avatar_url || '',
  });

  // Update form data when currentProfile changes (e.g., modal opens with new data)
  useEffect(() => {
    setFormData({
      full_name: currentProfile?.full_name || '',
      phone_number: currentProfile?.phone_number || '',
      avatar_url: currentProfile?.avatar_url || '',
    });
    setError(''); // Clear error when modal re-opens
    setIsLoading(false); // Reset loading state
  }, [currentProfile]);

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

    if (!currentProfile?.id) {
      setError('Profile data is missing.');
      setIsLoading(false);
      return;
    }

    try {
      await updateProfile({
        id: currentProfile.id,
        ...formData,
      });
      // Handle success - maybe show a success message or just close
      onClose(); // Close modal on success
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="full_name"
          name="full_name"
          label="Full Name"
          value={formData.full_name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          leftIcon={<User size={18} />}
        />

        <Input
          id="phone_number"
          name="phone_number"
          label="Phone Number"
          value={formData.phone_number}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          leftIcon={<Phone size={18} />}
          type="tel"
        />

        <Input
          id="avatar_url"
          name="avatar_url"
          label="Profile Picture URL"
          value={formData.avatar_url}
          onChange={handleInputChange}
          placeholder="Enter URL for your profile picture"
          leftIcon={<ImageIcon size={18} />}
        />

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full mt-6">
          {isLoading ? 'Updating...' : 'Save Changes'}
        </Button>
      </form>
    </Modal>
  );
};

export default EditProfileModal;

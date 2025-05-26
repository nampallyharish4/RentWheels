import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { User, Phone, Image as ImageIcon, AlertCircle } from 'lucide-react';
import SuccessModal from '../components/ui/SuccessModal';
import type { UserProfile } from '../types';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string;
}

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    updateProfile,
    isLoading: authLoading,
    error: authError,
    loadProfile, // To ensure profile is fresh
    user,
  } = useAuthStore();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!profile) {
      loadProfile(); // Attempt to load profile if not available but user exists
    }
  }, [user, profile, loadProfile, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const profileUpdateData: Partial<UserProfile> = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      avatarUrl: formData.avatarUrl.trim(),
    };

    // Remove empty strings so they don't overwrite existing values with blanks if not intended
    // The backend `updateProfile` in store already handles only defined fields.
    // However, sending empty strings might be interpreted as wanting to clear fields.
    // Depending on desired behavior, this can be adjusted.
    Object.keys(profileUpdateData).forEach((key) => {
      const k = key as keyof Partial<UserProfile>;
      if (profileUpdateData[k] === '') {
        delete profileUpdateData[k];
      }
    });

    try {
      await updateProfile(profileUpdateData);
      setIsSuccessModalOpen(true);
    } catch (error) {
      setSubmitError((error as Error).message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate('/dashboard');
  };

  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-secondary-50 flex justify-center items-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="container mx-auto max-w-xl px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-secondary-900">
              Edit Profile
            </h1>
            <p className="text-secondary-600">
              Update your personal information.
            </p>
          </CardHeader>
          <CardContent>
            {(submitError || authError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                <AlertCircle
                  className="text-red-500 mr-2 flex-shrink-0 mt-0.5"
                  size={16}
                />
                <span className="text-red-700 text-sm">
                  {submitError || authError}
                </span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  leftIcon={<User size={18} />}
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  fullWidth
                />
                <Input
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  leftIcon={<User size={18} />}
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  fullWidth
                />
              </div>
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                leftIcon={<Phone size={18} />}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                fullWidth
              />
              <Input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                label="Avatar URL"
                leftIcon={<ImageIcon size={18} />}
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                fullWidth
              />
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  isLoading={isSubmitting || authLoading}
                  disabled={isSubmitting || authLoading}
                  fullWidth
                  className="sm:flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  fullWidth
                  className="sm:flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        title="Profile Updated"
        message="Your profile information has been successfully updated."
      />
    </div>
  );
};

export default EditProfilePage;

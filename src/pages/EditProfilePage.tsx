import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    avatar_url: profile?.avatar_url || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!profile) {
      navigate('/login');
    }
  }, [profile, navigate]);

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
      if (!profile?.id) {
        throw new Error('User profile not loaded.');
      }
      await updateProfile({
        id: profile.id,
        ...formData,
      });
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-secondary-900">
            Edit Profile
          </h1>
          <p className="text-sm text-secondary-600">
            Update your personal information
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="full_name"
              name="full_name"
              label="Full Name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              leftIcon={<User size={18} />}
              required
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

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfilePage;

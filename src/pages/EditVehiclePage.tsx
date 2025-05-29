import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { useVehicleStore } from '../store/vehicleStore';
import { useAuthStore } from '../store/authStore';
import type { Vehicle } from '../types';
import SuccessModal from '../components/ui/SuccessModal';

// Simple ToggleSwitch component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${
            checked ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${
            checked ? 'transform translate-x-6' : ''
          }`}
        ></div>
      </div>
      <div className="ml-3 text-gray-700 font-medium">{label}</div>
    </label>
  );
};

// Form data will be a subset of Vehicle, focusing on editable fields.
// Ensure price is handled as string for form input, and converted.
interface EditVehicleFormData {
  make: string;
  model: string;
  year: string;
  price: string; // Corresponds to dailyRate, handled as string
  category: string;
  description: string;
  imageUrl: string;
  location: string;
  available: boolean;
  type: 'car' | 'bike'; // Add vehicle type
}

const vehicleCategories: string[] = [
  'sedan',
  'suv',
  'luxury',
  'compact',
  'pickup',
  'minivan',
  'convertible',
  'electric',
];

const EditVehiclePage: React.FC = () => {
  const { id: vehicleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchVehicleById,
    selectedVehicle,
    updateVehicle,
    isLoading,
    error: storeError,
  } = useVehicleStore();
  const { profile } = useAuthStore();

  const [formData, setFormData] = useState<EditVehicleFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  // State for success modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleById(vehicleId);
    } else {
      setPageMessage('No vehicle ID provided.');
      navigate('/dashboard');
    }
  }, [vehicleId, fetchVehicleById, navigate]);

  useEffect(() => {
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      if (!profile || selectedVehicle.ownerId !== profile.id) {
        setPageMessage('You are not authorized to edit this vehicle.');
        return;
      }
      setFormData({
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        year: selectedVehicle.year.toString(),
        price: selectedVehicle.dailyRate.toString(),
        category: selectedVehicle.category,
        description: selectedVehicle.description,
        imageUrl: selectedVehicle.imageUrl,
        location: selectedVehicle.location,
        available: selectedVehicle.available,
        type: selectedVehicle.type, // Initialize type from selectedVehicle
      });
      setPageMessage(null);
    }
  }, [selectedVehicle, vehicleId, profile]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Dedicated handler for the available toggle switch
  const handleAvailableToggle = (checked: boolean) => {
    if (!formData) return;
    setFormData({
      ...formData,
      available: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData ||
      !vehicleId ||
      !profile ||
      selectedVehicle?.ownerId !== profile.id
    ) {
      setSubmitError(
        'Form data is missing, or you are not authorized. Please refresh.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (
        !formData.make ||
        !formData.model ||
        !formData.year ||
        !formData.price ||
        !formData.imageUrl ||
        !formData.location ||
        !formData.category ||
        !formData.type
      ) {
        setSubmitError('Please fill in all required fields (*).');
        setIsSubmitting(false);
        return;
      }

      const vehicleUpdateData: Partial<Vehicle> = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year, 10),
        dailyRate: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        imageUrl: formData.imageUrl,
        location: formData.location,
        available: formData.available, // Use boolean directly
        type: formData.type, // Include type in update data
      };

      await updateVehicle(vehicleId, vehicleUpdateData);
      setSuccessModalTitle('Vehicle Updated!');
      setSuccessModalMessage(
        'The vehicle details have been successfully updated.'
      );
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      setSubmitError(
        (error as Error).message || 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate(`/vehicles/list`);
  };

  if (isLoading && !formData && !pageMessage) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading vehicle details...
      </div>
    );
  }

  if (pageMessage) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        {pageMessage}
      </div>
    );
  }

  if (!formData && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Vehicle not found or an error occurred.
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Preparing form...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Vehicle Details
          </h1>
          <p className="text-gray-600">
            Update the information for your vehicle.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="make"
                  className="block text-sm font-medium text-gray-700"
                >
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  id="make"
                  value={formData.make}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700"
                >
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price per day (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                >
                  {vehicleCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location (City, State) *
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Image URL *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                ></textarea>
              </div>
              <div className="md:col-span-2 flex items-center">
                <ToggleSwitch
                  label="Available for rent"
                  checked={formData.available}
                  onChange={handleAvailableToggle}
                />
              </div>
            </div>

            {submitError && (
              <div className="text-red-600 text-sm mt-2">{submitError}</div>
            )}

            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        title={successModalTitle}
        message={successModalMessage}
      />
    </div>
  );
};

export default EditVehiclePage;

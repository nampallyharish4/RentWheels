import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { useVehicleStore } from '../store/vehicleStore';
import { useAuthStore } from '../store/authStore';
import type { Vehicle } from '../types';
import SuccessModal from '../components/ui/SuccessModal';

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
    const { name, value, type } = e.target;
    const val =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({
      ...formData,
      [name]: val,
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
        available: formData.available,
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

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate(`/vehicles/list`);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-secondary-900">
            Edit Vehicle Details
          </h1>
          <p className="text-secondary-600">
            Update the information for your vehicle.
          </p>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
              {submitError}
            </div>
          )}
          {storeError && !submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
              Store error: {storeError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="make"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="make"
                  id="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full input-class"
                />
              </div>
              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full input-class"
                />
              </div>
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Price per day (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full input-class"
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Select Type</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full input-class"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {vehicleCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Location (City, State) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full input-class"
                  placeholder="e.g., Los Angeles, CA"
                />
              </div>
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full input-class"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full input-class"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="available"
                  name="available"
                  type="checkbox"
                  checked={formData.available}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="available"
                  className="ml-2 block text-sm text-secondary-900"
                >
                  Available for rent
                </label>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Updating Vehicle...' : 'Save Changes'}
              </Button>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Cancel
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
      <style jsx global>{`
        .input-class {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .input-class:focus {
          outline: none;
          box-shadow: 0 0 0 2px #6366f1;
          border-color: #6366f1;
        }
        .input-class::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default EditVehiclePage;

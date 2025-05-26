import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import { useVehicleStore } from '../store/vehicleStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../components/ui/SuccessModal';

// Define an interface for the form data based on the Vehicle type (excluding id, createdAt, updatedAt, ownerId initially)
interface VehicleFormData {
  make: string;
  model: string;
  year: string; // Keep as string for form input, convert to number before sending
  price: string; // Keep as string for form input, convert to number before sending
  location: string;
  imageUrl: string;
  description: string;
  available?: boolean; // Optional, will default to true in store if not set
}

const initialFormData: VehicleFormData = {
  make: '',
  model: '',
  year: '',
  price: '',
  location: '',
  imageUrl: '',
  description: '',
  available: true,
};

const AddVehiclePage: React.FC = () => {
  const { createVehicle } = useVehicleStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // State for success modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [newlyCreatedVehicleId, setNewlyCreatedVehicleId] = useState<
    string | null
  >(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
    if (!user) {
      setSubmitError('You must be logged in to list a vehicle.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Basic validation (can be expanded)
      if (
        !formData.make ||
        !formData.model ||
        !formData.year ||
        !formData.price ||
        !formData.imageUrl ||
        !formData.location
      ) {
        setSubmitError('Please fill in all required fields (*).');
        setIsSubmitting(false);
        return;
      }

      const vehicleDataForStore = {
        ...formData,
        year: parseInt(formData.year, 10),
        dailyRate: parseFloat(formData.price), // Ensure field name matches store (dailyRate)
        ownerId: user.id,
        // category will need to be handled if it's a required part of your Vehicle type for creation
        // For now, assuming it might be optional or handled by default in Supabase/store
        category: 'sedan', // Example default, adjust as needed or add a form field
      };

      // Remove `price` if `dailyRate` is used, to match Omit<Vehicle, ...>
      // This depends on the exact structure expected by `createVehicle`
      // It expects Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
      // So ensure all fields in vehicleDataForStore match the Vehicle type properties (camelCase)
      // and all required fields for creation are present.
      const { price, ...restOfData } = vehicleDataForStore;

      const newVehicleId = await createVehicle(restOfData as any);
      setNewlyCreatedVehicleId(newVehicleId); // Store ID for navigation after modal close
      setSuccessModalTitle('Vehicle Listed!');
      setSuccessModalMessage(
        'Your vehicle has been successfully listed and is now available for others to see.'
      );
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Failed to list vehicle:', error);
      setSubmitError(
        (error as Error).message || 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    setFormData(initialFormData); // Reset form
    if (newlyCreatedVehicleId) {
      navigate(`/vehicles/${newlyCreatedVehicleId}`);
    } else {
      navigate('/dashboard'); // Fallback navigation
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-secondary-900">
            List Your Vehicle
          </h1>
          <p className="text-secondary-600">
            Provide comprehensive details about your vehicle to attract renters.
          </p>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
              {submitError}
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
                  className="mt-1 block w-full input-class"
                  placeholder="e.g., 2020"
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-secondary-700 mb-1"
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
                  Available for rent immediately
                </label>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'List My Vehicle'}
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
          border: 1px solid #d1d5db; /* secondary-300 */
          border-radius: 0.375rem; /* rounded-md */
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
        }
        .input-class:focus {
          outline: none;
          box-shadow: 0 0 0 2px #6366f1; /* ring-primary-500 */
          border-color: #6366f1; /* border-primary-500 */
        }
        .input-class::placeholder {
          color: #9ca3af; /* secondary-400 */
        }
      `}</style>
    </div>
  );
};

export default AddVehiclePage;

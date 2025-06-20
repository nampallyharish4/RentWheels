import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleStore } from '../store/vehicleStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import {
  Car,
  Plus,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import type { Vehicle } from '../types';
import Card, { CardContent } from '../components/ui/Card'; // For consistency if needed
import ConfirmationModal from '../components/ui/ConfirmationModal'; // Import the modal

const VehicleListPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    userListedVehicles,
    fetchUserListedVehicles,
    isLoading,
    error: storeError, // Renamed to avoid conflict with local error state
    deleteVehicle,
  } = useVehicleStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [pageError, setPageError] = useState<string | null>(null); // For displaying errors from delete action

  useEffect(() => {
    if (user) {
      fetchUserListedVehicles(user.id);
    }
  }, [user, fetchUserListedVehicles]);

  useEffect(() => {
    if (storeError) {
      setPageError(storeError); // Display store errors on the page
    }
  }, [storeError]);

  const openDeleteModal = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setPageError(null); // Clear previous page errors
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setVehicleToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDeleteVehicle = async () => {
    if (vehicleToDelete) {
      try {
        await deleteVehicle(vehicleToDelete.id);
        // Vehicle list will auto-update from the store
        closeDeleteModal();
      } catch (err) {
        // The error from deleteVehicle (already set in store) will be displayed by useEffect
        // Or, set a specific page error if preferred
        setPageError((err as Error).message || 'Failed to delete the vehicle.');
        // Keep modal open to show error context, or close it:
        // closeDeleteModal();
      }
    }
  };

  // Filter vehicles into available and unavailable lists
  const availableVehicles = userListedVehicles.filter(
    (vehicle) => vehicle.available
  );
  const unavailableVehicles = userListedVehicles.filter(
    (vehicle) => !vehicle.available
  );

  // Custom card renderer for this page, potentially different from dashboard's
  const renderListedVehicleCard = (vehicle: Vehicle) => (
    <Card key={vehicle.id} className="overflow-hidden flex flex-col h-full">
      <Link to={`/vehicles/${vehicle.id}`} className="block">
        <img
          src={
            vehicle.imageUrl ||
            'https://via.placeholder.com/400x250?text=No+Image'
          }
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-52 object-cover hover:opacity-90 transition-opacity duration-200"
        />
      </Link>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="block hover:text-primary-600"
          >
            <h3
              className="text-xl font-semibold text-secondary-900 truncate"
              title={`${vehicle.make} ${vehicle.model}`}
            >
              {vehicle.make} {vehicle.model}
            </h3>
          </Link>
          <p className="text-sm text-secondary-600">
            {vehicle.year} - {vehicle.location}
          </p>
          <p className="text-lg font-bold text-primary-600 mt-1">
            ₹{vehicle.dailyRate}/day
          </p>
          <span
            className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              vehicle.available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {vehicle.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        {/* Specifications Section */}
        <div className="mt-4 border-t border-secondary-100 pt-4">
          <h4 className="text-md font-semibold text-primary-700 mb-2 flex items-center gap-2">
            <Car size={18} className="text-orange-500" /> Specifications
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-secondary-500">Make</span>
              <div className="font-medium text-secondary-900">
                {vehicle.make}
              </div>
            </div>
            <div>
              <span className="text-secondary-500">Model</span>
              <div className="font-medium text-secondary-900">
                {vehicle.model}
              </div>
            </div>
            <div>
              <span className="text-secondary-500">Year</span>
              <div className="font-medium text-secondary-900">
                {vehicle.year}
              </div>
            </div>
            <div>
              <span className="text-secondary-500">Category</span>
              <div className="font-medium text-secondary-900 capitalize">
                {vehicle.category}
              </div>
            </div>
            <div>
              <span className="text-secondary-500">Fuel Type</span>
              <div className="font-medium text-secondary-900">Gasoline</div>
            </div>
            <div>
              <span className="text-secondary-500">Transmission</span>
              <div className="font-medium text-secondary-900">Automatic</div>
            </div>
            <div>
              <span className="text-secondary-500">Seats</span>
              <div className="font-medium text-secondary-900">5</div>
            </div>
            <div>
              <span className="text-secondary-500">Doors</span>
              <div className="font-medium text-secondary-900">4</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-secondary-200 flex gap-2">
          <Link to={`/vehicles/edit/${vehicle.id}`} className="flex-1">
            {/* TODO: Create an edit page for vehicles */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={14} />}
              fullWidth
            >
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => openDeleteModal(vehicle)}
            fullWidth
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-secondary-600">Loading your listed vehicles...</p>
      </div>
    );
  }

  // Display page-level errors (including those from delete attempts)
  if (pageError && !isModalOpen) {
    // Only show page error if modal is not open (modal can show its own context)
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-red-700">Error: {pageError}</p>
        <Button
          onClick={() => {
            setPageError(null);
            fetchUserListedVehicles(user!.id);
          }}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-secondary-600 hover:text-secondary-900 transition-colors duration-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          My Listed Vehicles ({userListedVehicles.length})
        </h1>
        <Link to="/vehicles/add">
          <Button leftIcon={<Plus size={16} />}>List New Vehicle</Button>
        </Link>
      </div>

      {userListedVehicles.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Car size={56} className="mx-auto text-secondary-300 mb-6" />
          <h2 className="text-2xl font-semibold text-secondary-900 mb-3">
            You haven't listed any vehicles yet.
          </h2>
          <p className="text-secondary-600 max-w-md mx-auto mb-6">
            Start earning by sharing your vehicle. Click the button below to add
            your first one.
          </p>
          <Link to="/vehicles/add">
            <Button size="lg">List Your First Vehicle</Button>
          </Link>
        </div>
      )}

      {/* Display Available Vehicles */}
      {availableVehicles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Available Vehicles ({availableVehicles.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableVehicles.map(renderListedVehicleCard)}
          </div>
        </div>
      )}

      {/* Display message if no available vehicles */}
      {userListedVehicles.length > 0 && availableVehicles.length === 0 && (
        <div className="mb-8 text-secondary-600">
          No vehicles currently available.
        </div>
      )}

      {/* Display Unavailable Vehicles */}
      {unavailableVehicles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Unavailable Vehicles ({unavailableVehicles.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {unavailableVehicles.map(renderListedVehicleCard)}
          </div>
        </div>
      )}

      {/* Display message if no unavailable vehicles */}
      {userListedVehicles.length > 0 && unavailableVehicles.length === 0 && (
        <div className="mb-8 text-secondary-600">
          No vehicles currently unavailable.
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteVehicle}
        title="Confirm Deletion"
        message={
          `Are you sure you want to delete this vehicle: ${vehicleToDelete?.make} ${vehicleToDelete?.model}?\nThis action cannot be undone.` +
          (pageError && isModalOpen ? `\n\nError: ${pageError}` : '') // Show error within modal too
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default VehicleListPage;

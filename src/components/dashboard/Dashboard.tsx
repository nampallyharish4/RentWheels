import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Car,
  CalendarCheck,
  Plus,
  User,
  Clock,
  Edit,
  Trash2,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { format } from 'date-fns';
import type { Vehicle } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import DeleteAccountModal from '../auth/DeleteAccountModal';
import EditProfileModal from '../auth/EditProfileModal';

const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const {
    bookings,
    fetchUserBookings,
    isLoading: bookingsLoading,
  } = useBookingStore();
  const {
    userListedVehicles,
    fetchUserListedVehicles,
    isLoading: vehiclesLoading,
    error: vehiclesStoreError,
    deleteVehicle,
  } = useVehicleStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'vehicles'>(
    'bookings'
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehiclePendingDeletion, setVehiclePendingDeletion] =
    useState<Vehicle | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchUserBookings();
      fetchUserListedVehicles(profile.id);
    }
  }, [profile, fetchUserBookings, fetchUserListedVehicles]);

  useEffect(() => {
    if (vehiclesStoreError) {
      setDashboardError(vehiclesStoreError);
    }
  }, [vehiclesStoreError]);

  const openVehicleDeleteModal = (vehicle: Vehicle) => {
    setVehiclePendingDeletion(vehicle);
    setDashboardError(null);
    setIsDeleteModalOpen(true);
  };

  const closeVehicleDeleteModal = () => {
    setVehiclePendingDeletion(null);
    setIsDeleteModalOpen(false);
  };

  const confirmVehicleDelete = async () => {
    if (vehiclePendingDeletion) {
      try {
        await deleteVehicle(vehiclePendingDeletion.id);
        closeVehicleDeleteModal();
      } catch (error) {
        setDashboardError(
          (error as Error).message || 'Failed to delete vehicle.'
        );
      }
    }
  };

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {profile?.full_name || profile?.email.split('@')[0]}!
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link to="/vehicles/add">
            <Button variant="outline" leftIcon={<Plus size={16} />}>
              List a Vehicle
            </Button>
          </Link>
          <Link to="/vehicles/list">
            <Button variant="outline" leftIcon={<Car size={16} />}>
              My Listed Vehicles
            </Button>
          </Link>
          <Link to="/vehicles">
            <Button leftIcon={<Car size={16} />}>Rent a Vehicle</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <CalendarCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Completed Trips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Listed Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userListedVehicles.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'bookings'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'vehicles'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('vehicles')}
          >
            My Vehicles
          </button>
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-secondary-900">
                My Bookings
              </h2>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No bookings found
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {booking.vehicle?.make} {booking.vehicle?.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(booking.startDate), 'MMM dd')} -{' '}
                          {format(new Date(booking.endDate), 'MMM dd')}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-secondary-900">
                My Listed Vehicles
              </h2>
              <Link to="/vehicles/add">
                <Button size="sm" leftIcon={<Plus size={16} />}>
                  List New Vehicle
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {vehiclesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : userListedVehicles.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No vehicles listed
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListedVehicles.map((vehicle) => (
                    <Card
                      key={vehicle.id}
                      className="overflow-hidden flex flex-col"
                    >
                      <img
                        src={
                          vehicle.imageUrl ||
                          'https://via.placeholder.com/400x250?text=No+Image'
                        }
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900 truncate">
                            {vehicle.make} {vehicle.model}
                          </h3>
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
                        <div className="mt-4 flex gap-2">
                          <Link
                            to={`/vehicles/edit/${vehicle.id}`}
                            className="flex-1"
                          >
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
                            variant="dangerOutline"
                            size="sm"
                            leftIcon={<Trash2 size={14} />}
                            onClick={() => openVehicleDeleteModal(vehicle)}
                            fullWidth
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User size={20} className="mr-2 text-orange-600" />
              Profile Information
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">
                  {profile?.full_name || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {profile?.created_at
                    ? format(new Date(profile.created_at), 'MMMM dd, yyyy')
                    : 'Not available'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsEditProfileModalOpen(true)}
              >
                Edit Profile
              </Button>
              <Button
                variant="dangerOutline"
                onClick={() => setIsDeleteAccountModalOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentProfile={profile}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeVehicleDeleteModal}
        onConfirm={confirmVehicleDelete}
        title="Confirm Vehicle Deletion"
        message={
          `Are you sure you want to delete this vehicle: ${vehiclePendingDeletion?.make} ${vehiclePendingDeletion?.model}?\nThis action cannot be undone.` +
          (dashboardError && isDeleteModalOpen
            ? `\n\nError: ${dashboardError}`
            : '')
        }
        confirmText="Delete"
        cancelText="Cancel"
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;

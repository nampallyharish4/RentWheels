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
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
} from 'lucide-react';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { format } from 'date-fns';
import type { Vehicle, Booking } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import DeleteAccountModal from '../auth/DeleteAccountModal';
import EditProfileModal from '../auth/EditProfileModal';
import BookingCard from './BookingCard';

const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const {
    bookings: userBookings,
    ownerBookings,
    fetchUserBookings,
    fetchOwnerBookings,
    acceptBooking,
    rejectBooking,
    isLoading: bookingsLoading,
    updateBooking,
  } = useBookingStore();
  const {
    userListedVehicles,
    fetchUserListedVehicles,
    isLoading: vehiclesLoading,
    error: vehiclesStoreError,
    deleteVehicle,
  } = useVehicleStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'vehicles'>('bookings');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehiclePendingDeletion, setVehiclePendingDeletion] =
    useState<Vehicle | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  console.log('[Dashboard] User listed vehicles:', userListedVehicles);

  useEffect(() => {
    if (profile) {
      fetchUserBookings();
      fetchOwnerBookings();
      fetchUserListedVehicles(profile.id);
    }
  }, [profile, fetchUserBookings, fetchOwnerBookings, fetchUserListedVehicles]);

  const handleBookingAction = async (
    bookingId: string,
    action: 'accept' | 'reject'
  ) => {
    try {
      await updateBooking(bookingId, {
        status: action === 'accept' ? 'confirmed' : 'cancelled',
        ownerDecision: action === 'accept' ? 'accepted' : 'rejected',
      });
      fetchUserBookings(); // Refresh bookings after update
    } catch (error) {
      setDashboardError(
        `Failed to ${action} booking: ${(error as Error).message}`
      );
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderBookingTimeline = (booking: Booking) => {
    const timelineSteps = [
      {
        status: 'pending',
        label: 'Booking Requested',
        icon: Clock,
        completed: true,
      },
      {
        status: 'confirmed',
        label: 'Owner Approved',
        icon: CheckCircle,
        completed: booking.status === 'confirmed',
      },
      {
        status: 'completed',
        label: 'Rental Completed',
        icon: Package,
        completed: booking.status === 'completed',
      },
    ];

    return (
      <div className="mt-4">
        <div className="relative">
          <div className="absolute left-1/2 h-full w-px -translate-x-1/2 bg-gray-200" />
          <div className="space-y-8 py-3">
            {timelineSteps.map((step, index) => (
              <div
                key={step.status}
                className={`flex items-center ${
                  index % 2 === 0 ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <step.icon size={16} />
                </div>
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? 'text-right pr-4' : 'pl-4'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const activeBookings = userBookings.filter(
    (booking) => booking.status === 'pending' || booking.status === 'confirmed'
  );
  const completedTrips = userBookings.filter(
    (booking) => booking.status === 'completed'
  );
  const listedVehicles = userListedVehicles;

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
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Bookings
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeBookings.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Completed Trips
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {completedTrips.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Listed Vehicles
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {listedVehicles.length}
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
              activeTab === 'orders'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'orders'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-secondary-900">
                My Orders
              </h2>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : userBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No orders found
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isOwnerView={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-secondary-900">
                Orders for My Vehicles
              </h2>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : ownerBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No orders for your vehicles found.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownerBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isOwnerView={true}
                    />
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
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (vehiclePendingDeletion) {
            deleteVehicle(vehiclePendingDeletion.id);
            setIsDeleteModalOpen(false);
          }
        }}
        title="Confirm Vehicle Deletion"
        message={`Are you sure you want to delete this vehicle: ${vehiclePendingDeletion?.make} ${vehiclePendingDeletion?.model}? This action cannot be undone.`}
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
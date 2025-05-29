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
<<<<<<< HEAD
=======
  XCircle,
  AlertTriangle,
  Package,
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
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
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders'>('bookings');
=======

  const [activeTab, setActiveTab] = useState<'orders' | 'vehicles'>('orders');
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
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
<<<<<<< HEAD
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Bookings
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeBookings.length}
=======
              <div>
                <p className="text-gray-600 text-sm">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === 'confirmed').length}
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
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
<<<<<<< HEAD
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Completed Trips
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {completedTrips.length}
=======
              <div>
                <p className="text-gray-600 text-sm">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === 'completed').length}
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
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
<<<<<<< HEAD
            My Orders
=======
            Vehicle Requests
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
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
<<<<<<< HEAD
                      booking={booking}
                      isOwnerView={false}
                    />
=======
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                booking.status
                              )}`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(
                              new Date(booking.startDate),
                              'MMM dd, yyyy'
                            )}{' '}
                            -{' '}
                            {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Total: ₹{booking.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/booking-details/${booking.id}`}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                      {renderBookingTimeline(booking)}
                    </div>
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
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
<<<<<<< HEAD
                Orders for My Vehicles
=======
                Vehicle Booking Requests
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
              </h2>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                </div>
<<<<<<< HEAD
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
=======
              ) : bookings.filter((b) => b.status === 'pending').length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pending requests
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings
                    .filter((b) => b.status === 'pending')
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {format(
                                new Date(booking.startDate),
                                'MMM dd, yyyy'
                              )}{' '}
                              -{' '}
                              {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Amount: ₹{booking.totalPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleBookingAction(booking.id, 'accept')
                              }
                              leftIcon={<CheckCircle size={16} />}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="dangerOutline"
                              size="sm"
                              onClick={() =>
                                handleBookingAction(booking.id, 'reject')
                              }
                              leftIcon={<XCircle size={16} />}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
>>>>>>> 5fce15a080b801b5aa087d4047b009726d6011f6
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
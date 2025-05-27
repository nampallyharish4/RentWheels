import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  CalendarCheck,
  Plus,
  User,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { format, differenceInHours, differenceInMilliseconds } from 'date-fns';
import VehicleCard from '../vehicles/VehicleCard';
import type { Vehicle, Booking } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';

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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const bookingsWithDisplayInfo = useMemo(() => {
    return bookings.map((booking) => {
      const startDateObj = new Date(booking.startDate);
      let isBookingCancellable = false;
      let bookingCountdownText = '';
      let dynamicStatusText =
        booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
      let statusColorClass = '';
      let hoursUntilStart = 0;

      if (!isNaN(startDateObj.getTime())) {
        const currentHoursUntilStart = differenceInHours(startDateObj, now);
        hoursUntilStart = currentHoursUntilStart;
        isBookingCancellable =
          (booking.status.toLowerCase() === 'pending' ||
            booking.status.toLowerCase() === 'confirmed') &&
          currentHoursUntilStart > 24;

        if (isBookingCancellable) {
          const diffMs = differenceInMilliseconds(startDateObj, now);
          const totalSeconds = Math.floor(diffMs / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          bookingCountdownText = ` (${hours}h ${minutes}m ${seconds}s left to cancel)`;
          dynamicStatusText = 'Pending Booking';
        }
      }

      switch (dynamicStatusText.toLowerCase()) {
        case 'pending booking':
        case 'pending':
          statusColorClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 'confirmed':
          statusColorClass = 'bg-green-100 text-green-800';
          break;
        case 'completed':
          statusColorClass = 'bg-blue-100 text-blue-800';
          break;
        case 'cancelled':
          statusColorClass = 'bg-red-100 text-red-800';
          break;
        default:
          statusColorClass = 'bg-secondary-100 text-secondary-700';
      }

      console.log(`[Dashboard] Booking ID: ${booking.id} Display Info:`, {
        originalStatus: booking.status,
        startDate: booking.startDate,
        parsedStartDate: startDateObj.toISOString(),
        now: now.toISOString(),
        hoursUntilStart,
        isBookingCancellable,
        dynamicStatusText,
        bookingCountdownText,
        condition1_status_check:
          booking.status === 'pending' || booking.status === 'confirmed',
        condition2_hours_check: hoursUntilStart > 24,
      });

      return {
        ...booking,
        isBookingCancellable,
        bookingCountdownText,
        dynamicStatusText,
        statusColorClass,
      };
    });
  }, [bookings, now]);

  const renderUserVehicleCard = (vehicle: Vehicle) => (
    <Card key={vehicle.id} className="overflow-hidden flex flex-col">
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
          <h3
            className="text-lg font-semibold text-secondary-900 truncate"
            title={`${vehicle.make} ${vehicle.model}`}
          >
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
          <Link to={`/vehicles/edit/${vehicle.id}`} className="flex-1">
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
  );

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
                Recent Bookings
              </h2>
            </CardHeader>

            {(() => {
              console.log(
                '[Dashboard] Rendering bookings. isLoading:',
                bookingsLoading,
                'Bookings count:',
                bookings.length,
                'Bookings data:',
                bookings
              );
              if (bookingsLoading) {
                return (
                  <CardContent className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-secondary-600 mt-4">
                      Loading your bookings...
                    </p>
                  </CardContent>
                );
              }
              if (bookings.length === 0) {
                return (
                  <CardContent className="text-center py-12">
                    <div className="bg-secondary-100 p-3 rounded-full mx-auto w-fit">
                      <CalendarCheck className="h-8 w-8 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mt-4">
                      No Bookings Yet
                    </h3>
                    <p className="text-secondary-600 mt-2 max-w-md mx-auto">
                      You haven't made any bookings yet. Start by browsing
                      available vehicles and book your first ride!
                    </p>
                    <div className="mt-6">
                      <Link to="/vehicles">
                        <Button>Browse Vehicles</Button>
                      </Link>
                    </div>
                  </CardContent>
                );
              }
              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          Booking ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          Dates
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          Vehicle
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                            {booking.id.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            {format(new Date(booking.startDate), 'MMM dd')} -{' '}
                            {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            {booking.vehicle
                              ? `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`
                              : booking.vehicleId
                                  .substring(0, 8)
                                  .toUpperCase() + '...'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            ₹{booking.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              to={`/booking-details/${booking.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
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

            {vehiclesLoading ? (
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-secondary-600 mt-4">
                  Loading your vehicles...
                </p>
              </CardContent>
            ) : dashboardError && !isDeleteModalOpen ? (
              <CardContent className="text-center py-12">
                <AlertTriangle
                  size={48}
                  className="mx-auto text-red-500 mb-4"
                />
                <p className="text-red-700">Error: {dashboardError}</p>
                <Button
                  onClick={() => {
                    setDashboardError(null);
                    if (profile) {
                      fetchUserListedVehicles(profile.id);
                    }
                  }}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </CardContent>
            ) : userListedVehicles.length === 0 ? (
              <CardContent className="text-center py-12">
                <div className="bg-secondary-100 p-3 rounded-full mx-auto w-fit">
                  <Car className="h-8 w-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mt-4">
                  No Vehicles Listed
                </h3>
                <p className="text-secondary-600 mt-2 max-w-md mx-auto">
                  You haven't listed any vehicles yet. Start earning by sharing
                  your vehicle with others!
                </p>
              </CardContent>
            ) : (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListedVehicles.map(renderUserVehicleCard)}
              </CardContent>
            )}
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

            <div className="mt-6 flex justify-end">
              <Link to="/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default Dashboard;

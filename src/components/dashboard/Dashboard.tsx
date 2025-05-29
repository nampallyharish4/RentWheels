import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Car, Plus, User, Clock, CheckCircle, Users } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { format } from 'date-fns';
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
    isLoading: bookingsLoading,
    updateBooking,
    setOwnerBookings,
  } = useBookingStore();
  const { userListedVehicles, fetchUserListedVehicles } = useVehicleStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders'>('orders');
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);

  console.log('[Dashboard] User listed vehicles:', userListedVehicles);

  useEffect(() => {
    if (profile) {
      try {
        fetchUserBookings();
        fetchOwnerBookings();
        fetchUserListedVehicles(profile.id);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // You might want to set a state here to display an error message to the user
      }
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

      // Optimistically update the local state
      setOwnerBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: action === 'accept' ? 'confirmed' : 'cancelled',
              }
            : booking
        )
      );

      // Fetch updated data from the backend as a fallback
      fetchUserBookings();
      fetchOwnerBookings();
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
      // If optimistic update happened, you might want to revert it here
      // For now, we'll just refetch from the backend to be safe
      fetchOwnerBookings();
    }
  };

  const openChatModal = (bookingId: string) => {
    setChatBookingId(bookingId);
    console.log(`Open chat for booking: ${bookingId}`);
  };

  const closeChatModal = () => {
    setChatBookingId(null);
    console.log('Close chat modal');
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

  // Filter listed vehicles into available and unavailable
  const availableListedVehicles = userListedVehicles.filter(
    (vehicle) => vehicle.available
  );
  const unavailableListedVehicles = userListedVehicles.filter(
    (vehicle) => !vehicle.available
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Vehicle Requests
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {ownerBookings.length}
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
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  Available: {availableListedVehicles.length}
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  Unavailable: {unavailableListedVehicles.length}
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
            Vehicle Requests
          </button>
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
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <h2 className="text-xl font-bold text-gray-900 col-span-full">
            My Bookings
          </h2>
          {bookingsLoading ? (
            <p className="col-span-full">Loading bookings...</p>
          ) : userBookings.length > 0 ? (
            userBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAction={handleBookingAction}
                onMessageClick={openChatModal}
              />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">
              You have no upcoming bookings.
            </p>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <h2 className="text-xl font-bold text-gray-900 col-span-full">
            Vehicle Requests
          </h2>
          {bookingsLoading ? (
            <p className="col-span-full">Loading orders...</p>
          ) : ownerBookings.length > 0 ? (
            ownerBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isOwnerView={true}
                onAction={handleBookingAction}
                onMessageClick={openChatModal}
              />
            ))
          ) : (
            <p className="text-gray-600">
              No vehicle requests for your listings.
            </p>
          )}
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

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />

      {chatBookingId && (
        <ChatModal bookingId={chatBookingId} onClose={closeChatModal} />
      )}
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import {
  MapPin,
  CalendarDays,
  XCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { format, differenceInHours, differenceInMilliseconds } from 'date-fns';
import Button from '../components/ui/Button';
import type { ButtonVariant } from '../components/ui/Button';
import Card, {
  CardContent,
  CardHeader,
  CardFooter,
} from '../components/ui/Card';
import ConfirmationModal from '../components/ui/ConfirmationModal';

// Define the return type for the useMemo hook
interface BookingDetailsMemo {
  isCancellable: boolean;
  hoursUntilStart: number;
  countdownText: string;
  cancelButtonVariant: ButtonVariant;
}

const BookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedBookingDetails,
    fetchBookingWithVehicleDetails,
    isLoading,
    error,
    cancelBooking,
  } = useBookingStore();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (bookingId) {
      fetchBookingWithVehicleDetails(bookingId);
    }
    window.scrollTo(0, 0);
  }, [bookingId, fetchBookingWithVehicleDetails, user, navigate]);

  const handleOpenCancelModal = () => {
    setCancelError(null);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelBooking = async () => {
    if (selectedBookingDetails?.id) {
      try {
        await cancelBooking(selectedBookingDetails.id);
        if (bookingId) fetchBookingWithVehicleDetails(bookingId);
        setIsCancelModalOpen(false);
      } catch (err) {
        setCancelError((err as Error).message || 'Failed to cancel booking.');
      }
    }
  };

  const { isCancellable, hoursUntilStart, countdownText, cancelButtonVariant } =
    useMemo((): BookingDetailsMemo => {
      if (!selectedBookingDetails) {
        return {
          isCancellable: false,
          hoursUntilStart: 0,
          countdownText: '',
          cancelButtonVariant: 'danger',
        };
      }

      const startDateObj = new Date(selectedBookingDetails.startDate);
      if (isNaN(startDateObj.getTime())) {
        console.error(
          '[BookingDetailsPage] Invalid start date encountered:',
          selectedBookingDetails.startDate
        );
        return {
          isCancellable: false,
          hoursUntilStart: 0,
          countdownText: '',
          cancelButtonVariant: 'danger',
        };
      }
      const currentHoursUntilStart = differenceInHours(startDateObj, now);
      const currentIsCancellable =
        (selectedBookingDetails.status.toLowerCase() === 'pending' ||
          selectedBookingDetails.status.toLowerCase() === 'confirmed') &&
        currentHoursUntilStart > 24;

      let currentCountdownText = '';
      if (currentIsCancellable) {
        const diffMs = differenceInMilliseconds(startDateObj, now);
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        currentCountdownText = ` (${hours}h ${minutes}m ${seconds}s left)`;
      }

      let currentCancelButtonVariant: ButtonVariant = 'danger';
      if (currentIsCancellable) {
        if (currentHoursUntilStart > 48) {
          currentCancelButtonVariant = 'primary';
        } else {
          currentCancelButtonVariant = 'danger';
        }
      } else {
        currentCancelButtonVariant = 'danger';
      }

      return {
        isCancellable: currentIsCancellable,
        hoursUntilStart: currentHoursUntilStart,
        countdownText: currentCountdownText,
        cancelButtonVariant: currentCancelButtonVariant,
      };
    }, [selectedBookingDetails, now]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        <p className="mt-4 text-xl text-secondary-700">
          Loading booking details...
        </p>
      </div>
    );
  }

  if (error && !selectedBookingDetails) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Error Loading Booking
        </h2>
        <p className="text-secondary-600 mb-6">{error}</p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!selectedBookingDetails) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4 text-center">
        <Info size={48} className="text-secondary-500 mb-4" />
        <h2 className="text-2xl font-semibold text-secondary-800 mb-4">
          Booking Not Found
        </h2>
        <p className="text-secondary-600 mb-6">
          The requested booking could not be found. It might have been cancelled
          or the ID is incorrect.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const {
    vehicle,
    startDate,
    endDate,
    totalPrice,
    status,
    pickupAddress,
    dropoffAddress,
    id: actualBookingId,
    userId: bookingUserId,
  } = selectedBookingDetails;

  if (user?.id !== bookingUserId) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Access Denied
        </h2>
        <p className="text-secondary-600 mb-6">
          You do not have permission to view this booking.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  console.log('[BookingDetailsPage] Debugging cancel button visibility:', {
    status,
    isCancellable,
    hoursUntilStart,
    now: now.toISOString(),
    startDate: selectedBookingDetails.startDate,
    selectedBookingDetailsStatus: selectedBookingDetails.status,
    parsedStartDate: new Date(selectedBookingDetails.startDate).toISOString(),
    condition1_status_check: status === 'pending' || status === 'confirmed',
    condition2_hours_check: hoursUntilStart > 24,
    final_button_should_render: isCancellable && status !== 'cancelled',
  });

  const getStatusPill = (
    currentStatus: string,
    isBookingCancellable: boolean
  ) => {
    if (isBookingCancellable) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
          Pending Booking
        </span>
      );
    }
    switch (currentStatus.toLowerCase()) {
      case 'cancelled':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary-100 text-secondary-700">
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Confirmed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary-100 text-secondary-700">
            {currentStatus}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-secondary-900">
              {getStatusPill(status, isCancellable)}
            </h1>
            <p className="text-sm text-secondary-500 mt-1">
              Booking ID: {actualBookingId}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              <AlertTriangle className="inline mr-2 h-4 w-4" />
              Error: {error}
            </div>
          )}
          {vehicle && (
            <div>
              <h3 className="text-lg font-semibold text-secondary-800 mb-3">
                Vehicle Information
              </h3>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={
                    vehicle.imageUrl ||
                    'https://via.placeholder.com/300x200?text=No+Image'
                  }
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full sm:w-48 h-32 object-cover rounded-lg border"
                />
                <div className="text-secondary-700 flex-grow">
                  <p className="text-xl font-bold text-primary-600">
                    {vehicle.make} {vehicle.model}
                  </p>
                  {vehicle.year && (
                    <p>
                      <strong className="font-normal text-secondary-600">
                        Year:
                      </strong>{' '}
                      {vehicle.year}
                    </p>
                  )}
                  {selectedBookingDetails.vehicle?.location && (
                    <p>
                      <strong className="font-normal text-secondary-600">
                        Location:
                      </strong>{' '}
                      {selectedBookingDetails.vehicle.location}
                    </p>
                  )}
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="text-sm text-primary-600 hover:underline mt-1 block"
                  >
                    View Vehicle Page
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-3 pt-4 border-t mt-4">
              Rental Period & Price
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-secondary-700">
              <div className="flex items-start">
                <CalendarDays
                  size={20}
                  className="text-primary-500 mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <strong>Start Date:</strong>
                  <p>
                    {format(new Date(startDate), 'EEE, MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CalendarDays
                  size={20}
                  className="text-primary-500 mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <strong>End Date:</strong>
                  <p>
                    {format(new Date(endDate), 'EEE, MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-start col-span-1 sm:col-span-2">
                <span className="text-primary-500 mr-3 mt-0.5 flex-shrink-0 text-xl">
                  ₹
                </span>
                <div>
                  <strong>Total Price:</strong>
                  <p className="text-xl font-bold text-green-600">
                    ₹{totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-3 pt-4 border-t mt-4">
              Pickup & Dropoff
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-secondary-700">
              <div className="flex items-start">
                <MapPin
                  size={20}
                  className="text-primary-500 mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <strong>Pickup Location:</strong>
                  <p>{pickupAddress || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin
                  size={20}
                  className="text-primary-500 mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <strong>Dropoff Location:</strong>
                  <p>{dropoffAddress || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex flex-row justify-between items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          {isCancellable && status !== 'cancelled' && (
            <Button
              variant={cancelButtonVariant}
              onClick={handleOpenCancelModal}
              leftIcon={<XCircle size={16} />}
            >
              Cancel Booking{countdownText}
            </Button>
          )}
        </CardFooter>
      </Card>
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancelBooking}
        title="Confirm Booking Cancellation"
        message={
          cancelError
            ? `Error: ${cancelError}`
            : `Are you sure you want to cancel this booking? ${
                selectedBookingDetails?.vehicle
                  ? selectedBookingDetails.vehicle.make +
                    ' ' +
                    selectedBookingDetails.vehicle.model
                  : 'ID: ' + selectedBookingDetails?.id
              }? This action might not be reversible depending on the booking status.`
        }
        confirmText="Yes, Cancel Booking"
        cancelText="No, Keep Booking"
      />
    </div>
  );
};

export default BookingDetailsPage;

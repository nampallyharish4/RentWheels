import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import { CheckCircle, MapPin, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';

const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const {
    selectedBookingDetails,
    fetchBookingWithVehicleDetails,
    isLoading,
    error,
  } = useBookingStore();

  useEffect(() => {
    if (bookingId) {
      fetchBookingWithVehicleDetails(bookingId);
    }
    // Optional: Scroll to top on page load
    window.scrollTo(0, 0);
  }, [bookingId, fetchBookingWithVehicleDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        <p className="mt-4 text-xl text-secondary-700">
          Loading your booking details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Error Loading Booking
        </h2>
        <p className="text-secondary-600 mb-6">{error}</p>
        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!selectedBookingDetails) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center items-center p-4 text-center">
        <h2 className="text-2xl font-semibold text-secondary-800 mb-4">
          Booking Not Found
        </h2>
        <p className="text-secondary-600 mb-6">
          We couldn't find the details for this booking. It might have been
          cancelled or the ID is incorrect.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
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
  } = selectedBookingDetails;

  return (
    <div className="min-h-screen bg-secondary-50 py-8 px-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full shadow-2xl overflow-hidden">
        <CardHeader className="bg-green-500 text-white p-6 text-center">
          <CheckCircle size={64} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          <p className="mt-2 text-green-100">
            Thank you for choosing our service. Your adventure awaits!
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-3">
              Your Booking Details
            </h2>
            <div className="space-y-3 text-secondary-700">
              <p className="flex items-center">
                <strong className="w-32">Booking ID:</strong> {actualBookingId}
              </p>
              <p className="flex items-center">
                <strong className="w-32">Status:</strong>{' '}
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-secondary-100 text-secondary-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </p>
            </div>
          </div>

          {vehicle && (
            <div>
              <h3 className="text-lg font-semibold text-secondary-800 mb-3 border-t pt-4 mt-4">
                Vehicle Information
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {vehicle.imageUrl && (
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full sm:w-48 h-32 object-cover rounded-lg shadow-md"
                  />
                )}
                <div className="text-secondary-700 flex-grow">
                  <p className="text-xl font-bold text-primary-600">
                    {vehicle.make} {vehicle.model}
                  </p>
                  {vehicle.year && (
                    <p>
                      <strong className="font-normal">Year:</strong>{' '}
                      {vehicle.year}
                    </p>
                  )}
                  {vehicle.location && (
                    <p>
                      <strong className="font-normal">Location:</strong>{' '}
                      {vehicle.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-3 border-t pt-4 mt-4">
              Rental Period & Price
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-secondary-700">
              <div className="flex items-start">
                <CalendarDays
                  size={20}
                  className="text-primary-500 mr-3 mt-1 flex-shrink-0"
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
                  className="text-primary-500 mr-3 mt-1 flex-shrink-0"
                />
                <div>
                  <strong>End Date:</strong>
                  <p>
                    {format(new Date(endDate), 'EEE, MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-start col-span-1 sm:col-span-2">
                <span className="text-primary-500 mr-3 mt-1 flex-shrink-0 text-xl">
                  ₹
                </span>
                <div>
                  <strong>Total Price:</strong>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-3 border-t pt-4 mt-4">
              Pickup & Dropoff
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-secondary-700">
              <div className="flex items-start">
                <MapPin
                  size={20}
                  className="text-primary-500 mr-3 mt-1 flex-shrink-0"
                />
                <div>
                  <strong>Pickup Location:</strong>
                  <p>{pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin
                  size={20}
                  className="text-primary-500 mr-3 mt-1 flex-shrink-0"
                />
                <div>
                  <strong>Dropoff Location:</strong>
                  <p>{dropoffAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t text-center space-y-3">
            <p className="text-secondary-600">
              Questions about your booking? Contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/dashboard">
                <Button variant="primary" className="w-full sm:w-auto">
                  View My Bookings
                </Button>
              </Link>
              <Link to="/vehicles">
                <Button variant="primary" className="w-full sm:w-auto">
                  Explore More Vehicles
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmationPage;

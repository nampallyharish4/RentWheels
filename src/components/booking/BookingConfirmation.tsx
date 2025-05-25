import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Car, CreditCard, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useBookingStore } from '../../store/bookingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { format } from 'date-fns';

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, clearBookingFlow } = useBookingStore();
  const { selectedVehicle } = useVehicleStore();
  
  useEffect(() => {
    if (!currentBooking || !selectedVehicle) {
      navigate('/vehicles');
    }
    
    // Clear booking flow data when component unmounts
    return () => {
      clearBookingFlow();
    };
  }, [currentBooking, selectedVehicle, navigate, clearBookingFlow]);
  
  if (!currentBooking || !selectedVehicle) {
    return null;
  }
  
  const {
    id: bookingId,
    startDate,
    endDate,
    totalPrice,
    pickupAddress,
    dropoffAddress,
  } = currentBooking;
  
  const {
    make,
    model,
    year,
    imageUrl,
  } = selectedVehicle;
  
  const formattedStartDate = format(new Date(startDate), 'EEE, MMM dd, yyyy');
  const formattedEndDate = format(new Date(endDate), 'EEE, MMM dd, yyyy');
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <Card>
        <CardHeader className="text-center border-b-0">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Booking Confirmed!</h1>
          <p className="text-secondary-600 mt-1">
            Your booking has been confirmed and is ready to go!
          </p>
        </CardHeader>
        
        <CardContent className="pb-0">
          <div className="mb-4 p-3 bg-secondary-50 border border-secondary-200 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-secondary-900">Booking Reference</h3>
              <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-secondary-200">
                {bookingId.substring(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="border-t border-b border-secondary-200 py-4 my-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                <img
                  src={imageUrl || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={`${make} ${model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">
                  {make} {model} ({year})
                </h3>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-secondary-600">
                    <Calendar size={16} className="mr-1.5 text-primary-600" />
                    {formattedStartDate} - {formattedEndDate}
                  </div>
                  
                  <div className="flex items-center text-sm text-secondary-600">
                    <Car size={16} className="mr-1.5 text-primary-600" />
                    Vehicle ID: {selectedVehicle.id.substring(0, 8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">Pick-up Details</h3>
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-secondary-800">{pickupAddress}</p>
                  <p className="text-sm text-secondary-600 mt-1">{formattedStartDate}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">Drop-off Details</h3>
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-secondary-800">{dropoffAddress}</p>
                  <p className="text-sm text-secondary-600 mt-1">{formattedEndDate}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">Payment Details</h3>
              <div className="flex items-start">
                <CreditCard size={18} className="mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-secondary-800">Total Amount: <span className="font-semibold">${totalPrice.toFixed(2)}</span></p>
                  <p className="text-sm text-secondary-600 mt-1">Payment Status: <span className="text-green-600 font-medium">Paid</span></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
            <div className="flex items-start">
              <AlertCircle size={18} className="text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Important Information</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Please bring your driver's license and a valid ID card for verification.</li>
                  <li>Check the vehicle for any damages before accepting and report immediately if found.</li>
                  <li>Contact our support team if you need to modify your booking.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Link to="/dashboard" className="w-full">
            <Button fullWidth>
              Go to Dashboard
            </Button>
          </Link>
          
          <Button
            variant="outline"
            fullWidth
            onClick={() => window.print()}
          >
            Print Booking Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
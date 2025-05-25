import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar, User, Info, Car, Award, Zap, Check, X } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { useVehicleStore } from '../../store/vehicleStore';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedVehicle, isLoading, error, fetchVehicleById } = useVehicleStore();
  const { user } = useAuthStore();
  const { setVehicleId } = useBookingStore();
  
  React.useEffect(() => {
    if (id) {
      fetchVehicleById(id);
    }
  }, [id, fetchVehicleById]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-red-500 mb-2">
            <X size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">Error Loading Vehicle</h3>
          <p className="text-secondary-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!selectedVehicle) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-secondary-400 mb-2">
            <Car size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">Vehicle Not Found</h3>
          <p className="text-secondary-600 mb-4">The vehicle you're looking for could not be found.</p>
          <Button variant="outline" onClick={() => navigate('/vehicles')}>
            Browse Vehicles
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const {
    make,
    model,
    year,
    category,
    dailyRate,
    description,
    imageUrl,
    location,
    available,
    createdAt,
  } = selectedVehicle;
  
  const handleRentVehicle = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setVehicleId(id!);
    navigate(`/booking/${id}`);
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle Image and Basic Info */}
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden shadow-md mb-6">
            <img
              src={imageUrl || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={`${make} ${model}`}
              className="w-full h-[400px] object-cover"
            />
            {!available && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold bg-red-600 px-4 py-2 rounded-md">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                  {make} {model} ({year})
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                    <Calendar size={14} className="mr-1" />
                    {year}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                    <Car size={14} className="mr-1" />
                    {category}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Award size={14} className="mr-1" />
                    Premium
                  </span>
                </div>
                <div className="flex items-center text-secondary-600 mb-4">
                  <MapPin size={16} className="mr-1 text-primary-600" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center text-secondary-600 text-sm">
                  <User size={14} className="mr-1" />
                  <span>Listed on {format(new Date(createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-primary-600 mb-1">${dailyRate}</div>
                  <div className="text-secondary-600 text-sm mb-4">per day</div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-secondary-700">
                      <Check size={18} className="mr-2 text-green-500" />
                      <span>Free cancellation</span>
                    </div>
                    <div className="flex items-center text-secondary-700">
                      <Check size={18} className="mr-2 text-green-500" />
                      <span>Insurance included</span>
                    </div>
                    <div className="flex items-center text-secondary-700">
                      <Check size={18} className="mr-2 text-green-500" />
                      <span>24/7 support</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleRentVehicle}
                  disabled={!available}
                  fullWidth
                  size="lg"
                  className="mt-2"
                >
                  {available ? 'Rent This Vehicle' : 'Currently Unavailable'}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
                <Info size={20} className="mr-2 text-primary-600" />
                About This Vehicle
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-700 whitespace-pre-line">{description}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Features and Specifications */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
                <Zap size={20} className="mr-2 text-primary-600" />
                Features
              </h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center text-secondary-700">
                  <Check size={18} className="mr-2 text-green-500 flex-shrink-0" />
                  <span>Air Conditioning</span>
                </li>
                <li className="flex items-center text-secondary-700">
                  <Check size={18} className="mr-2 text-green-500 flex-shrink-0" />
                  <span>Power Steering</span>
                </li>
                <li className="flex items-center text-secondary-700">
                  <Check size={18} className="mr-2 text-green-500 flex-shrink-0" />
                  <span>Bluetooth Connectivity</span>
                </li>
                <li className="flex items-center text-secondary-700">
                  <Check size={18} className="mr-2 text-green-500 flex-shrink-0" />
                  <span>USB Charging Ports</span>
                </li>
                <li className="flex items-center text-secondary-700">
                  <Check size={18} className="mr-2 text-green-500 flex-shrink-0" />
                  <span>Navigation System</span>
                </li>
                <li className="flex items-center text-secondary-700">
                  <Check size={18} className="mr-2 text-green-500 flex-shrink-0" />
                  <span>Backup Camera</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
                <Car size={20} className="mr-2 text-primary-600" />
                Specifications
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Make</p>
                    <p className="font-medium text-secondary-900">{make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Model</p>
                    <p className="font-medium text-secondary-900">{model}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Year</p>
                    <p className="font-medium text-secondary-900">{year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Category</p>
                    <p className="font-medium text-secondary-900 capitalize">{category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Fuel Type</p>
                    <p className="font-medium text-secondary-900">Gasoline</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Transmission</p>
                    <p className="font-medium text-secondary-900">Automatic</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Seats</p>
                    <p className="font-medium text-secondary-900">5</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Doors</p>
                    <p className="font-medium text-secondary-900">4</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingForm from '../components/booking/BookingForm';
import { useVehicleStore } from '../store/vehicleStore';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchVehicleById } = useVehicleStore();
  const { setVehicleId } = useBookingStore();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchVehicleById(id);
      setVehicleId(id);
    }
  }, [id, user, navigate, fetchVehicleById, setVehicleId]);
  
  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Book Your Vehicle</h1>
        <BookingForm />
      </div>
    </div>
  );
};

export default BookingPage;
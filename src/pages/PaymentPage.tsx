import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentForm from '../components/booking/PaymentForm';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchBookingById } = useBookingStore();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchBookingById(id);
    }
  }, [id, user, navigate, fetchBookingById]);
  
  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Payment Information</h1>
        <PaymentForm />
      </div>
    </div>
  );
};

export default PaymentPage;
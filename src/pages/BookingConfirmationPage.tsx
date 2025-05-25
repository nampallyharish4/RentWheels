import React from 'react';
import BookingConfirmation from '../components/booking/BookingConfirmation';

const BookingConfirmationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <BookingConfirmation />
    </div>
  );
};

export default BookingConfirmationPage;
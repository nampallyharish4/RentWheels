import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useBookingStore } from '../../store/bookingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { format, addDays, differenceInDays, isValid } from 'date-fns';
import type { BookingFormData } from '../../types';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
}

export function BookingForm({ onSubmit, isLoading = false }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>();

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700"
        >
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          min={today}
          {...register('startDate', { required: 'Start date is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-600">
            {errors.startDate.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-gray-700"
        >
          End Date
        </label>
        <input
          type="date"
          id="endDate"
          min={today}
          {...register('endDate', { required: 'End date is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.endDate && (
          <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="pickupAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Pickup Address
        </label>
        <input
          type="text"
          id="pickupAddress"
          {...register('pickupAddress', {
            required: 'Pickup address is required',
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.pickupAddress && (
          <p className="mt-1 text-sm text-red-600">
            {errors.pickupAddress.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="dropoffAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Drop-off Address
        </label>
        <input
          type="text"
          id="dropoffAddress"
          {...register('dropoffAddress', {
            required: 'Drop-off address is required',
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.dropoffAddress && (
          <p className="mt-1 text-sm text-red-600">
            {errors.dropoffAddress.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isLoading
            ? 'bg-indigo-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
      >
        {isLoading ? 'Processing...' : 'Book Now'}
      </button>
    </form>
  );
}

const BookingFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { selectedVehicle } = useVehicleStore();
  const { setBookingFormData, vehicleId, createBooking } = useBookingStore();

  const today = new Date();
  const tomorrow = addDays(today, 1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(tomorrow, 'yyyy-MM-dd'),
      pickupAddress: '',
      dropoffAddress: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate days and total price
  let days = 0;
  let totalPrice = 0;
  let isDateRangeValid = false;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (
    selectedVehicle &&
    isValid(startDateObj) &&
    isValid(endDateObj) &&
    endDateObj > startDateObj
  ) {
    days = differenceInDays(endDateObj, startDateObj);
    if (days === 0) days = 1; // Minimum 1 day rental
    totalPrice = days * selectedVehicle.dailyRate;
    isDateRangeValid = true;
  } else if (
    selectedVehicle &&
    isValid(startDateObj) &&
    isValid(endDateObj) &&
    startDate === endDate
  ) {
    // Handle same day booking as 1 day
    days = 1;
    totalPrice = days * selectedVehicle.dailyRate;
    isDateRangeValid = true;
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedVehicle || !vehicleId) {
      navigate('/vehicles');
      return;
    }

    setBookingFormData(data);

    try {
      const bookingId = await createBooking(
        data,
        vehicleId,
        selectedVehicle.dailyRate
      );
      navigate(`/booking/payment/${bookingId}`);
    } catch (error) {
      console.error('Failed to create booking', error);
    }
  };

  if (!selectedVehicle) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-secondary-900">
          Booking Details
        </h2>
        <p className="text-secondary-600 text-sm">
          {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year}
          )
        </p>
      </CardHeader>

      <CardContent>
        <BookingForm onSubmit={onSubmit} isLoading={!isDateRangeValid} />
      </CardContent>
    </Card>
  );
};

export default BookingFormComponent;

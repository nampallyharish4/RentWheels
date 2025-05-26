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

const BookingForm: React.FC = () => {
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                id="startDate"
                type="date"
                label="Pick-up Date"
                leftIcon={<Calendar size={18} />}
                error={errors.startDate?.message}
                min={format(today, 'yyyy-MM-dd')}
                fullWidth
                {...register('startDate', {
                  required: 'Pick-up date is required',
                })}
              />
            </div>

            <div>
              <Input
                id="endDate"
                type="date"
                label="Drop-off Date"
                leftIcon={<Calendar size={18} />}
                error={errors.endDate?.message}
                min={startDate || format(tomorrow, 'yyyy-MM-dd')}
                fullWidth
                {...register('endDate', {
                  required: 'Drop-off date is required',
                  validate: (value) =>
                    new Date(value) > new Date(startDate) ||
                    'Drop-off date must be after pick-up date',
                })}
              />
            </div>
          </div>

          <div>
            <Input
              id="pickupAddress"
              label="Pick-up Location"
              leftIcon={<MapPin size={18} />}
              placeholder="Enter pick-up address"
              error={errors.pickupAddress?.message}
              fullWidth
              {...register('pickupAddress', {
                required: 'Pick-up address is required',
              })}
            />
          </div>

          <div>
            <Input
              id="dropoffAddress"
              label="Drop-off Location"
              leftIcon={<MapPin size={18} />}
              placeholder="Enter drop-off address"
              error={errors.dropoffAddress?.message}
              fullWidth
              {...register('dropoffAddress', {
                required: 'Drop-off address is required',
              })}
            />
          </div>

          <div className="p-4 border rounded-md bg-secondary-50/50">
            <h3 className="text-md font-semibold text-secondary-800 mb-2">
              Price Summary
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Daily Rate:</span>
                <span className="font-medium">
                  ₹{selectedVehicle.dailyRate.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Number of days:</span>
                <span className="font-medium">
                  {isDateRangeValid ? days : '-'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-secondary-900 pt-2 border-t mt-2">
                <span>Total Price:</span>
                <span className="text-primary-600">
                  {isDateRangeValid ? `₹${totalPrice.toFixed(2)}` : '-'}
                </span>
              </div>
            </div>
            <p className="text-xs text-secondary-500 mt-1">
              (Taxes and fees might apply)
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={!isDateRangeValid}
            className="mt-6"
          >
            {isDateRangeValid
              ? `Proceed to Pay ₹${totalPrice.toFixed(2)}`
              : 'Select valid dates'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;

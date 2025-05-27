import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Lock, CheckCircle } from 'lucide-react';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useBookingStore } from '../../store/bookingStore';
import { differenceInDays, format } from 'date-fns';
import type { PaymentFormData } from '../../types';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  isLoading?: boolean;
}

export function PaymentForm({ onSubmit, isLoading = false }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="cardNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          {...register('cardNumber', {
            required: 'Card number is required',
            pattern: {
              value: /^[0-9]{16}$/,
              message: 'Please enter a valid 16-digit card number',
            },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="1234 5678 9012 3456"
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">
            {errors.cardNumber.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="expiryDate"
            className="block text-sm font-medium text-gray-700"
          >
            Expiry Date
          </label>
          <input
            type="text"
            id="expiryDate"
            {...register('expiryDate', {
              required: 'Expiry date is required',
              pattern: {
                value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                message: 'Please enter a valid date (MM/YY)',
              },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="MM/YY"
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expiryDate.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cvv"
            className="block text-sm font-medium text-gray-700"
          >
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            {...register('cvv', {
              required: 'CVV is required',
              pattern: {
                value: /^[0-9]{3,4}$/,
                message: 'Please enter a valid CVV',
              },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="123"
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name on Card
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
        {isLoading ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </form>
  );
}

const PaymentFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, setPaymentFormData, processPayment } =
    useBookingStore();
  const [paymentMethod, setPaymentMethod] = useState<
    'credit_card' | 'debit_card' | 'upi'
  >('credit_card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      paymentMethod: 'credit_card',
    },
  });

  if (!currentBooking) {
    navigate('/vehicles');
    return null;
  }

  const { startDate, endDate, totalPrice } = currentBooking;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const days = Math.max(1, differenceInDays(endDateObj, startDateObj));

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessingPayment(true);
    try {
      setPaymentFormData({ ...data, paymentMethod });
      await processPayment();
      if (currentBooking && currentBooking.id) {
        navigate(`/booking/confirmation/${currentBooking.id}`);
      } else {
        console.error('Booking ID not found after payment processing.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Payment processing failed', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-secondary-900">
          Payment Details
        </h2>
        <p className="text-secondary-600 text-sm">
          Secure payment for your booking
        </p>
      </CardHeader>

      <CardContent>
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
          <CheckCircle
            className="text-green-500 mr-2 flex-shrink-0 mt-0.5"
            size={16}
          />
          <div>
            <p className="text-green-800 text-sm font-medium">
              Booking Summary
            </p>
            <p className="text-green-700 text-xs mt-1">
              {format(startDateObj, 'MMM dd, yyyy')} -{' '}
              {format(endDateObj, 'MMM dd, yyyy')}
              <span className="mx-1">•</span>
              {days} {days === 1 ? 'day' : 'days'}
              <span className="mx-1">•</span>
              Total: ₹{totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`border rounded-md p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                paymentMethod === 'credit_card'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <CreditCard
                size={24}
                className={
                  paymentMethod === 'credit_card'
                    ? 'text-primary-600'
                    : 'text-secondary-400'
                }
              />
              <span
                className={`text-sm mt-1 ${
                  paymentMethod === 'credit_card'
                    ? 'text-primary-700 font-medium'
                    : 'text-secondary-600'
                }`}
              >
                Credit Card
              </span>
            </div>

            <div
              className={`border rounded-md p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                paymentMethod === 'debit_card'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              onClick={() => setPaymentMethod('debit_card')}
            >
              <CreditCard
                size={24}
                className={
                  paymentMethod === 'debit_card'
                    ? 'text-primary-600'
                    : 'text-secondary-400'
                }
              />
              <span
                className={`text-sm mt-1 ${
                  paymentMethod === 'debit_card'
                    ? 'text-primary-700 font-medium'
                    : 'text-secondary-600'
                }`}
              >
                Debit Card
              </span>
            </div>

            <div
              className={`border rounded-md p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                paymentMethod === 'upi'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              onClick={() => setPaymentMethod('upi')}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className={
                  paymentMethod === 'upi'
                    ? 'text-primary-600'
                    : 'text-secondary-400'
                }
                fill="currentColor"
              >
                <path d="M7.97 2.1H2.1V7.97H7.97V2.1ZM21.9 2.1H16.03V7.97H21.9V2.1ZM16.03 21.9H21.9V16.03H16.03V21.9ZM7.97 21.9H2.1V16.03H7.97V21.9ZM12 16.68L15.8 9.65H13.57L12.43 12.28C12.3 12.57 12.15 12.94 12 13.33C11.86 12.93 11.7 12.54 11.57 12.26L10.43 9.65H8.2L12 16.68Z" />
              </svg>
              <span
                className={`text-sm mt-1 ${
                  paymentMethod === 'upi'
                    ? 'text-primary-700 font-medium'
                    : 'text-secondary-600'
                }`}
              >
                UPI
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(paymentMethod === 'credit_card' ||
            paymentMethod === 'debit_card') && (
            <>
              <div>
                <Input
                  id="cardNumber"
                  label="Card Number"
                  leftIcon={<CreditCard size={18} />}
                  placeholder="1234 5678 9012 3456"
                  error={errors.cardNumber?.message}
                  fullWidth
                  maxLength={19}
                  {...register('cardNumber', {
                    required: 'Card number is required',
                    pattern: {
                      value: /^[\d\s]{13,19}$/,
                      message: 'Please enter a valid card number',
                    },
                  })}
                />
              </div>

              <div>
                <Input
                  id="cardHolder"
                  label="Cardholder Name"
                  placeholder="John Doe"
                  error={errors.cardHolder?.message}
                  fullWidth
                  {...register('cardHolder', {
                    required: 'Cardholder name is required',
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    id="expiryDate"
                    label="Expiry Date (MM/YY)"
                    leftIcon={<Calendar size={18} />}
                    placeholder="MM/YY"
                    error={errors.expiryDate?.message}
                    fullWidth
                    maxLength={5}
                    {...register('expiryDate', {
                      required: 'Expiry date is required',
                      pattern: {
                        value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                        message: 'Please enter a valid expiry date (MM/YY)',
                      },
                    })}
                  />
                </div>

                <div>
                  <Input
                    id="cvv"
                    label="CVV"
                    leftIcon={<Lock size={18} />}
                    placeholder="123"
                    error={errors.cvv?.message}
                    fullWidth
                    type="password"
                    maxLength={4}
                    {...register('cvv', {
                      required: 'CVV is required',
                      pattern: {
                        value: /^[0-9]{3,4}$/,
                        message: 'Please enter a valid CVV',
                      },
                    })}
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'upi' && (
            <div>
              <Input
                id="upiId"
                label="UPI ID"
                placeholder="yourname@upi"
                error={errors.upiId?.message}
                fullWidth
                {...register('upiId', {
                  required: 'UPI ID is required',
                  pattern: {
                    value: /^[\w.-]+@[\w.-]+$/,
                    message: 'Please enter a valid UPI ID',
                  },
                })}
              />
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={isProcessingPayment}>
              {isProcessingPayment
                ? 'Processing Payment...'
                : `Pay ₹${totalPrice.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t border-secondary-200 bg-secondary-50">
        <div className="flex items-center justify-center w-full text-sm text-secondary-600">
          <Lock size={16} className="mr-1.5 text-secondary-500" />
          Secured by 256-bit SSL encryption. Your payment information is
          protected.
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaymentFormComponent;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Car,
  MapPin,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import type { Booking } from '../../types';
import Button from '../ui/Button';
import { useBookingStore } from '../../store/bookingStore';
import ConfirmationModal from '../ui/ConfirmationModal';

interface BookingCardProps {
  booking: Booking;
  isOwnerView?: boolean;
  onAction?: (bookingId: string, action: 'accept' | 'reject') => Promise<void>;
  onMessageClick: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  isOwnerView,
  onAction,
  onMessageClick,
}) => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      {
        title: 'Booking Placed',
        completed: true,
        icon: <Clock className="h-4 w-4" />,
      },
      {
        title: 'Owner Confirmation',
        completed: ['confirmed', 'completed'].includes(status.toLowerCase()),
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        title: 'Ride Started',
        completed: ['completed'].includes(status.toLowerCase()),
        icon: <Car className="h-4 w-4" />,
      },
      {
        title: 'Ride Completed',
        completed: ['completed'].includes(status.toLowerCase()),
        icon: <CheckCircle className="h-4 w-4" />,
      },
    ];

    if (status.toLowerCase() === 'cancelled') {
      steps[1].completed = false;
      steps[1].title = 'Booking Cancelled';
      steps[1].icon = <XCircle className="h-4 w-4" />;
    }

    return steps;
  };

  const timelineSteps = getTimelineSteps(booking.status);

  // Get actions from the store
  const { isLoading: storeIsLoading, cancelBooking } = useBookingStore(); // Renamed isLoading to avoid conflict

  const handleAccept = async () => {
    if (onAction) {
      setIsAccepting(true);
      setActionError(null);
      try {
        await onAction(booking.id, 'accept');
      } catch (error) {
        console.error('Error accepting booking:', error);
        setActionError('Failed to accept booking.');
      } finally {
        setIsAccepting(false);
      }
    }
  };

  const handleReject = async () => {
    if (onAction) {
      setIsRejecting(true);
      setActionError(null);
      try {
        await onAction(booking.id, 'reject');
      } catch (error) {
        console.error('Error rejecting booking:', error);
        setActionError('Failed to reject booking.');
      } finally {
        setIsRejecting(false);
      }
    }
  };

  const handleCancel = () => {
    // Add confirmation modal later if needed
    cancelBooking(booking.id);
  };

  const isActionInProgress = isAccepting || isRejecting || storeIsLoading;

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={
            booking.vehicle?.imageUrl ||
            'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
          alt={`${booking.vehicle?.make} ${booking.vehicle?.model}`}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-1 right-1">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>

      <CardContent className="p-3">
        {actionError && (
          <div className="bg-red-100 text-red-700 p-2 text-sm rounded mb-3">
            {actionError}
          </div>
        )}
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {booking.vehicle?.make} {booking.vehicle?.model}
          </h3>
          <div className="flex items-center text-gray-600 mb-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-xs">{booking.pickupAddress}</span>
          </div>
          <div className="flex items-center text-gray-600 mb-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-xs">{booking.dropoffAddress}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            <span className="text-xs">
              {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
              {format(new Date(booking.endDate), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mt-4">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          {timelineSteps.map((step, index) => (
            <div key={index} className="relative pl-6 pb-4 last:pb-0">
              <div
                className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  // Use a different icon or no icon for pending steps in smaller size
                  React.cloneElement(step.icon, { className: 'h-3 w-3' })
                )}
              </div>
              <div className="text-xs">
                <p
                  className={`font-medium ${
                    step.title === 'Booking Cancelled'
                      ? 'text-red-600'
                      : step.completed
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessageClick(booking.id)}
            leftIcon={<MessageSquare size={12} />}
          >
            Message
          </Button>

          <div className="flex space-x-2">
            {isOwnerView
              ? booking.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleAccept}
                      disabled={isActionInProgress}
                    >
                      {isAccepting ? 'Accepting...' : 'Accept'}
                    </Button>
                    <Button
                      variant="dangerOutline"
                      size="sm"
                      onClick={handleReject}
                      disabled={isActionInProgress}
                    >
                      {isRejecting ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </>
                )
              : booking.status !== 'completed' &&
                booking.status !== 'cancelled' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isActionInProgress}
                    leftIcon={<Trash2 size={12} />}
                  >
                    Cancel
                  </Button>
                )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;

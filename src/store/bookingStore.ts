import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type {
  Booking,
  BookingFormData,
  PaymentFormData,
  Vehicle,
} from '../types';
import { differenceInDays } from 'date-fns';

// Interface for combined booking and vehicle details
export interface BookingWithVehicleDetails extends Booking {
  vehicle?: Partial<Vehicle>; // Vehicle details will be partial, e.g., make, model, imageUrl
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  selectedBookingDetails: BookingWithVehicleDetails | null; // New state for confirmation page
  isLoading: boolean;
  error: string | null;

  // Booking form data for the flow
  bookingFormData: BookingFormData | null;
  paymentFormData: PaymentFormData | null;
  vehicleId: string | null;

  // Booking actions
  fetchUserBookings: () => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  fetchBookingWithVehicleDetails: (bookingId: string) => Promise<void>; // New action
  createBooking: (
    booking: BookingFormData,
    vehicleId: string,
    dailyRate: number
  ) => Promise<string>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;

  // Booking flow actions
  setBookingFormData: (data: BookingFormData) => void;
  setPaymentFormData: (data: PaymentFormData) => void;
  setVehicleId: (id: string) => void;
  clearBookingFlow: () => void;

  // Payment actions
  processPayment: () => Promise<string>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  currentBooking: null,
  selectedBookingDetails: null, // Initialize new state
  isLoading: false,
  error: null,
  bookingFormData: null,
  paymentFormData: null,
  vehicleId: null,

  fetchUserBookings: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      set({ isLoading: true, error: null });
      console.log('[fetchUserBookings] Fetching for user:', user.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          vehicle:vehicles (
            make,
            model,
            year,
            image_url
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('[fetchUserBookings] Raw data from Supabase:', data);
      if (error) {
        console.error('[fetchUserBookings] Supabase error:', error);
        throw error;
      }

      const formattedBookings = data.map(formatBookingResponse);
      console.log('[fetchUserBookings] Formatted bookings:', formattedBookings);
      set({ bookings: formattedBookings as Booking[] });
    } catch (error) {
      console.error('[fetchUserBookings] Catch error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBookingById: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const formattedBooking = formatBookingResponse(data);
      set({ currentBooking: formattedBooking });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBookingWithVehicleDetails: async (bookingId) => {
    try {
      set({ isLoading: true, error: null, selectedBookingDetails: null });

      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      if (!bookingData) throw new Error('Booking not found.');

      const formattedBooking = formatBookingResponse(bookingData);

      // Fetch associated vehicle details
      let vehicleDetails: Partial<Vehicle> | undefined = undefined;
      if (formattedBooking.vehicleId) {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('make, model, imageUrl, year, dailyRate, location') // Select specific fields
          .eq('id', formattedBooking.vehicleId)
          .single();

        if (vehicleError) {
          console.warn(
            'Could not fetch vehicle details for booking:',
            vehicleError.message
          );
          // Proceed without vehicle details if it fails, or throw error if critical
        } else if (vehicleData) {
          vehicleDetails = {
            make: vehicleData.make,
            model: vehicleData.model,
            imageUrl: vehicleData.imageUrl,
            year: vehicleData.year,
            dailyRate: vehicleData.daily_rate, // Ensure mapping from snake_case if needed by Vehicle type
            location: vehicleData.location,
          };
        }
      }

      set({
        selectedBookingDetails: {
          ...formattedBooking,
          vehicle: vehicleDetails,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching booking with vehicle details:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createBooking: async (booking, vehicleId, dailyRate) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      set({ isLoading: true, error: null });

      // Calculate total price
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const days = Math.max(1, differenceInDays(endDate, startDate));
      const totalPrice = days * dailyRate;

      // Create booking
      const bookingData = {
        vehicle_id: vehicleId,
        user_id: user.id,
        start_date: booking.startDate,
        end_date: booking.endDate,
        total_price: totalPrice,
        status: 'pending',
        pickup_address: booking.pickupAddress,
        dropoff_address: booking.dropoffAddress,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Store the current booking data for the flow
      set({
        bookingFormData: booking,
        vehicleId,
        currentBooking: formatBookingResponse(data),
      });

      return data.id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBooking: async (id, booking) => {
    try {
      set({ isLoading: true, error: null });

      // Convert from camelCase to snake_case for Supabase
      const updateData: Record<string, unknown> = {};

      if (booking.startDate !== undefined)
        updateData.start_date = booking.startDate;
      if (booking.endDate !== undefined) updateData.end_date = booking.endDate;
      if (booking.totalPrice !== undefined)
        updateData.total_price = booking.totalPrice;
      if (booking.status !== undefined) updateData.status = booking.status;
      if (booking.pickupAddress !== undefined)
        updateData.pickup_address = booking.pickupAddress;
      if (booking.dropoffAddress !== undefined)
        updateData.dropoff_address = booking.dropoffAddress;
      if (booking.paymentId !== undefined)
        updateData.payment_id = booking.paymentId;

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Refresh the bookings
      await get().fetchUserBookings();
      if (get().currentBooking?.id === id) {
        await get().fetchBookingById(id);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelBooking: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      // Refresh the bookings
      await get().fetchUserBookings();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setBookingFormData: (data) => {
    set({ bookingFormData: data });
  },

  setPaymentFormData: (data) => {
    set({ paymentFormData: data });
  },

  setVehicleId: (id) => {
    set({ vehicleId: id });
  },

  clearBookingFlow: () => {
    set({
      bookingFormData: null,
      paymentFormData: null,
      vehicleId: null,
      currentBooking: null,
    });
  },

  processPayment: async () => {
    try {
      const { currentBooking, paymentFormData } = get();
      if (!currentBooking) throw new Error('No active booking');
      if (!paymentFormData) throw new Error('Payment data not provided');

      set({ isLoading: true, error: null });

      // Create payment record
      const paymentData = {
        booking_id: currentBooking.id,
        amount: currentBooking.totalPrice,
        status: 'completed', // In a real app, this would be 'pending' until confirmed
        payment_method: paymentFormData.paymentMethod,
        transaction_id: `tx_${Math.random().toString(36).substr(2, 9)}`, // Mock transaction ID
      };

      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      // Update booking with payment ID and set status to confirmed
      await get().updateBooking(currentBooking.id, {
        paymentId: data.id,
        status: 'confirmed',
      });

      return data.id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Helper function to convert from snake_case to camelCase
function formatBookingResponse(booking: any): Booking {
  console.log('[formatBookingResponse] Formatting booking:', booking);
  const formatted = {
    id: booking.id,
    vehicleId: booking.vehicle_id,
    userId: booking.user_id,
    startDate: booking.start_date,
    endDate: booking.end_date,
    totalPrice: booking.total_price,
    status: booking.status,
    pickupAddress: booking.pickup_address,
    dropoffAddress: booking.dropoff_address,
    paymentId: booking.payment_id,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
    vehicle: booking.vehicle
      ? {
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          imageUrl: booking.vehicle.image_url,
        }
      : undefined,
  };
  console.log('[formatBookingResponse] Result:', formatted);
  return formatted;
}

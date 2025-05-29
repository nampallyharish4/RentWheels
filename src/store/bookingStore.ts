import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type {
  Booking,
  BookingFormData,
  PaymentFormData,
  Vehicle,
  UserProfile,
} from '../types/index';
import { differenceInDays, isBefore, isAfter, isEqual } from 'date-fns';

// Define the expected structure of the raw data from the ownerBookings select query
// Use snake_case for properties matching the Supabase response
interface RawOwnerBookingData {
  id: string;
  vehicle_id: string;
  user_id: string;
  start_date: string; // Assuming date strings from DB
  end_date: string; // Assuming date strings from DB
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pickup_address: string;
  dropoff_address: string;
  payment_id: string | null; // Assuming payment_id exists
  created_at: string; // Assuming date strings from DB
  updated_at: string; // Assuming date strings from DB
  ownerDecision: 'pending' | 'accepted' | 'rejected' | null; // Allow null explicitly from DB
  // Nested data from joins
  vehicle: {
    // Structure matching the select clause for vehicle
    id: string;
    make: string;
    model: string;
    year: number;
    daily_rate: number; // Snake_case from DB
    type: 'car' | 'bike'; // Assuming type exists in Vehicle
    category: string; // Assuming category exists in Vehicle
    description: string; // Assuming description exists in Vehicle
    image_url: string; // Snake_case from DB
    available: boolean; // Assuming available exists in Vehicle
    owner_id: string; // Snake_case from DB
    location: string; // Assuming location exists in Vehicle
    created_at: string; // Assuming date strings
    updated_at: string; // Assuming date strings
  } | null; // Vehicle can be null if not joined or not found
  user: {
    // Structure matching the select clause for user profile
    id: string;
    full_name: string | null; // Snake_case from DB
    // Add other profile fields if selected in the query and needed
    first_name: string | null; // Assuming these exist and are selected
    lastName: string | null; // Corrected from last_name to match UserProfile type
    phone: string | null;
    avatar_url: string | null; // Snake_case from DB
    email: string;
    created_at: string; // Assuming date strings
    updated_at: string; // Assuming date strings
  } | null; // User can be null if not joined or not found
}

// Interface for combined booking and vehicle details for owner view
// Extends Booking and adds customer (user) details, and provides full vehicle details
// Omit vehicle from base Booking as the join fetches more fields than Pick allows
export interface BookingWithVehicleDetails extends Omit<Booking, 'vehicle'> {
  vehicle?: Partial<Vehicle>; // Include full vehicle details fetched by the join
  customer?: Partial<UserProfile>; // Customer (user) details fetched by the join
  ownerDecision?: 'pending' | 'accepted' | 'rejected' | null; // Allow null explicitly here too
}

interface BookingState {
  bookings: Booking[]; // User's own bookings (using the base Booking type)
  ownerBookings: BookingWithVehicleDetails[]; // Bookings for owner's vehicles (using the extended type)
  currentBooking: BookingWithVehicleDetails | null; // Use extended type for current booking details
  selectedBookingDetails: BookingWithVehicleDetails | null; // For confirmation page
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

  // Owner actions
  fetchOwnerBookings: () => Promise<void>;
  acceptBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  ownerBookings: [],
  currentBooking: null,
  selectedBookingDetails: null,
  isLoading: false,
  error: null,
  bookingFormData: null,
  paymentFormData: null,
  vehicleId: null,

  fetchUserBookings: async () => {
    try {
      const userId = useAuthStore.getState().profile?.id;
      if (!userId)
        throw new Error('User not authenticated or profile not loaded');

      set({ isLoading: true, error: null });
      console.log('[fetchUserBookings] Fetching for user:', userId);

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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('[fetchUserBookings] Raw data from Supabase:', data);
      if (error) {
        console.error('[fetchUserBookings] Supabase error:', error);
        throw error;
      }

      // Format user bookings - these use the base Booking type
      // The select for user bookings only fetches a Pick of vehicle data
      // Map snake_case from DB to camelCase for Booking properties
      const formattedBookings = (data as any[]).map((b) => ({
        id: b.id,
        vehicleId: b.vehicle_id,
        userId: b.user_id,
        startDate: b.start_date,
        endDate: b.end_date,
        totalPrice: b.total_price,
        status: b.status,
        pickupAddress: b.pickup_address,
        dropoffAddress: b.dropoff_address,
        paymentId: b.payment_id,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
        ownerDecision: b.ownerDecision || null, // Assuming ownerDecision is also in base booking if selected
        vehicle: b.vehicle
          ? {
              // Map vehicle details to Pick<Vehicle>
              make: b.vehicle.make,
              model: b.vehicle.model,
              year: b.vehicle.year,
              imageUrl: b.vehicle.image_url,
              // Note: Base Booking type's vehicle is only a Pick, not full Vehicle
            }
          : undefined,
      }));

      console.log('[fetchUserBookings] Formatted bookings:', formattedBookings);
      set({ bookings: formattedBookings }); // No cast needed if mapping is correct
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
        .select(
          `
          *,
          vehicle:vehicles (*),
          user:profiles(*)
          `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      // Use the common formatBookingResponse helper
      // This helper expects RawOwnerBookingData structure (with nested vehicle/user)
      const formattedBooking = formatBookingResponse(
        data as RawOwnerBookingData
      );
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

      // Fetch booking details with nested vehicle and user for full context
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(
          `
          *,
          vehicle:vehicles (*),
          user:profiles(*)
          `
        )
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      if (!bookingData) throw new Error('Booking not found.');

      // Use the common formatBookingResponse helper to format the fetched data
      const formattedBookingDetails = formatBookingResponse(
        bookingData as RawOwnerBookingData
      );

      set({
        selectedBookingDetails: formattedBookingDetails,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching booking with vehicle details:', error);
      set({ error: (error as Error).message, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  createBooking: async (booking, vehicleId, dailyRate) => {
    try {
      const profileId = useAuthStore.getState().profile?.id;
      if (!profileId)
        throw new Error('User not authenticated or profile not loaded');

      set({ isLoading: true, error: null });

      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      // --- Booking Conflict Check ---
      const { data: conflictingBookings, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status')
        .eq('vehicle_id', vehicleId)
        .neq('status', 'cancelled') // Exclude cancelled bookings
        .or(
          `and(start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()})`
        );

      if (conflictError) {
        console.error('[createBooking] Conflict check error:', conflictError);
        throw conflictError;
      }

      if (conflictingBookings && conflictingBookings.length > 0) {
        // Found conflicting bookings
        console.warn(
          '[createBooking] Booking conflict found:',
          conflictingBookings
        );
        throw new Error(
          'This vehicle is already booked for some of the selected dates.'
        );
      }
      // --- End Booking Conflict Check ---

      // Calculate total price
      const days = Math.max(1, differenceInDays(endDate, startDate));
      const totalPrice = days * dailyRate;

      // Create booking
      const bookingData = {
        vehicle_id: vehicleId,
        user_id: profileId,
        start_date: booking.startDate,
        end_date: booking.endDate,
        total_price: totalPrice,
        status: 'pending',
        pickup_address: booking.pickupAddress,
        dropoff_address: booking.dropoffAddress,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('[createBooking] Supabase insert error:', error);
        throw error;
      }

      // Assuming the insert was successful, the created booking object should be in `data`
      if (data) {
        // You might want to add the new booking to the state, or refetch all bookings
        // Refetching is simpler for now to ensure consistency
        get().fetchUserBookings();
        return data.id; // Return the ID of the newly created booking
      }
      throw new Error('Booking creation failed.'); // Should not happen if data is present
    } catch (error) {
      console.error('[createBooking] Catch error:', error);
      set({ error: (error as Error).message });
      throw error; // Re-throw to be caught by the component
    } finally {
      set({ isLoading: false });
    }
  },

  updateBooking: async (id, booking) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase // Removed unused 'data'
        .from('bookings')
        .update(booking)
        .eq('id', id)
        .select();

      if (error) {
        console.error('[updateBooking] Supabase update error:', error);
        throw error;
      }

      // Optionally update the state with the modified booking
      // For simplicity, we might refetch bookings after important updates
      get().fetchUserBookings();
      get().fetchOwnerBookings();
    } catch (error) {
      console.error('[updateBooking] Catch error:', error);
      set({ error: (error as Error).message });
      throw error; // Re-throw to be caught by the component
    } finally {
      set({ isLoading: false });
    }
  },

  cancelBooking: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase // Removed unused 'data'
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        console.error('[cancelBooking] Supabase update error:', error);
        throw error;
      }

      // Refetch bookings to update the UI
      get().fetchUserBookings();
    } catch (error) {
      console.error('[cancelBooking] Catch error:', error);
      set({ error: (error as Error).message });
      // Optionally re-throw the error if the component needs to handle it
      // throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setBookingFormData: (data) => set({ bookingFormData: data }),
  setPaymentFormData: (data) => set({ paymentFormData: data }),
  setVehicleId: (id) => set({ vehicleId: id }),
  clearBookingFlow: () =>
    set({ bookingFormData: null, paymentFormData: null, vehicleId: null }),

  processPayment: async () => {
    try {
      const { bookingFormData, vehicleId, paymentFormData } = get();
      const profile = useAuthStore.getState().profile;

      if (!bookingFormData || !vehicleId || !paymentFormData || !profile)
        throw new Error(
          'Booking or payment data missing. Please restart the booking process.'
        );

      set({ isLoading: true, error: null });

      // In a real application, this is where you would integrate with a payment gateway (e.g., Stripe, PayPal)
      // This is a placeholder that simulates a successful payment after a delay.
      console.log('Processing payment...', {
        paymentFormData,
        bookingFormData,
      });

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // After successful payment, create the booking
      // You might move the createBooking logic here, or call it after confirming payment
      // For this example, we'll assume payment success means we can proceed to create booking

      // Fetch vehicle daily rate to calculate total price accurately
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('daily_rate')
        .eq('id', vehicleId)
        .single();

      if (vehicleError) {
        console.error(
          '[processPayment] Error fetching vehicle daily rate:',
          vehicleError
        );
        throw vehicleError;
      }

      if (!vehicleData) {
        throw new Error('Vehicle not found for payment processing.');
      }

      const bookingId = await get().createBooking(
        bookingFormData,
        vehicleId,
        vehicleData.daily_rate
      );

      // Clear booking flow data after successful booking
      get().clearBookingFlow();

      return bookingId; // Return the created booking ID
    } catch (error) {
      console.error('[processPayment] Catch error:', error);
      set({ error: (error as Error).message });
      throw error; // Re-throw to be caught by the component
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOwnerBookings: async () => {
    try {
      const userId = useAuthStore.getState().profile?.id;
      if (!userId) throw new Error('User not authenticated');

      set({ isLoading: true, error: null });

      // Fetch vehicles owned by the user
      const { data: userVehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('owner_id', userId);

      if (vehiclesError) throw vehiclesError;

      const userVehicleIds = userVehicles.map((vehicle) => vehicle.id);

      console.log('[fetchOwnerBookings] User ID:', userId);
      console.log('[fetchOwnerBookings] Owned Vehicle IDs:', userVehicleIds);

      if (userVehicleIds.length === 0) {
        set({ ownerBookings: [] }); // No vehicles, no owner bookings
        return;
      }

      // Fetch bookings for these vehicles where the user is NOT the booker
      const { data: ownerBookingsData, error: ownerBookingsError } =
        await supabase
          .from('bookings')
          .select(
            `
          *,
          vehicle:vehicles (*),
          user:profiles(*)
        `
          )
          .in('vehicle_id', userVehicleIds)
          .neq('user_id', userId) // Exclude bookings made by the owner for their own vehicle
          .order('created_at', { ascending: false });

      console.log(
        '[fetchOwnerBookings] Raw data from Supabase:',
        ownerBookingsData
      );

      if (ownerBookingsError) throw ownerBookingsError;

      const formattedOwnerBookings = (
        ownerBookingsData as RawOwnerBookingData[]
      ).map(formatBookingResponse);
      set({ ownerBookings: formattedOwnerBookings });
    } catch (error) {
      console.error('[fetchOwnerBookings] Error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  acceptBooking: async (bookingId) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase // Removed unused 'data'
        .from('bookings')
        .update({ status: 'confirmed', ownerDecision: 'accepted' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      // Refetch owner bookings to update the list
      get().fetchOwnerBookings();
      // Optionally update the specific booking in the state if needed
    } catch (error) {
      console.error('[acceptBooking] Error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  rejectBooking: async (bookingId) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase // Removed unused 'data'
        .from('bookings')
        .update({ status: 'cancelled', ownerDecision: 'rejected' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      // Refetch owner bookings to update the list
      get().fetchOwnerBookings();
      // Optionally update the specific booking in the state if needed
    } catch (error) {
      console.error('[rejectBooking] Error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Helper function to format booking response
function formatBookingResponse(
  booking: RawOwnerBookingData
): BookingWithVehicleDetails {
  // Map Supabase snake_case to camelCase
  const baseBooking: Booking = {
    // Use Booking type for the base mapping
    id: booking.id,
    vehicleId: booking.vehicle_id,
    userId: booking.user_id,
    startDate: booking.start_date, // Assuming these are strings/ISO dates from DB
    endDate: booking.end_date, // Assuming these are strings/ISO dates from DB
    totalPrice: booking.total_price,
    status: booking.status,
    pickupAddress: booking.pickup_address,
    dropoffAddress: booking.dropoff_address,
    paymentId: booking.payment_id, // Assuming payment_id exists and is snake_case
    createdAt: booking.created_at, // Assuming these are strings/ISO dates from DB
    updatedAt: booking.updated_at, // Assuming these are strings/ISO dates from DB
    // The base Booking type also has an optional vehicle property (Pick type)
    // which will be overridden by the detailed vehicle below.
    ownerDecision: booking.ownerDecision, // Directly use ownerDecision, allowing null
  };

  // Build the detailed booking including vehicle and customer
  const detailedBooking: BookingWithVehicleDetails = {
    ...baseBooking,
    // Map nested vehicle details from snake_case to camelCase using the Vehicle type
    vehicle: booking.vehicle
      ? {
          id: booking.vehicle.id,
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          dailyRate: booking.vehicle.daily_rate, // Correctly map snake_case to camelCase
          type: booking.vehicle.type,
          category: booking.vehicle.category,
          description: booking.vehicle.description,
          imageUrl: booking.vehicle.image_url, // Correctly map snake_case to camelCase
          available: booking.vehicle.available,
          ownerId: booking.vehicle.owner_id, // Correctly map snake_case to camelCase
          location: booking.vehicle.location,
          createdAt: booking.vehicle.created_at, // Assuming strings
          updatedAt: booking.vehicle.updated_at, // Assuming strings
        }
      : undefined,
    // Map nested user (customer) details from snake_case to camelCase using the UserProfile type
    customer: booking.user
      ? {
          id: booking.user.id,
          firstName: booking.user.first_name, // Correctly map snake_case to camelCase
          lastName: booking.user.last_name, // Correctly map snake_case to camelCase
          phone: booking.user.phone,
          avatarUrl: booking.user.avatar_url, // Correctly map snake_case to camelCase
          email: booking.user.email,
          createdAt: booking.user.created_at,
          updatedAt: booking.user.updated_at,
        }
      : undefined,
  };

  return detailedBooking;
}

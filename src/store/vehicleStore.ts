import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Vehicle, CategoryType } from '../types';
import { useAuthStore } from '../store/authStore';

interface VehicleFilters {
  category?: CategoryType;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  searchQuery?: string;
  available?: boolean;
}

interface VehicleState {
  vehicles: Vehicle[];
  featuredVehicles: Vehicle[];
  userListedVehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  filters: VehicleFilters;

  // Vehicle actions
  fetchVehicles: (filters?: VehicleFilters) => Promise<void>;
  fetchFeaturedVehicles: () => Promise<void>;
  fetchVehicleById: (id: string) => Promise<void>;
  fetchUserListedVehicles: (userId: string) => Promise<void>;
  createVehicle: (
    vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setFilters: (filters: VehicleFilters) => void;
  clearFilters: () => void;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  featuredVehicles: [],
  userListedVehicles: [],
  selectedVehicle: null,
  isLoading: false,
  error: null,
  filters: {
    available: true,
  },

  fetchVehicles: async (filters) => {
    try {
      set({ isLoading: true, error: null });

      // Use provided filters or store filters
      const currentFilters = filters || get().filters;

      // Get current user profile from auth store
      const profile = useAuthStore.getState().profile;

      // Start building the query
      let query = supabase.from('vehicles').select('*');

      // Filter out user's own vehicles if user is logged in
      if (profile?.id) {
        query = query.neq('owner_id', profile.id);
      }

      // Apply filters
      if (currentFilters.available !== undefined) {
        query = query.eq('available', currentFilters.available);
      }

      if (currentFilters.category) {
        query = query.eq('category', currentFilters.category);
      }

      if (currentFilters.location) {
        query = query.ilike('location', `%${currentFilters.location}%`);
      }

      if (currentFilters.priceMin !== undefined) {
        query = query.gte('daily_rate', currentFilters.priceMin);
      }

      if (currentFilters.priceMax !== undefined) {
        query = query.lte('daily_rate', currentFilters.priceMax);
      }

      if (currentFilters.searchQuery) {
        query = query.or(
          `make.ilike.%${currentFilters.searchQuery}%,model.ilike.%${currentFilters.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedVehicles = data.map(formatVehicleResponse);
      set({ vehicles: formattedVehicles });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeaturedVehicles: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('available', true)
        .order('daily_rate', { ascending: false })
        .limit(6);

      if (error) throw error;

      const formattedVehicles = data.map(formatVehicleResponse);
      set({ featuredVehicles: formattedVehicles });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchVehicleById: async (id) => {
    try {
      set({ isLoading: true, error: null, selectedVehicle: null });

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const formattedVehicle = formatVehicleResponse(data);
      set({ selectedVehicle: formattedVehicle });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserListedVehicles: async (userId) => {
    if (!userId) {
      set({
        userListedVehicles: [],
        error: 'User ID is required to fetch listed vehicles.',
      });
      return;
    }
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedVehicles = data.map(formatVehicleResponse);
      set({ userListedVehicles: formattedVehicles });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createVehicle: async (vehicle) => {
    try {
      set({ isLoading: true, error: null });

      // Get the current user's profile
      const profile = useAuthStore.getState().profile;
      if (!profile) {
        throw new Error('You must be logged in to list a vehicle.');
      }

      // Convert from camelCase to snake_case for Supabase
      const vehicleData = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        daily_rate: vehicle.dailyRate,
        category: vehicle.category || 'sedan', // Default to sedan if not specified
        description: vehicle.description || '',
        image_url: vehicle.imageUrl,
        available: vehicle.available !== undefined ? vehicle.available : true,
        owner_id: profile.id, // Use the profile ID from auth store
        location: vehicle.location,
      };

      // Use RPC call to bypass RLS
      const { data, error } = await supabase.rpc('create_vehicle', vehicleData);

      if (error) {
        console.error('Error creating vehicle:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Failed to create vehicle');
      }

      // Return the ID of the newly created vehicle
      return data.id;
    } catch (error) {
      console.error('Create vehicle error:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateVehicle: async (id, vehicle) => {
    try {
      set({ isLoading: true, error: null });

      // Convert from camelCase to snake_case for Supabase
      const updateData: Record<string, unknown> = {};

      if (vehicle.make !== undefined) updateData.make = vehicle.make;
      if (vehicle.model !== undefined) updateData.model = vehicle.model;
      if (vehicle.year !== undefined) updateData.year = vehicle.year;
      if (vehicle.dailyRate !== undefined)
        updateData.daily_rate = vehicle.dailyRate;
      if (vehicle.category !== undefined)
        updateData.category = vehicle.category;
      if (vehicle.description !== undefined)
        updateData.description = vehicle.description;
      if (vehicle.imageUrl !== undefined)
        updateData.image_url = vehicle.imageUrl;
      if (vehicle.available !== undefined)
        updateData.available = vehicle.available;
      if (vehicle.location !== undefined)
        updateData.location = vehicle.location;

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Refresh the vehicles list and selected vehicle
      if (get().selectedVehicle?.id === id) {
        await get().fetchVehicleById(id);
      }
      await get().fetchVehicles();

      // Also refresh user listed vehicles if the owner is known and matches
      const ownerId = get().selectedVehicle?.ownerId || vehicle.ownerId;
      if (ownerId) {
        await get().fetchUserListedVehicles(ownerId.toString());
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteVehicle: async (id) => {
    console.log(`[Store] Attempting to delete vehicle with ID: ${id}`);
    try {
      set({ isLoading: true, error: null });

      const vehicleToDelete =
        get().vehicles.find((v) => v.id === id) ||
        get().userListedVehicles.find((v) => v.id === id);
      const ownerId = vehicleToDelete?.ownerId;
      console.log(`[Store] Vehicle to delete found. Owner ID: ${ownerId}`);

      // Step 1: Get all booking IDs associated with the vehicle
      console.log(`[Store] Step 1: Fetching booking IDs for vehicle ID: ${id}`);
      const { data: bookings, error: fetchBookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('vehicle_id', id);

      if (fetchBookingsError) {
        console.error(
          '[Store] Error fetching booking IDs:',
          fetchBookingsError
        );
        throw new Error(
          `Could not fetch booking IDs (Code: ${fetchBookingsError.code}, Message: ${fetchBookingsError.message}). Vehicle not deleted.`
        );
      }
      console.log('[Store] Booking IDs fetched:', bookings);

      if (bookings && bookings.length > 0) {
        const bookingIds = bookings.map((b) => b.id);

        // Step 2: Delete payments associated with these bookings
        console.log(
          `[Store] Step 2: Deleting payments associated with booking IDs: ${bookingIds.join(
            ', '
          )}`
        );
        const { data: deletedPayments, error: paymentDeleteError } =
          await supabase
            .from('payments')
            .delete()
            .in('booking_id', bookingIds)
            .select();

        // Log the outcome of the payment deletion attempt
        console.log('[Store] Payments deletion attempt. Result:', {
          data: deletedPayments,
          error: paymentDeleteError,
        });

        if (paymentDeleteError) {
          console.error(
            '[Store] Error deleting associated payments:',
            paymentDeleteError
          );
          // Check for foreign key violation specifically for payments, though less likely to be a primary cause
          // if we're deleting payments themselves unless there's another table pointing to payments.
          // For now, a general error message for payment deletion.
          throw new Error(
            `Could not delete associated payments (Code: ${paymentDeleteError.code}, Message: ${paymentDeleteError.message}). Vehicle not deleted.`
          );
        }
        console.log('[Store] Associated payments deletion step completed.');

        // Step 3: Delete associated bookings
        console.log(
          `[Store] Step 3: Deleting bookings associated with vehicle ID: ${id}`
        );
        const { data: deletedBookings, error: bookingDeleteError } =
          await supabase
            .from('bookings')
            .delete()
            .in('id', bookingIds)
            .select();

        if (bookingDeleteError) {
          console.error(
            '[Store] Error deleting associated bookings:',
            bookingDeleteError
          );
          throw new Error(
            `Could not delete associated bookings (Code: ${bookingDeleteError.code}, Message: ${bookingDeleteError.message}). Vehicle not deleted.`
          );
        }
        console.log(
          '[Store] Associated bookings deletion step completed.',
          deletedBookings
        );
      } else {
        console.log(
          '[Store] No bookings found for this vehicle. Skipping payment and booking deletion.'
        );
      }

      // Step 4: Delete the vehicle itself
      console.log(`[Store] Step 4: Deleting vehicle with ID: ${id}`);
      const { error: vehicleDeleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (vehicleDeleteError) {
        console.error(
          '[Store] Error deleting vehicle itself:',
          vehicleDeleteError
        );
        throw vehicleDeleteError;
      }
      console.log('[Store] Vehicle deletion step completed.');

      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
        featuredVehicles: state.featuredVehicles.filter((v) => v.id !== id),
        userListedVehicles: state.userListedVehicles.filter((v) => v.id !== id),
        selectedVehicle:
          state.selectedVehicle?.id === id ? null : state.selectedVehicle,
      }));
      console.log('[Store] Local state updated after deletion.');

      if (ownerId) {
        console.log(
          `[Store] Refreshing user listed vehicles for owner ID: ${ownerId}`
        );
        await get().fetchUserListedVehicles(ownerId.toString());
      }
      console.log('[Store] deleteVehicle process completed successfully.');
    } catch (error) {
      console.error('[Store] Error in deleteVehicle process overall:', error);
      set({ error: (error as Error).message });
      throw error; // Re-throw for the component to catch
    } finally {
      set({ isLoading: false });
      console.log('[Store] deleteVehicle isLoading set to false.');
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    // Fetch vehicles with the new filters
    get().fetchVehicles();
  },

  clearFilters: () => {
    set({
      filters: {
        available: true,
      },
    });
    // Fetch vehicles with cleared filters
    get().fetchVehicles();
  },
}));

// Helper function to convert from snake_case to camelCase
function formatVehicleResponse(vehicle: Record<string, any>): Vehicle {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    dailyRate: vehicle.daily_rate,
    category: vehicle.category,
    description: vehicle.description,
    imageUrl: vehicle.image_url,
    available: vehicle.available,
    ownerId: vehicle.owner_id,
    location: vehicle.location,
    createdAt: vehicle.created_at,
    updatedAt: vehicle.updated_at,
  };
}

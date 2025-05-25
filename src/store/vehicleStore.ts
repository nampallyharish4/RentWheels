import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Vehicle, CategoryType } from '../types';

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
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  filters: VehicleFilters;
  
  // Vehicle actions
  fetchVehicles: (filters?: VehicleFilters) => Promise<void>;
  fetchFeaturedVehicles: () => Promise<void>;
  fetchVehicleById: (id: string) => Promise<void>;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setFilters: (filters: VehicleFilters) => void;
  clearFilters: () => void;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  featuredVehicles: [],
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
      
      // Start building the query
      let query = supabase
        .from('vehicles')
        .select('*');
      
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
        query = query.or(`make.ilike.%${currentFilters.searchQuery}%,model.ilike.%${currentFilters.searchQuery}%`);
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
  
  createVehicle: async (vehicle) => {
    try {
      set({ isLoading: true, error: null });
      
      // Convert from camelCase to snake_case for Supabase
      const vehicleData = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        daily_rate: vehicle.dailyRate,
        category: vehicle.category,
        description: vehicle.description,
        image_url: vehicle.imageUrl,
        available: vehicle.available,
        owner_id: vehicle.ownerId,
        location: vehicle.location,
      };
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh the vehicles list
      await get().fetchVehicles();
      
      return data.id;
    } catch (error) {
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
      if (vehicle.dailyRate !== undefined) updateData.daily_rate = vehicle.dailyRate;
      if (vehicle.category !== undefined) updateData.category = vehicle.category;
      if (vehicle.description !== undefined) updateData.description = vehicle.description;
      if (vehicle.imageUrl !== undefined) updateData.image_url = vehicle.imageUrl;
      if (vehicle.available !== undefined) updateData.available = vehicle.available;
      if (vehicle.location !== undefined) updateData.location = vehicle.location;
      
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
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteVehicle: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update state to remove the deleted vehicle
      set((state) => ({
        vehicles: state.vehicles.filter(v => v.id !== id),
        featuredVehicles: state.featuredVehicles.filter(v => v.id !== id),
        selectedVehicle: state.selectedVehicle?.id === id ? null : state.selectedVehicle
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
    // Fetch vehicles with the new filters
    get().fetchVehicles();
  },
  
  clearFilters: () => {
    set({
      filters: {
        available: true,
      }
    });
    // Fetch vehicles with cleared filters
    get().fetchVehicles();
  }
}));

// Helper function to convert from snake_case to camelCase
function formatVehicleResponse(vehicle: any): Vehicle {
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
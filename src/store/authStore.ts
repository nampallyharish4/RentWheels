import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { AuthUser, UserProfile } from '../types';

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loadUser: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            emailConfirmed: data.user.email_confirmed_at !== null,
          },
        });
        
        // Load user profile after login
        await get().loadProfile();
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`, // Redirect to login page after verification
        }
      });

      if (error) throw error;

      if (data.user) {
        // Check if email confirmation was sent
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error('This email is already registered. Please sign in or reset your password.');
        }

        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            emailConfirmed: data.user.email_confirmed_at !== null,
          },
        });
        
        // Create user profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email || '',
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            emailConfirmed: data.user.email_confirmed_at !== null,
          },
        });
        
        // Load user profile after getting user
        await get().loadProfile();
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadProfile: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If there's a data not found error, set profile to null
      if (error?.code === 'PGRST116') {
        set({ profile: null });
        return;
      }

      // For any other error, throw it
      if (error) throw error;

      if (data) {
        set({
          profile: {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            phone: data.phone,
            avatarUrl: data.avatar_url,
            email: data.email,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
        });
      } else {
        set({ profile: null });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateProfile: async (profile: Partial<UserProfile>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('User not authenticated');

      set({ isLoading: true, error: null });

      // Convert from camelCase to snake_case for Supabase
      const updateData = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        avatar_url: profile.avatarUrl,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Reload profile to get updated data
      await get().loadProfile();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
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
  signup: (
    email: string,
    password: string,
    profile?: { firstName?: string; lastName?: string }
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loadUser: () => Promise<void>;
  loadProfile: () => Promise<void>;
  createProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
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

      if (error) {
        // Check if the error is due to email not being confirmed
        if (error.message.includes('Email not confirmed')) {
          set({
            error:
              'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
          });
          return;
        }
        throw error;
      }

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

  signup: async (
    email: string,
    password: string,
    profile?: { firstName?: string; lastName?: string }
  ) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            email: email,
            first_name: profile?.firstName,
            last_name: profile?.lastName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Check if email is already registered
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error(
            'This email is already registered. Please sign in or reset your password.'
          );
        }

        // Set user state with emailConfirmed status
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            emailConfirmed: data.user.email_confirmed_at !== null,
          },
        });

        // Create profile with first name and last name
        if (profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              first_name: profile.firstName,
              last_name: profile.lastName,
            });

          if (profileError && profileError.code !== '23505') {
            console.error('Error creating profile:', profileError);
          }
        }

        // Navigate directly to verify-email page
        return '/verify-email';
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async () => {
    try {
      const { user } = get();
      if (!user) throw new Error('No authenticated user');

      set({ isLoading: true, error: null });

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Profile exists, just load it
        await get().loadProfile();
        return;
      }

      // Create new profile
      const { error: createError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
      });

      if (createError) {
        // If error is about duplicate key, profile exists
        if (createError.code === '23505') {
          await get().loadProfile();
          return;
        }
        throw createError;
      }

      // Load the newly created profile
      await get().loadProfile();
    } catch (error) {
      console.error('Error creating profile:', error);
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

      // First check if we have a session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        set({ user: null, profile: null });
        return;
      }

      // If we have a session, get the user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email || '',
            emailConfirmed: user.email_confirmed_at !== null,
          },
        });

        // Try to create/load profile
        await get().createProfile();
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error('Error loading user:', error);
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

      if (error) {
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          await get().createProfile();
          return;
        }
        throw error;
      }

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

  deleteAccount: async () => {
    try {
      const { user } = get();
      if (!user) throw new Error('User not authenticated');

      set({ isLoading: true, error: null });
      console.log('Attempting to delete user:', user.id);

      // Call the delete_user function
      const { data: success, error: deleteError } = await supabase.rpc(
        'delete_user'
      );
      console.log('Delete function response:', { success, error: deleteError });

      if (deleteError) {
        // Check if error is about active bookings
        if (deleteError.message.includes('active bookings')) {
          throw new Error(
            'Please cancel all active bookings before deleting your account'
          );
        }
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      if (!success) {
        console.error('Delete failed without error');
        throw new Error(
          'Failed to delete account. Please ensure you have no active bookings or pending transactions.'
        );
      }

      // Clear the local state
      set({ user: null, profile: null });
    } catch (error) {
      console.error('Delete account error:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

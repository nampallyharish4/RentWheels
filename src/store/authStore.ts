import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  password: string;
  full_name?: string;
  created_at?: string;
}

interface AuthState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    full_name?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log('Attempting login with:', { email });

          // Find user by email and password
          const { data: profiles, error: searchError } = await supabase
            .from('profiles')
            .select('id, email, full_name, created_at')
            .eq('email', email)
            .eq('password', password);

          if (searchError) {
            console.error('Login error:', searchError);
            throw new Error('Invalid email or password');
          }

          if (!profiles || profiles.length === 0) {
            console.log('No matching profile found');
            throw new Error('Invalid email or password');
          }

          const profile = profiles[0];
          console.log('Login successful:', { profileId: profile.id });

          // Store profile without password
          set({
            profile: {
              ...profile,
              password: '', // Don't store password in client
            },
          });
        } catch (error) {
          console.error('Login process error:', error);
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (email: string, password: string, full_name?: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log('Attempting signup:', { email, full_name });

          // Check if email already exists
          const { data: existingUser, error: searchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email);

          if (searchError) {
            console.error('Email check error:', searchError);
            throw new Error('Error checking email availability');
          }

          if (existingUser && existingUser.length > 0) {
            console.log('Email already exists:', email);
            throw new Error('Email already registered');
          }

          // Create new profile
          const { data: profile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                email,
                password,
                full_name,
                created_at: new Date().toISOString(),
              },
            ])
            .select('id, email, full_name, created_at')
            .single();

          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw new Error('Failed to create account');
          }

          if (profile) {
            console.log('Signup successful:', { profileId: profile.id });
            // Store profile without password
            set({
              profile: {
                ...profile,
                password: '', // Don't store password in client
              },
            });
          }
        } catch (error) {
          console.error('Signup process error:', error);
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        console.log('Logging out user');
        set({ profile: null, error: null });
      },

      loadProfile: async () => {
        const profile = get().profile;
        if (!profile?.email) {
          console.log('No profile to load');
          return;
        }

        try {
          set({ isLoading: true, error: null });
          console.log('Loading profile for:', { email: profile.email });

          const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, created_at')
            .eq('email', profile.email)
            .single();

          if (error) {
            console.error('Profile load error:', error);
            throw error;
          }

          if (data) {
            console.log('Profile loaded successfully');
            // Store profile without password
            set({
              profile: {
                ...data,
                password: '', // Don't store password in client
              },
            });
          }
        } catch (error) {
          console.error('Load profile process error:', error);
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              password: '', // Never persist password
            }
          : null,
      }),
    }
  )
);

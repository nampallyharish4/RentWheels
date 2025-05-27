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

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    profile?: { firstName?: string; lastName?: string }
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  createProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
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
            set({
              user: {
                id: data.user.id,
                email: data.user.email || '',
                emailConfirmed: data.user.email_confirmed_at !== null,
              },
            });
          }

          set({
            message:
              'Registration successful! Please check your email to confirm your account.',
          });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, profile: null });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      loadProfile: async () => {
        const { user } = get();
        if (!user?.id) return;

        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          set({ profile: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      createProfile: async () => {
        const { user } = get();
        if (!user?.id) return;

        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.from('profiles').insert([
            {
              id: user.id,
              email: user.email,
              updated_at: new Date().toISOString(),
            },
          ]);

          if (error) throw error;
          await get().loadProfile();
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user } = get();
        if (!user?.id) return;

        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) throw error;
          await get().loadProfile();
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAccount: async () => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.rpc('delete_user');
          if (error) throw error;
          await get().logout();
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
);

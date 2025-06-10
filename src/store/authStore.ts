import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
}

interface AuthState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    profileData?: { firstName?: string; lastName?: string }
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,
      message: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null, message: null });
        console.log('Attempting login with:', { email });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Supabase auth error:', error);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          if (data.user) {
            console.log('Login successful, user data:', data.user);
            
            // Try to load profile, but don't fail if it doesn't exist yet
            try {
              await get().loadProfile();
              console.log('Profile loaded successfully');
            } catch (profileError) {
              console.warn('Profile loading failed, but login was successful:', profileError);
              // Create a basic profile from auth user data
              set({
                profile: {
                  id: data.user.id,
                  email: data.user.email || email,
                  full_name: data.user.user_metadata?.full_name || null,
                  created_at: data.user.created_at,
                },
              });
            }
            
            set({ isLoading: false, error: null });
            return; // Success - don't throw here!
          } else {
            const errorMsg = 'Login failed - no user data received';
            set({ isLoading: false, error: errorMsg });
            throw new Error(errorMsg);
          }
        } catch (error) {
          console.error('Login catch block:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (
        email: string,
        password: string,
        profileData?: { firstName?: string; lastName?: string }
      ) => {
        try {
          set({ isLoading: true, error: null, message: null });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/verify-email`,
              data: {
                email: email,
                full_name: [profileData?.firstName, profileData?.lastName]
                  .filter(Boolean)
                  .join(' '),
              },
            },
          });

          if (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }

          if (data.user) {
            // Profile will be created automatically by a trigger on auth.users insert
            // We don't need to set profile here yet, loadProfile will fetch it after email confirmation
          }

          set({
            message:
              'Registration successful! Please check your email to confirm your account.',
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null, message: null });
          const { error } = await supabase.auth.signOut();
          if (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
          set({ profile: null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      loadProfile: async () => {
        set({ isLoading: true, error: null, message: null });

        try {
          // First, get the authenticated user from Supabase
          const {
            data: { user: authUser },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            // Handle "Auth session missing!" as a non-error state
            if (userError.message === 'Auth session missing!') {
              set({ profile: null, isLoading: false, error: null });
              return;
            }
            set({ profile: null, isLoading: false, error: userError.message });
            console.error('Error getting authenticated user:', userError);
            return;
          }

          if (!authUser?.id) {
            // No authenticated user, clear profile state
            set({ profile: null, isLoading: false, error: null });
            return;
          }

          // If there's an authenticated user, fetch their profile from the 'profiles' table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError) {
            // If profile doesn't exist, create one from auth user data
            if (profileError.code === 'PGRST116') {
              console.log('Profile not found, creating from auth user data');
              const newProfile = {
                id: authUser.id,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || null,
                created_at: authUser.created_at,
              };
              
              set({
                profile: newProfile as UserProfile,
                error: null,
                isLoading: false,
              });
              return;
            }
            
            set({
              profile: null,
              error: profileError.message,
              isLoading: false,
            });
            console.error('Error fetching profile data:', profileError);
            return;
          }

          // If profile data is successfully fetched
          set({
            profile: {
              id: profileData.id,
              email: profileData.email,
              full_name: profileData.full_name || null,
              created_at: profileData.created_at,
            } as UserProfile,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          // Catch any unexpected errors during the process
          console.error('Unexpected error in loadProfile:', error);
          set({
            profile: null,
            error: (error as Error).message,
            isLoading: false,
          });
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { profile: currentProfile } = get();
        if (!currentProfile?.id) {
          set({ error: 'No profile to update', isLoading: false });
          return;
        }

        set({ isLoading: true, error: null, message: null });

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentProfile.id);

          if (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }

          await get().loadProfile();
        } catch (error) {
          set({ isLoading: false });
        }
      },

      deleteAccount: async () => {
        const { profile: currentProfile } = get();
        if (!currentProfile?.id) {
          set({ error: 'No account to delete', isLoading: false });
          return;
        }
        set({ isLoading: true, error: null, message: null });
        try {
          const { error } = await supabase.rpc('delete_user');
          if (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
          set({ profile: null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        profile: state.profile,
        isLoading: state.isLoading,
        error: state.error,
        message: state.message,
      }),
    }
  )
);
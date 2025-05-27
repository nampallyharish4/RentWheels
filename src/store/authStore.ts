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

<<<<<<< HEAD
=======
  // Auth actions
>>>>>>> 01ba1d84af2f7d324d003f73076d42ee67ffabcc
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
<<<<<<< HEAD
    full_name?: string
=======
    profile?: { firstName?: string; lastName?: string }
>>>>>>> 01ba1d84af2f7d324d003f73076d42ee67ffabcc
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
<<<<<<< HEAD
=======
  createProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
>>>>>>> 01ba1d84af2f7d324d003f73076d42ee67ffabcc
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 01ba1d84af2f7d324d003f73076d42ee67ffabcc

      signup: async (email: string, password: string, full_name?: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log('Attempting signup:', { email, full_name });

<<<<<<< HEAD
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
=======
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
>>>>>>> 01ba1d84af2f7d324d003f73076d42ee67ffabcc

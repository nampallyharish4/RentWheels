import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
<<<<<<< HEAD
    autoRefreshToken: true,
    persistSession: true,
=======
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'vehicle-rental-auth',
    storage: window.localStorage,
>>>>>>> 01ba1d84af2f7d324d003f73076d42ee67ffabcc
  },
});

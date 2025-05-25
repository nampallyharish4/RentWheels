/*
  # Add insert policy for profiles table
  
  1. Security Changes
    - Add RLS policy to allow authenticated users to insert their own profile
    - Policy ensures users can only insert a profile with their own ID
  
  Note: The profiles table already has policies for SELECT and UPDATE,
  but was missing the INSERT policy needed during signup
*/

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
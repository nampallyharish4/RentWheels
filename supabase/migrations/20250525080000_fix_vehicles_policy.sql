-- Drop existing vehicle policies
DROP POLICY IF EXISTS "Anyone can view available vehicles" ON vehicles;
DROP POLICY IF EXISTS "Owners can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Owners can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Owners can delete their own vehicles" ON vehicles;

-- Create new policies that work with our custom auth system
CREATE POLICY "Anyone can view available vehicles"
  ON vehicles
  FOR SELECT
  USING (true);
/*
  # Initial schema setup for vehicle rental system
  
  1. New Tables
    - profiles: Store user profile information
    - vehicles: Store vehicle information
    - payments: Store payment transaction details
    - bookings: Store booking information with references to vehicles, users, and payments
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for vehicle owners
  
  3. Triggers
    - Add updated_at timestamp triggers
*/

-- Create profiles table to store user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  email text NOT NULL
);

-- Create vehicles table to store vehicle information
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  daily_rate numeric NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  owner_id uuid NOT NULL REFERENCES profiles(id),
  location text NOT NULL
);

-- Create payments table to store payment information
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  transaction_id text
);

-- Create bookings table to store booking information
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  user_id uuid NOT NULL REFERENCES profiles(id),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  pickup_address text NOT NULL,
  dropoff_address text NOT NULL,
  payment_id uuid REFERENCES payments(id)
);

-- Add booking_id to payments after bookings table is created
ALTER TABLE payments ADD COLUMN booking_id uuid REFERENCES bookings(id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for vehicles
CREATE POLICY "Anyone can view available vehicles"
  ON vehicles
  FOR SELECT
  USING (available = true OR owner_id = auth.uid());

CREATE POLICY "Owners can insert their own vehicles"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own vehicles"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own vehicles"
  ON vehicles
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Vehicle owners can view bookings for their vehicles"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.id = bookings.vehicle_id
    AND vehicles.owner_id = auth.uid()
  ));

-- Create policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = payments.booking_id
    AND bookings.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = payments.booking_id
    AND bookings.user_id = auth.uid()
  ));

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vehicles_modtime
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_bookings_modtime
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payments_modtime
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
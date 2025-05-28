/*
  # Initial Schema for RentWheels Vehicle Rental System

  1. New Tables
    - `profiles` - Stores user profile information
    - `vehicles` - Stores vehicle information
    - `bookings` - Stores booking information
    - `payments` - Stores payment information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
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

-- Create payments table to store payment information
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  transaction_id text
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
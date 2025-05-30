-- Update the create_vehicle function to include the type parameter
CREATE OR REPLACE FUNCTION create_vehicle(
  make text,
  model text,
  year integer,
  daily_rate numeric,
  category text,
  description text,
  image_url text,
  available boolean,
  owner_id uuid,
  location text,
  type text DEFAULT 'car'
) RETURNS vehicles AS $$
DECLARE
  new_vehicle vehicles;
BEGIN
  -- Insert the new vehicle
  INSERT INTO vehicles (
    make,
    model,
    year,
    daily_rate,
    category,
    description,
    image_url,
    available,
    owner_id,
    location,
    type,
    created_at,
    updated_at
  ) VALUES (
    make,
    model,
    year,
    daily_rate,
    category,
    description,
    image_url,
    available,
    owner_id,
    location,
    type,
    NOW(),
    NOW()
  )
  RETURNING * INTO new_vehicle;

  RETURN new_vehicle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
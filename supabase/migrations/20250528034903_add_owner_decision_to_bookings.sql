-- Add owner_decision column to bookings table
ALTER TABLE bookings
ADD COLUMN owner_decision text NOT NULL DEFAULT 'pending' CHECK (owner_decision IN ('pending', 'accepted', 'rejected'));

-- Optional: Add an index on owner_decision for faster lookups
CREATE INDEX idx_bookings_owner_decision ON bookings (owner_decision);

-- Add 'accepted' status to bookings workflow
-- This allows pilots to accept missions before marking them as completed

-- Update booking status constraint to include 'accepted'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'approved', 'assigned', 'accepted', 'completed', 'cancelled'));
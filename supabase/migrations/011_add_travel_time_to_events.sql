-- Migration: Add travel_time_minutes column to events table
-- Purpose: Store travel time duration in minutes for events
-- Display: Will be formatted as "30min", "1h30", "3h" in the UI

-- Add travel_time_minutes column (optional)
ALTER TABLE events
ADD COLUMN travel_time_minutes INTEGER;

-- Add check constraint to ensure travel time is positive and reasonable (max 24 hours = 1440 minutes)
ALTER TABLE events
ADD CONSTRAINT travel_time_positive_and_reasonable
CHECK (travel_time_minutes IS NULL OR (travel_time_minutes >= 0 AND travel_time_minutes <= 1440));

-- Add comment for documentation
COMMENT ON COLUMN events.travel_time_minutes IS 'Travel time duration in minutes. Displayed as formatted duration (e.g., 30min, 1h30) in the UI.';

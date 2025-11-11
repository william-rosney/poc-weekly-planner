-- Add 'place' column to events table
-- This column will store either a physical address or a URL (e.g., Google Maps link)

ALTER TABLE events
ADD COLUMN place TEXT;

COMMENT ON COLUMN events.place IS 'Physical address or URL link (e.g., Google Maps) for the event location';

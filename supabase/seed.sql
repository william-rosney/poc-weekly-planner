-- Seed data for local development
-- This file is automatically run when you reset your local database

-- Insert test users for development
INSERT INTO users (email, name, role, avatar_url) VALUES
  ('dev1@example.com', 'Alice Developer', 'admin', NULL),
  ('dev2@example.com', 'Bob Tester', 'member', NULL),
  ('dev3@example.com', 'Charlie Smith', 'member', NULL),
  ('dev4@example.com', 'Diana Jones', 'member', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert sample events for testing
INSERT INTO events (title, description, start_time, end_time, user_id, color)
SELECT
  'Sample Event ' || num,
  'This is a test event for development',
  CURRENT_TIMESTAMP + (num * INTERVAL '1 day'),
  CURRENT_TIMESTAMP + (num * INTERVAL '1 day') + INTERVAL '2 hours',
  (SELECT id FROM users WHERE email = 'dev1@example.com' LIMIT 1),
  CASE (num % 4)
    WHEN 0 THEN 'blue'
    WHEN 1 THEN 'green'
    WHEN 2 THEN 'red'
    ELSE 'purple'
  END
FROM generate_series(1, 10) AS num;

-- Output confirmation
SELECT 'Seed data loaded successfully!' AS status,
       COUNT(*) AS user_count
FROM users;

SELECT 'Sample events created!' AS status,
       COUNT(*) AS event_count
FROM events;

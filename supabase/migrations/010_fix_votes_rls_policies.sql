-- Migration: Fix RLS policies for votes table to work with auth_id
-- The issue: votes.user_id references users.id, but auth.uid() returns users.auth_id
-- Solution: Update policies to join with users table and check auth_id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own vote" ON votes;
DROP POLICY IF EXISTS "Admins can create any vote" ON votes;
DROP POLICY IF EXISTS "Users can update their own vote" ON votes;
DROP POLICY IF EXISTS "Admins can update any vote" ON votes;
DROP POLICY IF EXISTS "Users can delete their own vote" ON votes;
DROP POLICY IF EXISTS "Admins can delete any vote" ON votes;

-- RLS Policy: Users can insert their own vote
-- Check that the user_id corresponds to a user whose auth_id matches auth.uid()
CREATE POLICY "Users can create their own vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id
      AND users.auth_id = auth.uid()
    )
  );

-- RLS Policy: Admins can insert votes for anyone
CREATE POLICY "Admins can create any vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Users can update their own vote
CREATE POLICY "Users can update their own vote"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id
      AND users.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id
      AND users.auth_id = auth.uid()
    )
  );

-- RLS Policy: Admins can update any vote
CREATE POLICY "Admins can update any vote"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Users can delete their own vote
CREATE POLICY "Users can delete their own vote"
  ON votes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id
      AND users.auth_id = auth.uid()
    )
  );

-- RLS Policy: Admins can delete any vote
CREATE POLICY "Admins can delete any vote"
  ON votes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE votes IS 'Stores user participation votes for events. RLS policies use users.auth_id to match auth.uid().';

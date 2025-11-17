-- Migration: Create votes table for event participation tracking
-- Description: Allows users to vote "yes", "no", or "maybe" for each event
-- Features: RLS policies, admin override, exclusivity constraint

-- Create vote_status enum type
CREATE TYPE vote_status AS ENUM ('yes', 'no', 'maybe');

-- Create votes table
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status vote_status NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Ensure one vote per user per event (exclusivity constraint)
  CONSTRAINT unique_vote_per_user_per_event UNIQUE (event_id, user_id)
);

-- Create index for performance (querying votes by event)
CREATE INDEX idx_votes_event_id ON votes(event_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_votes_updated_at
  BEFORE UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_votes_updated_at();

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view all votes (for displaying participant lists)
CREATE POLICY "Anyone can view votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Users can insert their own vote
CREATE POLICY "Users can create their own vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can insert votes for anyone
CREATE POLICY "Admins can create any vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Users can update their own vote
CREATE POLICY "Users can update their own vote"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can update any vote
CREATE POLICY "Admins can update any vote"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Users can delete their own vote
CREATE POLICY "Users can delete their own vote"
  ON votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can delete any vote
CREATE POLICY "Admins can delete any vote"
  ON votes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE votes IS 'Stores user participation votes for events. Each user can vote once per event (yes/no/maybe).';
COMMENT ON COLUMN votes.status IS 'Participation status: yes (participating), no (not participating), maybe (unsure)';
COMMENT ON CONSTRAINT unique_vote_per_user_per_event ON votes IS 'Ensures a user can only have one vote per event (exclusivity constraint)';

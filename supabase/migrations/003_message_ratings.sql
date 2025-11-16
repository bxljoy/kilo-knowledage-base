-- Create message_ratings table for storing chat message feedback
CREATE TABLE IF NOT EXISTS message_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating IN (-1, 1)), -- -1 for thumbs down, 1 for thumbs up
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one rating per user per message
  UNIQUE(user_id, message_id)
);

-- Create index for faster queries
CREATE INDEX idx_message_ratings_user_id ON message_ratings(user_id);
CREATE INDEX idx_message_ratings_knowledge_base_id ON message_ratings(knowledge_base_id);
CREATE INDEX idx_message_ratings_message_id ON message_ratings(message_id);

-- Enable Row Level Security
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_ratings
-- Users can view their own ratings
CREATE POLICY "Users can view their own ratings"
  ON message_ratings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
  ON message_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON message_ratings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON message_ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_message_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_ratings_updated_at
  BEFORE UPDATE ON message_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_message_ratings_updated_at();

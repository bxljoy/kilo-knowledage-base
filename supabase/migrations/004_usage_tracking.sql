-- Create usage_tracking table for monitoring user resource consumption
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Query tracking
  daily_query_count INT DEFAULT 0 NOT NULL,
  total_query_count BIGINT DEFAULT 0 NOT NULL,
  query_reset_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day') NOT NULL,

  -- File upload tracking
  total_file_uploads INT DEFAULT 0 NOT NULL,

  -- Storage tracking (in bytes)
  total_storage_used BIGINT DEFAULT 0 NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user
  UNIQUE(user_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_query_reset_date ON usage_tracking(query_reset_date);

-- Enable Row Level Security
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_tracking_updated_at();

-- Function to increment query count
CREATE OR REPLACE FUNCTION increment_query_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (user_id, daily_query_count, total_query_count)
  VALUES (p_user_id, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    daily_query_count = CASE
      WHEN usage_tracking.query_reset_date <= NOW() THEN 1
      ELSE usage_tracking.daily_query_count + 1
    END,
    total_query_count = usage_tracking.total_query_count + 1,
    query_reset_date = CASE
      WHEN usage_tracking.query_reset_date <= NOW() THEN NOW() + INTERVAL '1 day'
      ELSE usage_tracking.query_reset_date
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment file upload count
CREATE OR REPLACE FUNCTION increment_file_upload_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, total_file_uploads)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_file_uploads = usage_tracking.total_file_uploads + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage(p_user_id UUID, p_storage_delta BIGINT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, total_storage_used)
  VALUES (p_user_id, GREATEST(0, p_storage_delta))
  ON CONFLICT (user_id) DO UPDATE SET
    total_storage_used = GREATEST(0, usage_tracking.total_storage_used + p_storage_delta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user usage statistics
CREATE OR REPLACE FUNCTION get_user_usage(p_user_id UUID)
RETURNS TABLE (
  daily_queries INT,
  total_queries BIGINT,
  query_reset_at TIMESTAMPTZ,
  file_uploads INT,
  storage_used BIGINT,
  queries_remaining INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN ut.query_reset_date <= NOW() THEN 0
      ELSE ut.daily_query_count
    END as daily_queries,
    ut.total_query_count as total_queries,
    CASE
      WHEN ut.query_reset_date <= NOW() THEN NOW() + INTERVAL '1 day'
      ELSE ut.query_reset_date
    END as query_reset_at,
    ut.total_file_uploads as file_uploads,
    ut.total_storage_used as storage_used,
    GREATEST(0, 100 - CASE
      WHEN ut.query_reset_date <= NOW() THEN 0
      ELSE ut.daily_query_count
    END) as queries_remaining
  FROM usage_tracking ut
  WHERE ut.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset expired daily query counts (run by cron job)
CREATE OR REPLACE FUNCTION reset_expired_query_counts()
RETURNS INT AS $$
DECLARE
  reset_count INT;
BEGIN
  UPDATE usage_tracking
  SET
    daily_query_count = 0,
    query_reset_date = NOW() + INTERVAL '1 day'
  WHERE query_reset_date <= NOW();

  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add usage analytics to chat messages (for business metrics)
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS response_time_ms INT,
ADD COLUMN IF NOT EXISTS token_count INT,
ADD COLUMN IF NOT EXISTS error_occurred BOOLEAN DEFAULT FALSE;

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_knowledge_base_id_created_at
  ON chat_messages(knowledge_base_id, created_at);

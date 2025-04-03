-- User Activity Logs Table
-- This table stores user activity for analytics and history tracking
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT
);

-- Add RLS policies to protect activity data
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own activity
CREATE POLICY "Users can view their own activity" 
  ON public.user_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own activity
CREATE POLICY "Users can insert their own activity" 
  ON public.user_activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON public.user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- Comments for documentation
COMMENT ON TABLE public.user_activity_logs IS 'Tracks user activity for analytics and history';
COMMENT ON COLUMN public.user_activity_logs.action IS 'The type of action performed (e.g., canvas_edit, asset_add)';
COMMENT ON COLUMN public.user_activity_logs.resource_type IS 'The type of resource affected (e.g., venue, asset, layout)';
COMMENT ON COLUMN public.user_activity_logs.resource_id IS 'The ID of the affected resource';
COMMENT ON COLUMN public.user_activity_logs.metadata IS 'Additional context about the action (JSON format)';
COMMENT ON COLUMN public.user_activity_logs.session_id IS 'ID of the user session for grouping related activities'; 
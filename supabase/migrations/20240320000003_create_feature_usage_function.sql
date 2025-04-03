-- Create function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_name TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_feature_usage (user_id, feature_name)
  VALUES (p_user_id, p_feature_name)
  ON CONFLICT (user_id, feature_name)
  DO UPDATE SET
    usage_count = analytics_feature_usage.usage_count + 1,
    last_used_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
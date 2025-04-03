-- Create analytics tables
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics_feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  load_time_ms INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_page_views_user_id ON analytics_page_views(user_id);
CREATE INDEX idx_analytics_page_views_created_at ON analytics_page_views(created_at);
CREATE INDEX idx_analytics_feature_usage_user_id ON analytics_feature_usage(user_id);
CREATE INDEX idx_analytics_feature_usage_feature_name ON analytics_feature_usage(feature_name);
CREATE INDEX idx_analytics_performance_page_path ON analytics_performance(page_path);
CREATE INDEX idx_analytics_performance_created_at ON analytics_performance(created_at);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Analytics events are viewable by admins"
  ON analytics_events FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Analytics events are insertable by authenticated users"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Page views are viewable by admins"
  ON analytics_page_views FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Page views are insertable by authenticated users"
  ON analytics_page_views FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Feature usage is viewable by admins"
  ON analytics_feature_usage FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Feature usage is insertable by authenticated users"
  ON analytics_feature_usage FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Performance metrics are viewable by admins"
  ON analytics_performance FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Performance metrics are insertable by authenticated users"
  ON analytics_performance FOR INSERT
  WITH CHECK (auth.role() = 'authenticated'); 
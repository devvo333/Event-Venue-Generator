-- Create ROI tracking tables
CREATE TABLE roi_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(15, 2) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roi_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calculation_type TEXT NOT NULL,
  input_metrics JSONB NOT NULL,
  result DECIMAL(15, 2) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roi_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comparison_type TEXT NOT NULL,
  baseline_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  baseline_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  comparison_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  comparison_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  percentage_change DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_roi_metrics_metric_type ON roi_metrics(metric_type);
CREATE INDEX idx_roi_metrics_period ON roi_metrics(period_start, period_end);
CREATE INDEX idx_roi_calculations_type ON roi_calculations(calculation_type);
CREATE INDEX idx_roi_calculations_period ON roi_calculations(period_start, period_end);
CREATE INDEX idx_roi_comparisons_type ON roi_comparisons(comparison_type);

-- Enable RLS
ALTER TABLE roi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_comparisons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "ROI metrics are viewable by admins"
  ON roi_metrics FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "ROI metrics are insertable by admins"
  ON roi_metrics FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "ROI calculations are viewable by admins"
  ON roi_calculations FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "ROI calculations are insertable by admins"
  ON roi_calculations FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "ROI comparisons are viewable by admins"
  ON roi_comparisons FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "ROI comparisons are insertable by admins"
  ON roi_comparisons FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin'); 
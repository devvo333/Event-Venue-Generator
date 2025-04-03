-- Create report tables
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  query TEXT NOT NULL,
  parameters JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE custom_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES report_templates(id),
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES custom_reports(id),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
  schedule_day INTEGER,
  schedule_time TIME WITH TIME ZONE,
  recipients JSONB NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE report_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES custom_reports(id),
  scheduled_report_id UUID REFERENCES scheduled_reports(id),
  parameters JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_report_templates_created_by ON report_templates(created_by);
CREATE INDEX idx_custom_reports_template_id ON custom_reports(template_id);
CREATE INDEX idx_custom_reports_created_by ON custom_reports(created_by);
CREATE INDEX idx_scheduled_reports_report_id ON scheduled_reports(report_id);
CREATE INDEX idx_scheduled_reports_next_run_at ON scheduled_reports(next_run_at);
CREATE INDEX idx_report_executions_report_id ON report_executions(report_id);
CREATE INDEX idx_report_executions_scheduled_report_id ON report_executions(scheduled_report_id);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Report templates are viewable by admins"
  ON report_templates FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Report templates are insertable by admins"
  ON report_templates FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Custom reports are viewable by admins"
  ON custom_reports FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Custom reports are insertable by admins"
  ON custom_reports FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Scheduled reports are viewable by admins"
  ON scheduled_reports FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Scheduled reports are insertable by admins"
  ON scheduled_reports FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Report executions are viewable by admins"
  ON report_executions FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Report executions are insertable by admins"
  ON report_executions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin'); 
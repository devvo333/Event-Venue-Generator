-- Create function to execute a report
CREATE OR REPLACE FUNCTION execute_report(
  p_report_id UUID,
  p_parameters JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (
  execution_id UUID,
  status TEXT,
  result JSONB,
  error_message TEXT
) AS $$
DECLARE
  v_template_id UUID;
  v_query TEXT;
  v_execution_id UUID;
  v_result JSONB;
BEGIN
  -- Get report template and query
  SELECT template_id, query
  INTO v_template_id, v_query
  FROM custom_reports
  WHERE id = p_report_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found';
  END IF;

  -- Create execution record
  INSERT INTO report_executions (
    report_id,
    parameters,
    status
  ) VALUES (
    p_report_id,
    p_parameters,
    'running'
  ) RETURNING id INTO v_execution_id;

  BEGIN
    -- Execute the query with parameters
    EXECUTE v_query
    USING p_parameters
    INTO v_result;

    -- Update execution record with result
    UPDATE report_executions
    SET 
      status = 'completed',
      result = v_result,
      completed_at = NOW()
    WHERE id = v_execution_id;

    RETURN QUERY
    SELECT 
      v_execution_id,
      'completed',
      v_result,
      NULL::TEXT;
  EXCEPTION WHEN OTHERS THEN
    -- Update execution record with error
    UPDATE report_executions
    SET 
      status = 'failed',
      error_message = SQLERRM,
      completed_at = NOW()
    WHERE id = v_execution_id;

    RETURN QUERY
    SELECT 
      v_execution_id,
      'failed',
      NULL::JSONB,
      SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process scheduled reports
CREATE OR REPLACE FUNCTION process_scheduled_reports()
RETURNS void AS $$
DECLARE
  v_report RECORD;
  v_execution_id UUID;
BEGIN
  -- Get all scheduled reports that are due
  FOR v_report IN
    SELECT 
      sr.id as scheduled_id,
      cr.id as report_id,
      cr.parameters
    FROM scheduled_reports sr
    JOIN custom_reports cr ON sr.report_id = cr.id
    WHERE sr.next_run_at <= NOW()
  LOOP
    -- Execute the report
    SELECT execution_id INTO v_execution_id
    FROM execute_report(v_report.report_id, v_report.parameters);

    -- Update scheduled report
    UPDATE scheduled_reports
    SET 
      last_run_at = NOW(),
      next_run_at = CASE 
        WHEN schedule_type = 'daily' THEN NOW() + INTERVAL '1 day'
        WHEN schedule_type = 'weekly' THEN NOW() + INTERVAL '1 week'
        WHEN schedule_type = 'monthly' THEN NOW() + INTERVAL '1 month'
      END
    WHERE id = v_report.scheduled_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to export report data
CREATE OR REPLACE FUNCTION export_report_data(
  p_report_id UUID,
  p_format TEXT DEFAULT 'csv'
)
RETURNS TABLE (
  content TEXT,
  filename TEXT
) AS $$
DECLARE
  v_query TEXT;
  v_result JSONB;
  v_filename TEXT;
BEGIN
  -- Get report query
  SELECT query
  INTO v_query
  FROM custom_reports cr
  WHERE cr.id = p_report_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found';
  END IF;

  -- Execute query
  EXECUTE v_query
  INTO v_result;

  -- Generate filename
  v_filename := 'report_' || p_report_id || '_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS') || '.' || p_format;

  -- Format result based on export format
  IF p_format = 'csv' THEN
    RETURN QUERY
    SELECT 
      jsonb_to_csv(v_result),
      v_filename;
  ELSIF p_format = 'json' THEN
    RETURN QUERY
    SELECT 
      v_result::TEXT,
      v_filename;
  ELSE
    RAISE EXCEPTION 'Unsupported export format: %', p_format;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to convert JSONB to CSV
CREATE OR REPLACE FUNCTION jsonb_to_csv(p_data JSONB)
RETURNS TEXT AS $$
DECLARE
  v_result TEXT;
  v_row JSONB;
  v_header TEXT;
  v_values TEXT;
BEGIN
  -- Get header from first row
  SELECT string_agg(key, ',')
  INTO v_header
  FROM jsonb_object_keys((p_data->0)::JSONB);

  -- Build CSV content
  v_result := v_header || E'\n';

  -- Add rows
  FOR v_row IN SELECT * FROM jsonb_array_elements(p_data)
  LOOP
    SELECT string_agg(
      CASE 
        WHEN value IS NULL THEN ''
        WHEN jsonb_typeof(value) = 'string' THEN '"' || value::TEXT || '"'
        ELSE value::TEXT
      END,
      ','
    )
    INTO v_values
    FROM jsonb_each(v_row);

    v_result := v_result || v_values || E'\n';
  END LOOP;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql; 
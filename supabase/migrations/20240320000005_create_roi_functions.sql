-- Create function to calculate ROI
CREATE OR REPLACE FUNCTION calculate_roi(
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  roi DECIMAL(15, 2),
  total_revenue DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  net_profit DECIMAL(15, 2)
) AS $$
DECLARE
  v_revenue DECIMAL(15, 2);
  v_cost DECIMAL(15, 2);
BEGIN
  -- Calculate total revenue from marketplace sales
  SELECT COALESCE(SUM(price), 0)
  INTO v_revenue
  FROM layout_purchases lp
  JOIN layout_marketplace lm ON lp.layout_id = lm.id
  WHERE lp.created_at BETWEEN p_period_start AND p_period_end;

  -- Calculate total costs (placeholder for actual cost calculation)
  -- This should be replaced with actual cost metrics
  SELECT COALESCE(SUM(metric_value), 0)
  INTO v_cost
  FROM roi_metrics
  WHERE metric_type = 'cost'
    AND period_start >= p_period_start
    AND period_end <= p_period_end;

  -- Calculate ROI
  roi := CASE 
    WHEN v_cost = 0 THEN 0
    ELSE ((v_revenue - v_cost) / v_cost) * 100
  END;

  total_revenue := v_revenue;
  total_cost := v_cost;
  net_profit := v_revenue - v_cost;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate period-over-period growth
CREATE OR REPLACE FUNCTION calculate_period_growth(
  p_baseline_start TIMESTAMP WITH TIME ZONE,
  p_baseline_end TIMESTAMP WITH TIME ZONE,
  p_comparison_start TIMESTAMP WITH TIME ZONE,
  p_comparison_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  metric_type TEXT,
  baseline_value DECIMAL(15, 2),
  comparison_value DECIMAL(15, 2),
  growth_percentage DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH baseline AS (
    SELECT 
      metric_type,
      SUM(metric_value) as value
    FROM roi_metrics
    WHERE period_start >= p_baseline_start
      AND period_end <= p_baseline_end
    GROUP BY metric_type
  ),
  comparison AS (
    SELECT 
      metric_type,
      SUM(metric_value) as value
    FROM roi_metrics
    WHERE period_start >= p_comparison_start
      AND period_end <= p_comparison_end
    GROUP BY metric_type
  )
  SELECT 
    COALESCE(b.metric_type, c.metric_type) as metric_type,
    COALESCE(b.value, 0) as baseline_value,
    COALESCE(c.value, 0) as comparison_value,
    CASE 
      WHEN COALESCE(b.value, 0) = 0 THEN 0
      ELSE ((COALESCE(c.value, 0) - COALESCE(b.value, 0)) / COALESCE(b.value, 0)) * 100
    END as growth_percentage
  FROM baseline b
  FULL OUTER JOIN comparison c ON b.metric_type = c.metric_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate customer lifetime value
CREATE OR REPLACE FUNCTION calculate_clv(
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  user_id UUID,
  total_revenue DECIMAL(15, 2),
  purchase_count INTEGER,
  average_order_value DECIMAL(15, 2),
  clv DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH user_purchases AS (
    SELECT 
      lp.user_id,
      COUNT(*) as purchase_count,
      SUM(lm.price) as total_revenue
    FROM layout_purchases lp
    JOIN layout_marketplace lm ON lp.layout_id = lm.id
    WHERE lp.created_at BETWEEN p_period_start AND p_period_end
    GROUP BY lp.user_id
  )
  SELECT 
    up.user_id,
    up.total_revenue,
    up.purchase_count,
    up.total_revenue / NULLIF(up.purchase_count, 0) as average_order_value,
    up.total_revenue * 0.3 as clv -- Assuming 30% retention rate
  FROM user_purchases up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
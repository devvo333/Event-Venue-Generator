import { supabase } from '../lib/supabase';

export interface ROIMetric {
  id: string;
  metricType: string;
  metricValue: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ROICalculation {
  id: string;
  calculationType: string;
  inputMetrics: Record<string, any>;
  result: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ROIGrowth {
  metricType: string;
  baselineValue: number;
  comparisonValue: number;
  growthPercentage: number;
}

export interface CustomerLifetimeValue {
  userId: string;
  totalRevenue: number;
  purchaseCount: number;
  averageOrderValue: number;
  clv: number;
}

class ROIService {
  async getROI(startDate: Date, endDate: Date) {
    try {
      const { data, error } = await supabase.rpc('calculate_roi', {
        p_period_start: startDate.toISOString(),
        p_period_end: endDate.toISOString(),
      });

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error calculating ROI:', error);
      throw error;
    }
  }

  async getPeriodGrowth(
    baselineStart: Date,
    baselineEnd: Date,
    comparisonStart: Date,
    comparisonEnd: Date
  ) {
    try {
      const { data, error } = await supabase.rpc('calculate_period_growth', {
        p_baseline_start: baselineStart.toISOString(),
        p_baseline_end: baselineEnd.toISOString(),
        p_comparison_start: comparisonStart.toISOString(),
        p_comparison_end: comparisonEnd.toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating period growth:', error);
      throw error;
    }
  }

  async getCustomerLifetimeValue(startDate: Date, endDate: Date) {
    try {
      const { data, error } = await supabase.rpc('calculate_clv', {
        p_period_start: startDate.toISOString(),
        p_period_end: endDate.toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating CLV:', error);
      throw error;
    }
  }

  async addMetric(metric: Omit<ROIMetric, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const { data, error } = await supabase.from('roi_metrics').insert({
        metric_type: metric.metricType,
        metric_value: metric.metricValue,
        period_start: metric.periodStart.toISOString(),
        period_end: metric.periodEnd.toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding ROI metric:', error);
      throw error;
    }
  }

  async getMetrics(startDate: Date, endDate: Date) {
    try {
      const { data, error } = await supabase
        .from('roi_metrics')
        .select('*')
        .gte('period_start', startDate.toISOString())
        .lte('period_end', endDate.toISOString());

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching ROI metrics:', error);
      throw error;
    }
  }
}

export const roiService = new ROIService(); 
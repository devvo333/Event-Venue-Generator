import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { analyticsService } from '../../services/analytics';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  events: any[];
  pageViews: any[];
  featureUsage: any[];
  performance: any[];
}

interface ChartDataPoint {
  date: string;
  views?: number;
  loadTime?: number;
}

interface FeatureUsageData {
  feature: string;
  count: number;
}

interface EventTypeData {
  type: string;
  count: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await analyticsService.getAnalyticsReport(startDate, endDate);
      setData(analyticsData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Box sx={{ mb: 3 }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(date: Date | null) => date && setStartDate(date)}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(date: Date | null) => date && setEndDate(date)}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Page Views
            </Typography>
            <LineChart
              data={data?.pageViews.map((view) => ({
                date: format(new Date(view.created_at), 'MMM d'),
                views: 1,
              }))}
              xField="date"
              yField="views"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Feature Usage
            </Typography>
            <BarChart
              data={data?.featureUsage.map((usage) => ({
                feature: usage.feature_name,
                count: usage.usage_count,
              }))}
              xField="feature"
              yField="count"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Event Types
            </Typography>
            <PieChart
              data={data?.events.reduce((acc: EventTypeData[], event) => {
                const existing = acc.find((item) => item.type === event.event_type);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ type: event.event_type, count: 1 });
                }
                return acc;
              }, [])}
              angleField="count"
              colorField="type"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <LineChart
              data={data?.performance.map((metric) => ({
                date: format(new Date(metric.created_at), 'MMM d'),
                loadTime: metric.load_time_ms,
              }))}
              xField="date"
              yField="loadTime"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 
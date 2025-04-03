import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, BarChart } from '@mui/x-charts';
import { roiService } from '../../services/roi';
import { format, subDays } from 'date-fns';

const ROIDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [roiData, setRoiData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [clvData, setClvData] = useState<any[]>([]);

  useEffect(() => {
    fetchROIData();
  }, [startDate, endDate]);

  const fetchROIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roi, growth, clv] = await Promise.all([
        roiService.getROI(startDate, endDate),
        roiService.getPeriodGrowth(
          subDays(startDate, 30),
          subDays(endDate, 30),
          startDate,
          endDate
        ),
        roiService.getCustomerLifetimeValue(startDate, endDate),
      ]);

      setRoiData(roi);
      setGrowthData(growth);
      setClvData(clv);
    } catch (err) {
      setError('Failed to fetch ROI data');
      console.error('Error fetching ROI data:', err);
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
        ROI Dashboard
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
              ROI Overview
            </Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>ROI</TableCell>
                    <TableCell align="right">{roiData?.roi.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Revenue</TableCell>
                    <TableCell align="right">${roiData?.total_revenue.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Cost</TableCell>
                    <TableCell align="right">${roiData?.total_cost.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Net Profit</TableCell>
                    <TableCell align="right">${roiData?.net_profit.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Growth Metrics
            </Typography>
            <BarChart
              data={growthData.map((item) => ({
                metric: item.metric_type,
                growth: item.growth_percentage,
              }))}
              xField="metric"
              yField="growth"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Lifetime Value
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell align="right">Total Revenue</TableCell>
                    <TableCell align="right">Purchase Count</TableCell>
                    <TableCell align="right">Average Order Value</TableCell>
                    <TableCell align="right">CLV</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clvData.map((row) => (
                    <TableRow key={row.user_id}>
                      <TableCell>{row.user_id}</TableCell>
                      <TableCell align="right">${row.total_revenue.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.purchase_count}</TableCell>
                      <TableCell align="right">${row.average_order_value.toFixed(2)}</TableCell>
                      <TableCell align="right">${row.clv.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ROIDashboard; 
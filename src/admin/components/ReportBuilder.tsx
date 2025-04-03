import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as RunIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { reportService } from '../../services/report';
import { ReportTemplate, CustomReport, ScheduledReport } from '../../services/report';

const ReportBuilder: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleDay, setScheduleDay] = useState<number>(1);
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [recipients, setRecipients] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [templatesData, reportsData, scheduledData] = await Promise.all([
        reportService.getTemplates(),
        reportService.getReports(),
        reportService.getScheduledReports(),
      ]);

      setTemplates(templatesData);
      setReports(reportsData);
      setScheduledReports(scheduledData);
    } catch (err) {
      setError('Failed to fetch report data');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const newReport = await reportService.createReport({
        template_id: selectedTemplate,
        name: reportName,
        description: reportDescription,
        parameters,
      });

      setReports([...reports, newReport]);
      setSelectedTemplate('');
      setReportName('');
      setReportDescription('');
      setParameters({});
    } catch (err) {
      setError('Failed to create report');
      console.error('Error creating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);

      const newScheduledReport = await reportService.createScheduledReport({
        report_id: reportId,
        schedule_type: scheduleType,
        schedule_day: scheduleType === 'weekly' ? scheduleDay : undefined,
        schedule_time: scheduleTime,
        recipients: recipients.split(',').map(email => email.trim()),
      });

      setScheduledReports([...scheduledReports, newScheduledReport]);
      setShowScheduleDialog(false);
    } catch (err) {
      setError('Failed to schedule report');
      console.error('Error scheduling report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportId: string, format: 'csv' | 'json') => {
    try {
      setLoading(true);
      setError(null);

      const { content, filename } = await reportService.exportReport(reportId, format);

      // Create download link
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export report');
      console.error('Error exporting report:', err);
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
        Report Builder
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Create New Report
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Template</InputLabel>
              <Select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                label="Template"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Report Name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreateReport}
              disabled={!selectedTemplate || !reportName}
            >
              Create Report
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Custom Reports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Template</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.name}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        {templates.find((t) => t.id === report.template_id)?.name}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleExportReport(report.id, 'csv')}
                          title="Export CSV"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleExportReport(report.id, 'json')}
                          title="Export JSON"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setShowScheduleDialog(true);
                            // Set up scheduling for this report
                          }}
                          title="Schedule Report"
                        >
                          <ScheduleIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Scheduled Reports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Next Run</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledReports.map((scheduled) => (
                    <TableRow key={scheduled.id}>
                      <TableCell>
                        {reports.find((r) => r.id === scheduled.report_id)?.name}
                      </TableCell>
                      <TableCell>
                        {scheduled.schedule_type}
                        {scheduled.schedule_day && ` (Day ${scheduled.schedule_day})`}
                        {` at ${scheduled.schedule_time}`}
                      </TableCell>
                      <TableCell>{scheduled.next_run_at}</TableCell>
                      <TableCell>{scheduled.last_run_at || 'Never'}</TableCell>
                      <TableCell>
                        <IconButton title="Delete Schedule">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)}>
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
            <InputLabel>Schedule Type</InputLabel>
            <Select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              label="Schedule Type"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          {scheduleType === 'weekly' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(Number(e.target.value))}
                label="Day of Week"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <MenuItem key={day} value={day}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day - 1]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            type="time"
            label="Time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Recipients (comma-separated emails)"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleScheduleReport(/* current report ID */)}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportBuilder; 
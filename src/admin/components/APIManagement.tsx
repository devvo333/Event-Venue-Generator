import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { apiService, APIKey, APIRequest, Webhook, WebhookLog } from '../../services/api';
import { tenantService } from '../../services/tenant';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const APIManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [newAPIKey, setNewAPIKey] = useState({
    name: '',
    permissions: {} as Record<string, boolean>,
    expiresAt: '',
  });
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });
  const [showSecret, setShowSecret] = useState(false);
  const [selectedAPIKey, setSelectedAPIKey] = useState<APIKey | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [apiRequests, setAPIRequests] = useState<APIRequest[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current tenant ID from context or state
      const tenantId = 'current-tenant-id';
      const [apiKeysData, webhooksData] = await Promise.all([
        apiService.getAPIKeys(tenantId),
        apiService.getWebhooks(tenantId),
      ]);

      setAPIKeys(apiKeysData);
      setWebhooks(webhooksData);
    } catch (err) {
      setError('Failed to fetch API data');
      console.error('Error fetching API data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateAPIKey = async () => {
    try {
      setLoading(true);
      setError(null);

      const tenantId = 'current-tenant-id';
      const { id, key, secret } = await apiService.generateAPIKey(
        tenantId,
        newAPIKey.name,
        newAPIKey.permissions,
        newAPIKey.expiresAt ? new Date(newAPIKey.expiresAt) : undefined
      );

      setAPIKeys([...apiKeys, {
        id,
        key,
        secret,
        tenant_id: tenantId,
        name: newAPIKey.name,
        permissions: newAPIKey.permissions,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: newAPIKey.expiresAt ? new Date(newAPIKey.expiresAt).toISOString() : null
      }]);
      setShowAPIKeyDialog(false);
      setNewAPIKey({ name: '', permissions: {}, expiresAt: '' });
    } catch (err) {
      setError('Failed to create API key');
      console.error('Error creating API key:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      setLoading(true);
      setError(null);

      const tenantId = 'current-tenant-id';
      const webhook = await apiService.createWebhook(
        tenantId,
        newWebhook.name,
        newWebhook.url,
        newWebhook.events
      );

      setWebhooks([...webhooks, webhook]);
      setShowWebhookDialog(false);
      setNewWebhook({ name: '', url: '', events: [] });
    } catch (err) {
      setError('Failed to create webhook');
      console.error('Error creating webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAPIKey = async (apiKeyId: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.deactivateAPIKey(apiKeyId);
      setAPIKeys(apiKeys.filter(key => key.id !== apiKeyId));
    } catch (err) {
      setError('Failed to deactivate API key');
      console.error('Error deactivating API key:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateWebhook = async (webhookId: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.deactivateWebhook(webhookId);
      setWebhooks(webhooks.filter(webhook => webhook.id !== webhookId));
    } catch (err) {
      setError('Failed to deactivate webhook');
      console.error('Error deactivating webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAPIKeyDetails = async (apiKey: APIKey) => {
    try {
      setLoading(true);
      setError(null);

      const requests = await apiService.getAPIRequests(apiKey.id);
      setSelectedAPIKey(apiKey);
      setAPIRequests(requests);
    } catch (err) {
      setError('Failed to fetch API key details');
      console.error('Error fetching API key details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewWebhookDetails = async (webhook: Webhook) => {
    try {
      setLoading(true);
      setError(null);

      const logs = await apiService.getWebhookLogs(webhook.id);
      setSelectedWebhook(webhook);
      setWebhookLogs(logs);
    } catch (err) {
      setError('Failed to fetch webhook details');
      console.error('Error fetching webhook details:', err);
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
        API Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="API Keys" />
          <Tab label="Webhooks" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAPIKeyDialog(true)}
          >
            Create API Key
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>{apiKey.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {showSecret ? apiKey.key : '••••••••'}
                      <IconButton
                        size="small"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigator.clipboard.writeText(apiKey.key)}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {Object.entries(apiKey.permissions).map(([permission, enabled]) => (
                      enabled && (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      )
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={apiKey.is_active ? 'Active' : 'Inactive'}
                      color={apiKey.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewAPIKeyDetails(apiKey)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeactivateAPIKey(apiKey.id)}
                      disabled={!apiKey.is_active}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowWebhookDialog(true)}
          >
            Create Webhook
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Events</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.name}</TableCell>
                  <TableCell>{webhook.url}</TableCell>
                  <TableCell>
                    {webhook.events.map((event) => (
                      <Chip
                        key={event}
                        label={event}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={webhook.is_active ? 'Active' : 'Inactive'}
                      color={webhook.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewWebhookDetails(webhook)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeactivateWebhook(webhook.id)}
                      disabled={!webhook.is_active}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={showAPIKeyDialog} onClose={() => setShowAPIKeyDialog(false)}>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newAPIKey.name}
            onChange={(e) => setNewAPIKey({ ...newAPIKey, name: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={Object.entries(newAPIKey.permissions)
                .filter(([_, enabled]) => enabled)
                .map(([permission]) => permission)}
              onChange={(e) => {
                const permissions = {} as Record<string, boolean>;
                (e.target.value as string[]).forEach(permission => {
                  permissions[permission] = true;
                });
                setNewAPIKey({ ...newAPIKey, permissions });
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="write">Write</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Expires At"
            type="datetime-local"
            value={newAPIKey.expiresAt}
            onChange={(e) => setNewAPIKey({ ...newAPIKey, expiresAt: e.target.value })}
            sx={{ mt: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAPIKeyDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAPIKey} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showWebhookDialog} onClose={() => setShowWebhookDialog(false)}>
        <DialogTitle>Create Webhook</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newWebhook.name}
            onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            fullWidth
            label="URL"
            value={newWebhook.url}
            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Events</InputLabel>
            <Select
              multiple
              value={newWebhook.events}
              onChange={(e) => setNewWebhook({ ...newWebhook, events: e.target.value as string[] })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="venue.created">Venue Created</MenuItem>
              <MenuItem value="venue.updated">Venue Updated</MenuItem>
              <MenuItem value="venue.deleted">Venue Deleted</MenuItem>
              <MenuItem value="booking.created">Booking Created</MenuItem>
              <MenuItem value="booking.updated">Booking Updated</MenuItem>
              <MenuItem value="booking.cancelled">Booking Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateWebhook} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedAPIKey}
        onClose={() => setSelectedAPIKey(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>API Key Details</DialogTitle>
        <DialogContent>
          {selectedAPIKey && (
            <Box>
              <Typography variant="h6" gutterBottom>
                API Key Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Name: {selectedAPIKey.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Key: {selectedAPIKey.key}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Created: {new Date(selectedAPIKey.created_at).toLocaleString()}</Typography>
                </Grid>
                {selectedAPIKey.expires_at && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Expires: {new Date(selectedAPIKey.expires_at).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Recent Requests
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.endpoint}</TableCell>
                        <TableCell>{request.method}</TableCell>
                        <TableCell>{request.status_code}</TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAPIKey(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedWebhook}
        onClose={() => setSelectedWebhook(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Webhook Details</DialogTitle>
        <DialogContent>
          {selectedWebhook && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Webhook Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Name: {selectedWebhook.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">URL: {selectedWebhook.url}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Secret: {selectedWebhook.secret}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Created: {new Date(selectedWebhook.created_at).toLocaleString()}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Recent Events
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhookLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.event}</TableCell>
                        <TableCell>{log.status_code}</TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedWebhook(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default APIManagement; 
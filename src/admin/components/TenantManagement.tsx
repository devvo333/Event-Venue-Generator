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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { tenantService, Tenant, TenantUser, TenantTeam, TeamMember, SSOProvider } from '../../services/tenant';

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
      id={`tenant-tabpanel-${index}`}
      aria-labelledby={`tenant-tab-${index}`}
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

const TenantManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [teams, setTeams] = useState<TenantTeam[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'member' as const,
  });
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real application, you would get the tenant ID from the current user's context
      const tenantId = 'current-tenant-id';
      const [tenantData, usersData, teamsData] = await Promise.all([
        tenantService.getTenant(tenantId),
        tenantService.getTenantUsers(tenantId),
        tenantService.getTeams(tenantId),
      ]);

      setTenant(tenantData);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (err) {
      setError('Failed to fetch tenant data');
      console.error('Error fetching tenant data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real application, you would create the user first and then add them to the tenant
      const userId = 'new-user-id';
      await tenantService.addTenantUser(tenant!.id, userId, newUser.role);

      setShowUserDialog(false);
      setNewUser({ email: '', role: 'member' });
      fetchData();
    } catch (err) {
      setError('Failed to add user');
      console.error('Error adding user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setLoading(true);
      setError(null);

      await tenantService.createTeam(tenant!.id, newTeam.name, newTeam.description);

      setShowTeamDialog(false);
      setNewTeam({ name: '', description: '' });
      fetchData();
    } catch (err) {
      setError('Failed to create team');
      console.error('Error creating team:', err);
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
        Tenant Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Settings" icon={<SecurityIcon />} />
          <Tab label="Users" icon={<PersonIcon />} />
          <Tab label="Teams" icon={<GroupIcon />} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tenant Settings
              </Typography>
              <TextField
                fullWidth
                label="Name"
                value={tenant?.name}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Domain"
                value={tenant?.domain}
                sx={{ mb: 2 }}
              />
              <Button variant="contained">
                Save Settings
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowUserDialog(true)}
          >
            Add User
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowTeamDialog(true)}
          >
            Create Team
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.description}</TableCell>
                  <TableCell>
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={showUserDialog} onClose={() => setShowUserDialog(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
              label="Role"
            >
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="member">Member</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showTeamDialog} onClose={() => setShowTeamDialog(false)}>
        <DialogTitle>Create Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newTeam.description}
            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTeamDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement; 
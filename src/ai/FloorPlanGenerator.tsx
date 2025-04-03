import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  InsertDriveFile as FileIcon,
  TipsAndUpdates as TipsIcon,
  CompareArrows as CompareIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  SaveAlt as SaveIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import aiService, { FloorPlanGenerationParams, FloorPlanGenerationResponse } from './aiService';

const eventTypes = [
  'Wedding',
  'Conference',
  'Corporate Meeting',
  'Exhibition',
  'Gala',
  'Banquet',
  'Reception',
  'Cocktail Party',
  'Birthday Party',
  'Graduation',
  'Concert',
  'Workshop'
];

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
      id={`floor-plan-tabpanel-${index}`}
      aria-labelledby={`floor-plan-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 1, height: '100%' }}>{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `floor-plan-tab-${index}`,
    'aria-controls': `floor-plan-tabpanel-${index}`,
  };
}

const FloorPlanGenerator: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [venueId, setVenueId] = useState('');
  
  // Form inputs
  const [eventType, setEventType] = useState('Wedding');
  const [guestCount, setGuestCount] = useState(100);
  const [dimensions, setDimensions] = useState({
    width: 20,
    length: 30,
    height: 4,
    unit: 'meters' as 'meters' | 'feet'
  });
  
  const [spaceRequirements, setSpaceRequirements] = useState({
    stage: false,
    danceFloor: false,
    bar: false,
    buffet: false,
    reception: false,
    lounge: false
  });
  
  const [accessibilityRequirements, setAccessibilityRequirements] = useState(false);
  
  // Results
  const [floorPlanResults, setFloorPlanResults] = useState<FloorPlanGenerationResponse | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setFloorPlanResults(null);
    
    try {
      // Prepare request parameters
      const params: FloorPlanGenerationParams = {
        venueId: venueId || undefined,
        eventType,
        guestCount,
        dimensions,
        spaceRequirements,
        accessibilityRequirements
      };
      
      // Call AI service
      const results = await aiService.generateFloorPlan(params);
      setFloorPlanResults(results);
      
      // Set active tab to results
      setActiveTab(1);
    } catch (error) {
      console.error('Error generating floor plan:', error);
      setSnackbarMessage('Failed to generate floor plan. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle alternative floor plan selection
  const handleAlternativeSelect = (id: string) => {
    setSelectedAlternative(id);
  };
  
  // Handle editing and applying floor plan
  const handleApplyFloorPlan = () => {
    // In a real implementation, this would save the plan to the venue and redirect to editor
    setSnackbarMessage('Floor plan applied successfully! Redirecting to editor...');
    setSnackbarOpen(true);
    
    // Simulate redirect after a delay
    setTimeout(() => {
      // This would be a redirect to the editor in a real implementation
      console.log('Redirecting to editor with floor plan:', 
        selectedAlternative || floorPlanResults?.floorPlan?.id);
    }, 1500);
  };
  
  // Render floor plan visualization
  useEffect(() => {
    if (!floorPlanResults?.floorPlan || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Get plan dimensions
    const width = dimensions.width;
    const length = dimensions.length;
    
    // Calculate scale factor to fit floor plan in canvas
    const scaleX = (canvasWidth - 40) / width;
    const scaleY = (canvasHeight - 40) / length;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate offset to center floor plan
    const offsetX = (canvasWidth - (width * scale)) / 2;
    const offsetY = (canvasHeight - (length * scale)) / 2;
    
    // Draw room outline
    ctx.strokeStyle = theme.palette.primary.main;
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, width * scale, length * scale);
    
    // Draw areas
    floorPlanResults.floorPlan.areas.forEach(area => {
      // Set fill color based on area type
      switch (area.type) {
        case 'stage':
          ctx.fillStyle = 'rgba(255, 87, 34, 0.7)';  // Orange
          break;
        case 'danceFloor':
          ctx.fillStyle = 'rgba(103, 58, 183, 0.7)'; // Purple
          break;
        case 'bar':
          ctx.fillStyle = 'rgba(0, 150, 136, 0.7)';  // Teal
          break;
        case 'seating':
          ctx.fillStyle = 'rgba(33, 150, 243, 0.7)'; // Blue
          break;
        case 'entrance':
          ctx.fillStyle = 'rgba(76, 175, 80, 0.7)';  // Green
          break;
        case 'exit':
          ctx.fillStyle = 'rgba(244, 67, 54, 0.7)';  // Red
          break;
        case 'circulation':
          ctx.fillStyle = 'rgba(158, 158, 158, 0.3)'; // Gray, transparent
          break;
        default:
          ctx.fillStyle = 'rgba(189, 189, 189, 0.5)'; // Light gray
      }
      
      // Draw rectangle for area
      ctx.fillRect(
        offsetX + area.x * scale,
        offsetY + area.y * scale,
        area.width * scale,
        area.length * scale
      );
      
      // Add border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        offsetX + area.x * scale,
        offsetY + area.y * scale,
        area.width * scale,
        area.length * scale
      );
      
      // Add label for area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        area.type.charAt(0).toUpperCase() + area.type.slice(1),
        offsetX + (area.x + area.width / 2) * scale,
        offsetY + (area.y + area.length / 2) * scale
      );
    });
    
    // Draw scale
    const scaleBarLength = 5; // 5 meters/feet
    const scaleBarHeight = 10;
    const scaleBarX = offsetX + 10;
    const scaleBarY = canvasHeight - 30;
    
    ctx.fillStyle = 'black';
    ctx.fillRect(scaleBarX, scaleBarY, scaleBarLength * scale, scaleBarHeight);
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${scaleBarLength} ${dimensions.unit}`,
      scaleBarX + (scaleBarLength * scale) / 2,
      scaleBarY + scaleBarHeight + 15
    );
    
  }, [floorPlanResults, dimensions, theme.palette.primary.main]);
  
  return (
    <Container maxWidth="xl" sx={{ mt: 2, height: 'calc(100vh - 100px)' }}>
      <Paper sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
        <Typography variant="h5" gutterBottom>
          Automated Floor Plan Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Generate optimized floor plans for your event space based on event type and requirements.
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Requirements" {...a11yProps(0)} />
            <Tab label="Floor Plan Results" {...a11yProps(1)} disabled={!floorPlanResults} />
            <Tab label="Alternatives" {...a11yProps(2)} disabled={!floorPlanResults?.alternativeLayouts?.length} />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    
                    <TextField
                      label="Venue ID (optional)"
                      value={venueId}
                      onChange={(e) => setVenueId(e.target.value)}
                      fullWidth
                      margin="normal"
                      helperText="Leave blank to use dimensions below instead of venue data"
                    />
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        label="Event Type"
                        required
                      >
                        {eventTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography id="guest-count-slider" gutterBottom>
                        Expected Guest Count: {guestCount}
                      </Typography>
                      <Slider
                        value={guestCount}
                        onChange={(_, value) => setGuestCount(value as number)}
                        aria-labelledby="guest-count-slider"
                        valueLabelDisplay="auto"
                        min={10}
                        max={500}
                        step={10}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Venue Dimensions</Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <TextField
                          label="Width"
                          type="number"
                          value={dimensions.width}
                          onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                          fullWidth
                          margin="normal"
                          InputProps={{ inputProps: { min: 5, max: 100 } }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Length"
                          type="number"
                          value={dimensions.length}
                          onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                          fullWidth
                          margin="normal"
                          InputProps={{ inputProps: { min: 5, max: 100 } }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Height"
                          type="number"
                          value={dimensions.height}
                          onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                          fullWidth
                          margin="normal"
                          InputProps={{ inputProps: { min: 2, max: 20 } }}
                        />
                      </Grid>
                    </Grid>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={dimensions.unit}
                        onChange={(e) => setDimensions({ 
                          ...dimensions, 
                          unit: e.target.value as 'meters' | 'feet'
                        })}
                        label="Unit"
                      >
                        <MenuItem value="meters">Meters</MenuItem>
                        <MenuItem value="feet">Feet</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Space Requirements</Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={spaceRequirements.stage}
                              onChange={(e) => setSpaceRequirements({
                                ...spaceRequirements,
                                stage: e.target.checked
                              })}
                            />
                          }
                          label="Stage"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={spaceRequirements.danceFloor}
                              onChange={(e) => setSpaceRequirements({
                                ...spaceRequirements,
                                danceFloor: e.target.checked
                              })}
                            />
                          }
                          label="Dance Floor"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={spaceRequirements.bar}
                              onChange={(e) => setSpaceRequirements({
                                ...spaceRequirements,
                                bar: e.target.checked
                              })}
                            />
                          }
                          label="Bar"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={spaceRequirements.buffet}
                              onChange={(e) => setSpaceRequirements({
                                ...spaceRequirements,
                                buffet: e.target.checked
                              })}
                            />
                          }
                          label="Buffet"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={spaceRequirements.reception}
                              onChange={(e) => setSpaceRequirements({
                                ...spaceRequirements,
                                reception: e.target.checked
                              })}
                            />
                          }
                          label="Reception"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={spaceRequirements.lounge}
                              onChange={(e) => setSpaceRequirements({
                                ...spaceRequirements,
                                lounge: e.target.checked
                              })}
                            />
                          }
                          label="Lounge"
                        />
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={accessibilityRequirements}
                          onChange={(e) => setAccessibilityRequirements(e.target.checked)}
                        />
                      }
                      label="Accessibility Requirements"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
                >
                  {loading ? 'Generating...' : 'Generate Floor Plan'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          {floorPlanResults?.floorPlan && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {floorPlanResults.floorPlan.name}
                  </Typography>
                  
                  <Box sx={{ position: 'relative', width: '100%', height: 500, backgroundColor: '#f5f5f5' }}>
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={500}
                      style={{ width: '100%', height: '100%' }}
                    />
                    {/* Overlay loading indicator if needed */}
                    {loading && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    )}
                  </Box>
                  
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        setSnackbarMessage('Floor plan downloaded successfully!');
                        setSnackbarOpen(true);
                      }}
                    >
                      Download PDF
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setActiveTab(2);
                      }}
                    >
                      View Alternatives
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<SaveIcon />}
                      onClick={handleApplyFloorPlan}
                    >
                      Apply to Venue
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Floor Plan Stats</Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Capacity</Typography>
                          <Typography variant="body1">{floorPlanResults.floorPlan.stats.capacity} guests</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Space Utilization</Typography>
                          <Typography variant="body1">{floorPlanResults.floorPlan.stats.utilizationRate}%</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Circulation Score</Typography>
                          <Typography variant="body1">{floorPlanResults.floorPlan.stats.circulationScore}/100</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Accessibility</Typography>
                          <Typography variant="body1">{floorPlanResults.floorPlan.stats.accessibilityScore}/100</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Asset Requirements</Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Tables</Typography>
                          <Typography variant="body1">{floorPlanResults.floorPlan.assetCount.tables}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Chairs</Typography>
                          <Typography variant="body1">{floorPlanResults.floorPlan.assetCount.chairs}</Typography>
                        </Grid>
                        {floorPlanResults.floorPlan.assetCount.stages > 0 && (
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">Stages</Typography>
                            <Typography variant="body1">{floorPlanResults.floorPlan.assetCount.stages}</Typography>
                          </Grid>
                        )}
                        {floorPlanResults.floorPlan.assetCount.bars > 0 && (
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">Bars</Typography>
                            <Typography variant="body1">{floorPlanResults.floorPlan.assetCount.bars}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TipsIcon color="primary" />
                        <Typography variant="h6">Recommendations</Typography>
                      </Stack>
                      
                      {floorPlanResults.floorPlan.recommendations?.map((recommendation, index) => (
                        <Alert severity="info" key={index} sx={{ mt: 1 }}>
                          {recommendation}
                        </Alert>
                      ))}
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          )}
          
          {!floorPlanResults?.floorPlan && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Generate a floor plan to see results here
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(0)}
                sx={{ mt: 2 }}
              >
                Go to Generator
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          {floorPlanResults?.alternativeLayouts && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Alternative Floor Plan Layouts
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" paragraph>
                  Compare different layout options optimized for specific goals.
                </Typography>
              </Grid>
              
              {floorPlanResults.alternativeLayouts.map((layout) => (
                <Grid item xs={12} md={4} key={layout.id}>
                  <Card 
                    variant={selectedAlternative === layout.id ? "elevation" : "outlined"}
                    elevation={selectedAlternative === layout.id ? 8 : 1}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: selectedAlternative === layout.id ? 'scale(1.02)' : 'scale(1)',
                      border: selectedAlternative === layout.id ? `2px solid ${theme.palette.primary.main}` : 'none'
                    }}
                    onClick={() => handleAlternativeSelect(layout.id)}
                  >
                    <Box
                      sx={{
                        height: 200,
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: `url('/assets/ai/floorplans/alt-${layout.id.split('-').pop()}-preview.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!layout.preview && (
                        <FileIcon sx={{ fontSize: 60, color: 'rgba(0,0,0,0.1)' }} />
                      )}
                    </Box>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" gutterBottom>
                          {layout.name}
                        </Typography>
                        <Chip 
                          label={layout.differentiator}
                          color={selectedAlternative === layout.id ? "primary" : "default"}
                          size="small"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {layout.description}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Capacity</Typography>
                          <Typography variant="body2">{layout.stats.capacity} guests</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Utilization</Typography>
                          <Typography variant="body2">{layout.stats.utilizationRate}%</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!selectedAlternative}
                  onClick={handleApplyFloorPlan}
                  startIcon={<SaveIcon />}
                >
                  Apply Selected Layout
                </Button>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default FloorPlanGenerator; 
import React, { useState, useEffect } from 'react';
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
  Snackbar,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  ColorLens as ColorLensIcon,
  Download as DownloadIcon,
  Layers as LayersIcon,
  TipsAndUpdates as TipsIcon,
  WbIncandescent as WbIncandescentIcon,
  AccessTime as AccessTimeIcon,
  Mood as MoodIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { HexColorPicker } from 'react-colorful';
import aiService, { LightingSimulationParams, LightingSimulationResponse } from './aiService';

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

const timeOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' }
];

const moodOptions = [
  { value: 'intimate', label: 'Intimate' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'professional', label: 'Professional' }
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
      id={`lighting-tabpanel-${index}`}
      aria-labelledby={`lighting-tab-${index}`}
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
    id: `lighting-tab-${index}`,
    'aria-controls': `lighting-tabpanel-${index}`,
  };
}

const LightingSimulation: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [venueId, setVenueId] = useState('');
  const [layoutId, setLayoutId] = useState('');
  
  // Form inputs
  const [eventType, setEventType] = useState('Wedding');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [mood, setMood] = useState<'intimate' | 'energetic' | 'relaxed' | 'dramatic' | 'professional'>('intimate');
  const [primaryColor, setPrimaryColor] = useState<string | undefined>(undefined);
  const [secondaryColor, setSecondaryColor] = useState<string | undefined>(undefined);
  const [colorPickerOpen, setColorPickerOpen] = useState<'primary' | 'secondary' | null>(null);
  
  const [hasWindowLight, setHasWindowLight] = useState(false);
  const [hasStage, setHasStage] = useState(false);
  const [hasDanceFloor, setHasDanceFloor] = useState(false);
  
  // Results
  const [simulationResults, setSimulationResults] = useState<LightingSimulationResponse | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSimulationResults(null);
    
    try {
      // Prepare request parameters
      const params: LightingSimulationParams = {
        venueId,
        layoutId: layoutId || undefined,
        eventType,
        timeOfDay,
        mood,
        primaryColor,
        secondaryColor,
        hasWindowLight,
        hasStage,
        hasDanceFloor
      };
      
      // Call AI service
      const results = await aiService.simulateLighting(params);
      setSimulationResults(results);
      
      // Initialize layer visibility
      if (results.simulation?.layers) {
        const visibility: Record<string, boolean> = {};
        results.simulation.layers.forEach(layer => {
          visibility[layer.name] = layer.visible;
        });
        setLayerVisibility(visibility);
        setActiveLayer(results.simulation.layers[0].name);
      }
      
      // Set active tab to results
      setActiveTab(1);
    } catch (error) {
      console.error('Error simulating lighting:', error);
      setSnackbarMessage('Failed to generate lighting simulation. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle layer visibility toggle
  const handleLayerToggle = (layerName: string) => {
    setLayerVisibility({
      ...layerVisibility,
      [layerName]: !layerVisibility[layerName]
    });
  };
  
  // Handle download of assets
  const handleDownload = (assetType: 'planPdf' | 'planImage' | 'technicalSpecifications') => {
    if (!simulationResults?.downloadableAssets) return;
    
    const assetUrl = simulationResults.downloadableAssets[assetType];
    if (!assetUrl) return;
    
    // In a real implementation, this would download the asset
    // For now, just show a snackbar message
    setSnackbarMessage(`Downloading ${assetType.replace(/([A-Z])/g, ' $1').toLowerCase()}...`);
    setSnackbarOpen(true);
    
    // Simulate download delay
    setTimeout(() => {
      console.log(`Downloaded: ${assetUrl}`);
      setSnackbarMessage(`${assetType.replace(/([A-Z])/g, ' $1').toLowerCase()} downloaded successfully!`);
      setSnackbarOpen(true);
    }, 1500);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 2, height: 'calc(100vh - 100px)' }}>
      <Paper sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
        <Typography variant="h5" gutterBottom>
          <WbIncandescentIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
          Lighting Simulation
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Simulate and visualize lighting for your event space based on event type, mood, and requirements.
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue)}>
            <Tab label="Requirements" {...a11yProps(0)} />
            <Tab label="Lighting Preview" {...a11yProps(1)} disabled={!simulationResults} />
            <Tab label="Equipment & Specs" {...a11yProps(2)} disabled={!simulationResults?.equipmentList} />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <LightbulbIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      Basic Information
                    </Typography>
                    
                    <TextField
                      label="Venue ID"
                      value={venueId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVenueId(e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      helperText="Enter the venue ID to load venue dimensions"
                    />
                    
                    <TextField
                      label="Layout ID (optional)"
                      value={layoutId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLayoutId(e.target.value)}
                      fullWidth
                      margin="normal"
                      helperText="If specified, will use this floor plan layout for simulation"
                    />
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        value={eventType}
                        onChange={(e: React.ChangeEvent<{ value: unknown }>) => setEventType(e.target.value as string)}
                        label="Event Type"
                        required
                      >
                        {eventTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      Time & Mood
                    </Typography>
                    
                    <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Time of Day
                      </Typography>
                      <RadioGroup
                        row
                        value={timeOfDay}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setTimeOfDay(e.target.value as 'morning' | 'afternoon' | 'evening' | 'night')}
                      >
                        {timeOptions.map(option => (
                          <FormControlLabel 
                            key={option.value} 
                            value={option.value} 
                            control={<Radio />} 
                            label={option.label} 
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    
                    <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Mood
                      </Typography>
                      <RadioGroup
                        row
                        value={mood}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setMood(e.target.value as 'intimate' | 'energetic' | 'relaxed' | 'dramatic' | 'professional')}
                      >
                        {moodOptions.map(option => (
                          <FormControlLabel 
                            key={option.value} 
                            value={option.value} 
                            control={<Radio />} 
                            label={option.label} 
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={hasWindowLight}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHasWindowLight(e.target.checked)}
                        />
                      }
                      label="Natural Window Light"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <ColorLensIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      Color Selection
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Primary Color (optional)
                        </Typography>
                        <Box sx={{ position: 'relative' }}>
                          <Button
                            variant="outlined"
                            onClick={() => setColorPickerOpen(colorPickerOpen === 'primary' ? null : 'primary')}
                            fullWidth
                            sx={{
                              height: 40,
                              backgroundColor: primaryColor || 'transparent',
                              '&:hover': {
                                backgroundColor: primaryColor || 'rgba(0, 0, 0, 0.05)'
                              },
                              borderColor: 'rgba(0, 0, 0, 0.23)',
                              color: primaryColor ? 'white' : 'inherit'
                            }}
                          >
                            {primaryColor || 'Select Color'}
                          </Button>
                          
                          {colorPickerOpen === 'primary' && (
                            <Box sx={{ position: 'absolute', zIndex: 1, mt: 1, boxShadow: 3 }}>
                              <HexColorPicker
                                color={primaryColor || '#ffffff'}
                                onChange={setPrimaryColor}
                              />
                              <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                onClick={() => setColorPickerOpen(null)}
                              >
                                Done
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Secondary Color (optional)
                        </Typography>
                        <Box sx={{ position: 'relative' }}>
                          <Button
                            variant="outlined"
                            onClick={() => setColorPickerOpen(colorPickerOpen === 'secondary' ? null : 'secondary')}
                            fullWidth
                            sx={{
                              height: 40,
                              backgroundColor: secondaryColor || 'transparent',
                              '&:hover': {
                                backgroundColor: secondaryColor || 'rgba(0, 0, 0, 0.05)'
                              },
                              borderColor: 'rgba(0, 0, 0, 0.23)',
                              color: secondaryColor ? 'white' : 'inherit'
                            }}
                          >
                            {secondaryColor || 'Select Color'}
                          </Button>
                          
                          {colorPickerOpen === 'secondary' && (
                            <Box sx={{ position: 'absolute', zIndex: 1, mt: 1, boxShadow: 3 }}>
                              <HexColorPicker
                                color={secondaryColor || '#ffffff'}
                                onChange={setSecondaryColor}
                              />
                              <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                onClick={() => setColorPickerOpen(null)}
                              >
                                Done
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <MoodIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      Special Requirements
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={hasStage}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHasStage(e.target.checked)}
                            />
                          }
                          label="Stage Lighting"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={hasDanceFloor}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHasDanceFloor(e.target.checked)}
                            />
                          }
                          label="Dance Floor"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || !venueId}
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <WbIncandescentIcon />}
                >
                  {loading ? 'Simulating...' : 'Simulate Lighting'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          {simulationResults?.simulation && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {`${mood.charAt(0).toUpperCase() + mood.slice(1)} ${eventType} Lighting`}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: 500, 
                      backgroundColor: '#191919',
                      backgroundImage: `url('${simulationResults.simulation.previewUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
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
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
                      onClick={() => handleDownload('planImage')}
                    >
                      Download Image
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload('planPdf')}
                    >
                      Download PDF
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => setActiveTab(2)}
                    >
                      View Equipment List
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <LayersIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                        Lighting Layers
                      </Typography>
                      
                      {simulationResults.simulation.layers.map((layer, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Switch 
                              checked={layerVisibility[layer.name] ?? layer.visible}
                              onChange={() => handleLayerToggle(layer.name)}
                              color="primary"
                            />
                          }
                          label={
                            <Box 
                              component="span" 
                              sx={{ 
                                fontWeight: activeLayer === layer.name ? 'bold' : 'normal',
                                color: activeLayer === layer.name ? 'primary.main' : 'text.primary'
                              }}
                              onClick={() => setActiveLayer(layer.name)}
                            >
                              {layer.name}
                            </Box>
                          }
                          sx={{ 
                            display: 'block', 
                            mb: 1, 
                            p: 1, 
                            borderRadius: 1,
                            bgcolor: activeLayer === layer.name ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Color Palette</Typography>
                      
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {simulationResults.simulation.colorPalette.map((color, index) => (
                          <Tooltip key={index} title={color}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: color,
                                borderRadius: '4px',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                if (index === 0 && !primaryColor) setPrimaryColor(color);
                                else if (index === 2 && !secondaryColor) setSecondaryColor(color);
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TipsIcon color="primary" />
                        <Typography variant="h6">Recommendations</Typography>
                      </Stack>
                      
                      {simulationResults.simulation.recommendations.map((recommendation, index) => (
                        <Alert severity="info" key={index} sx={{ mt: 1 }}>
                          {recommendation.text}
                        </Alert>
                      ))}
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          )}
          
          {!simulationResults?.simulation && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Generate a lighting simulation to see results here
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(0)}
                sx={{ mt: 2 }}
              >
                Go to Simulator
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          {simulationResults?.equipmentList && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                  Recommended Lighting Equipment
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" paragraph>
                  Estimated equipment needs for your event lighting setup.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="h6" gutterBottom>
                        Equipment Summary
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Total Items: {simulationResults.equipmentList.reduce((sum, item) => sum + item.count, 0)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Estimated Cost: ${simulationResults.equipmentList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={8}>
                      <Box sx={{ mb: 2 }}>
                        <Button 
                          variant="outlined" 
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload('technicalSpecifications')}
                          sx={{ mr: 2 }}
                        >
                          Technical Specifications
                        </Button>
                        <Button 
                          variant="outlined" 
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            setSnackbarMessage('Equipment list exported successfully!');
                            setSnackbarOpen(true);
                          }}
                        >
                          Export Equipment List
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    {simulationResults.equipmentList.map((equipment, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="h6">{equipment.type}</Typography>
                              <Chip label={`Qty: ${equipment.count}`} color="primary" />
                            </Stack>
                            
                            {equipment.estimatedCost && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Estimated Cost: ${equipment.estimatedCost.toLocaleString()}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Note</Typography>
                  Equipment list is an estimate based on venue size and event requirements. Actual needs may vary depending on specific venue conditions. We recommend consulting with a professional lighting designer for final implementation.
                </Alert>
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

export default LightingSimulation; 
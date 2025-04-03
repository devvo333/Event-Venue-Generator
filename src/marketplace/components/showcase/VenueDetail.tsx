import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  Divider,
  Paper,
  TextField,
  ImageList,
  ImageListItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ChairAlt as ChairIcon,
  RestaurantMenu as CateringIcon,
  MusicNote as EntertainmentIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  AccessibilityNew as AccessibilityIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ViewInAr as ViewInArIcon,
  Star as StarIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import VenueShowcaseService, { ShowcaseVenue } from '../../services/venueShowcaseService';

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
      id={`venue-tabpanel-${index}`}
      aria-labelledby={`venue-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VenueDetail: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState<ShowcaseVenue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [openImageDialog, setOpenImageDialog] = useState<boolean>(false);
  const [dialogImageIndex, setDialogImageIndex] = useState<number>(0);
  
  // Form state
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    date: '',
    attendees: '',
    subscribe: false
  });
  
  // Fetch venue details on component mount
  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (!venueId) {
        setError('Venue ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const venueData = await VenueShowcaseService.getVenueById(venueId);
        
        if (!venueData) {
          throw new Error('Venue not found');
        }
        
        setVenue(venueData);
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError(`Failed to load venue details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVenueDetails();
  }, [venueId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInquiryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInquiryForm(prev => ({ ...prev, subscribe: e.target.checked }));
  };
  
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send the inquiry to the backend
    alert('Thank you for your inquiry! The venue owner will contact you soon.');
    setInquiryForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      date: '',
      attendees: '',
      subscribe: false
    });
  };
  
  const handleImageClick = (index: number) => {
    setDialogImageIndex(index);
    setOpenImageDialog(true);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading venue details...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (error || !venue) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Venue not found'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/marketplace/showcase')}
            sx={{ mt: 2 }}
          >
            Back to Showcase
          </Button>
        </Paper>
      </Container>
    );
  }
  
  const allImages = [
    venue.cover_image, 
    ...(venue.showcase_images || [])
  ].filter(Boolean) as string[];
  
  // Get amenities from the venue data
  const amenities = venue.amenities || [];
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/marketplace" color="inherit">
          Marketplace
        </Link>
        <Link component={RouterLink} to="/marketplace/showcase" color="inherit">
          Venue Showcase
        </Link>
        <Typography color="text.primary">{venue.name}</Typography>
      </Breadcrumbs>
      
      {/* Venue Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {venue.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              {venue.showcase_featured && (
                <Chip label="Featured" color="secondary" size="small" />
              )}
              
              {venue.location && (venue.location.city || venue.location.state || venue.location.country) && (
                <Chip 
                  icon={<LocationIcon />} 
                  label={[venue.location.city, venue.location.state, venue.location.country].filter(Boolean).join(', ')} 
                  variant="outlined" 
                  size="small" 
                />
              )}
              
              {venue.virtual_tour_available && (
                <Chip 
                  icon={<ViewInArIcon />} 
                  label="VR Tour Available" 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <Rating value={venue.average_rating || 0} readOnly precision={0.5} size="small" />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  ({venue.average_rating ? venue.average_rating.toFixed(1) : '0.0'})
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary">
              Owned by {venue.owner_name || 'Anonymous Owner'} • {venue.layout_count || 0} Layouts
            </Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<FavoriteBorderIcon />}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ShareIcon />}
            >
              Share
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Gallery & Details Section */}
      <Grid container spacing={4}>
        {/* Gallery */}
        <Grid item xs={12} md={8}>
          <Box>
            {/* Main Image */}
            <Box 
              sx={{ 
                position: 'relative', 
                width: '100%', 
                height: 400, 
                overflow: 'hidden',
                borderRadius: 2,
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  '& .overlay': {
                    opacity: 1
                  }
                }
              }}
              onClick={() => handleImageClick(mainImageIndex)}
            >
              <Box 
                component="img"
                src={allImages[mainImageIndex] || '/images/placeholder-venue.jpg'}
                alt={venue.name}
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
              <Box 
                className="overlay"
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  bgcolor: 'rgba(0,0,0,0.6)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  color: 'white'
                }}
              >
                <Typography variant="h6">Click to enlarge</Typography>
              </Box>
            </Box>
            
            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <ImageList cols={Math.min(allImages.length, 5)} gap={8} sx={{ mb: 4 }}>
                {allImages.map((img, index) => (
                  <ImageListItem 
                    key={index}
                    onClick={() => setMainImageIndex(index)}
                    sx={{ 
                      cursor: 'pointer',
                      border: index === mainImageIndex ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={img}
                      alt={`${venue.name} - Image ${index + 1}`}
                      loading="lazy"
                      style={{ height: 80, objectFit: 'cover' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
            
            {venue.virtual_tour_available && (
              <Button 
                variant="contained" 
                fullWidth
                size="large"
                startIcon={<ViewInArIcon />}
                component={RouterLink}
                to={`/ar-vr/virtual-tour/${venue.id}`}
                sx={{ mb: 4 }}
              >
                Start Virtual Tour
              </Button>
            )}
            
            {/* Tabs for Details */}
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Description" />
                  <Tab label="Amenities" />
                  <Tab label="Specifications" />
                  <Tab label="Layouts" />
                </Tabs>
              </Box>
              
              {/* Description Tab */}
              <TabPanel value={tabValue} index={0}>
                <Typography variant="body1" paragraph>
                  {venue.showcase_description || venue.description || 'No description available for this venue.'}
                </Typography>
                
                {venue.showcase_tags && venue.showcase_tags.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {venue.showcase_tags.map(tag => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          component={RouterLink}
                          to={`/marketplace/showcase/search?tags=${encodeURIComponent(tag)}`}
                          clickable
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </TabPanel>
              
              {/* Amenities Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  {amenities.length > 0 ? (
                    amenities.map((amenity, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 1.5 }}>
                              {amenity.includes('WiFi') && <WifiIcon color="primary" />}
                              {amenity.includes('Parking') && <ParkingIcon color="primary" />}
                              {amenity.includes('Catering') && <CateringIcon color="primary" />}
                              {amenity.includes('Accessibility') && <AccessibilityIcon color="primary" />}
                              {amenity.includes('Furniture') && <ChairIcon color="primary" />}
                              {amenity.includes('Entertainment') && <EntertainmentIcon color="primary" />}
                              {!['WiFi', 'Parking', 'Catering', 'Accessibility', 'Furniture', 'Entertainment'].some(a => amenity.includes(a)) && <CheckIcon color="primary" />}
                            </Box>
                            <Typography variant="body1">{amenity}</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary">
                        No amenities listed for this venue.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              
              {/* Specifications Tab */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  {/* Dimensions */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Dimensions
                        </Typography>
                        {venue.dimensions ? (
                          <List dense disablePadding>
                            <ListItem>
                              <ListItemText 
                                primary={`Width: ${venue.dimensions.width} ${venue.dimensions.unit}`} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary={`Length: ${venue.dimensions.length} ${venue.dimensions.unit}`} 
                              />
                            </ListItem>
                            {venue.dimensions.height && (
                              <ListItem>
                                <ListItemText 
                                  primary={`Height: ${venue.dimensions.height} ${venue.dimensions.unit}`} 
                                />
                              </ListItem>
                            )}
                            <ListItem>
                              <ListItemText 
                                primary={`Total Area: ${venue.dimensions.width * venue.dimensions.length} sq ${venue.dimensions.unit}`} 
                              />
                            </ListItem>
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Dimensions not specified
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Capacity */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Capacity
                        </Typography>
                        {venue.capacity ? (
                          <List dense disablePadding>
                            {venue.capacity.max && (
                              <ListItem>
                                <ListItemIcon>
                                  <PeopleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`Maximum: ${venue.capacity.max} people`} 
                                />
                              </ListItem>
                            )}
                            {venue.capacity.recommended && (
                              <ListItem>
                                <ListItemIcon>
                                  <PeopleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`Recommended: ${venue.capacity.recommended} people`} 
                                />
                              </ListItem>
                            )}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Capacity not specified
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Address */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Location
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationIcon color="primary" sx={{ mt: 0.5, mr: 1 }} />
                          <Typography variant="body1">
                            {venue.address || 
                              (venue.location && [venue.location.city, venue.location.state, venue.location.country].filter(Boolean).join(', ')) || 
                              'Address not provided'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>
              
              {/* Layouts Tab */}
              <TabPanel value={tabValue} index={3}>
                {venue.layout_count && venue.layout_count > 0 ? (
                  <Grid container spacing={3}>
                    {/* This would be populated with actual layouts in a real application */}
                    <Grid item xs={12}>
                      <Typography variant="body1" paragraph>
                        This venue has {venue.layout_count} saved layouts. 
                        Schedule a consultation to see detailed layout examples and customize them for your event.
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        onClick={() => setTabValue(4)} // Switch to Inquiry tab
                        sx={{ mt: 1 }}
                      >
                        Request Layout Information
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No layouts available for this venue yet.
                  </Typography>
                )}
              </TabPanel>
            </Box>
          </Box>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Inquiry Card */}
          <Card sx={{ position: 'sticky', top: 16, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interested in this venue?
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Fill out this form to get more information
              </Typography>
              
              <Box component="form" onSubmit={handleInquirySubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={inquiryForm.name}
                  onChange={handleInquiryChange}
                  margin="normal"
                  variant="outlined"
                  required
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={inquiryForm.email}
                  onChange={handleInquiryChange}
                  margin="normal"
                  variant="outlined"
                  required
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={inquiryForm.phone}
                  onChange={handleInquiryChange}
                  margin="normal"
                  variant="outlined"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Event Date"
                  name="date"
                  type="date"
                  value={inquiryForm.date}
                  onChange={handleInquiryChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Number of Attendees"
                  name="attendees"
                  type="number"
                  value={inquiryForm.attendees}
                  onChange={handleInquiryChange}
                  margin="normal"
                  variant="outlined"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={inquiryForm.message}
                  onChange={handleInquiryChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={3}
                  required
                  placeholder="I'm interested in this venue for my upcoming event..."
                  size="small"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={inquiryForm.subscribe} 
                      onChange={handleCheckboxChange} 
                      name="subscribe" 
                      color="primary" 
                    />
                  }
                  label="Subscribe to venue updates"
                  sx={{ mt: 1 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  sx={{ mt: 2 }}
                >
                  Submit Inquiry
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          {/* Quick Info */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Info
              </Typography>
              
              <List dense disablePadding>
                {venue.capacity && venue.capacity.max && (
                  <ListItem disablePadding sx={{ pb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PeopleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`Up to ${venue.capacity.max} people`} />
                  </ListItem>
                )}
                
                {venue.address && (
                  <ListItem disablePadding sx={{ pb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={venue.address} />
                  </ListItem>
                )}
                
                {venue.amenities && venue.amenities.length > 0 && (
                  <ListItem disablePadding sx={{ pb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`${venue.amenities.length} Amenities`} />
                  </ListItem>
                )}
                
                {venue.virtual_tour_available && (
                  <ListItem disablePadding sx={{ pb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ViewInArIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Virtual Tour Available" />
                  </ListItem>
                )}
                
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EventIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={`${venue.layout_count || 0} Layouts`} />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Perfect for:
              </Typography>
              
              {venue.showcase_tags && venue.showcase_tags.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {venue.showcase_tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined" 
                      component={RouterLink}
                      to={`/marketplace/showcase/search?tags=${encodeURIComponent(tag)}`}
                      clickable
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No event types specified
                </Typography>
              )}
            </CardContent>
          </Card>
          
          {/* Similar Venues */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                You might also like
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Discover similar venues that match your criteria
              </Typography>
              
              <Button 
                fullWidth 
                variant="outlined"
                component={RouterLink}
                to="/marketplace/showcase/browse"
              >
                Browse More Venues
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Image Dialog */}
      <Dialog 
        open={openImageDialog} 
        onClose={() => setOpenImageDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{venue.name} - Image Gallery</Typography>
          <IconButton onClick={() => setOpenImageDialog(false)} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box 
            component="img"
            src={allImages[dialogImageIndex] || '/images/placeholder-venue.jpg'}
            alt={`${venue.name} - Full size image`}
            sx={{ 
              width: '100%', 
              maxHeight: '70vh', 
              objectFit: 'contain'
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography>
              {dialogImageIndex + 1} of {allImages.length}
            </Typography>
          </Box>
          
          <ImageList cols={Math.min(allImages.length, 8)} gap={8} sx={{ mt: 2 }}>
            {allImages.map((img, index) => (
              <ImageListItem 
                key={index}
                onClick={() => setDialogImageIndex(index)}
                sx={{ 
                  cursor: 'pointer',
                  border: index === dialogImageIndex ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <img
                  src={img}
                  alt={`${venue.name} - Thumbnail ${index + 1}`}
                  loading="lazy"
                  style={{ height: 60, objectFit: 'cover' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default VenueDetail; 
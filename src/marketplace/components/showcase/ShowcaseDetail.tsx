import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tab,
  Tabs,
  ImageList,
  ImageListItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Event as EventIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  ViewInAr as ViewInArIcon,
  Info as InfoIcon,
  Room as RoomIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  AccessTime as TimeIcon,
  Accessible as AccessibleIcon
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ShowcaseDetail: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const [venue, setVenue] = useState<ShowcaseVenue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

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
          setError('Venue not found');
        } else {
          setVenue(venueData);
        }
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError('Failed to load venue details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [venueId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading venue details...
        </Typography>
      </Container>
    );
  }

  if (error || !venue) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Error loading venue'}
        </Alert>
        <Button
          component={RouterLink}
          to="/marketplace/showcase"
          startIcon={<ArrowBackIcon />}
        >
          Back to Showcase
        </Button>
      </Container>
    );
  }

  // Format capacity display
  const capacityText = venue.capacity?.recommended
    ? `Recommended: ${venue.capacity.recommended} people (Max: ${venue.capacity.max})`
    : venue.capacity?.max
    ? `Maximum: ${venue.capacity.max} people`
    : 'Capacity details not specified';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={RouterLink}
          to="/marketplace/showcase"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Showcase
        </Button>
        <Typography variant="body2" color="text.secondary">
          {venue.name}
        </Typography>
      </Box>

      {/* Venue Header with Hero Image */}
      <Paper 
        sx={{ 
          position: 'relative', 
          mb: 4, 
          overflow: 'hidden',
          height: { xs: 200, sm: 300, md: 400 },
          bgcolor: 'grey.200'
        }}
      >
        <Box
          component="img"
          src={venue.showcase_images?.[0] || venue.cover_image || '/images/placeholder-venue.jpg'}
          alt={venue.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white',
          }}
        >
          <Typography variant="h3" component="h1">
            {venue.name}
          </Typography>
          
          {venue.location && (venue.location.city || venue.location.state || venue.location.country) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LocationIcon fontSize="small" />
              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                {[venue.location.city, venue.location.state, venue.location.country].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          )}
          
          {venue.showcase_featured && (
            <Chip 
              label="Featured Venue" 
              color="secondary" 
              size="small"
              sx={{ mt: 1, fontWeight: 'bold' }} 
            />
          )}
        </Box>
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - Main Venue Details */}
        <Grid item xs={12} md={8}>
          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              aria-label="venue detail tabs"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Overview" id="venue-tab-0" aria-controls="venue-tabpanel-0" />
              <Tab label="Amenities" id="venue-tab-1" aria-controls="venue-tabpanel-1" />
              <Tab label="Gallery" id="venue-tab-2" aria-controls="venue-tabpanel-2" />
              {venue.virtual_tour_available && (
                <Tab 
                  label="Virtual Tour" 
                  id="venue-tab-3" 
                  aria-controls="venue-tabpanel-3" 
                  icon={<ViewInArIcon fontSize="small" />}
                  iconPosition="start"
                />
              )}
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h5" gutterBottom>
              About This Venue
            </Typography>
            
            <Typography variant="body1" paragraph>
              {venue.showcase_description || venue.description || 'No description available for this venue.'}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Specifications
            </Typography>
            
            <Grid container spacing={2}>
              {/* Dimensions */}
              {venue.dimensions && (
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dimensions
                    </Typography>
                    <Typography variant="body1">
                      {venue.dimensions.width} × {venue.dimensions.length}
                      {venue.dimensions.height ? ` × ${venue.dimensions.height}` : ''} {venue.dimensions.unit}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {/* Capacity */}
              {venue.capacity && (venue.capacity.max || venue.capacity.recommended) && (
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Capacity
                    </Typography>
                    <Typography variant="body1">
                      {capacityText}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {/* Address */}
              {venue.address && (
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {venue.address}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {/* Layout Count */}
              {venue.layout_count !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Available Layouts
                    </Typography>
                    <Typography variant="body1">
                      {venue.layout_count} {venue.layout_count === 1 ? 'layout' : 'layouts'}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            {/* Tags */}
            {venue.showcase_tags && venue.showcase_tags.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Venue Type & Features
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
              </>
            )}
          </TabPanel>

          {/* Amenities Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h5" gutterBottom>
              Amenities & Services
            </Typography>
            
            {venue.amenities && venue.amenities.length > 0 ? (
              <Grid container spacing={2}>
                {venue.amenities.map((amenity, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {amenity.toLowerCase().includes('wifi') ? <WifiIcon color="primary" /> :
                         amenity.toLowerCase().includes('parking') ? <ParkingIcon color="primary" /> :
                         amenity.toLowerCase().includes('accessible') ? <AccessibleIcon color="primary" /> :
                         amenity.toLowerCase().includes('hour') ? <TimeIcon color="primary" /> :
                         <InfoIcon color="primary" />}
                      </ListItemIcon>
                      <ListItemText primary={amenity} />
                    </ListItem>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No amenities information available for this venue.
              </Typography>
            )}
          </TabPanel>

          {/* Gallery Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h5" gutterBottom>
              Venue Gallery
            </Typography>
            
            {venue.showcase_images && venue.showcase_images.length > 0 ? (
              <ImageList 
                variant="masonry" 
                cols={window.innerWidth < 600 ? 1 : 2} 
                gap={8}
              >
                {venue.showcase_images.map((imageUrl, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={imageUrl}
                      alt={`${venue.name} - View ${index + 1}`}
                      loading="lazy"
                      style={{ borderRadius: '4px' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No gallery images available for this venue.
              </Typography>
            )}
          </TabPanel>

          {/* Virtual Tour Tab */}
          {venue.virtual_tour_available && (
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h5" gutterBottom>
                Virtual Experience
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Experience this venue in augmented reality or take a virtual walkthrough.
                </Alert>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    component={RouterLink}
                    to={`/ar-viewer?venueId=${venue.id}`}
                    startIcon={<ViewInArIcon />}
                  >
                    View in AR
                  </Button>
                  <Button 
                    variant="outlined" 
                    component={RouterLink}
                    to={`/virtual-walkthrough?venueId=${venue.id}`}
                    startIcon={<RoomIcon />}
                  >
                    Virtual Walkthrough
                  </Button>
                </Box>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h6" gutterBottom>
                  How it works
                </Typography>
                <Typography variant="body2" paragraph>
                  Our virtual tour technology allows you to:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ViewInArIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Augmented Reality" 
                      secondary="View the venue in AR through your mobile device, overlaid on your real environment." 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RoomIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Virtual Walkthrough" 
                      secondary="Take a 3D tour of the venue with the ability to move and look around as if you were there." 
                    />
                  </ListItem>
                </List>
              </Paper>
            </TabPanel>
          )}
        </Grid>

        {/* Right Column - Sidebar Information */}
        <Grid item xs={12} md={4}>
          {/* Owner Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Venue Owner
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2 }}>
                  {venue.owner_name?.charAt(0) || 'V'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {venue.owner_name || 'Venue Owner'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date(venue.created_at).getFullYear()}
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                component={RouterLink}
                to={`/contact?subject=Inquiry about ${venue.name}`}
              >
                Contact Owner
              </Button>
            </CardContent>
          </Card>

          {/* Rating Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ratings & Reviews
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating 
                  value={venue.average_rating || 0} 
                  readOnly 
                  precision={0.5}
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({venue.average_rating?.toFixed(1) || '0.0'})
                </Typography>
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth
                startIcon={<StarIcon />}
                disabled={!venue.layout_count}
                component={RouterLink}
                to={`/marketplace/showcase/venue/${venue.id}/reviews`}
              >
                {venue.layout_count ? 'Read Reviews' : 'No Reviews Yet'}
              </Button>
            </CardContent>
          </Card>

          {/* Event Planning */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Your Event
              </Typography>
              
              <Typography variant="body2" paragraph>
                Use our comprehensive event planning tools to create layouts and manage your event in this venue.
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                startIcon={<EventIcon />}
                component={RouterLink}
                to={`/layouts/new?venueId=${venue.id}`}
                sx={{ mb: 1 }}
              >
                Create Layout
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth
                startIcon={<PeopleIcon />}
                component={RouterLink}
                to={`/calculate-capacity?venueId=${venue.id}`}
              >
                Calculate Capacity
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Related Venues Section */}
      <Box sx={{ mt: 6 }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="h5" gutterBottom>
          Similar Venues
        </Typography>
        
        <Typography variant="body2" paragraph>
          Explore other venues that match your search criteria.
        </Typography>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="contained"
            component={RouterLink}
            to="/marketplace/showcase"
          >
            Browse All Venues
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ShowcaseDetail; 
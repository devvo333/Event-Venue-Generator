import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Chip,
  Rating,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  IconButton,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Event as EventIcon,
  LocalOffer as TagIcon,
  Check as CheckIcon,
  ArrowBack as BackIcon,
  ViewInAr as ViewInArIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  NavigateNext as NavigateNextIcon,
  PhotoLibrary as GalleryIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Chat as CommentIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import VenueShowcaseService, { ShowcaseVenue } from '../../services/venueShowcaseService';

const VenueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<ShowcaseVenue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Fetch venue data
  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Venue ID is missing');
          setLoading(false);
          return;
        }
        
        const venueData = await VenueShowcaseService.getVenueById(id);
        
        if (!venueData) {
          setError('Venue not found');
          setLoading(false);
          return;
        }
        
        setVenue(venueData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError('Failed to load venue details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchVenueDetails();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Open gallery with specific image
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  // Navigate gallery
  const navigateGallery = (direction: 'prev' | 'next') => {
    if (!venue?.showcase_images?.length) return;
    
    const imagesCount = venue.showcase_images.length;
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imagesCount - 1));
    } else {
      setCurrentImageIndex((prev) => (prev < imagesCount - 1 ? prev + 1 : 0));
    }
  };

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real implementation, this would save to the database
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={60} width="100%" sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} width="100%" />
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item key={item} xs={3}>
                    <Skeleton variant="rectangular" height={80} width="100%" />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} width="100%" />
            <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="rectangular" height={50} width="100%" sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !venue) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Venue not found'}
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink}
            to="/marketplace/showcase"
            sx={{ mt: 2 }}
          >
            Return to Showcase
          </Button>
        </Paper>
      </Container>
    );
  }

  // Combine all available images
  const allImages = [
    ...(venue.cover_image ? [venue.cover_image] : []),
    ...(venue.showcase_images || [])
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          component={RouterLink} 
          to="/"
          underline="hover"
          color="inherit"
        >
          Home
        </Link>
        <Link 
          component={RouterLink} 
          to="/marketplace"
          underline="hover"
          color="inherit"
        >
          Marketplace
        </Link>
        <Link 
          component={RouterLink} 
          to="/marketplace/showcase"
          underline="hover"
          color="inherit"
        >
          Venue Showcase
        </Link>
        <Typography color="text.primary">{venue.name}</Typography>
      </Breadcrumbs>
      
      {/* Back Button */}
      <Button 
        startIcon={<BackIcon />} 
        variant="text" 
        component={RouterLink}
        to="/marketplace/showcase"
        sx={{ mb: 2 }}
      >
        Back to Showcase
      </Button>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Images and Description */}
        <Grid item xs={12} md={8}>
          {/* Main Image */}
          <Paper 
            sx={{ 
              height: 400, 
              overflow: 'hidden', 
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => openGallery(0)}
          >
            <Box 
              component="img"
              src={allImages[0] || '/images/placeholder-venue-large.jpg'}
              alt={venue.name}
              sx={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            {allImages.length > 1 && (
              <Button
                variant="contained"
                startIcon={<GalleryIcon />}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryOpen(true);
                }}
              >
                View All Photos ({allImages.length})
              </Button>
            )}
          </Paper>
          
          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                {allImages.slice(0, 4).map((img, index) => (
                  <Grid item key={index} xs={3}>
                    <Paper 
                      sx={{ 
                        height: 80, 
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: index === 0 ? '2px solid' : 'none',
                        borderColor: 'primary.main'
                      }}
                      onClick={() => openGallery(index)}
                    >
                      <Box 
                        component="img"
                        src={img || '/images/placeholder-venue.jpg'}
                        alt={`${venue.name} - Image ${index + 1}`}
                        sx={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Paper>
                  </Grid>
                ))}
                
                {allImages.length > 4 && (
                  <Grid item xs={3}>
                    <Paper 
                      sx={{ 
                        height: 80, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white'
                      }}
                      onClick={() => setGalleryOpen(true)}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        +{allImages.length - 4} more
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          
          {/* Tabs for Details/Description */}
          <Box sx={{ width: '100%', mt: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="venue details tabs"
              >
                <Tab label="Overview" />
                <Tab label="Amenities" />
                <Tab label="Layouts" />
                {venue.virtual_tour_available && (
                  <Tab label="Virtual Tour" />
                )}
              </Tabs>
            </Box>
            
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box sx={{ py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  About this Venue
                </Typography>
                <Typography variant="body1" paragraph>
                  {venue.showcase_description || venue.description || 'No detailed description available for this venue.'}
                </Typography>
                
                {/* Location Information */}
                {venue.location && (venue.location.city || venue.location.state || venue.location.country) && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Location
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                      <LocationIcon color="action" sx={{ mt: 0.5, mr: 1 }} />
                      <Box>
                        <Typography variant="body1">
                          {[venue.location.city, venue.location.state, venue.location.country].filter(Boolean).join(', ')}
                        </Typography>
                        {venue.address && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {venue.address}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {/* Capacity Information */}
                {venue.capacity && (venue.capacity.max || venue.capacity.recommended) && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Capacity
                    </Typography>
                    <Grid container spacing={2}>
                      {venue.capacity.max && (
                        <Grid item xs={6} sm={4}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {venue.capacity.max}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Maximum Capacity
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                      
                      {venue.capacity.recommended && (
                        <Grid item xs={6} sm={4}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {venue.capacity.recommended}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Recommended Capacity
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
                
                {/* Dimensions */}
                {venue.dimensions && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Dimensions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Floor Space
                          </Typography>
                          <Typography variant="body1">
                            {venue.dimensions.width} × {venue.dimensions.length} {venue.dimensions.unit}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      {venue.dimensions.height && (
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Ceiling Height
                            </Typography>
                            <Typography variant="body1">
                              {venue.dimensions.height} {venue.dimensions.unit}
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
                
                {/* Tags */}
                {venue.showcase_tags && venue.showcase_tags.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {venue.showcase_tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          icon={<TagIcon />}
                          component={RouterLink}
                          to={`/marketplace/showcase/search?tags=${encodeURIComponent(tag)}`}
                          clickable
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Amenities Tab */}
            {activeTab === 1 && (
              <Box sx={{ py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Venue Amenities
                </Typography>
                
                {venue.amenities && venue.amenities.length > 0 ? (
                  <Grid container spacing={2}>
                    {venue.amenities.map((amenity, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={amenity} />
                        </ListItem>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No amenities information available for this venue.
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Layouts Tab */}
            {activeTab === 2 && (
              <Box sx={{ py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Available Layouts
                </Typography>
                
                {venue.layout_count && venue.layout_count > 0 ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Alert severity="info">
                        This venue has {venue.layout_count} saved layouts. Sign in to view and customize them for your events.
                      </Alert>
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        component={RouterLink}
                        to={`/layouts?venueId=${venue.id}`}
                        startIcon={<EventIcon />}
                      >
                        Browse Layouts
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No layouts have been created for this venue yet. Be the first to design a layout!
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Virtual Tour Tab */}
            {activeTab === 3 && venue.virtual_tour_available && (
              <Box sx={{ py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Virtual Experience
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image="/images/ar-preview.jpg"
                        alt="AR Preview"
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Augmented Reality
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          See how this venue would look in your space using augmented reality on your mobile device.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          component={RouterLink}
                          to={`/ar-viewer?venueId=${venue.id}`}
                          startIcon={<ViewInArIcon />}
                          fullWidth
                        >
                          View in AR
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image="/images/virtual-tour-preview.jpg"
                        alt="Virtual Tour Preview"
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Virtual Walkthrough
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Take a virtual walkthrough of this venue to get a feel for the space and layout.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          component={RouterLink}
                          to={`/virtual-walkthrough?venueId=${venue.id}`}
                          startIcon={<ViewInArIcon />}
                          fullWidth
                        >
                          Start Walkthrough
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Grid>
        
        {/* Right Column - Key Info and Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h1">
                {venue.name}
              </Typography>
              
              <IconButton
                color={isFavorite ? 'primary' : 'default'}
                onClick={toggleFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            
            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating 
                value={venue.average_rating || 0} 
                readOnly 
                precision={0.5} 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({venue.average_rating?.toFixed(1) || '0.0'})
              </Typography>
            </Box>
            
            {/* Owner */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Owned by {venue.owner_name || 'Anonymous Owner'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Quick Info */}
            <List dense>
              {/* Location */}
              {venue.location && (venue.location.city || venue.location.state || venue.location.country) && (
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LocationIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={[venue.location.city, venue.location.state, venue.location.country].filter(Boolean).join(', ')} 
                  />
                </ListItem>
              )}
              
              {/* Capacity */}
              {venue.capacity && venue.capacity.max && (
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PeopleIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Capacity: Up to ${venue.capacity.max} people`} 
                  />
                </ListItem>
              )}
              
              {/* Layouts */}
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EventIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${venue.layout_count || 0} Available Layouts`} 
                />
              </ListItem>
              
              {/* Virtual Tour */}
              {venue.virtual_tour_available && (
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ViewInArIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Virtual Tour Available" 
                  />
                </ListItem>
              )}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                fullWidth
                component={RouterLink}
                to={`/layouts/new?venueId=${venue.id}`}
                startIcon={<EventIcon />}
              >
                Create Event Layout
              </Button>
              
              {venue.virtual_tour_available && (
                <Button 
                  variant="outlined" 
                  fullWidth
                  component={RouterLink}
                  to={`/virtual-walkthrough?venueId=${venue.id}`}
                  startIcon={<ViewInArIcon />}
                >
                  Virtual Walkthrough
                </Button>
              )}
              
              <Button 
                variant="outlined" 
                fullWidth
                startIcon={<ShareIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // Would show a notification here in a full implementation
                  alert('Link copied to clipboard');
                }}
              >
                Share Venue
              </Button>
            </Box>
          </Paper>
          
          {/* Similar Venues Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Similar Venues
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Coming soon! We'll show similar venues based on size, location, and amenities.
            </Typography>
            
            <Button 
              variant="text" 
              component={RouterLink}
              to="/marketplace/showcase"
              endIcon={<NavigateNextIcon />}
              sx={{ mt: 1 }}
            >
              Browse All Venues
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Full-screen Gallery Dialog */}
      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setGalleryOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ position: 'relative', p: 0, height: '70vh' }}>
          {allImages.length > 0 && (
            <Box
              component="img"
              src={allImages[currentImageIndex] || '/images/placeholder-venue-large.jpg'}
              alt={`${venue.name} - Image ${currentImageIndex + 1}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          )}
          
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: 16,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
            onClick={() => navigateGallery('prev')}
          >
            <PrevIcon />
          </IconButton>
          
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              right: 16,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
            onClick={() => navigateGallery('next')}
          >
            <NextIcon />
          </IconButton>
          
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 1
            }}
          >
            <Typography variant="body2">
              {currentImageIndex + 1} / {allImages.length}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default VenueDetails; 
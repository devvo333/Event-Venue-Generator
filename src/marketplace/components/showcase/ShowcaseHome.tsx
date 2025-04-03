import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Paper,
  Tabs,
  Tab,
  Chip,
  Rating,
  Link,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CorporateFare as VenueIcon,
  Category as CategoryIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ViewInAr as ViewInArIcon,
  Event as EventIcon
} from '@mui/icons-material';

import VenueShowcaseService, { ShowcaseVenue, VenueShowcaseFilterOptions } from '../../services/venueShowcaseService';

// Featured venue card component
const FeaturedVenueCard: React.FC<{ venue: ShowcaseVenue }> = ({ venue }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {venue.showcase_featured && (
        <Chip 
          label="Featured" 
          color="secondary" 
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 2,
            fontWeight: 'bold'
          }} 
        />
      )}
      <CardMedia
        component="img"
        height="180"
        image={venue.cover_image || venue.showcase_images?.[0] || '/images/placeholder-venue.jpg'}
        alt={venue.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {venue.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {(venue.showcase_description || venue.description || '').length > 100 
            ? `${(venue.showcase_description || venue.description || '').substring(0, 100)}...` 
            : (venue.showcase_description || venue.description || 'No description available')}
        </Typography>
        
        {venue.location && (venue.location.city || venue.location.state || venue.location.country) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {[venue.location.city, venue.location.state, venue.location.country].filter(Boolean).join(', ')}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            By {venue.owner_name || 'Anonymous Owner'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={venue.average_rating || 0} 
            readOnly 
            size="small" 
            precision={0.5} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({venue.layout_count || 0} layouts)
          </Typography>
        </Box>
        
        {venue.showcase_tags && venue.showcase_tags.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {venue.showcase_tags.slice(0, 3).map(tag => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {venue.showcase_tags.length > 3 && (
              <Chip
                label={`+${venue.showcase_tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          {venue.capacity && venue.capacity.max && (
            <Typography variant="body2" component="div" color="primary">
              Up to {venue.capacity.max} people
            </Typography>
          )}
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<VenueIcon />}
            component={RouterLink}
            to={`/marketplace/showcase/venue/${venue.id}`}
          >
            Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Category card component
const CategoryCard: React.FC<{ tag: string; count: number }> = ({ tag, count }) => {
  return (
    <Card 
      component={RouterLink} 
      to={`/marketplace/showcase/search?tags=${encodeURIComponent(tag)}`}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        textDecoration: 'none',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3,
          bgcolor: 'primary.light',
          color: 'white'
        }}
      >
        <CategoryIcon fontSize="large" />
      </Box>
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Typography gutterBottom variant="h6" component="div">
          {tag}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count} venues
        </Typography>
      </CardContent>
    </Card>
  );
};

const ShowcaseHome: React.FC = () => {
  const [featuredVenues, setFeaturedVenues] = useState<ShowcaseVenue[]>([]);
  const [popularTags, setPopularTags] = useState<{tag: string, count: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [venuesTotal, setVenuesTotal] = useState<number>(0);

  // Fetch data on component mount
  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        setLoading(true);
        // Get featured venues
        const venues = await VenueShowcaseService.getFeaturedVenues();
        setFeaturedVenues(venues);
        
        // Get popular tags
        const tags = await VenueShowcaseService.getPopularTags();
        setPopularTags(tags);
        
        // Get total venues count
        const { total } = await VenueShowcaseService.searchVenues({});
        setVenuesTotal(total);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching showcase data:', err);
        setError('Failed to load venue showcase data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchShowcaseData();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // Navigate to search results page with query
    window.location.href = `/marketplace/showcase/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item key={item} xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={180} />
            <CardContent>
              <Skeleton variant="text" height={30} width="80%" />
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={20} width="60%" />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" height={24} width={60} />
                <Skeleton variant="rectangular" height={24} width={60} />
                <Skeleton variant="rectangular" height={24} width={60} />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="text" height={24} width="40%" />
                <Skeleton variant="rectangular" height={36} width={100} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Showcase Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Venue Showcase
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Explore our collection of {venuesTotal}+ stunning venues for events and gatherings
        </Typography>
        
        {/* Search Bar */}
        <Box 
          component="form"
          onSubmit={handleSearch}
          sx={{ 
            display: 'flex', 
            maxWidth: 600, 
            mx: 'auto', 
            mt: 3
          }}
        >
          <TextField
            fullWidth
            placeholder="Search venues by name, location, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ ml: 1 }}
          >
            Search
          </Button>
        </Box>
      </Box>
      
      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Featured Venues" icon={<StarIcon />} iconPosition="start" />
          <Tab label="Categories" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="AR/VR Ready" icon={<ViewInArIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Featured Venues Tab */}
      {activeTab === 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            Featured Venues
          </Typography>
          
          {loading ? (
            renderSkeletons()
          ) : featuredVenues.length > 0 ? (
            <Grid container spacing={3}>
              {featuredVenues.map((venue) => (
                <Grid item key={venue.id} xs={12} sm={6} md={4}>
                  <FeaturedVenueCard venue={venue} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No featured venues available at the moment.
              </Typography>
            </Paper>
          )}
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/marketplace/showcase/browse"
              endIcon={<VenueIcon />}
            >
              Browse All Venues
            </Button>
          </Box>
        </>
      )}
      
      {/* Categories Tab */}
      {activeTab === 1 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            Venue Categories
          </Typography>
          
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Grid item key={item} xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <Skeleton variant="rectangular" height={120} />
                    <CardContent>
                      <Skeleton variant="text" height={30} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : popularTags.length > 0 ? (
            <Grid container spacing={3}>
              {popularTags.map((tag) => (
                <Grid item key={tag.tag} xs={12} sm={6} md={3}>
                  <CategoryCard tag={tag.tag} count={tag.count} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No venue categories available at the moment.
              </Typography>
            </Paper>
          )}
        </>
      )}
      
      {/* AR/VR Ready Tab */}
      {activeTab === 2 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            AR/VR Ready Venues
          </Typography>
          
          {loading ? (
            renderSkeletons()
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Immersive Experience
                  </Typography>
                  <Typography variant="body2" paragraph>
                    These venues offer AR/VR experiences so you can virtually explore the space before booking. 
                    Experience the venue in augmented reality or take a virtual walkthrough to get a feel for 
                    the space and dimensions.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      component={RouterLink}
                      to="/ar-demo"
                      startIcon={<ViewInArIcon />}
                      size="small"
                    >
                      Try AR Demo
                    </Button>
                    <Button 
                      variant="outlined" 
                      component={RouterLink}
                      to="/virtual-walkthrough"
                      startIcon={<EventIcon />}
                      size="small"
                    >
                      Sample Walkthrough
                    </Button>
                  </Box>
                </Paper>
              </Box>
              
              <Grid container spacing={3}>
                {featuredVenues
                  .filter(venue => venue.virtual_tour_available)
                  .map((venue) => (
                    <Grid item key={venue.id} xs={12} sm={6} md={4}>
                      <FeaturedVenueCard venue={venue} />
                    </Grid>
                  ))}
                
                {featuredVenues.filter(venue => venue.virtual_tour_available).length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No AR/VR ready venues available at the moment.
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  component={RouterLink}
                  to="/marketplace/showcase/search?hasVirtualTour=true"
                  endIcon={<ViewInArIcon />}
                >
                  View All AR/VR Venues
                </Button>
              </Box>
            </>
          )}
        </>
      )}
      
      {/* Showcase Info */}
      <Box sx={{ mt: 6 }}>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              About the Venue Showcase
            </Typography>
            <Typography variant="body2" paragraph>
              Our Venue Showcase is a curated collection of exceptional event spaces from around the world. 
              Browse through different venue types, locations, and capacities to find the perfect setting for your next event.
            </Typography>
            <Typography variant="body2" paragraph>
              Each showcase venue includes detailed information, virtual tours, and capacity specifications to help you make 
              informed decisions without the need for in-person visits.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              For Venue Owners
            </Typography>
            <Typography variant="body2" paragraph>
              Are you a venue owner? Showcase your venue to thousands of event planners and clients. 
              Our platform provides powerful tools for venue presentation, virtual tours, and detailed specifications.
            </Typography>
            <Button 
              variant="outlined" 
              component={RouterLink}
              to="/venues"
              sx={{ mt: 1 }}
            >
              Showcase Your Venue
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ShowcaseHome; 
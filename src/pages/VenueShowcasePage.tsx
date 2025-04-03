import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  Category as CategoryIcon,
  ViewInAr as ViewInArIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  People as PeopleIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';

import { venueShowcaseService, ShowcaseVenue } from '../marketplace/services/venueShowcaseService';

const VenueShowcasePage: React.FC = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<ShowcaseVenue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<ShowcaseVenue[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [popularTags, setPopularTags] = useState<{tag: string, count: number}[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get featured venues
        const featuredVenues = await venueShowcaseService.getFeaturedVenues();
        setVenues(featuredVenues);
        setFilteredVenues(featuredVenues);
        
        // Get popular tags
        const tags = await venueShowcaseService.getPopularTags();
        setPopularTags(tags);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching venue showcase data:', err);
        setError('Failed to load venue showcase data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter venues based on search and selected filters
  useEffect(() => {
    const filterVenues = async () => {
      try {
        setLoading(true);
        const { venues: filtered } = await venueShowcaseService.searchVenues({
          searchQuery,
          eventTypes: selectedEventTypes,
          amenities: selectedAmenities,
          priceRange: selectedPriceRange,
        });
        setFilteredVenues(filtered);
        setLoading(false);
      } catch (err) {
        console.error('Error filtering venues:', err);
        setError('Failed to filter venues. Please try again later.');
        setLoading(false);
      }
    };
    
    filterVenues();
  }, [searchQuery, selectedEventTypes, selectedAmenities, selectedPriceRange]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // The search is handled by the useEffect above
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleVenueClick = (venueId: string) => {
    navigate(`/marketplace/venues/${venueId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

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
      {/* Venue Showcase Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Venue Showcase
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Discover and explore venues for your next event
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
      
      {/* Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              multiple
              options={popularTags.map(tag => tag.tag)}
              value={selectedEventTypes}
              onChange={(event, newValue) => setSelectedEventTypes(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Event Types"
                  placeholder="Select event types"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <EventIcon sx={{ mr: 1 }} />
                  {option}
                </li>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              multiple
              options={['WiFi', 'Parking', 'Catering', 'AV Equipment', 'Wheelchair Access']}
              value={selectedAmenities}
              onChange={(event, newValue) => setSelectedAmenities(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Amenities"
                  placeholder="Select amenities"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <LocalOfferIcon sx={{ mr: 1 }} />
                  {option}
                </li>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={['$', '$$', '$$$', '$$$$']}
              value={selectedPriceRange}
              onChange={(event, newValue) => setSelectedPriceRange(newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Price Range"
                  placeholder="Select price range"
                />
              )}
            />
          </Grid>
        </Grid>
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
          <Grid container spacing={3}>
            {filteredVenues.length > 0 ? (
              filteredVenues.map((venue) => (
                <Grid item key={venue.id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleVenueClick(venue.id)}
                  >
                    {venue.cover_image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={venue.cover_image}
                        alt={venue.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {venue.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {venue.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {venue.location?.city}, {venue.location?.state}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Capacity: {venue.capacity?.max} people
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
                      
                      <Box sx={{ mt: 2 }}>
                        {venue.showcase_tags?.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No venues found matching your criteria.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
      
      {/* Categories Tab */}
      {activeTab === 1 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            Venue Categories
          </Typography>
          <Grid container spacing={3}>
            {popularTags.length > 0 ? (
              popularTags.map((tag) => (
                <Grid item key={tag.tag} xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => {
                      setSelectedEventTypes([tag.tag]);
                      setActiveTab(0);
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
                        {tag.tag}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tag.count} venues
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No venue categories available at the moment.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
      
      {/* AR/VR Ready Tab */}
      {activeTab === 2 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            AR/VR Ready Venues
          </Typography>
          <Grid container spacing={3}>
            {filteredVenues.filter(venue => venue.virtual_tour_available).length > 0 ? (
              filteredVenues
                .filter(venue => venue.virtual_tour_available)
                .map((venue) => (
                  <Grid item key={venue.id} xs={12} sm={6} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                      onClick={() => handleVenueClick(venue.id)}
                    >
                      {venue.cover_image && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={venue.cover_image}
                          alt={venue.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {venue.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {venue.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {venue.location?.city}, {venue.location?.state}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Capacity: {venue.capacity?.max} people
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
                        
                        <Box sx={{ mt: 2 }}>
                          {venue.showcase_tags?.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No AR/VR ready venues available at the moment.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
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
              component={Link}
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

export default VenueShowcasePage; 
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Chip, Rating, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  priceRange: string;
  rating: number;
  imageUrl: string;
  amenities: string[];
  eventTypes: string[];
}

interface VenueShowcaseProps {
  venues?: Venue[];
  onVenueSelect?: (venue: Venue) => void;
}

const VenueShowcase: React.FC<VenueShowcaseProps> = ({ venues = [], onVenueSelect }) => {
  const navigate = useNavigate();
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(venues);
  const [selectedFilters, setSelectedFilters] = useState<{
    eventType: string[];
    amenities: string[];
    priceRange: string[];
  }>({
    eventType: [],
    amenities: [],
    priceRange: [],
  });

  const handleVenueClick = (venue: Venue) => {
    if (onVenueSelect) {
      onVenueSelect(venue);
    } else {
      navigate(`/marketplace/venues/${venue.id}`);
    }
  };

  return (
    <Grid container spacing={3}>
      {filteredVenues.map((venue) => (
        <Grid item xs={12} sm={6} md={4} key={venue.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
            onClick={() => handleVenueClick(venue)}
          >
            <CardMedia
              component="img"
              height="200"
              image={venue.imageUrl}
              alt={venue.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="div">
                {venue.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {venue.location}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={venue.rating} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({venue.rating})
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Capacity: {venue.capacity} guests
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {venue.eventTypes.slice(0, 3).map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default VenueShowcase; 
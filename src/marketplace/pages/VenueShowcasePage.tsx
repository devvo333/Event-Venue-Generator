import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Autocomplete, Chip } from '@mui/material';
import VenueShowcase from '../components/VenueShowcase';
import { fetchVenues, filterVenues } from '../services/venueService';
import { Venue } from '../types/venue';

const VenueShowcasePage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await fetchVenues();
        setVenues(data);
        setFilteredVenues(data);
      } catch (err) {
        setError('Failed to load venues. Please try again later.');
        console.error('Error loading venues:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, []);

  useEffect(() => {
    const filtered = filterVenues(venues, {
      eventType: selectedEventTypes,
      amenities: selectedAmenities,
      priceRange: selectedPriceRanges,
      searchQuery,
    });
    setFilteredVenues(filtered);
  }, [venues, selectedEventTypes, selectedAmenities, selectedPriceRanges, searchQuery]);

  if (loading) {
    return (
      <Container>
        <Typography>Loading venues...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Venue Showcase
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Search venues"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Autocomplete
              multiple
              options={Array.from(new Set(venues.flatMap(v => v.eventTypes)))}
              value={selectedEventTypes}
              onChange={(_, newValue) => setSelectedEventTypes(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Event Types" />
              )}
              sx={{ minWidth: 200 }}
            />
            
            <Autocomplete
              multiple
              options={Array.from(new Set(venues.flatMap(v => v.amenities)))}
              value={selectedAmenities}
              onChange={(_, newValue) => setSelectedAmenities(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Amenities" />
              )}
              sx={{ minWidth: 200 }}
            />
            
            <Autocomplete
              multiple
              options={Array.from(new Set(venues.map(v => v.priceRange)))}
              value={selectedPriceRanges}
              onChange={(_, newValue) => setSelectedPriceRanges(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Price Range" />
              )}
              sx={{ minWidth: 200 }}
            />
          </Box>
        </Box>

        <VenueShowcase venues={filteredVenues} />
      </Box>
    </Container>
  );
};

export default VenueShowcasePage; 
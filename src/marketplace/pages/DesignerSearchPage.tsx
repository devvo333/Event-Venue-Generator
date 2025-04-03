import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    TextField,
    Box,
    Typography,
    Autocomplete,
    Slider,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { DesignerCard } from '../components/DesignerCard';
import { designerService } from '../services/designerService';
import { DesignerProfile, DesignerSearchFilters } from '../types/designer';

const specialties = [
    'Weddings',
    'Corporate Events',
    'Birthdays',
    'Conferences',
    'Trade Shows',
    'Social Gatherings',
    'Virtual Events',
    'Outdoor Events'
];

const eventTypes = [
    'Formal',
    'Casual',
    'Business',
    'Social',
    'Educational',
    'Entertainment',
    'Networking',
    'Celebration'
];

export const DesignerSearchPage: React.FC = () => {
    const [designers, setDesigners] = useState<DesignerProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DesignerSearchFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const searchDesigners = async () => {
            setLoading(true);
            setError(null);
            try {
                const results = await designerService.searchDesigners({
                    ...filters,
                    searchQuery: searchQuery || undefined
                });
                setDesigners(results);
            } catch (err) {
                setError('Failed to load designers. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchDesigners, 500);
        return () => clearTimeout(debounceTimer);
    }, [filters, searchQuery]);

    const handleSpecialtiesChange = (_: any, value: string[]) => {
        setFilters(prev => ({ ...prev, specialties: value }));
    };

    const handleEventTypesChange = (_: any, value: string[]) => {
        setFilters(prev => ({ ...prev, eventTypes: value }));
    };

    const handleRatingChange = (_: any, value: number | number[]) => {
        setFilters(prev => ({ ...prev, minRating: value as number }));
    };

    const handleExperienceChange = (_: any, value: number | number[]) => {
        setFilters(prev => ({ ...prev, minExperience: value as number }));
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Find Event Designers
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
                Browse our curated selection of professional event designers and find the perfect match for your event.
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search designers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            multiple
                            options={specialties}
                            value={filters.specialties || []}
                            onChange={handleSpecialtiesChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Specialties"
                                    placeholder="Select specialties"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            multiple
                            options={eventTypes}
                            value={filters.eventTypes || []}
                            onChange={handleEventTypesChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Event Types"
                                    placeholder="Select event types"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ px: 2 }}>
                            <Typography gutterBottom>Minimum Rating</Typography>
                            <Slider
                                value={filters.minRating || 0}
                                onChange={handleRatingChange}
                                step={0.5}
                                marks
                                min={0}
                                max={5}
                                valueLabelDisplay="auto"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ px: 2 }}>
                            <Typography gutterBottom>Minimum Experience (Years)</Typography>
                            <Slider
                                value={filters.minExperience || 0}
                                onChange={handleExperienceChange}
                                step={1}
                                marks
                                min={0}
                                max={20}
                                valueLabelDisplay="auto"
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : designers.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center">
                    No designers found matching your criteria.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {designers.map((designer) => (
                        <Grid item key={designer.id} xs={12} sm={6} md={4}>
                            <DesignerCard designer={designer} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}; 
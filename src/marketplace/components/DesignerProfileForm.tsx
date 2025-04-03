import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    Paper,
    Autocomplete,
    FormHelperText,
    Alert
} from '@mui/material';
import { DesignerProfile, DesignerService, PortfolioItem } from '../types/designer';
import { designerService } from '../services/designerService';

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

interface DesignerProfileFormProps {
    initialData?: DesignerProfile;
    onSubmit: (data: Partial<DesignerProfile>) => Promise<void>;
}

export const DesignerProfileForm: React.FC<DesignerProfileFormProps> = ({
    initialData,
    onSubmit
}) => {
    const [formData, setFormData] = useState<Partial<DesignerProfile>>(initialData || {});
    const [services, setServices] = useState<DesignerService[]>([]);
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // Load services and portfolio items if they exist
            if ('services' in initialData) {
                setServices((initialData as any).services || []);
            }
            if ('portfolioItems' in initialData) {
                setPortfolioItems((initialData as any).portfolioItems || []);
            }
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceChange = (index: number, field: keyof DesignerService, value: string | number) => {
        const updatedServices = [...services];
        updatedServices[index] = {
            ...updatedServices[index],
            [field]: value
        };
        setServices(updatedServices);
    };

    const handlePortfolioItemChange = (index: number, field: keyof PortfolioItem, value: string) => {
        const updatedItems = [...portfolioItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };
        setPortfolioItems(updatedItems);
    };

    const addService = () => {
        setServices([...services, {
            id: '',
            designerId: formData.id || '',
            title: '',
            description: '',
            price: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }]);
    };

    const addPortfolioItem = () => {
        setPortfolioItems([...portfolioItems, {
            id: '',
            designerId: formData.id || '',
            title: '',
            description: '',
            imageUrls: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }]);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ py: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Display Name"
                            value={formData.displayName || ''}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Location"
                            value={formData.location || ''}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Bio"
                            multiline
                            rows={4}
                            value={formData.bio || ''}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            multiple
                            options={specialties}
                            value={formData.specialties || []}
                            onChange={(_, value) => setFormData({ ...formData, specialties: value })}
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
                            value={formData.eventTypes || []}
                            onChange={(_, value) => setFormData({ ...formData, eventTypes: value })}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Event Types"
                                    placeholder="Select event types"
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Services
                </Typography>
                {services.map((service, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Service Title"
                                    value={service.title}
                                    onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Price"
                                    type="number"
                                    value={service.price}
                                    onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={2}
                                    value={service.description}
                                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Box>
                ))}
                <Button variant="outlined" onClick={addService} sx={{ mt: 2 }}>
                    Add Service
                </Button>
            </Paper>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Portfolio Items
                </Typography>
                {portfolioItems.map((item, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    value={item.title}
                                    onChange={(e) => handlePortfolioItemChange(index, 'title', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={3}
                                    value={item.description}
                                    onChange={(e) => handlePortfolioItemChange(index, 'description', e.target.value)}
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Box>
                ))}
                <Button variant="outlined" onClick={addPortfolioItem} sx={{ mt: 2 }}>
                    Add Portfolio Item
                </Button>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Profile'}
                </Button>
            </Box>
        </Box>
    );
}; 
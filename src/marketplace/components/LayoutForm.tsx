import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Autocomplete,
  Chip,
  Alert,
} from '@mui/material';
import { Layout, UserGeneratedLayout } from '../../types/layout';

interface LayoutFormProps {
  initialData?: UserGeneratedLayout;
  onSubmit: (layout: Omit<UserGeneratedLayout, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const venueTypes = ['Ballroom', 'Conference Room', 'Outdoor', 'Theater', 'Restaurant'];
const eventTypes = ['Wedding', 'Conference', 'Party', 'Meeting', 'Exhibition'];

const LayoutForm: React.FC<LayoutFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<UserGeneratedLayout, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    previewUrl: initialData?.previewUrl || '',
    assets: initialData?.assets || [],
    metadata: {
      venueType: initialData?.metadata.venueType || '',
      eventType: initialData?.metadata.eventType || '',
      capacity: initialData?.metadata.capacity || 0,
      dimensions: {
        width: initialData?.metadata.dimensions.width || 0,
        height: initialData?.metadata.dimensions.height || 0,
        unit: initialData?.metadata.dimensions.unit || 'meters',
      },
    },
    isTemplate: false,
    author: initialData?.author || null,
    isPublic: initialData?.isPublic || false,
    likes: initialData?.likes || 0,
    downloads: initialData?.downloads || 0,
  });

  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: type === 'number' ? Number(value) : value,
      },
    }));
  };

  const handleDimensionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        dimensions: {
          ...prev.metadata.dimensions,
          [name]: Number(value),
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    if (!formData.metadata.venueType || !formData.metadata.eventType) {
      setError('Venue type and event type are required');
      return;
    }

    if (formData.metadata.capacity <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }

    if (formData.metadata.dimensions.width <= 0 || formData.metadata.dimensions.height <= 0) {
      setError('Dimensions must be greater than 0');
      return;
    }

    onSubmit({
      ...formData,
      tags,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Venue Type</InputLabel>
            <Select
              name="venueType"
              value={formData.metadata.venueType}
              label="Venue Type"
              onChange={handleMetadataChange}
            >
              {venueTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Event Type</InputLabel>
            <Select
              name="eventType"
              value={formData.metadata.eventType}
              label="Event Type"
              onChange={handleMetadataChange}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Capacity"
            name="capacity"
            value={formData.metadata.capacity}
            onChange={handleMetadataChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select
              name="unit"
              value={formData.metadata.dimensions.unit}
              label="Unit"
              onChange={handleDimensionsChange}
            >
              <MenuItem value="meters">Meters</MenuItem>
              <MenuItem value="feet">Feet</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Width"
            name="width"
            value={formData.metadata.dimensions.width}
            onChange={handleDimensionsChange}
            InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Height"
            name="height"
            value={formData.metadata.dimensions.height}
            onChange={handleDimensionsChange}
            InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
                }
              />
            }
            label="Make this layout public"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained">
              {initialData ? 'Update Layout' : 'Create Layout'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LayoutForm; 
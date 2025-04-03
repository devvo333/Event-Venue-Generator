import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  Download,
  Share,
  Visibility,
} from '@mui/icons-material';
import { LayoutTemplate } from '../../types/layout';

interface LayoutTemplatesProps {
  templates: LayoutTemplate[];
  onUseTemplate: (template: LayoutTemplate) => void;
  onLike: (templateId: string) => void;
  onShare: (templateId: string) => void;
}

const LayoutTemplates: React.FC<LayoutTemplatesProps> = ({
  templates,
  onUseTemplate,
  onLike,
  onShare,
}) => {
  const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set());

  const handleLike = (templateId: string) => {
    setLikedTemplates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
    onLike(templateId);
  };

  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} key={template.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={template.thumbnailUrl}
              alt={template.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div">
                {template.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {template.description}
              </Typography>
              <Box sx={{ mb: 2 }}>
                {template.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Capacity: {template.metadata.capacity} people
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dimensions: {template.metadata.dimensions.width}x
                {template.metadata.dimensions.height}{' '}
                {template.metadata.dimensions.unit}
              </Typography>
            </CardContent>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Tooltip title="Like">
                  <IconButton
                    onClick={() => handleLike(template.id)}
                    color={likedTemplates.has(template.id) ? 'primary' : 'default'}
                  >
                    <Favorite />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton onClick={() => onShare(template.id)}>
                    <Share />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Preview">
                  <IconButton>
                    <Visibility />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button
                variant="contained"
                onClick={() => onUseTemplate(template)}
                startIcon={<Download />}
              >
                Use Template
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default LayoutTemplates; 
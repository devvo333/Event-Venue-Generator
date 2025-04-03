import React, { useState } from 'react';
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
  Avatar,
} from '@mui/material';
import {
  Favorite,
  Download,
  Share,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';
import { UserGeneratedLayout } from '../../types/layout';

interface UserGeneratedLayoutsProps {
  layouts: UserGeneratedLayout[];
  isOwner?: boolean;
  onUseLayout: (layout: UserGeneratedLayout) => void;
  onLike: (layoutId: string) => void;
  onShare: (layoutId: string) => void;
  onEdit?: (layout: UserGeneratedLayout) => void;
  onDelete?: (layoutId: string) => void;
}

const UserGeneratedLayouts: React.FC<UserGeneratedLayoutsProps> = ({
  layouts,
  isOwner = false,
  onUseLayout,
  onLike,
  onShare,
  onEdit,
  onDelete,
}) => {
  const [likedLayouts, setLikedLayouts] = useState<Set<string>>(new Set());

  const handleLike = (layoutId: string) => {
    setLikedLayouts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layoutId)) {
        newSet.delete(layoutId);
      } else {
        newSet.add(layoutId);
      }
      return newSet;
    });
    onLike(layoutId);
  };

  return (
    <Grid container spacing={3}>
      {layouts.map((layout) => (
        <Grid item xs={12} sm={6} md={4} key={layout.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={layout.thumbnailUrl}
              alt={layout.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={layout.author.avatarUrl}
                  alt={layout.author.name}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
                <Typography variant="subtitle2" color="text.secondary">
                  {layout.author.name}
                </Typography>
              </Box>
              <Typography gutterBottom variant="h6" component="div">
                {layout.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {layout.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity: {layout.metadata.capacity} people
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dimensions: {layout.metadata.dimensions.width}x
                {layout.metadata.dimensions.height}{' '}
                {layout.metadata.dimensions.unit}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Chip
                  label={`${layout.likes} Likes`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`${layout.downloads} Downloads`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </CardContent>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Tooltip title="Like">
                  <IconButton
                    onClick={() => handleLike(layout.id)}
                    color={likedLayouts.has(layout.id) ? 'primary' : 'default'}
                  >
                    <Favorite />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton onClick={() => onShare(layout.id)}>
                    <Share />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Preview">
                  <IconButton>
                    <Visibility />
                  </IconButton>
                </Tooltip>
                {isOwner && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => onEdit?.(layout)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => onDelete?.(layout.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={() => onUseLayout(layout)}
                startIcon={<Download />}
              >
                Use Layout
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default UserGeneratedLayouts; 
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Grid,
  Chip,
  Rating,
  Tabs,
  Tab,
} from '@mui/material';
import { Close, Favorite, Share, Download } from '@mui/icons-material';
import { Layout } from '../../types/layout';
import LayoutReviews from './LayoutReviews';
import { User } from '../../types/user';

interface LayoutPreviewProps {
  layout: Layout;
  open: boolean;
  onClose: () => void;
  onLike: () => void;
  onShare: () => void;
  onDownload?: () => void;
  currentUser: User | null;
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  layout,
  open,
  onClose,
  onLike,
  onShare,
  onDownload,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">{layout.title}</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Details" />
          <Tab label="Reviews" />
        </Tabs>

        {activeTab === 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box
                component="img"
                src={layout.previewUrl}
                alt={layout.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {layout.description}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Capacity
                    </Typography>
                    <Typography variant="body1">
                      {layout.metadata.capacity} people
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Dimensions
                    </Typography>
                    <Typography variant="body1">
                      {layout.metadata.dimensions.width}x{layout.metadata.dimensions.height}{' '}
                      {layout.metadata.dimensions.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Venue Type
                    </Typography>
                    <Typography variant="body1">{layout.metadata.venueType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Event Type
                    </Typography>
                    <Typography variant="body1">{layout.metadata.eventType}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Assets
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {layout.assets.map((asset) => (
                    <Chip
                      key={asset.id}
                      label={asset.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton onClick={onLike} color="primary">
                  <Favorite />
                </IconButton>
                <IconButton onClick={onShare} color="primary">
                  <Share />
                </IconButton>
                {onDownload && (
                  <IconButton onClick={onDownload} color="primary">
                    <Download />
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <LayoutReviews layoutId={layout.id} currentUser={currentUser} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LayoutPreview; 
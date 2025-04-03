import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  Divider,
  Link,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import {
  ViewInAr as ViewInArIcon,
  QrCode as QrCodeIcon,
  ArrowBack as ArrowBackIcon,
  DirectionsWalk as WalkIcon,
  VrpanoRounded as VrIcon
} from '@mui/icons-material';
import QRCodeSharing from './QRCodeSharing';

// Sample venue layouts for the demo
const demoVenues = [
  {
    id: 'demo-wedding-hall',
    name: 'Wedding Hall',
    description: 'A spacious venue perfect for wedding ceremonies and receptions',
    image: '/images/demo/wedding-hall.jpg',
    type: 'Wedding',
    capacity: 200,
    dimensions: '30m x 20m'
  },
  {
    id: 'demo-conference-center',
    name: 'Conference Center',
    description: 'Modern space designed for corporate events and conferences',
    image: '/images/demo/conference-center.jpg',
    type: 'Corporate',
    capacity: 300,
    dimensions: '40m x 25m'
  },
  {
    id: 'demo-concert-venue',
    name: 'Concert Venue',
    description: 'Live music venue with optimized acoustics and staging',
    image: '/images/demo/concert-venue.jpg',
    type: 'Entertainment',
    capacity: 500,
    dimensions: '50m x 30m'
  }
];

const ARDemo: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState<boolean>(false);

  const handleViewInAR = (venueId: string) => {
    navigate(`/ar-viewer/${venueId}`);
  };

  const handleVirtualWalkthrough = (venueId: string) => {
    navigate(`/virtual-walkthrough/${venueId}`);
  };

  const handleVRPreview = (venueId: string) => {
    navigate(`/vr-preview/${venueId}`);
  };

  const handleOpenQrDialog = (venue: any) => {
    setSelectedVenue(venue);
    setQrDialogOpen(true);
  };

  const handleCloseQrDialog = () => {
    setQrDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton 
          onClick={() => navigate(-1)} 
          color="inherit" 
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          AR/VR Experience Demo
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 5 }}>
        <Typography variant="h5" gutterBottom>
          Experience Venues in Augmented & Virtual Reality
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This demo showcases our AR, VR, and virtual walkthrough capabilities. 
          Select a sample venue below to view it in AR on your mobile device, 
          walk through it in your browser, or experience it in virtual reality 
          with a compatible VR headset.
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Divider>
            <Chip label="How It Works" />
          </Divider>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <ViewInArIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Augmented Reality
              </Typography>
              <Typography variant="body2">
                View the venue layouts in AR, with the ability to walk around and 
                see how the venue would look in your real space.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <WalkIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Virtual Walkthrough
              </Typography>
              <Typography variant="body2">
                Take a first-person tour of the venue layout directly in your browser, 
                with the ability to explore every corner of the space.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <VrIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                VR Experience
              </Typography>
              <Typography variant="body2">
                For the most immersive experience, use a VR headset to explore 
                the venue in full virtual reality with intuitive controls.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Sample Venues
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select a venue to experience it in AR, VR, or virtual walkthrough:
      </Typography>
      
      <Grid container spacing={4}>
        {demoVenues.map((venue) => (
          <Grid item xs={12} md={4} key={venue.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={venue.image}
                alt={venue.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = '/images/placeholder-venue.jpg';
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {venue.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {venue.description}
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                  <Chip 
                    label={venue.type} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`Capacity: ${venue.capacity}`} 
                    size="small" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={venue.dimensions} 
                    size="small" 
                    variant="outlined" 
                  />
                </Stack>
              </CardContent>
              
              <Box p={2} pt={0}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ViewInArIcon />}
                      onClick={() => handleViewInAR(venue.id)}
                    >
                      View in AR
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<WalkIcon />}
                      onClick={() => handleVirtualWalkthrough(venue.id)}
                    >
                      Walkthrough
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VrIcon />}
                      onClick={() => handleVRPreview(venue.id)}
                    >
                      VR Preview
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="text"
                      startIcon={<QrCodeIcon />}
                      onClick={() => handleOpenQrDialog(venue)}
                    >
                      Share
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box mt={6} mb={3}>
        <Divider />
      </Box>
      
      <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          About AR/VR Integration
        </Typography>
        <Typography variant="body2" paragraph>
          Our AR/VR integration allows you to experience venue layouts in immersive ways:
        </Typography>
        <Typography component="ul" variant="body2">
          <li>AR Viewer: View venues in your physical space using WebXR on compatible devices</li>
          <li>Virtual Walkthrough: First-person navigation through the venue in your browser</li>
          <li>VR Preview: Immersive virtual reality experience with a compatible headset</li>
          <li>QR code sharing: Easily share any view with clients and team members</li>
        </Typography>
        <Box mt={2}>
          <Button 
            component={RouterLink} 
            to="/dashboard" 
            variant="outlined"
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
      
      {/* QR Code Sharing Dialog */}
      {selectedVenue && (
        <QRCodeSharing
          isOpen={qrDialogOpen}
          onClose={handleCloseQrDialog}
          layoutId={selectedVenue.id}
          layoutName={selectedVenue.name}
          venueName={selectedVenue.name}
        />
      )}
    </Container>
  );
};

export default ARDemo; 
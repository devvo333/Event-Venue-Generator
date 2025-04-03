import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  ShoppingCart as CartIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

import MarketplaceService, { 
  MarketplaceAsset, 
  AssetReview 
} from '../services/marketplaceService';
import { useAuth } from '../../auth/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AssetDetails: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [asset, setAsset] = useState<MarketplaceAsset | null>(null);
  const [reviews, setReviews] = useState<AssetReview[]>([]);
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [purchaseStatus, setPurchaseStatus] = useState<{
    success: boolean;
    message: string;
    show: boolean;
  }>({ success: false, message: '', show: false });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [userOwnsAsset, setUserOwnsAsset] = useState(false);
  
  // Fetch asset data
  useEffect(() => {
    const fetchAssetData = async () => {
      if (!assetId) {
        setError('Asset ID is required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get asset details
        const assetData = await MarketplaceService.getAssetById(assetId);
        if (!assetData) {
          throw new Error('Asset not found');
        }
        setAsset(assetData);
        
        // Get asset reviews
        const reviewsData = await MarketplaceService.getAssetReviews(assetId);
        setReviews(reviewsData);
        
        // Check if user owns this asset
        if (user) {
          const userAssets = await MarketplaceService.getUserPurchases(user.id);
          setUserOwnsAsset(userAssets.some(a => a.id === assetId));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching asset data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the asset');
        setLoading(false);
      }
    };
    
    fetchAssetData();
  }, [assetId, user]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handlePurchase = async () => {
    if (!asset) return;
    
    try {
      const result = await MarketplaceService.purchaseAsset(asset.id);
      
      setPurchaseStatus({
        success: result.success,
        message: result.message,
        show: true
      });
      
      if (result.success) {
        // Update state to reflect the purchase
        setUserOwnsAsset(true);
      }
    } catch (err) {
      setPurchaseStatus({
        success: false,
        message: 'Failed to process purchase. Please try again.',
        show: true
      });
    }
  };
  
  const handleReviewSubmit = async () => {
    if (!asset || !user) return;
    
    try {
      const success = await MarketplaceService.addAssetReview(
        asset.id,
        userReview.rating,
        userReview.comment
      );
      
      if (success) {
        // Reload reviews
        const reviewsData = await MarketplaceService.getAssetReviews(asset.id);
        setReviews(reviewsData);
        
        // Reset form
        setUserReview({ rating: 0, comment: '' });
        
        // Show success message
        setPurchaseStatus({
          success: true,
          message: 'Review submitted successfully!',
          show: true
        });
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (err) {
      setPurchaseStatus({
        success: false,
        message: 'Failed to submit review. Please try again.',
        show: true
      });
    }
  };
  
  const handleCloseAlert = () => {
    setPurchaseStatus(prev => ({ ...prev, show: false }));
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !asset) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Asset not found'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/marketplace')}
            sx={{ mt: 2 }}
          >
            Return to Marketplace
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Marketplace
        </Button>
      </Box>
      
      {/* Asset Header */}
      <Grid container spacing={4}>
        {/* Asset Image */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {asset.is_premium && (
              <Chip 
                label="Premium" 
                color="secondary" 
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  zIndex: 2,
                  fontWeight: 'bold'
                }} 
              />
            )}
            <Box 
              component="img"
              src={asset.preview_url}
              alt={asset.name}
              sx={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: 400,
                objectFit: 'contain',
                cursor: 'pointer'
              }}
              onClick={() => setPreviewOpen(true)}
            />
            <Button
              startIcon={<ImageIcon />}
              sx={{ alignSelf: 'center', mt: 2 }}
              onClick={() => setPreviewOpen(true)}
            >
              View Full Image
            </Button>
          </Paper>
        </Grid>
        
        {/* Asset Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {asset.name}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Rating 
                value={avgRating} 
                readOnly 
                precision={0.5} 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </Typography>
            </Box>
            
            <Typography variant="h5" color="primary" gutterBottom>
              {asset.price > 0 ? `$${asset.price.toFixed(2)}` : 'Free'}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {asset.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Creator" 
                  secondary={
                    <RouterLink to={`/marketplace/creator/${asset.creator_id}`}>
                      {asset.creator_name}
                    </RouterLink>
                  } 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Category" 
                  secondary={
                    <RouterLink to={`/marketplace/category/${asset.category}`}>
                      {asset.category}
                    </RouterLink>
                  } 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Downloads" 
                  secondary={asset.downloads} 
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {asset.tags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    component={RouterLink}
                    to={`/marketplace/search?tags=${tag}`}
                    clickable
                  />
                ))}
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {userOwnsAsset ? (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  href={asset.preview_url} // This would actually link to the asset_url in a real implementation
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mb: 2 }}
                >
                  Download Asset
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handlePurchase}
                  sx={{ mb: 2 }}
                >
                  {asset.price > 0 ? `Purchase for $${asset.price.toFixed(2)}` : 'Get for Free'}
                </Button>
              )}
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FavoriteBorderIcon />}
                sx={{ mb: 2 }}
              >
                Add to Favorites
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabs for Details, Specs, Reviews */}
      <Paper sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="asset details tabs"
          >
            <Tab label="Details" id="asset-tab-0" aria-controls="asset-tabpanel-0" />
            <Tab label="Specifications" id="asset-tab-1" aria-controls="asset-tabpanel-1" />
            <Tab 
              label={`Reviews (${reviews.length})`} 
              id="asset-tab-2" 
              aria-controls="asset-tabpanel-2" 
            />
          </Tabs>
        </Box>
        
        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            About this Asset
          </Typography>
          <Typography variant="body1" paragraph>
            {asset.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Compatibility
          </Typography>
          <Typography variant="body1" paragraph>
            This asset is compatible with: {asset.compatibility.join(', ')}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Usage Rights
          </Typography>
          <Typography variant="body1" paragraph>
            Once purchased, this asset can be used in unlimited layouts within the Event Venue Generator app. 
            Commercial usage rights are included with purchase.
          </Typography>
        </TabPanel>
        
        {/* Specifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Technical Specifications
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="File Format" 
                    secondary="Proprietary EVG Asset Format" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Created Date" 
                    secondary={new Date(asset.created_at).toLocaleDateString()} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Last Updated" 
                    secondary={new Date(asset.updated_at).toLocaleDateString()} 
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <List>
                {asset.dimensions && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary="Width" 
                        secondary={`${asset.dimensions.width} m`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Height" 
                        secondary={`${asset.dimensions.height} m`} 
                      />
                    </ListItem>
                    {asset.dimensions.depth !== undefined && (
                      <ListItem>
                        <ListItemText 
                          primary="Depth" 
                          secondary={`${asset.dimensions.depth} m`} 
                        />
                      </ListItem>
                    )}
                  </>
                )}
              </List>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Customer Reviews
          </Typography>
          
          {reviews.length > 0 ? (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                  <Typography variant="h3" component="span" sx={{ mr: 1 }}>
                    {avgRating.toFixed(1)}
                  </Typography>
                  <Box>
                    <Rating value={avgRating} readOnly precision={0.5} size="large" />
                    <Typography variant="body2" color="text.secondary">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {reviews.map((review) => (
                <Card key={review.id} sx={{ mb: 2 }}>
                  <CardHeader
                    avatar={
                      <Avatar>{review.user_name.charAt(0)}</Avatar>
                    }
                    title={review.user_name}
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2">
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No reviews yet. Be the first to review this asset!
            </Typography>
          )}
          
          {/* Add Review Form */}
          {user && userOwnsAsset && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Your Rating:
                </Typography>
                <Rating
                  value={userReview.rating}
                  onChange={(event, newValue) => {
                    setUserReview(prev => ({ ...prev, rating: newValue || 0 }));
                  }}
                  size="large"
                />
              </Box>
              <TextField
                label="Your Review"
                multiline
                rows={4}
                fullWidth
                value={userReview.comment}
                onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                onClick={handleReviewSubmit}
                disabled={userReview.rating === 0 || !userReview.comment.trim()}
              >
                Submit Review
              </Button>
            </Box>
          )}
          
          {user && !userOwnsAsset && (
            <Alert severity="info" sx={{ mt: 3 }}>
              You need to purchase this asset before you can leave a review.
            </Alert>
          )}
          
          {!user && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Please <RouterLink to="/auth/login">log in</RouterLink> to leave a review.
            </Alert>
          )}
        </TabPanel>
      </Paper>
      
      {/* Related Assets Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Related Assets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You might also be interested in these assets:
        </Typography>
        
        <Grid container spacing={3}>
          {/* This would normally be populated with actual related assets */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography>
                Related assets will appear here in the full implementation.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Image Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{asset.name}</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={asset.preview_url}
            alt={asset.name}
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={purchaseStatus.show}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={purchaseStatus.success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {purchaseStatus.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssetDetails; 
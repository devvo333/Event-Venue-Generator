import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Paper,
  Tabs,
  Tab,
  Chip,
  Rating,
  Link,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  Storefront as StorefrontIcon,
  Category as CategoryIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AddShoppingCart as AddShoppingCartIcon
} from '@mui/icons-material';

import MarketplaceService, { MarketplaceAsset, AssetCategory } from '../services/marketplaceService';

// Featured asset card component
const FeaturedAssetCard: React.FC<{ asset: MarketplaceAsset }> = ({ asset }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {asset.is_premium && (
        <Chip 
          label="Premium" 
          color="secondary" 
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 2,
            fontWeight: 'bold'
          }} 
        />
      )}
      <CardMedia
        component="img"
        height="180"
        image={asset.preview_url}
        alt={asset.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {asset.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {asset.description.length > 100 
            ? `${asset.description.substring(0, 100)}...` 
            : asset.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            By {asset.creator_name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={asset.rating} 
            readOnly 
            size="small" 
            precision={0.5} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({asset.downloads} downloads)
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h6" component="div" color="primary">
            {asset.price > 0 ? `$${asset.price.toFixed(2)}` : 'Free'}
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<AddShoppingCartIcon />}
            component={RouterLink}
            to={`/marketplace/asset/${asset.id}`}
          >
            Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Category card component
const CategoryCard: React.FC<{ category: AssetCategory }> = ({ category }) => {
  return (
    <Card 
      component={RouterLink} 
      to={`/marketplace/category/${category.id}`}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        textDecoration: 'none',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3,
          bgcolor: 'primary.light',
          color: 'white'
        }}
      >
        <CategoryIcon fontSize="large" />
      </Box>
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Typography gutterBottom variant="h6" component="div">
          {category.name}
        </Typography>
        {category.subcategories && (
          <Typography variant="body2" color="text.secondary">
            {category.subcategories.length} subcategories
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const MarketplaceHome: React.FC = () => {
  const [featuredAssets, setFeaturedAssets] = useState<MarketplaceAsset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        setLoading(true);
        // Get featured assets
        const assets = await MarketplaceService.getFeaturedAssets();
        setFeaturedAssets(assets);
        
        // Get categories
        const categories = await MarketplaceService.getCategories();
        setCategories(categories);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching marketplace data:', err);
        setError('Failed to load marketplace data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMarketplaceData();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // Navigate to search results page with query
    window.location.href = `/marketplace/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Marketplace Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Asset Marketplace
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Browse, purchase, and download high-quality assets for your venue layouts
        </Typography>
        
        {/* Search Bar */}
        <Box 
          component="form"
          onSubmit={handleSearch}
          sx={{ 
            display: 'flex', 
            maxWidth: 600, 
            mx: 'auto', 
            mt: 3
          }}
        >
          <TextField
            fullWidth
            placeholder="Search assets, categories, or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ ml: 1 }}
          >
            Search
          </Button>
        </Box>
      </Box>
      
      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Featured" icon={<StarIcon />} iconPosition="start" />
          <Tab label="Categories" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="New Arrivals" icon={<FavoriteIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Featured Assets Tab */}
      {activeTab === 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            Featured Assets
          </Typography>
          <Grid container spacing={3}>
            {featuredAssets.length > 0 ? (
              featuredAssets.map((asset) => (
                <Grid item key={asset.id} xs={12} sm={6} md={4}>
                  <FeaturedAssetCard asset={asset} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No featured assets available at the moment.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/marketplace/browse"
              endIcon={<StorefrontIcon />}
            >
              Browse All Assets
            </Button>
          </Box>
        </>
      )}
      
      {/* Categories Tab */}
      {activeTab === 1 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            Asset Categories
          </Typography>
          <Grid container spacing={3}>
            {categories.length > 0 ? (
              categories.map((category) => (
                <Grid item key={category.id} xs={12} sm={6} md={3}>
                  <CategoryCard category={category} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No categories available at the moment.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
      
      {/* New Arrivals Tab */}
      {activeTab === 2 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            New Arrivals
          </Typography>
          <Grid container spacing={3}>
            {/* We'll use the same featured assets here for now */}
            {featuredAssets.length > 0 ? (
              featuredAssets.slice(0, 3).map((asset) => (
                <Grid item key={asset.id} xs={12} sm={6} md={4}>
                  <FeaturedAssetCard asset={asset} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No new assets available at the moment.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/marketplace/browse?sort=newest"
              endIcon={<FavoriteIcon />}
            >
              View All New Arrivals
            </Button>
          </Box>
        </>
      )}
      
      {/* Marketplace Info */}
      <Box sx={{ mt: 6 }}>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              About the Marketplace
            </Typography>
            <Typography variant="body2" paragraph>
              Our Asset Marketplace is a platform for venue planners and designers to discover and use high-quality assets for their event layouts. Browse through categories of furniture, decorations, equipment, and more.
            </Typography>
            <Typography variant="body2" paragraph>
              All assets are seamlessly integrated with our venue layout editor, allowing for drag-and-drop functionality to quickly enhance your event designs.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              For Creators
            </Typography>
            <Typography variant="body2" paragraph>
              Are you a designer or creator? Join our marketplace to showcase and sell your assets to event professionals worldwide. Our platform provides powerful tools for asset creation, publishing, and sales management.
            </Typography>
            <Button 
              variant="outlined" 
              component={RouterLink}
              to="/marketplace/creators"
              sx={{ mt: 1 }}
            >
              Become a Creator
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MarketplaceHome; 
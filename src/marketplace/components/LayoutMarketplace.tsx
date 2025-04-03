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
  TextField,
  InputAdornment,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Rating,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Preview as PreviewIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { LayoutMarketplaceItem, LayoutSearchFilters } from '../../types/layout';
import LayoutPreview from './LayoutPreview';
import LayoutPurchaseDialog from './LayoutPurchaseDialog';

interface LayoutMarketplaceProps {
  items: LayoutMarketplaceItem[];
  onPurchase: (layoutId: string, quantity: number) => Promise<void>;
  onLike: (layoutId: string) => Promise<void>;
  onShare: (layoutId: string) => Promise<void>;
  onSearch: (filters: LayoutSearchFilters) => void;
}

const LayoutMarketplace: React.FC<LayoutMarketplaceProps> = ({
  items,
  onPurchase,
  onLike,
  onShare,
  onSearch,
}) => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<LayoutSearchFilters>({
    sortBy: 'popular',
    priceRange: [0, 1000],
    venueType: '',
    eventType: '',
  });
  const [previewLayout, setPreviewLayout] = useState<LayoutMarketplaceItem | null>(null);
  const [purchaseLayout, setPurchaseLayout] = useState<LayoutMarketplaceItem | null>(null);

  const handleLike = async (layoutId: string) => {
    try {
      await onLike(layoutId);
      setLikedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(layoutId)) {
          newSet.delete(layoutId);
        } else {
          newSet.add(layoutId);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Error liking layout:', err);
    }
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    const newFilters = {
      ...filters,
      [event.target.name]: event.target.value,
    };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handlePriceRangeChange = (_: Event, newValue: number | number[]) => {
    const newFilters = {
      ...filters,
      priceRange: newValue as [number, number],
    };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search layouts..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                label="Sort By"
              >
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={filters.priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={item.previewImage}
                alt={item.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={item.author.avatar} sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {item.author.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Rating value={item.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary">
                    ({item.reviewCount} reviews)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    ${item.price.toFixed(2)}
                  </Typography>
                  <Box>
                    <Tooltip title="Preview">
                      <IconButton onClick={() => setPreviewLayout(item)}>
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={likedItems.has(item.id) ? 'Unlike' : 'Like'}>
                      <IconButton onClick={() => handleLike(item.id)}>
                        <FavoriteIcon color={likedItems.has(item.id) ? 'error' : 'inherit'} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton onClick={() => onShare(item.id)}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => setPurchaseLayout(item)}
                    >
                      Purchase
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {previewLayout && (
        <LayoutPreview
          layout={previewLayout}
          open={!!previewLayout}
          onClose={() => setPreviewLayout(null)}
          onLike={() => handleLike(previewLayout.id)}
          onShare={() => onShare(previewLayout.id)}
        />
      )}

      {purchaseLayout && (
        <LayoutPurchaseDialog
          layout={purchaseLayout}
          open={!!purchaseLayout}
          onClose={() => setPurchaseLayout(null)}
          onPurchase={onPurchase}
        />
      )}
    </Box>
  );
};

export default LayoutMarketplace; 
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
} from '@mui/material';
import { LayoutMarketplaceItem } from '../../types/layout';

interface LayoutPurchaseDialogProps {
  open: boolean;
  layout: LayoutMarketplaceItem;
  onClose: () => void;
  onPurchase: (layoutId: string, quantity: number) => Promise<void>;
}

const LayoutPurchaseDialog: React.FC<LayoutPurchaseDialogProps> = ({
  open,
  layout,
  onClose,
  onPurchase,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      await onPurchase(layout.id, quantity);
      onClose();
    } catch (err) {
      setError('Failed to complete purchase. Please try again.');
      console.error('Error purchasing layout:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = layout.price * quantity;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Purchase Layout</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {layout.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {layout.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Price per license: ${layout.price.toFixed(2)}
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            inputProps={{ min: 1 }}
            sx={{ width: '100px' }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">
            Total: ${totalPrice.toFixed(2)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handlePurchase}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LayoutPurchaseDialog; 
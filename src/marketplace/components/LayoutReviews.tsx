import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Divider,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/user';

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: User;
  createdAt: string;
}

interface LayoutReviewsProps {
  layoutId: string;
  currentUser: User | null;
}

const LayoutReviews: React.FC<LayoutReviewsProps> = ({ layoutId, currentUser }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [layoutId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('layout_reviews')
        .select(`
          *,
          user:user_id (
            id,
            email,
            avatar_url,
            full_name
          )
        `)
        .eq('layout_id', layoutId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: review.user,
        createdAt: review.created_at,
      })));
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUser || !newRating) return;

    try {
      setSubmitting(true);
      setError(null);

      const { error } = await supabase
        .from('layout_reviews')
        .upsert({
          layout_id: layoutId,
          user_id: currentUser.id,
          rating: newRating,
          comment: newComment,
        });

      if (error) throw error;

      // Update the layout's rating
      const { error: updateError } = await supabase.rpc('update_layout_rating', {
        layout_id: layoutId,
      });

      if (updateError) throw updateError;

      setNewRating(null);
      setNewComment('');
      fetchReviews();
    } catch (err) {
      setError('Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Reviews
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {currentUser && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Write a Review
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={newRating}
              onChange={(_, value) => setNewRating(value)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience with this layout..."
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!newRating || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {reviews.length === 0 ? (
        <Typography color="text.secondary">
          No reviews yet. Be the first to review!
        </Typography>
      ) : (
        reviews.map((review) => (
          <Box key={review.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                src={review.user.avatar_url}
                alt={review.user.full_name}
                sx={{ mr: 1 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  {review.user.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Rating value={review.rating} readOnly size="small" />
            {review.comment && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
            )}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default LayoutReviews; 
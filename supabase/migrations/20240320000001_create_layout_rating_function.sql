-- Create function to update layout rating
CREATE OR REPLACE FUNCTION update_layout_rating(layout_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE layout_marketplace
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM layout_reviews
      WHERE layout_reviews.layout_id = update_layout_rating.layout_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM layout_reviews
      WHERE layout_reviews.layout_id = update_layout_rating.layout_id
    )
  WHERE id = layout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
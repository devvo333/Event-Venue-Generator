-- Schema for Venue Showcase tables

-- Venue showcase data
CREATE TABLE IF NOT EXISTS venue_showcase (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  showcase_description TEXT,
  showcase_images TEXT[] DEFAULT '{}',
  showcase_featured BOOLEAN DEFAULT FALSE,
  showcase_tags TEXT[] DEFAULT '{}',
  owner_name VARCHAR(255),
  location JSONB DEFAULT NULL,
  capacity JSONB DEFAULT NULL,
  amenities TEXT[] DEFAULT '{}',
  virtual_tour_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (venue_id)
);

-- Venue ratings for showcase venues
CREATE TABLE IF NOT EXISTS venue_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (venue_id, user_id)
);

-- Venue layouts for counting and reference
CREATE TABLE IF NOT EXISTS venue_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  layout_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  preview_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_venue_showcase_venue_id ON venue_showcase(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_showcase_featured ON venue_showcase(showcase_featured);
CREATE INDEX IF NOT EXISTS idx_venue_ratings_venue_id ON venue_ratings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_ratings_user_id ON venue_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_layouts_venue_id ON venue_layouts(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_layouts_public ON venue_layouts(is_public);

-- Create a view for average ratings
CREATE OR REPLACE VIEW venue_average_ratings AS
SELECT 
  venue_id, 
  COUNT(*) as rating_count,
  AVG(rating) as average_rating
FROM 
  venue_ratings
GROUP BY 
  venue_id;

-- Create a view for layout counts
CREATE OR REPLACE VIEW venue_layout_counts AS
SELECT 
  venue_id, 
  COUNT(*) as count
FROM 
  venue_layouts
GROUP BY 
  venue_id;

-- Security policies

-- Enable RLS
ALTER TABLE venue_showcase ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_layouts ENABLE ROW LEVEL SECURITY;

-- Venue showcase: viewable by all if venue is public, editable by owner
CREATE POLICY "Showcase is viewable by everyone for public venues" 
  ON venue_showcase FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_showcase.venue_id AND venues.is_public = true
  ));

CREATE POLICY "Showcase is insertable by venue owner" 
  ON venue_showcase FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_showcase.venue_id AND venues.owner_id = auth.uid()
  ));

CREATE POLICY "Showcase is updatable by venue owner or admin" 
  ON venue_showcase FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_showcase.venue_id AND (venues.owner_id = auth.uid() OR auth.role() = 'admin')
  ));

CREATE POLICY "Showcase is deletable by venue owner or admin" 
  ON venue_showcase FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_showcase.venue_id AND (venues.owner_id = auth.uid() OR auth.role() = 'admin')
  ));

-- Special admin policy for featuring venues
CREATE POLICY "Only admins can mark venues as featured" 
  ON venue_showcase FOR UPDATE 
  USING (auth.role() = 'admin')
  WITH CHECK (
    (showcase_featured IS NOT NULL AND auth.role() = 'admin') OR
    (showcase_featured IS NULL)
  );

-- Venue ratings: viewable by all, editable by the rater
CREATE POLICY "Ratings are viewable by everyone" 
  ON venue_ratings FOR SELECT USING (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_ratings.venue_id AND venues.is_public = true
  ));

CREATE POLICY "Ratings are insertable by authenticated users" 
  ON venue_ratings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ratings are updatable by the reviewer" 
  ON venue_ratings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Ratings are deletable by the reviewer or admin" 
  ON venue_ratings FOR DELETE 
  USING (auth.uid() = user_id OR auth.role() = 'admin');

-- Venue layouts: viewable if public, editable by venue owner
CREATE POLICY "Public layouts are viewable by everyone" 
  ON venue_layouts FOR SELECT 
  USING (is_public = true OR EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_layouts.venue_id AND venues.owner_id = auth.uid()
  ));

CREATE POLICY "Layouts are insertable by venue owner" 
  ON venue_layouts FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_layouts.venue_id AND venues.owner_id = auth.uid()
  ));

CREATE POLICY "Layouts are updatable by venue owner or admin" 
  ON venue_layouts FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_layouts.venue_id AND (venues.owner_id = auth.uid() OR auth.role() = 'admin')
  ));

CREATE POLICY "Layouts are deletable by venue owner or admin" 
  ON venue_layouts FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM venues 
    WHERE venues.id = venue_layouts.venue_id AND (venues.owner_id = auth.uid() OR auth.role() = 'admin')
  ));

-- Triggers and functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps triggers
CREATE TRIGGER update_venue_showcase_timestamp
BEFORE UPDATE ON venue_showcase
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_venue_ratings_timestamp
BEFORE UPDATE ON venue_ratings
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_venue_layouts_timestamp
BEFORE UPDATE ON venue_layouts
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Function to update average rating when a review is added, updated, or deleted
CREATE OR REPLACE FUNCTION update_venue_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average rating and save to the venue table if needed
  -- This is a placeholder for more complex rating logic
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for rating actions
CREATE TRIGGER venue_rating_on_insert
AFTER INSERT ON venue_ratings
FOR EACH ROW EXECUTE PROCEDURE update_venue_rating();

CREATE TRIGGER venue_rating_on_update
AFTER UPDATE ON venue_ratings
FOR EACH ROW EXECUTE PROCEDURE update_venue_rating();

CREATE TRIGGER venue_rating_on_delete
AFTER DELETE ON venue_ratings
FOR EACH ROW EXECUTE PROCEDURE update_venue_rating(); 
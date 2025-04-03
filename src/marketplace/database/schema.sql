-- Schema for the Marketplace database tables

-- Asset Categories
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES asset_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on parent_id for faster lookup of subcategories
CREATE INDEX IF NOT EXISTS idx_asset_categories_parent_id ON asset_categories (parent_id);

-- Asset Subcategories View (for easier querying)
CREATE OR REPLACE VIEW asset_subcategories AS
  SELECT 
    id, 
    name, 
    icon, 
    description, 
    parent_id 
  FROM 
    asset_categories 
  WHERE 
    parent_id IS NOT NULL;

-- Marketplace Assets
CREATE TABLE IF NOT EXISTS marketplace_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category UUID REFERENCES asset_categories(id) NOT NULL,
  subcategory UUID REFERENCES asset_categories(id),
  
  -- Asset URLs
  preview_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  asset_url TEXT NOT NULL,
  
  -- Creator info
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  creator_name VARCHAR(255) NOT NULL,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 2) DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  compatibility TEXT[] DEFAULT '{all}',
  
  -- Dimensions (if applicable)
  dimensions JSONB DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_marketplace_assets_category ON marketplace_assets (category);
CREATE INDEX IF NOT EXISTS idx_marketplace_assets_creator_id ON marketplace_assets (creator_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_assets_is_featured ON marketplace_assets (is_featured);
CREATE INDEX IF NOT EXISTS idx_marketplace_assets_price ON marketplace_assets (price);
CREATE INDEX IF NOT EXISTS idx_marketplace_assets_rating ON marketplace_assets (rating);
CREATE INDEX IF NOT EXISTS idx_marketplace_assets_downloads ON marketplace_assets (downloads);

-- Asset Purchases
CREATE TABLE IF NOT EXISTS asset_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES marketplace_assets(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate purchases
  UNIQUE(asset_id, user_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_asset_purchases_user_id ON asset_purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_asset_purchases_asset_id ON asset_purchases (asset_id);

-- Asset Reviews
CREATE TABLE IF NOT EXISTS asset_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES marketplace_assets(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent multiple reviews from the same user
  UNIQUE(asset_id, user_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_asset_reviews_asset_id ON asset_reviews (asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_user_id ON asset_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_rating ON asset_reviews (rating);

-- Asset Favorites
CREATE TABLE IF NOT EXISTS asset_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES marketplace_assets(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate favorites
  UNIQUE(asset_id, user_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_asset_favorites_user_id ON asset_favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_asset_favorites_asset_id ON asset_favorites (asset_id);

-- Creator Profiles
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  website TEXT,
  social_links JSONB DEFAULT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  total_sales INTEGER DEFAULT 0,
  total_assets INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Policies

-- Enable RLS
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

-- Categories: readable by all, writable by admins
CREATE POLICY "Categories are viewable by everyone" 
  ON asset_categories FOR SELECT USING (true);

CREATE POLICY "Categories are insertable by admins only" 
  ON asset_categories FOR INSERT 
  WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Categories are updatable by admins only" 
  ON asset_categories FOR UPDATE 
  USING (auth.role() = 'admin');

CREATE POLICY "Categories are deletable by admins only" 
  ON asset_categories FOR DELETE 
  USING (auth.role() = 'admin');

-- Assets: readable by all, writable by creator and admins
CREATE POLICY "Assets are viewable by everyone" 
  ON marketplace_assets FOR SELECT USING (true);

CREATE POLICY "Assets are insertable by authenticated users" 
  ON marketplace_assets FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Assets are updatable by creator or admins" 
  ON marketplace_assets FOR UPDATE 
  USING (auth.uid() = creator_id OR auth.role() = 'admin');

CREATE POLICY "Assets are deletable by creator or admins" 
  ON marketplace_assets FOR DELETE 
  USING (auth.uid() = creator_id OR auth.role() = 'admin');

-- Purchases: users can view/add their own purchases, admins can view all
CREATE POLICY "Users can view their own purchases" 
  ON asset_purchases FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "Users can insert their own purchases" 
  ON asset_purchases FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Reviews: viewable by all, writable by the reviewer
CREATE POLICY "Reviews are viewable by everyone" 
  ON asset_reviews FOR SELECT USING (true);

CREATE POLICY "Reviews are insertable by authenticated users" 
  ON asset_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviews are updatable by the reviewer" 
  ON asset_reviews FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Reviews are deletable by the reviewer or admins" 
  ON asset_reviews FOR DELETE 
  USING (auth.uid() = user_id OR auth.role() = 'admin');

-- Favorites: users can manage their own favorites
CREATE POLICY "Users can view their own favorites" 
  ON asset_favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
  ON asset_favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON asset_favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- Creator Profiles: viewable by all, writable by the creator
CREATE POLICY "Creator profiles are viewable by everyone" 
  ON creator_profiles FOR SELECT USING (true);

CREATE POLICY "Creator profiles are insertable by the user" 
  ON creator_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Creator profiles are updatable by the user" 
  ON creator_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Triggers to update timestamps and maintain data integrity

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps triggers
CREATE TRIGGER update_asset_categories_timestamp
BEFORE UPDATE ON asset_categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_marketplace_assets_timestamp
BEFORE UPDATE ON marketplace_assets
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_creator_profiles_timestamp
BEFORE UPDATE ON creator_profiles
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Update asset rating when a review is added, updated, or deleted
CREATE OR REPLACE FUNCTION update_asset_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
BEGIN
  -- Calculate new average rating
  SELECT COALESCE(AVG(rating), 0)
  INTO avg_rating
  FROM asset_reviews
  WHERE asset_id = COALESCE(NEW.asset_id, OLD.asset_id);
  
  -- Update the asset's rating
  UPDATE marketplace_assets
  SET rating = avg_rating
  WHERE id = COALESCE(NEW.asset_id, OLD.asset_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for review actions
CREATE TRIGGER update_asset_rating_on_insert
AFTER INSERT ON asset_reviews
FOR EACH ROW EXECUTE PROCEDURE update_asset_rating();

CREATE TRIGGER update_asset_rating_on_update
AFTER UPDATE ON asset_reviews
FOR EACH ROW EXECUTE PROCEDURE update_asset_rating();

CREATE TRIGGER update_asset_rating_on_delete
AFTER DELETE ON asset_reviews
FOR EACH ROW EXECUTE PROCEDURE update_asset_rating();

-- Update creator stats when assets are added, purchased, or rated
CREATE OR REPLACE FUNCTION update_creator_stats()
RETURNS TRIGGER AS $$
DECLARE
  creator_uid UUID;
  total_creator_assets INTEGER;
  total_creator_sales INTEGER;
  avg_creator_rating DECIMAL(3, 2);
BEGIN
  -- Get creator ID
  creator_uid := COALESCE(NEW.creator_id, OLD.creator_id);
  
  -- Count total assets
  SELECT COUNT(*)
  INTO total_creator_assets
  FROM marketplace_assets
  WHERE creator_id = creator_uid;
  
  -- Count total sales
  SELECT COUNT(*)
  INTO total_creator_sales
  FROM asset_purchases
  JOIN marketplace_assets ON asset_purchases.asset_id = marketplace_assets.id
  WHERE marketplace_assets.creator_id = creator_uid;
  
  -- Calculate average rating across all assets
  SELECT COALESCE(AVG(rating), 0)
  INTO avg_creator_rating
  FROM marketplace_assets
  WHERE creator_id = creator_uid;
  
  -- Update the creator's profile
  UPDATE creator_profiles
  SET 
    total_assets = total_creator_assets,
    total_sales = total_creator_sales,
    average_rating = avg_creator_rating,
    updated_at = NOW()
  WHERE id = creator_uid;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for asset and purchase actions
CREATE TRIGGER update_creator_stats_on_asset_change
AFTER INSERT OR UPDATE OR DELETE ON marketplace_assets
FOR EACH ROW EXECUTE PROCEDURE update_creator_stats();

CREATE TRIGGER update_creator_stats_on_purchase
AFTER INSERT ON asset_purchases
FOR EACH ROW EXECUTE PROCEDURE update_creator_stats(); 
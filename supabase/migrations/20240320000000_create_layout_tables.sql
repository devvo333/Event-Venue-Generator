-- Create layout templates table
CREATE TABLE layout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  preview_image TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user generated layouts table
CREATE TABLE user_generated_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  preview_image TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  metadata JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create layout marketplace table
CREATE TABLE layout_marketplace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  preview_image TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  price DECIMAL(10, 2) NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('standard', 'premium')),
  is_premium BOOLEAN DEFAULT false,
  metadata JSONB NOT NULL,
  sales_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create layout reviews table
CREATE TABLE layout_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layout_id UUID NOT NULL REFERENCES layout_marketplace(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(layout_id, user_id)
);

-- Create layout likes table
CREATE TABLE layout_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layout_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(layout_id, user_id)
);

-- Create layout purchases table
CREATE TABLE layout_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layout_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create layout shares table
CREATE TABLE layout_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layout_id UUID NOT NULL,
  share_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_layout_templates_created_at ON layout_templates(created_at);
CREATE INDEX idx_user_generated_layouts_author_id ON user_generated_layouts(author_id);
CREATE INDEX idx_user_generated_layouts_created_at ON user_generated_layouts(created_at);
CREATE INDEX idx_layout_marketplace_author_id ON layout_marketplace(author_id);
CREATE INDEX idx_layout_marketplace_created_at ON layout_marketplace(created_at);
CREATE INDEX idx_layout_reviews_layout_id ON layout_reviews(layout_id);
CREATE INDEX idx_layout_reviews_user_id ON layout_reviews(user_id);
CREATE INDEX idx_layout_likes_layout_id ON layout_likes(layout_id);
CREATE INDEX idx_layout_likes_user_id ON layout_likes(user_id);
CREATE INDEX idx_layout_purchases_layout_id ON layout_purchases(layout_id);
CREATE INDEX idx_layout_purchases_user_id ON layout_purchases(user_id);
CREATE INDEX idx_layout_shares_layout_id ON layout_shares(layout_id);

-- Create RLS policies
ALTER TABLE layout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generated_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_shares ENABLE ROW LEVEL SECURITY;

-- Layout templates policies
CREATE POLICY "Layout templates are viewable by everyone"
  ON layout_templates FOR SELECT
  USING (true);

-- User generated layouts policies
CREATE POLICY "User generated layouts are viewable by everyone"
  ON user_generated_layouts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own layouts"
  ON user_generated_layouts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own layouts"
  ON user_generated_layouts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own layouts"
  ON user_generated_layouts FOR DELETE
  USING (auth.uid() = author_id);

-- Layout marketplace policies
CREATE POLICY "Layout marketplace items are viewable by everyone"
  ON layout_marketplace FOR SELECT
  USING (true);

CREATE POLICY "Users can create marketplace items"
  ON layout_marketplace FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own marketplace items"
  ON layout_marketplace FOR UPDATE
  USING (auth.uid() = author_id);

-- Layout reviews policies
CREATE POLICY "Layout reviews are viewable by everyone"
  ON layout_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON layout_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON layout_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON layout_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Layout likes policies
CREATE POLICY "Users can view likes"
  ON layout_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create likes"
  ON layout_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON layout_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Layout purchases policies
CREATE POLICY "Users can view their own purchases"
  ON layout_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON layout_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Layout shares policies
CREATE POLICY "Users can view shares"
  ON layout_shares FOR SELECT
  USING (true);

CREATE POLICY "Users can create shares"
  ON layout_shares FOR INSERT
  WITH CHECK (true); 
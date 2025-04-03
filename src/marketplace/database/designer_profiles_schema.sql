-- Create designer_profiles table
CREATE TABLE designer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    portfolio_url TEXT,
    specialties TEXT[],
    experience_years INTEGER,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create designer_portfolio_items table
CREATE TABLE designer_portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    designer_id UUID REFERENCES designer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_urls TEXT[],
    event_type TEXT,
    venue_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create designer_reviews table
CREATE TABLE designer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    designer_id UUID REFERENCES designer_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create designer_services table
CREATE TABLE designer_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    designer_id UUID REFERENCES designer_profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE designer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_services ENABLE ROW LEVEL SECURITY;

-- Policies for designer_profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON designer_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON designer_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
    ON designer_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for designer_portfolio_items
CREATE POLICY "Portfolio items are viewable by everyone"
    ON designer_portfolio_items FOR SELECT
    USING (true);

CREATE POLICY "Designers can manage their own portfolio items"
    ON designer_portfolio_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM designer_profiles
        WHERE designer_profiles.id = designer_portfolio_items.designer_id
        AND designer_profiles.user_id = auth.uid()
    ));

-- Policies for designer_reviews
CREATE POLICY "Reviews are viewable by everyone"
    ON designer_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews"
    ON designer_reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
    ON designer_reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- Policies for designer_services
CREATE POLICY "Services are viewable by everyone"
    ON designer_services FOR SELECT
    USING (true);

CREATE POLICY "Designers can manage their own services"
    ON designer_services FOR ALL
    USING (EXISTS (
        SELECT 1 FROM designer_profiles
        WHERE designer_profiles.id = designer_services.designer_id
        AND designer_profiles.user_id = auth.uid()
    ));

-- Create indexes
CREATE INDEX idx_designer_profiles_user_id ON designer_profiles(user_id);
CREATE INDEX idx_designer_portfolio_items_designer_id ON designer_portfolio_items(designer_id);
CREATE INDEX idx_designer_reviews_designer_id ON designer_reviews(designer_id);
CREATE INDEX idx_designer_services_designer_id ON designer_services(designer_id);

-- Create function to update designer rating
CREATE OR REPLACE FUNCTION update_designer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE designer_profiles
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM designer_reviews
        WHERE designer_id = NEW.designer_id
    ),
    review_count = (
        SELECT COUNT(*)
        FROM designer_reviews
        WHERE designer_id = NEW.designer_id
    )
    WHERE id = NEW.designer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating designer rating
CREATE TRIGGER update_designer_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON designer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_designer_rating(); 
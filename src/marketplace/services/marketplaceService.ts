import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../auth/AuthContext';

// Types for marketplace assets
export interface MarketplaceAsset {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  preview_url: string;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  creator_name: string;
  tags: string[];
  rating: number;
  downloads: number;
  is_premium: boolean;
  is_featured: boolean;
  compatibility: string[];
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  subcategories?: AssetSubcategory[];
}

export interface AssetSubcategory {
  id: string;
  name: string;
  parent_id: string;
}

export interface AssetFilterOptions {
  category?: string;
  subcategory?: string;
  priceRange?: [number, number];
  searchQuery?: string;
  tags?: string[];
  sort?: 'newest' | 'popular' | 'price_low' | 'price_high' | 'rating';
  isPremium?: boolean;
  isFeatured?: boolean;
  creatorId?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  transaction_id?: string;
  asset_id?: string;
}

export interface AssetReview {
  id: string;
  asset_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Service for interacting with the marketplace
export const MarketplaceService = {
  // Get all asset categories
  getCategories: async (): Promise<AssetCategory[]> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*, subcategories(*)');
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching asset categories:', error);
      return [];
    }
  },
  
  // Get featured assets for homepage
  getFeaturedAssets: async (limit = 6): Promise<MarketplaceAsset[]> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { data, error } = await supabase
        .from('marketplace_assets')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching featured assets:', error);
      return [];
    }
  },
  
  // Get asset details by ID
  getAssetById: async (assetId: string): Promise<MarketplaceAsset | null> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { data, error } = await supabase
        .from('marketplace_assets')
        .select('*')
        .eq('id', assetId)
        .single();
        
      if (error) throw error;
      
      return data || null;
    } catch (error) {
      console.error(`Error fetching asset details for ID ${assetId}:`, error);
      return null;
    }
  },
  
  // Search and filter assets
  searchAssets: async (filters: AssetFilterOptions): Promise<{assets: MarketplaceAsset[], total: number}> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const {
        category,
        subcategory,
        priceRange,
        searchQuery,
        tags,
        sort = 'newest',
        isPremium,
        isFeatured,
        creatorId,
        page = 1,
        limit = 20
      } = filters;
      
      let query = supabase
        .from('marketplace_assets')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }
      
      if (priceRange) {
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      }
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }
      
      if (isPremium !== undefined) {
        query = query.eq('is_premium', isPremium);
      }
      
      if (isFeatured !== undefined) {
        query = query.eq('is_featured', isFeatured);
      }
      
      if (creatorId) {
        query = query.eq('creator_id', creatorId);
      }
      
      // Apply sorting
      switch (sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('downloads', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        assets: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching marketplace assets:', error);
      return { assets: [], total: 0 };
    }
  },
  
  // Purchase an asset
  purchaseAsset: async (assetId: string): Promise<PurchaseResult> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // First get the asset details
      const { data: asset, error: assetError } = await supabase
        .from('marketplace_assets')
        .select('*')
        .eq('id', assetId)
        .single();
        
      if (assetError) throw assetError;
      if (!asset) throw new Error('Asset not found');
      
      // Get current user
      const { user } = useAuth();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to purchase assets'
        };
      }
      
      // Create a purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('asset_purchases')
        .insert([
          {
            asset_id: assetId,
            user_id: user.id,
            price: asset.price,
            purchase_date: new Date().toISOString()
          }
        ])
        .select()
        .single();
        
      if (purchaseError) throw purchaseError;
      
      // Update asset download count
      await supabase
        .from('marketplace_assets')
        .update({ downloads: asset.downloads + 1 })
        .eq('id', assetId);
      
      return {
        success: true,
        message: 'Asset purchased successfully',
        transaction_id: purchase.id,
        asset_id: assetId
      };
    } catch (error) {
      console.error(`Error purchasing asset ID ${assetId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  },
  
  // Get user's purchased assets
  getUserPurchases: async (userId: string): Promise<MarketplaceAsset[]> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { data, error } = await supabase
        .from('asset_purchases')
        .select('asset_id')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const assetIds = data.map(purchase => purchase.asset_id);
      
      const { data: assets, error: assetsError } = await supabase
        .from('marketplace_assets')
        .select('*')
        .in('id', assetIds);
        
      if (assetsError) throw assetsError;
      
      return assets || [];
    } catch (error) {
      console.error(`Error fetching purchases for user ${userId}:`, error);
      return [];
    }
  },
  
  // Get reviews for an asset
  getAssetReviews: async (assetId: string): Promise<AssetReview[]> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { data, error } = await supabase
        .from('asset_reviews')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching reviews for asset ${assetId}:`, error);
      return [];
    }
  },
  
  // Add a review for an asset
  addAssetReview: async (assetId: string, rating: number, comment: string): Promise<boolean> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Get current user
      const { user } = useAuth();
      if (!user) {
        console.error('User must be logged in to leave a review');
        return false;
      }
      
      // Add the review
      const { error } = await supabase
        .from('asset_reviews')
        .insert([
          {
            asset_id: assetId,
            user_id: user.id,
            user_name: user.user_metadata?.name || 'Anonymous',
            rating,
            comment,
            created_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      // Update average rating on the asset
      const { data: reviews, error: reviewsError } = await supabase
        .from('asset_reviews')
        .select('rating')
        .eq('asset_id', assetId);
        
      if (reviewsError) throw reviewsError;
      
      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await supabase
          .from('marketplace_assets')
          .update({ rating: avgRating })
          .eq('id', assetId);
      }
      
      return true;
    } catch (error) {
      console.error(`Error adding review for asset ${assetId}:`, error);
      return false;
    }
  },
  
  // Upload new asset to marketplace (for creators)
  uploadAsset: async (assetData: Partial<MarketplaceAsset>, assetFile: File, previewImage: File): Promise<string | null> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Get current user
      const { user } = useAuth();
      if (!user) {
        console.error('User must be logged in to upload assets');
        return null;
      }
      
      // Upload the asset file
      const assetFileName = `assets/${user.id}/${Date.now()}-${assetFile.name}`;
      const { error: assetUploadError } = await supabase.storage
        .from('marketplace')
        .upload(assetFileName, assetFile);
        
      if (assetUploadError) throw assetUploadError;
      
      // Upload the preview image
      const previewFileName = `previews/${user.id}/${Date.now()}-${previewImage.name}`;
      const { error: previewUploadError } = await supabase.storage
        .from('marketplace')
        .upload(previewFileName, previewImage);
        
      if (previewUploadError) throw previewUploadError;
      
      // Get URLs for the uploaded files
      const { data: assetUrl } = supabase.storage
        .from('marketplace')
        .getPublicUrl(assetFileName);
        
      const { data: previewUrl } = supabase.storage
        .from('marketplace')
        .getPublicUrl(previewFileName);
      
      // Create thumbnail version of preview (assume we have a function for this)
      const thumbnailFileName = `thumbnails/${user.id}/${Date.now()}-${previewImage.name}`;
      // Here we'd normally process the image to create a thumbnail
      // For now we'll just use the same image
      await supabase.storage
        .from('marketplace')
        .copy(previewFileName, thumbnailFileName);
        
      const { data: thumbnailUrl } = supabase.storage
        .from('marketplace')
        .getPublicUrl(thumbnailFileName);
      
      // Create the asset record in the database
      const { data, error } = await supabase
        .from('marketplace_assets')
        .insert([
          {
            name: assetData.name,
            description: assetData.description,
            price: assetData.price || 0,
            category: assetData.category,
            subcategory: assetData.subcategory,
            preview_url: previewUrl.publicUrl,
            thumbnail_url: thumbnailUrl.publicUrl,
            asset_url: assetUrl.publicUrl,
            creator_id: user.id,
            creator_name: user.user_metadata?.name || 'Anonymous Creator',
            tags: assetData.tags || [],
            rating: 0,
            downloads: 0,
            is_premium: assetData.is_premium || false,
            is_featured: false, // Only admins can feature assets
            compatibility: assetData.compatibility || ['all'],
            dimensions: assetData.dimensions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error('Error uploading asset to marketplace:', error);
      return null;
    }
  }
};

export default MarketplaceService; 
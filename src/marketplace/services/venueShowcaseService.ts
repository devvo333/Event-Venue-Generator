import { supabase } from '../../api/supabaseClient';
import { Venue } from '../../types/venue';

// Types specific to venue showcase
export interface ShowcaseVenue extends Venue {
  showcase_description?: string;
  showcase_images?: string[];
  showcase_featured?: boolean;
  showcase_tags?: string[];
  layout_count?: number;
  average_rating?: number;
  owner_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  capacity?: {
    max?: number;
    recommended?: number;
  };
  amenities?: string[];
  virtual_tour_available?: boolean;
}

interface VenueRating {
  rating: number;
}

export interface VenueShowcaseFilterOptions {
  searchQuery?: string;
  capacity?: [number, number]; // min, max
  tags?: string[];
  location?: string;
  hasVirtualTour?: boolean;
  sort?: 'newest' | 'popular' | 'rating' | 'capacity';
  featured?: boolean;
  page?: number;
  limit?: number;
}

// Service for interacting with venue showcase
export const venueShowcaseService = {
  // Get all featured venues
  getFeaturedVenues: async (): Promise<ShowcaseVenue[]> => {
    try {
      const { data, error } = await supabase
        .from('venue_showcase')
        .select(`
          *,
          venues (
            id,
            name,
            description,
            cover_image,
            address,
            dimensions,
            is_public,
            created_at,
            updated_at
          )
        `)
        .eq('showcase_featured', true)
        .eq('venues.is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item.venues,
        showcase_description: item.showcase_description,
        showcase_images: item.showcase_images,
        showcase_featured: item.showcase_featured,
        showcase_tags: item.showcase_tags,
        owner_name: item.owner_name,
        location: item.location,
        capacity: item.capacity,
        amenities: item.amenities,
        virtual_tour_available: item.virtual_tour_available,
      }));
    } catch (error) {
      console.error('Error fetching featured venues:', error);
      return [];
    }
  },

  // Get venue by ID
  getVenueById: async (venueId: string): Promise<ShowcaseVenue | null> => {
    try {
      const { data, error } = await supabase
        .from('venue_showcase')
        .select(`
          *,
          venues (
            id,
            name,
            description,
            cover_image,
            address,
            dimensions,
            is_public,
            created_at,
            updated_at
          ),
          venue_ratings (
            rating
          ),
          venue_layouts (
            id
          )
        `)
        .eq('venue_id', venueId)
        .eq('venues.is_public', true)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Calculate average rating
      const ratings = data.venue_ratings || [];
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: VenueRating) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        ...data.venues,
        showcase_description: data.showcase_description,
        showcase_images: data.showcase_images,
        showcase_featured: data.showcase_featured,
        showcase_tags: data.showcase_tags,
        owner_name: data.owner_name,
        location: data.location,
        capacity: data.capacity,
        amenities: data.amenities,
        virtual_tour_available: data.virtual_tour_available,
        average_rating: averageRating,
        layout_count: data.venue_layouts?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching venue:', error);
      return null;
    }
  },

  // Search venues
  searchVenues: async (params: {
    searchQuery?: string;
    eventTypes?: string[];
    amenities?: string[];
    priceRange?: string;
    hasVirtualTour?: boolean;
  }): Promise<{ venues: ShowcaseVenue[]; total: number }> => {
    try {
      let query = supabase
        .from('venue_showcase')
        .select(`
          *,
          venues (
            id,
            name,
            description,
            cover_image,
            address,
            dimensions,
            is_public,
            created_at,
            updated_at
          ),
          venue_ratings (
            rating
          ),
          venue_layouts (
            id
          )
        `, { count: 'exact' })
        .eq('venues.is_public', true);

      // Apply search filters
      if (params.searchQuery) {
        query = query.or(`venues.name.ilike.%${params.searchQuery}%,venues.description.ilike.%${params.searchQuery}%`);
      }

      if (params.eventTypes?.length) {
        query = query.contains('showcase_tags', params.eventTypes);
      }

      if (params.amenities?.length) {
        query = query.contains('amenities', params.amenities);
      }

      if (params.hasVirtualTour) {
        query = query.eq('virtual_tour_available', true);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const venues = data.map(item => {
        const ratings = item.venue_ratings || [];
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum: number, r: VenueRating) => sum + r.rating, 0) / ratings.length
          : 0;

        return {
          ...item.venues,
          showcase_description: item.showcase_description,
          showcase_images: item.showcase_images,
          showcase_featured: item.showcase_featured,
          showcase_tags: item.showcase_tags,
          owner_name: item.owner_name,
          location: item.location,
          capacity: item.capacity,
          amenities: item.amenities,
          virtual_tour_available: item.virtual_tour_available,
          average_rating: averageRating,
          layout_count: item.venue_layouts?.length || 0,
        };
      });

      return {
        venues,
        total: count || 0,
      };
    } catch (error) {
      console.error('Error searching venues:', error);
      return { venues: [], total: 0 };
    }
  },

  // Get popular tags
  getPopularTags: async (): Promise<{ tag: string; count: number }[]> => {
    try {
      const { data, error } = await supabase
        .from('venue_showcase')
        .select('showcase_tags')
        .eq('venues.is_public', true);

      if (error) throw error;

      // Count tag occurrences
      const tagCounts = new Map<string, number>();
      data.forEach(item => {
        item.showcase_tags?.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      // Convert to array and sort by count
      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  },

  // Add venue to showcase (for venue owners)
  addVenueToShowcase: async (
    venueId: string, 
    showcaseData: {
      showcase_description: string;
      showcase_tags: string[];
      owner_name: string;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
      capacity?: {
        max?: number;
        recommended?: number;
      };
      amenities?: string[];
      virtual_tour_available?: boolean;
    }
  ): Promise<boolean> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // First, ensure venue is marked as public
      const { error: venueUpdateError } = await supabase
        .from('venues')
        .update({ is_public: true })
        .eq('id', venueId);
        
      if (venueUpdateError) throw venueUpdateError;
      
      // Then, create or update showcase data
      const { error: showcaseError } = await supabase
        .from('venue_showcase')
        .upsert({
          venue_id: venueId,
          ...showcaseData,
          showcase_featured: false, // Only admins can feature venues
          updated_at: new Date().toISOString()
        });
        
      if (showcaseError) throw showcaseError;
      
      return true;
    } catch (error) {
      console.error('Error adding venue to showcase:', error);
      return false;
    }
  },
  
  // Upload showcase images for a venue
  uploadShowcaseImages: async (venueId: string, files: File[]): Promise<string[]> => {
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const uploadPromises = files.map(async (file) => {
        const fileName = `venues/${venueId}/showcase/${Date.now()}-${file.name}`;
        
        const { error } = await supabase.storage
          .from('showcase')
          .upload(fileName, file);
          
        if (error) throw error;
        
        const { data } = supabase.storage
          .from('showcase')
          .getPublicUrl(fileName);
          
        return data.publicUrl;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Update the venue showcase with new images
      const { data } = await supabase
        .from('venue_showcase')
        .select('showcase_images')
        .eq('venue_id', venueId)
        .single();
        
      const existingImages = data?.showcase_images || [];
      const allImages = [...existingImages, ...uploadedUrls];
      
      await supabase
        .from('venue_showcase')
        .update({ showcase_images: allImages })
        .eq('venue_id', venueId);
        
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading showcase images:', error);
      return [];
    }
  }
};

export default venueShowcaseService; 
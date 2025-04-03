import { supabase } from '../../api/supabaseClient';
import {
    DesignerProfile,
    PortfolioItem,
    DesignerReview,
    DesignerService,
    DesignerProfileWithDetails,
    DesignerSearchFilters
} from '../types/designer';

export const designerService = {
    async getDesignerProfile(userId: string): Promise<DesignerProfile | null> {
        const { data, error } = await supabase
            .from('designer_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    async createDesignerProfile(profile: Omit<DesignerProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<DesignerProfile> {
        const { data, error } = await supabase
            .from('designer_profiles')
            .insert([{
                user_id: profile.userId,
                display_name: profile.displayName,
                bio: profile.bio,
                profile_image_url: profile.profileImageUrl,
                portfolio_url: profile.portfolioUrl,
                specialties: profile.specialties,
                experience_years: profile.experienceYears,
                is_verified: profile.isVerified
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateDesignerProfile(profile: Partial<DesignerProfile>): Promise<DesignerProfile> {
        const { data, error } = await supabase
            .from('designer_profiles')
            .update({
                display_name: profile.displayName,
                bio: profile.bio,
                profile_image_url: profile.profileImageUrl,
                portfolio_url: profile.portfolioUrl,
                specialties: profile.specialties,
                experience_years: profile.experienceYears,
                is_verified: profile.isVerified
            })
            .eq('id', profile.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getDesignerProfileWithDetails(designerId: string): Promise<DesignerProfileWithDetails | null> {
        const { data: profile, error: profileError } = await supabase
            .from('designer_profiles')
            .select('*')
            .eq('id', designerId)
            .single();

        if (profileError) throw profileError;
        if (!profile) return null;

        const [
            { data: portfolioItems, error: portfolioError },
            { data: services, error: servicesError },
            { data: reviews, error: reviewsError }
        ] = await Promise.all([
            supabase.from('designer_portfolio_items').select('*').eq('designer_id', designerId),
            supabase.from('designer_services').select('*').eq('designer_id', designerId),
            supabase.from('designer_reviews').select('*').eq('designer_id', designerId)
        ]);

        if (portfolioError || servicesError || reviewsError) {
            throw portfolioError || servicesError || reviewsError;
        }

        return {
            ...profile,
            portfolioItems: portfolioItems || [],
            services: services || [],
            reviews: reviews || []
        };
    },

    async searchDesigners(filters: DesignerSearchFilters): Promise<DesignerProfile[]> {
        let query = supabase
            .from('designer_profiles')
            .select('*');

        if (filters.specialties?.length) {
            query = query.contains('specialties', filters.specialties);
        }

        if (filters.minRating) {
            query = query.gte('rating', filters.minRating);
        }

        if (filters.minExperience) {
            query = query.gte('experience_years', filters.minExperience);
        }

        if (filters.searchQuery) {
            query = query.or(`display_name.ilike.%${filters.searchQuery}%,bio.ilike.%${filters.searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    },

    async addPortfolioItem(item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> {
        const { data, error } = await supabase
            .from('designer_portfolio_items')
            .insert([{
                designer_id: item.designerId,
                title: item.title,
                description: item.description,
                image_urls: item.imageUrls,
                event_type: item.eventType,
                venue_size: item.venueSize
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async addReview(review: Omit<DesignerReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<DesignerReview> {
        const { data, error } = await supabase
            .from('designer_reviews')
            .insert([{
                designer_id: review.designerId,
                reviewer_id: review.reviewerId,
                rating: review.rating,
                review_text: review.reviewText
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async addService(service: Omit<DesignerService, 'id' | 'createdAt' | 'updatedAt'>): Promise<DesignerService> {
        const { data, error } = await supabase
            .from('designer_services')
            .insert([{
                designer_id: service.designerId,
                service_name: service.serviceName,
                description: service.description,
                base_price: service.basePrice
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}; 
export interface DesignerProfile {
    id: string;
    userId: string;
    displayName: string;
    bio: string;
    location: string;
    profileImageUrl: string;
    portfolioUrl?: string;
    specialties: string[];
    eventTypes: string[];
    yearsOfExperience: number;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioItem {
    id: string;
    designerId: string;
    title: string;
    description: string;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
}

export interface DesignerReview {
    id: string;
    designerId: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface DesignerService {
    id: string;
    designerId: string;
    title: string;
    description: string;
    price: number;
    createdAt: string;
    updatedAt: string;
}

export interface DesignerProfileWithDetails extends DesignerProfile {
    portfolioItems: PortfolioItem[];
    reviews: DesignerReview[];
    services: DesignerService[];
}

export interface DesignerSearchFilters {
    specialties?: string[];
    eventTypes?: string[];
    minRating?: number;
    minExperience?: number;
    searchQuery?: string;
} 
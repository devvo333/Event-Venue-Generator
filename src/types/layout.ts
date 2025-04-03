import { Asset } from './asset';
import { User } from './user';

export interface Layout {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  previewUrl: string;
  createdAt: string;
  updatedAt: string;
  assets: Asset[];
  metadata: {
    venueType: string;
    eventType: string;
    capacity: number;
    dimensions: {
      width: number;
      height: number;
      unit: 'meters' | 'feet';
    };
  };
}

export interface LayoutTemplate extends Layout {
  isTemplate: true;
  category: string;
  tags: string[];
  usageCount: number;
}

export interface UserGeneratedLayout extends Layout {
  isTemplate: false;
  author: User;
  isPublic: boolean;
  likes: number;
  downloads: number;
}

export interface LayoutMarketplaceItem {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  price: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  licenseType: 'standard' | 'premium';
  isPremium: boolean;
  metadata: {
    capacity: number;
    dimensions: {
      width: number;
      height: number;
      unit: string;
    };
    venueType: string;
    eventType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LayoutSearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  minCapacity?: number;
  maxCapacity?: number;
  venueType?: string;
  eventType?: string;
  minRating?: number;
  priceRange: [number, number];
  licenseType?: 'personal' | 'commercial';
  sortBy: 'popular' | 'newest' | 'price-asc' | 'price-desc';
} 
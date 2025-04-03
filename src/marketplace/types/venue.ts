export interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  priceRange: string;
  rating: number;
  imageUrl: string;
  amenities: string[];
  eventTypes: string[];
  createdAt?: string;
  updatedAt?: string;
} 
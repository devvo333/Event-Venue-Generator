export interface Venue {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  address: string | null;
  dimensions: {
    width: number;
    length: number;
    height: number;
    unit: 'feet' | 'meters';
  } | null;
  is_public: boolean;
  created_at: string;
  updated_at: string | null;
} 
import { supabase } from '../../api/supabaseClient';
import { Venue } from '../types/venue';

export const fetchVenues = async (): Promise<Venue[]> => {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      id,
      name,
      description,
      location,
      capacity,
      price_range,
      rating,
      image_url,
      amenities,
      event_types,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }

  return data.map(venue => ({
    id: venue.id,
    name: venue.name,
    description: venue.description,
    location: venue.location,
    capacity: venue.capacity,
    priceRange: venue.price_range,
    rating: venue.rating,
    imageUrl: venue.image_url,
    amenities: venue.amenities || [],
    eventTypes: venue.event_types || [],
  }));
};

export const filterVenues = (
  venues: Venue[],
  filters: {
    eventType?: string[];
    amenities?: string[];
    priceRange?: string[];
    searchQuery?: string;
  }
): Venue[] => {
  return venues.filter(venue => {
    // Filter by event type
    if (filters.eventType?.length && !filters.eventType.some(type => 
      venue.eventTypes.includes(type)
    )) {
      return false;
    }

    // Filter by amenities
    if (filters.amenities?.length && !filters.amenities.every(amenity => 
      venue.amenities.includes(amenity)
    )) {
      return false;
    }

    // Filter by price range
    if (filters.priceRange?.length && !filters.priceRange.includes(venue.priceRange)) {
      return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        venue.name.toLowerCase().includes(query) ||
        venue.description.toLowerCase().includes(query) ||
        venue.location.toLowerCase().includes(query)
      );
    }

    return true;
  });
};

export const getVenueById = async (venueId: string): Promise<Venue | null> => {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', venueId)
    .single();

  if (error) {
    console.error('Error fetching venue:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    location: data.location,
    capacity: data.capacity,
    priceRange: data.price_range,
    rating: data.rating,
    imageUrl: data.image_url,
    amenities: data.amenities || [],
    eventTypes: data.event_types || [],
  };
}; 
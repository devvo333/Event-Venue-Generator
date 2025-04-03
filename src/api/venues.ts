import { supabase } from '../config/supabase';

export interface Venue {
  id: string;
  owner_id: string;
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

export interface VenueCreateInput {
  name: string;
  description?: string;
  address?: string;
  dimensions?: {
    width: number;
    length: number;
    height: number;
    unit: 'feet' | 'meters';
  };
  is_public?: boolean;
}

export interface VenueUpdateInput extends VenueCreateInput {
  id: string;
}

/**
 * Create a new venue for the current user
 */
export const createVenue = async (
  venueData: VenueCreateInput
): Promise<{ 
  venue: Venue | null; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { venue: null, error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('venues')
      .insert({
        owner_id: user.user.id,
        name: venueData.name,
        description: venueData.description || null,
        address: venueData.address || null,
        dimensions: venueData.dimensions || null,
        is_public: venueData.is_public || false,
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { venue: data as Venue, error: null };
  } catch (error) {
    console.error('Error creating venue:', error);
    return { venue: null, error };
  }
};

/**
 * Get a venue by ID
 */
export const getVenue = async (venueId: string): Promise<{ 
  venue: Venue | null; 
  error: any | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return { venue: data as Venue, error: null };
  } catch (error) {
    console.error('Error fetching venue:', error);
    return { venue: null, error };
  }
};

/**
 * Get all venues owned by the current user
 */
export const getUserVenues = async (): Promise<{ 
  venues: Venue[] | null; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { venues: null, error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('owner_id', user.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { venues: data as Venue[], error: null };
  } catch (error) {
    console.error('Error fetching user venues:', error);
    return { venues: null, error };
  }
};

/**
 * Get all public venues
 */
export const getPublicVenues = async (): Promise<{ 
  venues: Venue[] | null; 
  error: any | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { venues: data as Venue[], error: null };
  } catch (error) {
    console.error('Error fetching public venues:', error);
    return { venues: null, error };
  }
};

/**
 * Update a venue
 */
export const updateVenue = async (
  venueData: VenueUpdateInput
): Promise<{ 
  success: boolean; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    // Extract the ID from the input and remove it from the update payload
    const { id, ...updates } = venueData;
    
    // Verify the venue belongs to the current user
    const { data: venueCheck, error: checkError } = await supabase
      .from('venues')
      .select('owner_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      throw checkError;
    }
    
    if (!venueCheck || venueCheck.owner_id !== user.user.id) {
      return { success: false, error: new Error('Unauthorized: You do not own this venue') };
    }
    
    // Update the venue
    const { error } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating venue:', error);
    return { success: false, error };
  }
};

/**
 * Delete a venue
 */
export const deleteVenue = async (
  venueId: string
): Promise<{ 
  success: boolean; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    // Verify the venue belongs to the current user
    const { data: venueCheck, error: checkError } = await supabase
      .from('venues')
      .select('owner_id')
      .eq('id', venueId)
      .single();
      
    if (checkError) {
      throw checkError;
    }
    
    if (!venueCheck || venueCheck.owner_id !== user.user.id) {
      return { success: false, error: new Error('Unauthorized: You do not own this venue') };
    }
    
    // Delete the venue
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', venueId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting venue:', error);
    return { success: false, error };
  }
};

/**
 * Upload a venue cover image
 */
export const uploadVenueCoverImage = async (
  venueId: string,
  file: File
): Promise<{
  url: string | null;
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { url: null, error: new Error('User not authenticated') };
    }
    
    // Verify the venue belongs to the current user
    const { data: venueCheck, error: checkError } = await supabase
      .from('venues')
      .select('owner_id')
      .eq('id', venueId)
      .single();
      
    if (checkError) {
      throw checkError;
    }
    
    if (!venueCheck || venueCheck.owner_id !== user.user.id) {
      return { url: null, error: new Error('Unauthorized: You do not own this venue') };
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}/${venueId}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('venue-images')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('venue-images')
      .getPublicUrl(fileName);
      
    const imageUrl = data.publicUrl;
    
    // Update the venue
    const { error: updateError } = await supabase
      .from('venues')
      .update({ cover_image: imageUrl })
      .eq('id', venueId);
      
    if (updateError) {
      throw updateError;
    }
    
    return { url: imageUrl, error: null };
  } catch (error) {
    console.error('Error uploading venue cover image:', error);
    return { url: null, error };
  }
}; 
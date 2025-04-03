import { supabase } from '../config/supabase';
import { Asset } from '@/types/assets';

export interface AssetCreateInput {
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  imageUrl: string;
  width?: number;
  height?: number;
  is_public?: boolean;
}

export interface AssetUpdateInput extends Partial<AssetCreateInput> {
  id: string;
}

/**
 * Create a new asset
 */
export const createAsset = async (
  assetData: AssetCreateInput
): Promise<{ 
  asset: Asset | null; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { asset: null, error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('assets')
      .insert({
        creator_id: user.user.id,
        name: assetData.name,
        description: assetData.description || null,
        category: assetData.category,
        tags: assetData.tags || [],
        imageUrl: assetData.imageUrl,
        width: assetData.width || null,
        height: assetData.height || null,
        is_public: assetData.is_public || false,
        status: user.user.id === 'admin' ? 'approved' : 'pending', // Auto-approve for admins
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { asset: data as Asset, error: null };
  } catch (error) {
    console.error('Error creating asset:', error);
    return { asset: null, error };
  }
};

/**
 * Get an asset by ID
 */
export const getAsset = async (assetId: string): Promise<{ 
  asset: Asset | null; 
  error: any | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return { asset: data as Asset, error: null };
  } catch (error) {
    console.error('Error fetching asset:', error);
    return { asset: null, error };
  }
};

/**
 * Get all assets created by the current user
 */
export const getUserAssets = async (): Promise<{ 
  assets: Asset[] | null; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { assets: null, error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('creator_id', user.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { assets: data as Asset[], error: null };
  } catch (error) {
    console.error('Error fetching user assets:', error);
    return { assets: null, error };
  }
};

/**
 * Get all public and approved assets
 */
export const getPublicAssets = async (): Promise<{ 
  assets: Asset[] | null; 
  error: any | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { assets: data as Asset[], error: null };
  } catch (error) {
    console.error('Error fetching public assets:', error);
    return { assets: null, error };
  }
};

/**
 * Get assets by category
 */
export const getAssetsByCategory = async (category: string): Promise<{ 
  assets: Asset[] | null; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      // Non-authenticated users can only see public approved assets
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('category', category)
        .eq('is_public', true)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return { assets: data as Asset[], error: null };
    }
    
    // Authenticated users can see public approved assets and their own assets
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('category', category)
      .or(`is_public.eq.true,creator_id.eq.${user.user.id}`)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { assets: data as Asset[], error: null };
  } catch (error) {
    console.error('Error fetching assets by category:', error);
    return { assets: null, error };
  }
};

/**
 * Search assets by name or tags
 */
export const searchAssets = async (searchTerm: string): Promise<{ 
  assets: Asset[] | null; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    let query = supabase
      .from('assets')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    
    if (!user.user) {
      // Non-authenticated users can only see public approved assets
      query = query
        .eq('is_public', true)
        .eq('status', 'approved');
    } else {
      // Authenticated users can see public approved assets and their own assets
      query = query.or(`is_public.eq.true,creator_id.eq.${user.user.id}`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { assets: data as Asset[], error: null };
  } catch (error) {
    console.error('Error searching assets:', error);
    return { assets: null, error };
  }
};

/**
 * Update an asset
 */
export const updateAsset = async (
  assetData: AssetUpdateInput
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
    const { id, ...updates } = assetData;
    
    // Verify the asset belongs to the current user
    const { data: assetCheck, error: checkError } = await supabase
      .from('assets')
      .select('creator_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      throw checkError;
    }
    
    if (!assetCheck || assetCheck.creator_id !== user.user.id) {
      return { success: false, error: new Error('Unauthorized: You do not own this asset') };
    }
    
    // Update the asset
    const { error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { success: false, error };
  }
};

/**
 * Delete an asset
 */
export const deleteAsset = async (
  assetId: string
): Promise<{ 
  success: boolean; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    // Verify the asset belongs to the current user
    const { data: assetCheck, error: checkError } = await supabase
      .from('assets')
      .select('creator_id')
      .eq('id', assetId)
      .single();
      
    if (checkError) {
      throw checkError;
    }
    
    if (!assetCheck || assetCheck.creator_id !== user.user.id) {
      return { success: false, error: new Error('Unauthorized: You do not own this asset') };
    }
    
    // Delete the asset
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return { success: false, error };
  }
};

/**
 * Upload asset image
 */
export const uploadAssetImage = async (
  file: File,
  assetName: string
): Promise<{
  url: string | null;
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { url: null, error: new Error('User not authenticated') };
    }
    
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const sanitizedName = assetName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${user.user.id}/${sanitizedName}-${timestamp}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName);
      
    const imageUrl = data.publicUrl;
    
    return { url: imageUrl, error: null };
  } catch (error) {
    console.error('Error uploading asset image:', error);
    return { url: null, error };
  }
}; 
import { supabase } from '../config/supabase';

export interface UserProfile {
  id: string;
  email: string;
  role: 'venue_owner' | 'stager' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Get the current user's profile
 */
export const getCurrentUserProfile = async (): Promise<{ 
  profile: UserProfile | null; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { profile: null, error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return { profile: data as UserProfile, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, error };
  }
};

/**
 * Get a user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<{ 
  profile: UserProfile | null; 
  error: any | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return { profile: data as UserProfile, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, error };
  }
};

/**
 * Update the current user's profile
 */
export const updateUserProfile = async (
  updates: Partial<UserProfile>
): Promise<{ 
  success: boolean; 
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    // Don't allow updating id, email, or role through this function
    const { id, email, role, created_at, ...validUpdates } = updates;
    
    const { error } = await supabase
      .from('profiles')
      .update(validUpdates)
      .eq('id', user.user.id);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

/**
 * Upload a user avatar
 */
export const uploadAvatar = async (
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
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    const avatarUrl = data.publicUrl;
    
    // Update the user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.user.id);
      
    if (updateError) {
      throw updateError;
    }
    
    return { url: avatarUrl, error: null };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { url: null, error };
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<{
  users: UserProfile[] | null;
  error: any | null;
}> => {
  try {
    // First check if current user is admin
    const { profile, error: profileError } = await getCurrentUserProfile();
    
    if (profileError || !profile) {
      return { users: null, error: profileError || new Error('Failed to get current user profile') };
    }
    
    if (profile.role !== 'admin') {
      return { users: null, error: new Error('Unauthorized: Admin access required') };
    }
    
    // Get all users
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { users: data as UserProfile[], error: null };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { users: null, error };
  }
}; 
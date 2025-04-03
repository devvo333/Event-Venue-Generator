import { supabase } from '../config/supabase';

export interface Layout {
  id: string;
  name: string;
  data: any; // Replace with more specific type based on your layout data structure
  created_at: string;
  updated_at: string;
  venue_id: string;
  user_id: string;
}

export async function fetchLayoutById(layoutId: string): Promise<Layout | null> {
  try {
    const { data, error } = await supabase
      .from('layouts')
      .select('*')
      .eq('id', layoutId)
      .single();

    if (error) {
      console.error('Error fetching layout:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchLayoutById:', error);
    return null;
  }
} 
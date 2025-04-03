import { supabase } from '../lib/supabase';
import {
  LayoutTemplate,
  UserGeneratedLayout,
  LayoutMarketplaceItem,
  LayoutSearchFilters,
} from '../types/layout';

export const getLayoutTemplates = async (): Promise<LayoutTemplate[]> => {
  const { data, error } = await supabase
    .from('layout_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch layout templates: ${error.message}`);
  }

  return data;
};

export const getUserGeneratedLayouts = async (): Promise<UserGeneratedLayout[]> => {
  const { data, error } = await supabase
    .from('user_generated_layouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user layouts: ${error.message}`);
  }

  return data;
};

export const getMarketplaceLayouts = async (
  filters: LayoutSearchFilters
): Promise<LayoutMarketplaceItem[]> => {
  let query = supabase
    .from('layout_marketplace')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.venueType) {
    query = query.eq('metadata->venueType', filters.venueType);
  }

  if (filters.eventType) {
    query = query.eq('metadata->eventType', filters.eventType);
  }

  if (filters.priceRange) {
    query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
  }

  switch (filters.sortBy) {
    case 'popular':
      query = query.order('sales_count', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch marketplace layouts: ${error.message}`);
  }

  return data;
};

export const createLayout = async (
  layout: Omit<UserGeneratedLayout, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserGeneratedLayout> => {
  const { data, error } = await supabase
    .from('user_generated_layouts')
    .insert([layout])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create layout: ${error.message}`);
  }

  return data;
};

export const updateLayout = async (
  id: string,
  layout: Partial<UserGeneratedLayout>
): Promise<UserGeneratedLayout> => {
  const { data, error } = await supabase
    .from('user_generated_layouts')
    .update(layout)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update layout: ${error.message}`);
  }

  return data;
};

export const deleteLayout = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('user_generated_layouts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete layout: ${error.message}`);
  }
};

export const likeLayout = async (layoutId: string): Promise<void> => {
  const { error } = await supabase
    .from('layout_likes')
    .insert([{ layout_id: layoutId }]);

  if (error) {
    throw new Error(`Failed to like layout: ${error.message}`);
  }
};

export const purchaseLayout = async (
  layoutId: string,
  quantity: number
): Promise<void> => {
  const { error } = await supabase
    .from('layout_purchases')
    .insert([{ layout_id: layoutId, quantity }]);

  if (error) {
    throw new Error(`Failed to purchase layout: ${error.message}`);
  }
};

export const shareLayout = async (layoutId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('layout_shares')
    .insert([{ layout_id: layoutId }])
    .select('share_url')
    .single();

  if (error) {
    throw new Error(`Failed to share layout: ${error.message}`);
  }

  return data.share_url;
}; 
import { createClient } from '@supabase/supabase-js';
import { env } from '@config/env';

// Debug logging
console.log('Supabase URL:', env.supabaseUrl);
console.log('URL type:', typeof env.supabaseUrl);
console.log('URL length:', env.supabaseUrl?.length);

// Validate URL format
try {
  if (env.supabaseUrl) {
    new URL(env.supabaseUrl);
  }
} catch (error) {
  console.error('Invalid Supabase URL format:', error);
}

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure URL starts with https:// and ends with .supabase.co
if (!env.supabaseUrl.startsWith('https://') || !env.supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid Supabase URL format. URL should start with https:// and contain .supabase.co');
}

// Create a single instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient(); 
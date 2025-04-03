interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Debug logging
console.log('Raw env variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '[EXISTS]' : '[MISSING]'
});

// Helper function to validate and format URL
const validateSupabaseUrl = (url: string | undefined): string => {
  if (!url) {
    throw new Error('VITE_SUPABASE_URL is undefined');
  }

  // Remove any accidental whitespace
  url = url.trim();

  // Ensure URL starts with https://
  if (!url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Ensure URL ends with .supabase.co if not already
  if (!url.includes('.supabase.co')) {
    throw new Error('Invalid Supabase URL: Must contain .supabase.co');
  }

  try {
    new URL(url);
    return url;
  } catch (error: any) {
    throw new Error(`Invalid Supabase URL format: ${error?.message || 'Unknown error'}`);
  }
};

export const env: EnvConfig = {
  supabaseUrl: validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
};

// Validate environment variables
const requiredEnvVars: (keyof EnvConfig)[] = ['supabaseUrl', 'supabaseAnonKey'];

requiredEnvVars.forEach((key) => {
  if (!env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    console.log('Available environment variables:', import.meta.env);
  }
}); 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mock.supabase.co';
const supabaseKey = 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseKey); 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrepcoqtfpvvuypmfrgz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZXBjb3F0ZnB2dnV5cG1mcmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NTEyNTgsImV4cCI6MjA1OTIyNzI1OH0._Hq_Gr9z_i406uaWGSAeYxmA0vk_ubI0ulNDdlMkBlI';

export const supabase = createClient(supabaseUrl, supabaseKey); 
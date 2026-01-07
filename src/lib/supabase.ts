import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orpdpcvwwftnncsyzbwq.supabase.co';

// Using the key user confirmed earlier.
// IMPORTANT: In production, use environment variables: import.meta.env.VITE_SUPABASE_KEY
const SUPABASE_KEY = 'sb_publishable_kISpxfZJHmxn4uzC1NeELg_thEVRNWA'; // Using the publishable key as identified

export const supabase = createClient(supabaseUrl, SUPABASE_KEY);

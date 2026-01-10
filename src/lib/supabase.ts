import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://orpdpcvwwftnncsyzbwq.supabase.co';

// Using the key user confirmed earlier.
// IMPORTANT: In production, use environment variables: import.meta.env.VITE_SUPABASE_KEY
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycGRwY3Z3d2Z0bm5jc3l6YndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjI4OTMsImV4cCI6MjA4MzI5ODg5M30.AMsHlk1eFjIOiy64LwYP7D-b47SnpGfDKtP-BTR9Mcg';

export const supabase = createClient(supabaseUrl, supabaseKey);

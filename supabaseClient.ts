import { createClient } from '@supabase/supabase-js';

// بيانات مشروعك (جاهزة للعمل)
const supabaseUrl = 'https://sdxtpldpxewvkjwmlkcz.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_c0pLNtJrtegGwEFCvgAOGQ_Z9ag411h';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

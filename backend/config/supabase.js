import { createClient } from '@supabase/supabase-js';
import { envConfig } from './env.js';

if (!envConfig.SUPABASE_URL || !envConfig.SUPABASE_ANON_KEY) {
  console.warn('[WARNING] Supabase credentials not configured in environment variables.');
}

// Client for standard public/auth context
export const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Admin client using service role key (bypasses RLS for backend management operations)
const adminKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_ANON_KEY;
export const supabaseAdmin = createClient(envConfig.SUPABASE_URL, adminKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

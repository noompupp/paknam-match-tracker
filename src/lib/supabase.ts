
// Re-export the integrated Supabase client for compatibility
export { supabase } from '@/integrations/supabase/client';

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  // Since we're using the integrated client, it's always configured
  return true;
};

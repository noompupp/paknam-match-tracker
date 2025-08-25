import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Periodic Sync: Starting background sync process...');

    // Check current sync health status
    const { data: healthStatus, error: healthError } = await supabaseClient
      .rpc('get_sync_health_status');

    if (healthError) {
      console.error('❌ Error checking sync health:', healthError);
      throw healthError;
    }

    console.log('📊 Current sync health:', healthStatus);

    // If sync is unhealthy or stale, perform sync
    const needsSync = healthStatus.sync_health === 'unhealthy' || 
                     healthStatus.sync_health === 'stale' ||
                     (healthStatus.discrepancy_status?.has_discrepancies === true);

    if (needsSync) {
      console.log('🚨 Sync issues detected, performing automatic sync...');
      
      // Perform manual sync (which is actually automatic background sync)
      const { data: syncResult, error: syncError } = await supabaseClient
        .rpc('manual_sync_player_stats');

      if (syncError) {
        console.error('❌ Background sync failed:', syncError);
        throw syncError;
      }

      console.log('✅ Background sync completed:', syncResult);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'sync_performed',
          syncResult,
          healthBefore: healthStatus,
          message: `Background sync completed. Fixed ${syncResult.discrepancies_fixed} discrepancies, updated ${syncResult.players_updated} players.`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } else {
      console.log('✅ Sync health is good, no action needed');
      
      return new Response(
        JSON.stringify({
          success: true,
          action: 'no_sync_needed',
          healthStatus,
          message: 'Sync health is good, no background sync required.'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

  } catch (error) {
    console.error('❌ Periodic sync function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Periodic sync failed'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})
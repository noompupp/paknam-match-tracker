import { supabase } from '@/integrations/supabase/client';

interface EnhancedPlayerStats {
  id: number;
  name: string;
  team_id?: string;
  goals: number;
  assists: number;
  matches_played: number;
  profileImageUrl?: string;
}

interface SyncHealthStatus {
  sync_health: 'healthy' | 'unhealthy' | 'stale';
  last_sync: string | null;
  total_goal_assist_events: number;
  total_players_with_stats: number;
  discrepancy_status: {
    has_discrepancies: boolean;
    discrepancy_count: number;
    discrepancies: Array<{
      player_name: string;
      stored_goals: number;
      actual_goals: number;
      stored_assists: number;
      actual_assists: number;
      goals_diff: number;
      assists_diff: number;
    }>;
  };
  sync_enabled: boolean;
  status_checked_at: string;
}

export const enhancedPlayerStatsAPI = {
  // Enhanced top scorers with real-time sync validation
  async getTopScorers(limit: number = 10): Promise<EnhancedPlayerStats[]> {
    console.log(`🏆 EnhancedPlayerStatsAPI: Fetching top ${limit} scorers with sync validation...`);
    
    try {
      // First check sync health
      const syncStatus = await this.getSyncHealth();
      
      if (syncStatus.discrepancy_status.has_discrepancies) {
        console.warn('⚠️ EnhancedPlayerStatsAPI: Sync discrepancies detected, triggering auto-fix...');
        await this.performManualSync();
      }
      
      // Fetch top scorers with enhanced query
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          name,
          team_id,
          goals,
          assists,
          matches_played,
          ProfileURL,
          optimized_avatar_url,
          avatar_variants
        `)
        .gt('goals', 0)
        .order('goals', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ EnhancedPlayerStatsAPI: Error fetching top scorers:', error);
        throw error;
      }

      // Transform data with profile image handling
      const transformedData: EnhancedPlayerStats[] = data?.map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        team_id: player.team_id,
        goals: player.goals || 0,
        assists: player.assists || 0,
        matches_played: player.matches_played || 0,
        profileImageUrl: player.optimized_avatar_url || player.ProfileURL || undefined
      })) || [];

      console.log(`✅ EnhancedPlayerStatsAPI: Successfully fetched ${transformedData.length} top scorers`);
      return transformedData;

    } catch (error) {
      console.error('❌ EnhancedPlayerStatsAPI: Critical error in getTopScorers:', error);
      throw error;
    }
  },

  // Enhanced top assists with real-time sync validation
  async getTopAssists(limit: number = 10): Promise<EnhancedPlayerStats[]> {
    console.log(`🎯 EnhancedPlayerStatsAPI: Fetching top ${limit} assists with sync validation...`);
    
    try {
      // First check sync health
      const syncStatus = await this.getSyncHealth();
      
      if (syncStatus.discrepancy_status.has_discrepancies) {
        console.warn('⚠️ EnhancedPlayerStatsAPI: Sync discrepancies detected, triggering auto-fix...');
        await this.performManualSync();
      }
      
      // Fetch top assists with enhanced query
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          name,
          team_id,
          goals,
          assists,
          matches_played,
          ProfileURL,
          optimized_avatar_url,
          avatar_variants
        `)
        .gt('assists', 0)
        .order('assists', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ EnhancedPlayerStatsAPI: Error fetching top assists:', error);
        throw error;
      }

      // Transform data with profile image handling
      const transformedData: EnhancedPlayerStats[] = data?.map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        team_id: player.team_id,
        goals: player.goals || 0,
        assists: player.assists || 0,
        matches_played: player.matches_played || 0,
        profileImageUrl: player.optimized_avatar_url || player.ProfileURL || undefined
      })) || [];

      console.log(`✅ EnhancedPlayerStatsAPI: Successfully fetched ${transformedData.length} top assists`);
      return transformedData;

    } catch (error) {
      console.error('❌ EnhancedPlayerStatsAPI: Critical error in getTopAssists:', error);
      throw error;
    }
  },

  // Get sync health status
  async getSyncHealth(): Promise<SyncHealthStatus> {
    console.log('📊 EnhancedPlayerStatsAPI: Checking sync health status...');
    
    try {
      const { data, error } = await supabase.rpc('get_sync_health_status');
      
      if (error) {
        console.error('❌ EnhancedPlayerStatsAPI: Error getting sync health:', error);
        throw error;
      }

      console.log('✅ EnhancedPlayerStatsAPI: Sync health retrieved:', data);
      return data as unknown as SyncHealthStatus;

    } catch (error) {
      console.error('❌ EnhancedPlayerStatsAPI: Critical error getting sync health:', error);
      throw error;
    }
  },

  // Perform manual sync
  async performManualSync(): Promise<any> {
    console.log('🔄 EnhancedPlayerStatsAPI: Performing manual sync...');
    
    try {
      const { data, error } = await supabase.rpc('manual_sync_player_stats');
      
      if (error) {
        console.error('❌ EnhancedPlayerStatsAPI: Error performing manual sync:', error);
        throw error;
      }

      console.log('✅ EnhancedPlayerStatsAPI: Manual sync completed:', data);
      return data;

    } catch (error) {
      console.error('❌ EnhancedPlayerStatsAPI: Critical error performing manual sync:', error);
      throw error;
    }
  },

  // Detect sync discrepancies
  async detectDiscrepancies(): Promise<any> {
    console.log('🔍 EnhancedPlayerStatsAPI: Detecting sync discrepancies...');
    
    try {
      const { data, error } = await supabase.rpc('detect_sync_discrepancies');
      
      if (error) {
        console.error('❌ EnhancedPlayerStatsAPI: Error detecting discrepancies:', error);
        throw error;
      }

      console.log('✅ EnhancedPlayerStatsAPI: Discrepancy detection completed:', data);
      return data;

    } catch (error) {
      console.error('❌ EnhancedPlayerStatsAPI: Critical error detecting discrepancies:', error);
      throw error;
    }
  },

  // Validate and auto-fix sync if needed
  async validateAndAutoFixSync(): Promise<boolean> {
    console.log('🛠️ EnhancedPlayerStatsAPI: Validating sync and auto-fixing if needed...');
    
    try {
      const syncHealth = await this.getSyncHealth();
      
      if (syncHealth.discrepancy_status.has_discrepancies) {
        console.warn('⚠️ EnhancedPlayerStatsAPI: Discrepancies found, auto-fixing...');
        const syncResult = await this.performManualSync();
        
        if (syncResult.success && syncResult.discrepancies_fixed > 0) {
          console.log(`✅ EnhancedPlayerStatsAPI: Auto-fix successful, fixed ${syncResult.discrepancies_fixed} discrepancies`);
          return true;
        }
      } else {
        console.log('✅ EnhancedPlayerStatsAPI: Sync is healthy, no fixes needed');
        return true;
      }
      
      return false;

    } catch (error) {
      console.error('❌ EnhancedPlayerStatsAPI: Critical error in validateAndAutoFixSync:', error);
      return false;
    }
  }
};
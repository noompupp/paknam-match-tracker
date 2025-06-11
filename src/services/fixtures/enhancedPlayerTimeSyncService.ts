
import { supabase } from '@/integrations/supabase/client';

interface PlayerTimeSync {
  playerId: number;
  playerName: string;
  teamId: number;
  totalMinutes: number;
  seasonTotal: number;
  lastSyncTime: string;
}

export const enhancedPlayerTimeSyncService = {
  async syncPlayerTimeData(fixtureId: number): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    console.log('🔄 EnhancedPlayerTimeSyncService: Starting player time sync for fixture:', fixtureId);
    
    try {
      const errors: string[] = [];
      let syncedCount = 0;

      // Get all player time tracking data for this fixture
      const { data: playerTimes, error: fetchError } = await supabase
        .from('player_time_tracking')
        .select('*')
        .eq('fixture_id', fixtureId);

      if (fetchError) {
        console.error('❌ EnhancedPlayerTimeSyncService: Error fetching player times:', fetchError);
        return { success: false, syncedCount: 0, errors: [fetchError.message] };
      }

      if (!playerTimes || playerTimes.length === 0) {
        console.log('ℹ️ EnhancedPlayerTimeSyncService: No player time data to sync');
        return { success: true, syncedCount: 0, errors: [] };
      }

      // Process each player's time data
      for (const playerTime of playerTimes) {
        try {
          // The trigger will automatically handle the sync when we update player_time_tracking
          // We just need to touch the record to trigger the sync
          const { error: updateError } = await supabase
            .from('player_time_tracking')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', playerTime.id);

          if (updateError) {
            console.error(`❌ EnhancedPlayerTimeSyncService: Error syncing player ${playerTime.player_id}:`, updateError);
            errors.push(`Failed to sync player ${playerTime.player_name}: ${updateError.message}`);
          } else {
            syncedCount++;
            console.log(`✅ EnhancedPlayerTimeSyncService: Synced player ${playerTime.player_name}`);
          }
        } catch (error) {
          console.error(`❌ EnhancedPlayerTimeSyncService: Error processing player ${playerTime.player_id}:`, error);
          errors.push(`Error processing player ${playerTime.player_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`✅ EnhancedPlayerTimeSyncService: Sync completed. ${syncedCount} players synced, ${errors.length} errors`);
      
      return {
        success: errors.length === 0,
        syncedCount,
        errors
      };

    } catch (error) {
      console.error('❌ EnhancedPlayerTimeSyncService: Critical error in sync:', error);
      return {
        success: false,
        syncedCount: 0,
        errors: [error instanceof Error ? error.message : 'Critical sync error']
      };
    }
  },

  async getPlayerTimeStats(playerId: number): Promise<PlayerTimeSync | null> {
    console.log('📊 EnhancedPlayerTimeSyncService: Getting player time stats for:', playerId);
    
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error || !member) {
        console.error('❌ EnhancedPlayerTimeSyncService: Player not found:', error);
        return null;
      }

      return {
        playerId: member.id,
        playerName: member.name,
        teamId: parseInt(member.team_id),
        totalMinutes: member.total_minutes_played || 0,
        seasonTotal: member.total_minutes_this_season || 0,
        lastSyncTime: member.last_time_sync || member.updated_at
      };

    } catch (error) {
      console.error('❌ EnhancedPlayerTimeSyncService: Error getting player stats:', error);
      return null;
    }
  },

  async validateTimeDataIntegrity(fixtureId: number): Promise<{ isValid: boolean; issues: string[] }> {
    console.log('🔍 EnhancedPlayerTimeSyncService: Validating time data integrity for fixture:', fixtureId);
    
    try {
      const issues: string[] = [];

      // Check for players with time tracking but no member record
      const { data: orphanedTimes, error: orphanError } = await supabase
        .from('player_time_tracking')
        .select(`
          player_id,
          player_name,
          members!inner(id)
        `)
        .eq('fixture_id', fixtureId)
        .is('members.id', null);

      if (orphanError) {
        issues.push(`Error checking orphaned times: ${orphanError.message}`);
      } else if (orphanedTimes && orphanedTimes.length > 0) {
        issues.push(`Found ${orphanedTimes.length} player time records without corresponding member records`);
      }

      // Check for members with outdated sync times
      const { data: outdatedSync, error: syncError } = await supabase
        .from('members')
        .select('id, name, last_time_sync')
        .lt('last_time_sync', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24 hours ago

      if (syncError) {
        issues.push(`Error checking sync times: ${syncError.message}`);
      } else if (outdatedSync && outdatedSync.length > 0) {
        issues.push(`Found ${outdatedSync.length} members with outdated sync times`);
      }

      console.log(`✅ EnhancedPlayerTimeSyncService: Integrity check completed. ${issues.length} issues found`);
      
      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      console.error('❌ EnhancedPlayerTimeSyncService: Error in integrity validation:', error);
      return {
        isValid: false,
        issues: [error instanceof Error ? error.message : 'Integrity check failed']
      };
    }
  }
};

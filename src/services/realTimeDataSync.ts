
import { useMatchStore } from '@/stores/useMatchStore';
import { supabase } from '@/integrations/supabase/client';

export interface SyncResult {
  success: boolean;
  updatedGoals: number;
  errors: string[];
  localStoreUpdated: boolean;
  goalFound?: boolean;
  matchedGoalId?: string;
}

export const realTimeDataSync = {
  async syncGoalDetailsUpdate(goalId: string | number, updatedPlayerName: string): Promise<SyncResult> {
    console.log('🔄 RealTimeDataSync: Starting enhanced goal details sync for:', { goalId, updatedPlayerName });
    
    const result: SyncResult = {
      success: false,
      updatedGoals: 0,
      errors: [],
      localStoreUpdated: false,
      goalFound: false
    };

    try {
      // Get the current local store state
      const { goals, updateGoal, triggerUIUpdate } = useMatchStore.getState();
      console.log('📊 RealTimeDataSync: Current local goals:', goals.length);

      // Enhanced goal matching with multiple strategies
      let goalToUpdate = null;
      let matchedGoalId = null;

      // Strategy 1: Find by exact ID match
      goalToUpdate = goals.find(g => 
        g.id === String(goalId) || 
        g.id === goalId ||
        g.id === `global_${goalId}` ||
        g.id.includes(String(goalId))
      );

      if (goalToUpdate) {
        matchedGoalId = goalToUpdate.id;
        console.log('✅ RealTimeDataSync: Found goal by ID match:', matchedGoalId);
      }

      // Strategy 2: Find by unassigned goal pattern if exact ID fails
      if (!goalToUpdate) {
        const unassignedGoals = goals.filter(g => 
          (g.playerName === 'Quick Goal' || g.playerName === 'Unknown Player') &&
          g.type === 'goal'
        );

        if (unassignedGoals.length > 0) {
          // Take the oldest unassigned goal
          goalToUpdate = unassignedGoals.sort((a, b) => a.timestamp - b.timestamp)[0];
          matchedGoalId = goalToUpdate.id;
          console.log('🔍 RealTimeDataSync: Found goal by unassigned pattern:', matchedGoalId);
        }
      }

      if (goalToUpdate && matchedGoalId) {
        console.log('✅ RealTimeDataSync: Updating local store goal:', {
          id: matchedGoalId,
          oldPlayerName: goalToUpdate.playerName,
          newPlayerName: updatedPlayerName
        });
        
        // Update the local store with enhanced data
        updateGoal(matchedGoalId, {
          playerName: updatedPlayerName,
          synced: true
        });

        // Force UI update trigger
        triggerUIUpdate();

        result.localStoreUpdated = true;
        result.updatedGoals = 1;
        result.success = true;
        result.goalFound = true;
        result.matchedGoalId = matchedGoalId;
        
        console.log('✅ RealTimeDataSync: Local store updated successfully with UI trigger');
      } else {
        result.errors.push('Could not find matching goal in local store');
        result.goalFound = false;
        console.warn('⚠️ RealTimeDataSync: No matching goal found for update');
      }

      return result;

    } catch (error) {
      console.error('❌ RealTimeDataSync: Error during sync:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      return result;
    }
  },

  async refreshGoalsFromDatabase(fixtureId: number): Promise<SyncResult> {
    console.log('🔄 RealTimeDataSync: Enhanced refresh from database for fixture:', fixtureId);
    
    const result: SyncResult = {
      success: false,
      updatedGoals: 0,
      errors: [],
      localStoreUpdated: false
    };

    try {
      // Fetch latest goals from database
      const { data: dbGoals, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .in('event_type', ['goal', 'assist'])
        .order('event_time', { ascending: true });

      if (error) {
        result.errors.push(`Database fetch error: ${error.message}`);
        return result;
      }

      if (!dbGoals || dbGoals.length === 0) {
        console.log('📭 RealTimeDataSync: No goals found in database');
        result.success = true;
        return result;
      }

      // Enhanced local store update with proper synchronization
      const { goals: currentGoals, updateGoal, triggerUIUpdate } = useMatchStore.getState();
      
      let updatedCount = 0;
      
      for (const dbGoal of dbGoals) {
        // Multiple matching strategies for database sync
        const localGoal = currentGoals.find(g => 
          g.id === String(dbGoal.id) ||
          g.id.includes(String(dbGoal.id)) ||
          (g.time === dbGoal.event_time && g.type === dbGoal.event_type && g.playerName !== dbGoal.player_name)
        );

        if (localGoal && localGoal.playerName !== dbGoal.player_name) {
          updateGoal(localGoal.id, {
            playerName: dbGoal.player_name,
            synced: true
          });
          updatedCount++;
          console.log('🔄 RealTimeDataSync: Updated local goal with DB data:', {
            localId: localGoal.id,
            dbId: dbGoal.id,
            playerName: dbGoal.player_name
          });
        }
      }

      // Trigger UI update if any changes were made
      if (updatedCount > 0) {
        triggerUIUpdate();
      }

      result.success = true;
      result.updatedGoals = updatedCount;
      result.localStoreUpdated = updatedCount > 0;
      
      console.log(`✅ RealTimeDataSync: Enhanced database refresh completed, updated ${updatedCount} goals`);
      return result;

    } catch (error) {
      console.error('❌ RealTimeDataSync: Error refreshing from database:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown refresh error');
      return result;
    }
  },

  // New method for comprehensive goal synchronization
  async forceGoalResync(fixtureId: number): Promise<SyncResult> {
    console.log('🔄 RealTimeDataSync: Force goal resync initiated for fixture:', fixtureId);
    
    const result: SyncResult = {
      success: false,
      updatedGoals: 0,
      errors: [],
      localStoreUpdated: false
    };

    try {
      // First refresh from database
      const dbRefreshResult = await this.refreshGoalsFromDatabase(fixtureId);
      
      // Trigger UI update regardless
      const { triggerUIUpdate } = useMatchStore.getState();
      triggerUIUpdate();
      
      result.success = dbRefreshResult.success;
      result.updatedGoals = dbRefreshResult.updatedGoals;
      result.errors = dbRefreshResult.errors;
      result.localStoreUpdated = true; // Always consider it updated for UI purposes
      
      console.log('✅ RealTimeDataSync: Force resync completed');
      return result;

    } catch (error) {
      console.error('❌ RealTimeDataSync: Error in force resync:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown resync error');
      return result;
    }
  }
};

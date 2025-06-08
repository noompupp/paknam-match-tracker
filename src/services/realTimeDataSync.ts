
import { useMatchStore } from '@/stores/useMatchStore';
import { supabase } from '@/integrations/supabase/client';

export interface SyncResult {
  success: boolean;
  updatedGoals: number;
  errors: string[];
  localStoreUpdated: boolean;
}

export const realTimeDataSync = {
  async syncGoalDetailsUpdate(goalId: string | number, updatedPlayerName: string): Promise<SyncResult> {
    console.log('🔄 RealTimeDataSync: Starting goal details sync for:', { goalId, updatedPlayerName });
    
    const result: SyncResult = {
      success: false,
      updatedGoals: 0,
      errors: [],
      localStoreUpdated: false
    };

    try {
      // Get the current local store state
      const { goals, updateGoal } = useMatchStore.getState();
      console.log('📊 RealTimeDataSync: Current local goals:', goals.length);

      // Strategy 1: Find by exact ID match
      let goalToUpdate = goals.find(g => 
        g.id === String(goalId) || 
        g.id === goalId
      );

      // Strategy 2: Find by player name pattern if exact ID fails
      if (!goalToUpdate) {
        goalToUpdate = goals.find(g => 
          (g.playerName === 'Quick Goal' || g.playerName === 'Unknown Player') &&
          g.type === 'goal'
        );
        console.log('🔍 RealTimeDataSync: Fallback match found:', !!goalToUpdate);
      }

      if (goalToUpdate) {
        console.log('✅ RealTimeDataSync: Updating local store goal:', goalToUpdate.id);
        
        // Update the local store immediately for UI responsiveness
        updateGoal(goalToUpdate.id, {
          playerName: updatedPlayerName,
          synced: true
        });

        result.localStoreUpdated = true;
        result.updatedGoals = 1;
        result.success = true;
        
        console.log('✅ RealTimeDataSync: Local store updated successfully');
      } else {
        result.errors.push('Could not find matching goal in local store');
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
    console.log('🔄 RealTimeDataSync: Refreshing goals from database for fixture:', fixtureId);
    
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

      // Transform database goals to match store format
      const { goals: currentGoals, updateGoal } = useMatchStore.getState();
      
      // Update existing goals with database data
      let updatedCount = 0;
      
      for (const dbGoal of dbGoals) {
        const localGoal = currentGoals.find(g => 
          g.id === String(dbGoal.id) ||
          (g.time === dbGoal.event_time && g.type === dbGoal.event_type)
        );

        if (localGoal && localGoal.playerName !== dbGoal.player_name) {
          updateGoal(localGoal.id, {
            playerName: dbGoal.player_name,
            synced: true
          });
          updatedCount++;
          console.log('🔄 RealTimeDataSync: Updated local goal with DB data:', localGoal.id);
        }
      }

      result.success = true;
      result.updatedGoals = updatedCount;
      result.localStoreUpdated = updatedCount > 0;
      
      console.log(`✅ RealTimeDataSync: Database refresh completed, updated ${updatedCount} goals`);
      return result;

    } catch (error) {
      console.error('❌ RealTimeDataSync: Error refreshing from database:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown refresh error');
      return result;
    }
  }
};

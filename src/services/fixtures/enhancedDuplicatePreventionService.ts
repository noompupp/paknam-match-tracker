import { supabase } from '@/integrations/supabase/client';

export interface DuplicateCleanupResult {
  removedCount: number;
  errors: string[];
  summary: string;
}

export const enhancedDuplicatePreventionService = {
  async cleanupAllDuplicateEvents(): Promise<DuplicateCleanupResult> {
    console.log('🧹 EnhancedDuplicatePreventionService: Starting comprehensive duplicate cleanup...');
    
    let totalRemoved = 0;
    const errors: string[] = [];
    
    try {
      // Clean up duplicate match events
      const matchEventsResult = await this.cleanupDuplicateMatchEvents();
      totalRemoved += matchEventsResult.removedCount;
      errors.push(...matchEventsResult.errors);
      
      // Clean up duplicate cards
      const cardsResult = await this.cleanupDuplicateCards();
      totalRemoved += cardsResult.removedCount;
      errors.push(...cardsResult.errors);
      
      // Clean up duplicate player time records
      const playerTimeResult = await this.cleanupDuplicatePlayerTimeRecords();
      totalRemoved += playerTimeResult.removedCount;
      errors.push(...playerTimeResult.errors);
      
      const summary = `Removed ${totalRemoved} duplicate records across all tables`;
      
      console.log('✅ EnhancedDuplicatePreventionService: Cleanup completed:', {
        totalRemoved,
        errorsCount: errors.length
      });
      
      return {
        removedCount: totalRemoved,
        errors,
        summary
      };
      
    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Critical error in cleanup:', error);
      throw error;
    }
  },

  async cleanupDuplicateMatchEvents(): Promise<DuplicateCleanupResult> {
    console.log('🧹 Cleaning duplicate match events...');
    
    try {
      // Find duplicates based on fixture_id, event_type, player_name, team_id, event_time
      const { data: duplicates, error: findError } = await supabase
        .from('match_events')
        .select('id, fixture_id, event_type, player_name, team_id, event_time')
        .order('created_at', { ascending: true });

      if (findError) {
        throw new Error(`Failed to find duplicates: ${findError.message}`);
      }

      if (!duplicates || duplicates.length === 0) {
        return { removedCount: 0, errors: [], summary: 'No duplicate match events found' };
      }

      // Group by potential duplicate criteria
      const duplicateGroups = new Map<string, any[]>();
      
      duplicates.forEach(event => {
        const key = `${event.fixture_id}-${event.event_type}-${event.player_name}-${event.team_id}-${event.event_time}`;
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key)!.push(event);
      });

      // Find groups with more than one event (duplicates)
      const idsToDelete: number[] = [];
      
      duplicateGroups.forEach(group => {
        if (group.length > 1) {
          // Keep the first (oldest) record, mark others for deletion
          for (let i = 1; i < group.length; i++) {
            idsToDelete.push(group[i].id);
          }
        }
      });

      if (idsToDelete.length === 0) {
        return { removedCount: 0, errors: [], summary: 'No duplicate match events found' };
      }

      // Delete duplicates
      const { error: deleteError } = await supabase
        .from('match_events')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        throw new Error(`Failed to delete duplicates: ${deleteError.message}`);
      }

      console.log(`✅ Removed ${idsToDelete.length} duplicate match events`);
      
      return {
        removedCount: idsToDelete.length,
        errors: [],
        summary: `Removed ${idsToDelete.length} duplicate match events`
      };

    } catch (error) {
      console.error('❌ Error cleaning duplicate match events:', error);
      return {
        removedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        summary: 'Failed to clean duplicate match events'
      };
    }
  },

  async cleanupDuplicateCards(): Promise<DuplicateCleanupResult> {
    console.log('🧹 Cleaning duplicate cards...');
    
    try {
      const { data: duplicates, error: findError } = await supabase
        .from('cards')
        .select('id, fixture_id, player_id, team_id, card_type, event_time')
        .order('created_at', { ascending: true });

      if (findError) {
        throw new Error(`Failed to find card duplicates: ${findError.message}`);
      }

      if (!duplicates || duplicates.length === 0) {
        return { removedCount: 0, errors: [], summary: 'No duplicate cards found' };
      }

      const duplicateGroups = new Map<string, any[]>();
      
      duplicates.forEach(card => {
        const key = `${card.fixture_id}-${card.player_id}-${card.team_id}-${card.card_type}-${card.event_time}`;
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key)!.push(card);
      });

      const idsToDelete: number[] = [];
      
      duplicateGroups.forEach(group => {
        if (group.length > 1) {
          for (let i = 1; i < group.length; i++) {
            idsToDelete.push(group[i].id);
          }
        }
      });

      if (idsToDelete.length === 0) {
        return { removedCount: 0, errors: [], summary: 'No duplicate cards found' };
      }

      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        throw new Error(`Failed to delete card duplicates: ${deleteError.message}`);
      }

      console.log(`✅ Removed ${idsToDelete.length} duplicate cards`);
      
      return {
        removedCount: idsToDelete.length,
        errors: [],
        summary: `Removed ${idsToDelete.length} duplicate cards`
      };

    } catch (error) {
      console.error('❌ Error cleaning duplicate cards:', error);
      return {
        removedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        summary: 'Failed to clean duplicate cards'
      };
    }
  },

  async cleanupDuplicatePlayerTimeRecords(): Promise<DuplicateCleanupResult> {
    console.log('🧹 Cleaning duplicate player time records...');
    
    try {
      const { data: duplicates, error: findError } = await supabase
        .from('player_time_tracking')
        .select('id, fixture_id, player_id, team_id')
        .order('created_at', { ascending: true });

      if (findError) {
        throw new Error(`Failed to find player time duplicates: ${findError.message}`);
      }

      if (!duplicates || duplicates.length === 0) {
        return { removedCount: 0, errors: [], summary: 'No duplicate player time records found' };
      }

      const duplicateGroups = new Map<string, any[]>();
      
      duplicates.forEach(record => {
        const key = `${record.fixture_id}-${record.player_id}-${record.team_id}`;
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key)!.push(record);
      });

      const idsToDelete: number[] = [];
      
      duplicateGroups.forEach(group => {
        if (group.length > 1) {
          for (let i = 1; i < group.length; i++) {
            idsToDelete.push(group[i].id);
          }
        }
      });

      if (idsToDelete.length === 0) {
        return { removedCount: 0, errors: [], summary: 'No duplicate player time records found' };
      }

      const { error: deleteError } = await supabase
        .from('player_time_tracking')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        throw new Error(`Failed to delete player time duplicates: ${deleteError.message}`);
      }

      console.log(`✅ Removed ${idsToDelete.length} duplicate player time records`);
      
      return {
        removedCount: idsToDelete.length,
        errors: [],
        summary: `Removed ${idsToDelete.length} duplicate player time records`
      };

    } catch (error) {
      console.error('❌ Error cleaning duplicate player time records:', error);
      return {
        removedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        summary: 'Failed to clean duplicate player time records'
      };
    }
  },

  async preventDuplicateGoalEvent(fixtureId: number, teamId: number, playerName: string): Promise<boolean> {
    console.log('🔍 Checking for duplicate goal event:', { fixtureId, teamId, playerName });
    
    try {
      const { data: existing, error } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .eq('team_id', teamId)
        .eq('player_name', playerName)
        .limit(1);

      if (error) {
        console.error('❌ Error checking for duplicate goal event:', error);
        return false; // Allow creation on error to prevent blocking
      }

      const isDuplicate = existing && existing.length > 0;
      
      if (isDuplicate) {
        console.log('⚠️ Duplicate goal event prevented');
      }
      
      return !isDuplicate; // Return true if NOT a duplicate (safe to create)

    } catch (error) {
      console.error('❌ Critical error in duplicate prevention:', error);
      return false; // Allow creation on error
    }
  }
};

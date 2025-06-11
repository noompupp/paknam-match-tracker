
import { supabase } from '@/integrations/supabase/client';
import { enhancedDuplicatePreventionService } from './fixtures/enhancedDuplicatePreventionService';
import { syncExistingMatchEvents, validatePlayerStats } from './fixtures/playerStatsSyncService';

export interface SyncResult {
  success: boolean;
  duplicatesRemoved: number;
  playersUpdated: number;
  goalsAdded: number;
  assistsAdded: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

export const dataSynchronizationService = {
  async performFullDataSync(): Promise<SyncResult> {
    console.log('🔄 DataSynchronizationService: Starting comprehensive data synchronization...');
    
    const result: SyncResult = {
      success: false,
      duplicatesRemoved: 0,
      playersUpdated: 0,
      goalsAdded: 0,
      assistsAdded: 0,
      errors: [],
      warnings: [],
      summary: ''
    };

    try {
      // Step 1: Clean up duplicate events across all fixtures
      console.log('🧹 DataSynchronizationService: Step 1 - Cleaning up duplicate events...');
      await this.cleanupAllDuplicateEvents(result);

      // Step 2: Synchronize player stats with match events
      console.log('📊 DataSynchronizationService: Step 2 - Synchronizing player stats...');
      await this.synchronizePlayerStats(result);

      // Step 3: Validate data consistency
      console.log('✅ DataSynchronizationService: Step 3 - Validating data consistency...');
      await this.validateDataConsistency(result);

      // Step 4: Refresh cached data
      console.log('🔄 DataSynchronizationService: Step 4 - Refreshing cached data...');
      await this.refreshCachedData();

      result.success = true;
      result.summary = this.generateSyncSummary(result);
      
      console.log('✅ DataSynchronizationService: Full synchronization completed successfully');
      return result;

    } catch (error) {
      console.error('❌ DataSynchronizationService: Critical error during synchronization:', error);
      result.errors.push(`Critical sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.summary = 'Synchronization failed due to critical errors';
      return result;
    }
  },

  async cleanupAllDuplicateEvents(result: SyncResult): Promise<void> {
    try {
      // Use the enhanced duplicate prevention service for comprehensive cleanup
      const cleanupResult = await enhancedDuplicatePreventionService.cleanupAllDuplicateEvents();
      result.duplicatesRemoved += cleanupResult.removedCount;
      result.errors.push(...cleanupResult.errors);

      console.log(`🧹 DataSynchronizationService: Cleaned up ${result.duplicatesRemoved} duplicate events`);
    } catch (error) {
      result.errors.push(`Critical error in duplicate cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async synchronizePlayerStats(result: SyncResult): Promise<void> {
    try {
      const syncResult = await syncExistingMatchEvents();
      
      result.playersUpdated += syncResult.playersUpdated;
      result.goalsAdded += syncResult.goalsAdded;
      result.assistsAdded += syncResult.assistsAdded;
      result.errors.push(...syncResult.errors);
      result.warnings.push(...syncResult.warnings);

      console.log(`📊 DataSynchronizationService: Updated ${result.playersUpdated} players with ${result.goalsAdded} goals and ${result.assistsAdded} assists`);
    } catch (error) {
      result.errors.push(`Critical error in player stats sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async validateDataConsistency(result: SyncResult): Promise<void> {
    try {
      const validationResult = await validatePlayerStats();
      
      if (!validationResult.isValid) {
        result.warnings.push(`Data validation found ${validationResult.issues.length} inconsistencies`);
        result.warnings.push(...validationResult.issues);
      } else {
        console.log('✅ DataSynchronizationService: Data validation passed');
      }
    } catch (error) {
      result.errors.push(`Error during data validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async refreshCachedData(): Promise<void> {
    try {
      // Refresh members table data instead of player_stats_view
      const { error } = await supabase
        .from('members')
        .select('count(*)', { count: 'exact' });

      if (error) {
        console.warn('⚠️ DataSynchronizationService: Could not refresh members data:', error);
      } else {
        console.log('🔄 DataSynchronizationService: Members data refreshed');
      }
    } catch (error) {
      console.warn('⚠️ DataSynchronizationService: Error refreshing cached data:', error);
    }
  },

  generateSyncSummary(result: SyncResult): string {
    const parts = [];
    
    if (result.duplicatesRemoved > 0) {
      parts.push(`Removed ${result.duplicatesRemoved} duplicate events`);
    }
    
    if (result.playersUpdated > 0) {
      parts.push(`Updated ${result.playersUpdated} players`);
    }
    
    if (result.goalsAdded > 0) {
      parts.push(`Added ${result.goalsAdded} goals`);
    }
    
    if (result.assistsAdded > 0) {
      parts.push(`Added ${result.assistsAdded} assists`);
    }
    
    if (result.errors.length > 0) {
      parts.push(`${result.errors.length} errors occurred`);
    }
    
    if (result.warnings.length > 0) {
      parts.push(`${result.warnings.length} warnings`);
    }
    
    return parts.length > 0 
      ? `Synchronization completed: ${parts.join(', ')}`
      : 'Synchronization completed with no changes needed';
  }
};

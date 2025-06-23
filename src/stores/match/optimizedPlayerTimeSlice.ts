
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

export interface OptimizedPlayerTimeSlice {
  optimizedBatchSync: (fixtureId: number) => Promise<void>;
  syncAllToDatabase: (fixtureId: number) => Promise<void>;
}

export const createOptimizedPlayerTimeSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  OptimizedPlayerTimeSlice
> = (set, get) => ({
  optimizedBatchSync: async (fixtureId: number) => {
    try {
      console.log('🔄 Starting optimized batch sync for fixture:', fixtureId);
      
      // Update any active player times before syncing
      if (typeof get().updateAllPlayerTimes === 'function') {
        get().updateAllPlayerTimes?.();
      }
      
      // Sync goals
      if (typeof get().syncGoalsToDatabase === 'function') {
        await get().syncGoalsToDatabase(fixtureId);
      }
      
      // Sync cards
      if (typeof get().syncCardsToDatabase === 'function') {
        await get().syncCardsToDatabase(fixtureId);
      }
      
      // Sync player times
      if (typeof get().syncPlayerTimesToDatabase === 'function') {
        await get().syncPlayerTimesToDatabase(fixtureId);
      }
      
      console.log('✅ Optimized batch sync completed successfully');
    } catch (error) {
      console.error('❌ Error during optimized batch sync:', error);
      throw error;
    }
  },

  syncAllToDatabase: async (fixtureId: number) => {
    try {
      console.log('🔄 Starting full database sync for fixture:', fixtureId);
      
      // Update any active player times before syncing
      if (typeof get().updateAllPlayerTimes === 'function') {
        get().updateAllPlayerTimes?.();
      }
      
      // Sync goals
      if (typeof get().syncGoalsToDatabase === 'function') {
        await get().syncGoalsToDatabase(fixtureId);
      }
      
      // Sync cards
      if (typeof get().syncCardsToDatabase === 'function') {
        await get().syncCardsToDatabase(fixtureId);
      }
      
      // Sync player times
      if (typeof get().syncPlayerTimesToDatabase === 'function') {
        await get().syncPlayerTimesToDatabase(fixtureId);
      }
      
      console.log('✅ Full database sync completed successfully');
    } catch (error) {
      console.error('❌ Error during full database sync:', error);
      throw error;
    }
  }
});

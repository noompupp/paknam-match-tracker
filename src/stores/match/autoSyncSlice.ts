
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { updateFixtureScore } from '@/services/fixtures/scoreUpdateService';

export interface AutoSyncSlice {
  isAutoSyncEnabled: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
  syncErrors: string[];
  enableAutoSync: () => void;
  disableAutoSync: () => void;
  syncToDatabase: () => Promise<void>;
  clearSyncErrors: () => void;
}

export const createAutoSyncSlice: StateCreator<
  MatchState & MatchActions & AutoSyncSlice,
  [],
  [],
  AutoSyncSlice
> = (set, get) => ({
  isAutoSyncEnabled: true,
  isSyncing: false,
  lastSyncTimestamp: null,
  syncErrors: [],

  enableAutoSync: () => {
    set({ isAutoSyncEnabled: true });
    console.log('🔄 Auto-sync enabled');
  },

  disableAutoSync: () => {
    set({ isAutoSyncEnabled: false });
    console.log('⏸️ Auto-sync disabled');
  },

  syncToDatabase: async () => {
    const state = get();
    
    if (state.isSyncing) {
      console.log('⏭️ Sync already in progress, skipping');
      return;
    }

    if (!state.fixtureId) {
      console.warn('⚠️ Cannot sync: No fixture ID set');
      return;
    }

    set({ isSyncing: true });

    try {
      console.log('🔄 Starting database sync for fixture:', state.fixtureId);

      // Update fixture scores in database
      await updateFixtureScore(state.fixtureId, state.homeScore, state.awayScore);

      // Sync goals to database
      if (state.syncGoalsToDatabase) {
        await state.syncGoalsToDatabase(state.fixtureId);
      }

      // Mark all items as synced
      if (state.markAsSaved) {
        state.markAsSaved();
      }

      set({ 
        lastSyncTimestamp: Date.now(),
        syncErrors: [],
        isSyncing: false
      });

      console.log('✅ Database sync completed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      
      set((state) => ({ 
        syncErrors: [...state.syncErrors, errorMessage],
        isSyncing: false
      }));

      console.error('❌ Database sync failed:', errorMessage);
      throw error;
    }
  },

  clearSyncErrors: () => {
    set({ syncErrors: [] });
  }
});

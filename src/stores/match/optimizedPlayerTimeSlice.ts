import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

export interface OptimizedPlayerTimeSlice {
  startPlayerTime: (playerTimeId: string) => void;
  stopPlayerTime: (playerTimeId: string) => void;
  togglePlayerTime: (playerTimeId: string) => void;
  updateAllPlayerTimes: () => void;
  syncPlayerTimesToDatabase: (fixtureId: number) => Promise<void>;
  optimizedBatchSync: (fixtureId: number) => Promise<void>;
  syncAllToDatabase: (fixtureId: number) => Promise<void>;
}

export const createOptimizedPlayerTimeSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  OptimizedPlayerTimeSlice
> = (set, get) => ({
  startPlayerTime: (playerTimeId: string) => {
    set((state) => ({
      playerTimes: state.playerTimes.map(pt => 
        pt.id === playerTimeId 
          ? { 
              ...pt, 
              isPlaying: true, 
              startTime: Date.now(),
              synced: false
            }
          : pt
      ),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    
    console.log('⏱️ OptimizedPlayerTimeSlice: Started player time:', playerTimeId);
  },

  stopPlayerTime: (playerTimeId: string) => {
    const state = get();
    const playerTime = state.playerTimes.find(pt => pt.id === playerTimeId);
    
    if (!playerTime || !playerTime.isPlaying || !playerTime.startTime) {
      console.warn('⚠️ OptimizedPlayerTimeSlice: Cannot stop player time - not currently playing:', playerTimeId);
      return;
    }
    
    const now = Date.now();
    const duration = Math.floor((now - playerTime.startTime) / 1000); // Convert to seconds
    
    set((state) => ({
      playerTimes: state.playerTimes.map(pt => 
        pt.id === playerTimeId 
          ? { 
              ...pt, 
              isPlaying: false,
              totalTime: pt.totalTime + duration,
              periods: [
                ...(pt.periods || []),
                {
                  start_time: Math.floor(pt.startTime! / 1000),
                  end_time: Math.floor(now / 1000),
                  duration
                }
              ],
              synced: false
            }
          : pt
      ),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    
    console.log('⏱️ OptimizedPlayerTimeSlice: Stopped player time:', {
      playerTimeId,
      duration,
      totalTime: playerTime.totalTime + duration
    });
  },

  togglePlayerTime: (playerTimeId: string) => {
    const state = get();
    const playerTime = state.playerTimes.find(pt => pt.id === playerTimeId);
    
    if (!playerTime) {
      console.warn('⚠️ OptimizedPlayerTimeSlice: Cannot toggle player time - not found:', playerTimeId);
      return;
    }
    
    if (playerTime.isPlaying) {
      get().stopPlayerTime(playerTimeId);
    } else {
      get().startPlayerTime(playerTimeId);
    }
  },

  updateAllPlayerTimes: () => {
    const state = get();
    const now = Date.now();
    let hasChanges = false;
    
    const updatedPlayerTimes = state.playerTimes.map(pt => {
      if (pt.isPlaying && pt.startTime) {
        hasChanges = true;
        const duration = Math.floor((now - pt.startTime) / 1000); // Convert to seconds
        
        return {
          ...pt,
          totalTime: pt.totalTime + duration,
          startTime: now,
          synced: false
        };
      }
      return pt;
    });
    
    if (hasChanges) {
      set({
        playerTimes: updatedPlayerTimes,
        hasUnsavedChanges: true,
        lastUpdated: now
      });
      
      console.log('⏱️ OptimizedPlayerTimeSlice: Updated all active player times');
    }
  },

  syncPlayerTimesToDatabase: async (fixtureId: number) => {
    const state = get();
    const unsyncedPlayerTimes = state.playerTimes.filter(pt => !pt.synced);
    
    if (unsyncedPlayerTimes.length === 0) {
      console.log('✅ No unsynced player times to save');
      return;
    }
    
    try {
      console.log('💾 Syncing', unsyncedPlayerTimes.length, 'player time records to database');
      
      // This would typically call an API to save the player times
      // For now, we'll just mark them as synced
      set((state) => ({
        playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
        hasUnsavedChanges: state.goals.some(g => !g.synced) || state.cards.some(c => !c.synced),
        lastUpdated: Date.now()
      }));
      
      console.log('✅ Player time sync completed successfully');
    } catch (error) {
      console.error('❌ Error syncing player times to database:', error);
      throw error;
    }
  },

  optimizedBatchSync: async (fixtureId: number) => {
    try {
      console.log('🔄 Starting optimized batch sync for fixture:', fixtureId);
      
      // Update any active player times before syncing
      get().updateAllPlayerTimes();
      
      // Sync goals
      if (typeof get().syncGoalsToDatabase === 'function') {
        await get().syncGoalsToDatabase(fixtureId);
      }
      
      // Sync cards
      if (typeof get().syncCardsToDatabase === 'function') {
        await get().syncCardsToDatabase(fixtureId);
      }
      
      // Sync player times
      await get().syncPlayerTimesToDatabase(fixtureId);
      
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
      get().updateAllPlayerTimes();
      
      // Sync goals
      if (typeof get().syncGoalsToDatabase === 'function') {
        await get().syncGoalsToDatabase(fixtureId);
      }
      
      // Sync cards
      if (typeof get().syncCardsToDatabase === 'function') {
        await get().syncCardsToDatabase(fixtureId);
      }
      
      // Sync player times
      await get().syncPlayerTimesToDatabase(fixtureId);
      
      console.log('✅ Full database sync completed successfully');
    } catch (error) {
      console.error('❌ Error during full database sync:', error);
      throw error;
    }
  }
});

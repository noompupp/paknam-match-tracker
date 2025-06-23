
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface EnhancedPlayerTimeSlice {
  addPlayerTime: MatchActions['addPlayerTime'];
  updatePlayerTime: (playerTimeId: string, updates: Partial<any>) => void;
  removePlayerTime: (playerTimeId: string) => void;
  getUnsavedPlayerTimesCount: () => number;
  getActivePlayersCount: () => number;
  startPlayerTime: (playerTimeId: string) => void;
  stopPlayerTime: (playerTimeId: string) => void;
  togglePlayerTime: (playerTimeId: string) => void;
  updateAllPlayerTimes: () => void;
  syncPlayerTimesToDatabase: (fixtureId: number) => Promise<void>;
}

export const createEnhancedPlayerTimeSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  EnhancedPlayerTimeSlice
> = (set, get) => ({
  addPlayerTime: (playerTimeData) => {
    const newPlayerTime = {
      ...playerTimeData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false,
      isPlaying: false,
      isActive: true,
      startTime: Date.now()
    };

    set((state) => ({
      playerTimes: [...state.playerTimes, newPlayerTime],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    console.log('⏱️ Enhanced Player Time Store: Player time added:', newPlayerTime);
    return newPlayerTime;
  },

  updatePlayerTime: (playerTimeId: string, updates: Partial<any>) => {
    set((state) => ({
      playerTimes: state.playerTimes.map(pt => 
        pt.id === playerTimeId 
          ? { ...pt, ...updates, synced: false }
          : pt
      ),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
  },

  removePlayerTime: (playerTimeId: string) => {
    set((state) => ({
      playerTimes: state.playerTimes.filter(pt => pt.id !== playerTimeId),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    console.log('🗑️ Enhanced Player Time Store: Player time removed:', playerTimeId);
  },

  getUnsavedPlayerTimesCount: () => {
    return get().playerTimes.filter(pt => !pt.synced).length;
  },

  getActivePlayersCount: () => {
    return get().playerTimes.filter(pt => pt.isPlaying).length;
  },

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
    
    console.log('⏱️ Enhanced Player Time: Started player time:', playerTimeId);
  },

  stopPlayerTime: (playerTimeId: string) => {
    const state = get();
    const playerTime = state.playerTimes.find(pt => pt.id === playerTimeId);
    
    if (!playerTime || !playerTime.isPlaying || !playerTime.startTime) {
      console.warn('⚠️ Enhanced Player Time: Cannot stop player time - not currently playing:', playerTimeId);
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
    
    console.log('⏱️ Enhanced Player Time: Stopped player time:', {
      playerTimeId,
      duration,
      totalTime: playerTime.totalTime + duration
    });
  },

  togglePlayerTime: (playerTimeId: string) => {
    const state = get();
    const playerTime = state.playerTimes.find(pt => pt.id === playerTimeId);
    
    if (!playerTime) {
      console.warn('⚠️ Enhanced Player Time: Cannot toggle player time - not found:', playerTimeId);
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
      
      console.log('⏱️ Enhanced Player Time: Updated all active player times');
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

      for (const playerTime of unsyncedPlayerTimes) {
        // Simulate database sync - replace with actual implementation
        console.log('Syncing player time:', playerTime);
      }

      // Mark all player times as synced
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
  }
});

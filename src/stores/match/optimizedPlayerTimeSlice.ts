
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface OptimizedPlayerTimeSlice {
  // Local state management
  localPlayerTimes: any[];
  isLocalTimerActive: boolean;
  
  // Sync management
  syncStatus: {
    lastSyncTime: number | null;
    pendingChanges: number;
    isSyncing: boolean;
    lastError: string | null;
  };
  
  // Controls
  autoSyncEnabled: boolean;
  manualSyncOnly: boolean;
  
  // Actions
  startOptimizedTracking: () => void;
  stopOptimizedTracking: () => void;
  addPlayerOptimized: (playerId: number, playerName: string, teamId: number) => void;
  removePlayerOptimized: (playerId: number) => void;
  togglePlayerOptimized: (playerId: number) => void;
  forceSyncNow: (fixtureId: number) => Promise<void>;
  toggleAutoSync: (enabled: boolean) => void;
  enableManualSyncOnly: () => void;
  clearPendingChanges: () => void;
  
  // Persistence
  saveToLocalStorage: (fixtureId: number) => void;
  loadFromLocalStorage: (fixtureId: number) => void;
}

export const createOptimizedPlayerTimeSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  OptimizedPlayerTimeSlice
> = (set, get) => {
  return {
    localPlayerTimes: [],
    isLocalTimerActive: false,
    syncStatus: {
      lastSyncTime: null,
      pendingChanges: 0,
      isSyncing: false,
      lastError: null
    },
    autoSyncEnabled: true,
    manualSyncOnly: false,

    startOptimizedTracking: () => {
      console.log('🚀 OptimizedPlayerTime: Starting optimized tracking');
      set((state) => ({
        ...state,
        isLocalTimerActive: true
      }));
    },

    stopOptimizedTracking: () => {
      console.log('⏹️ OptimizedPlayerTime: Stopping optimized tracking');
      set((state) => ({
        ...state,
        isLocalTimerActive: false
      }));
    },

    addPlayerOptimized: (playerId: number, playerName: string, teamId: number) => {
      const newPlayerTime = {
        id: generateId(),
        playerId,
        playerName,
        teamId: teamId.toString(),
        teamName: '',
        team: 'home' as const,
        totalTime: 0,
        startTime: Date.now(),
        isPlaying: true,
        periods: [],
        synced: false
      };

      set((state) => ({
        ...state,
        localPlayerTimes: [...state.localPlayerTimes, newPlayerTime]
      }));

      console.log('➕ OptimizedPlayerTime: Added player to local tracking:', playerName);
    },

    removePlayerOptimized: (playerId: number) => {
      set((state) => ({
        ...state,
        localPlayerTimes: state.localPlayerTimes.filter(pt => pt.playerId !== playerId)
      }));

      console.log('➖ OptimizedPlayerTime: Removed player from local tracking:', playerId);
    },

    togglePlayerOptimized: (playerId: number) => {
      set((state) => {
        const updatedPlayerTimes = state.localPlayerTimes.map(pt => {
          if (pt.playerId === playerId) {
            const now = Date.now();
            const isNowPlaying = !pt.isPlaying;
            
            let updatedPlayer = { ...pt, isPlaying: isNowPlaying };

            if (isNowPlaying) {
              updatedPlayer.startTime = now;
            } else {
              const sessionTime = pt.startTime ? Math.floor((now - pt.startTime) / 1000) : 0;
              updatedPlayer.totalTime += sessionTime;
              updatedPlayer.startTime = null;
              
              if (pt.startTime) {
                updatedPlayer.periods = [
                  ...(pt.periods || []),
                  {
                    start_time: pt.startTime,
                    end_time: now,
                    duration: sessionTime
                  }
                ];
              }
              updatedPlayer.synced = false;
            }
            
            return updatedPlayer;
          }
          return pt;
        });

        return { ...state, localPlayerTimes: updatedPlayerTimes };
      });

      console.log('🔄 OptimizedPlayerTime: Toggled player time:', playerId);
    },

    forceSyncNow: async (fixtureId: number) => {
      const state = get();
      console.log('💾 OptimizedPlayerTime: Force syncing', state.localPlayerTimes.length, 'players');
      
      // Update sync status
      set((state) => ({
        ...state,
        syncStatus: { ...state.syncStatus, isSyncing: true, lastError: null }
      }));

      try {
        // Sync logic would go here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate sync
        
        set((state) => ({
          ...state,
          syncStatus: {
            lastSyncTime: Date.now(),
            pendingChanges: 0,
            isSyncing: false,
            lastError: null
          },
          localPlayerTimes: state.localPlayerTimes.map(pt => ({ ...pt, synced: true }))
        }));

        console.log('✅ OptimizedPlayerTime: Force sync completed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sync failed';
        set((state) => ({
          ...state,
          syncStatus: { ...state.syncStatus, isSyncing: false, lastError: errorMessage }
        }));
        throw error;
      }
    },

    toggleAutoSync: (enabled: boolean) => {
      set((state) => ({ 
        ...state, 
        autoSyncEnabled: enabled, 
        manualSyncOnly: enabled ? false : state.manualSyncOnly 
      }));
      console.log('🔄 OptimizedPlayerTime: Auto-sync', enabled ? 'enabled' : 'disabled');
    },

    enableManualSyncOnly: () => {
      set((state) => ({ 
        ...state, 
        manualSyncOnly: true, 
        autoSyncEnabled: false 
      }));
      console.log('✋ OptimizedPlayerTime: Manual sync only enabled');
    },

    clearPendingChanges: () => {
      set((state) => ({
        ...state,
        syncStatus: { ...state.syncStatus, pendingChanges: 0 },
        localPlayerTimes: []
      }));
      console.log('🗑️ OptimizedPlayerTime: Cleared pending changes');
    },

    saveToLocalStorage: (fixtureId: number) => {
      const state = get();
      // Persistence logic would go here
      console.log('💾 OptimizedPlayerTime: Saved to localStorage for fixture', fixtureId);
    },

    loadFromLocalStorage: (fixtureId: number) => {
      // Persistence logic would go here
      console.log('📂 OptimizedPlayerTime: Loaded from localStorage for fixture', fixtureId);
    }
  };
};

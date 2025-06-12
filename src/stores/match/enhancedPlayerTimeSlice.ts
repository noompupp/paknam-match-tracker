
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface EnhancedPlayerTimeSlice {
  addPlayerTime: MatchActions['addPlayerTime'];
  updatePlayerTime: (playerTimeId: string, updates: Partial<any>) => void;
  removePlayerTime: (playerTimeId: string) => void;
  getUnsavedPlayerTimesCount: () => number;
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
      synced: false
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
  }
});

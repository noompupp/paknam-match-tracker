
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface PlayerTimeSlice {
  addPlayerTime: MatchActions['addPlayerTime'];
  updatePlayerTime: MatchActions['updatePlayerTime'];
  removePlayerTime: MatchActions['removePlayerTime'];
  getUnsavedPlayerTimesCount: MatchActions['getUnsavedPlayerTimesCount'];
}

export const createPlayerTimeSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  PlayerTimeSlice
> = (set, get) => ({
  addPlayerTime: (playerTimeData) => {
    const newPlayerTime = {
      ...playerTimeData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false,
      isPlaying: false, // Set default value
      startTime: Date.now()
    };

    set((state) => ({
      playerTimes: [...state.playerTimes, newPlayerTime],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    console.log('⏱️ Player Time Store: Player time added:', newPlayerTime);
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
  },

  getUnsavedPlayerTimesCount: () => {
    return get().playerTimes.filter(pt => !pt.synced).length;
  }
});

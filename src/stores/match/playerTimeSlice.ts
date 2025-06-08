
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface PlayerTimeSlice {
  addPlayerTime: MatchActions['addPlayerTime'];
  updatePlayerTime: MatchActions['updatePlayerTime'];
}

export const createPlayerTimeSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  PlayerTimeSlice
> = (set, get) => ({
  addPlayerTime: (playerData) => {
    const newPlayerTime = {
      ...playerData,
      id: generateId(),
      synced: false
    };

    set((state) => ({
      playerTimes: [...state.playerTimes, newPlayerTime],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    return newPlayerTime;
  },

  updatePlayerTime: (playerId, updates) => {
    set((state) => ({
      playerTimes: state.playerTimes.map(pt => 
        pt.playerId === playerId 
          ? { ...pt, ...updates, synced: false }
          : pt
      ),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
  }
});


import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface PlayerTimeSlice {
  addPlayerTime: MatchActions['addPlayerTime'];
  updatePlayerTime: MatchActions['updatePlayerTime'];
  startPlayerTime: MatchActions['startPlayerTime'];
  stopPlayerTime: MatchActions['stopPlayerTime'];
  getPlayerTimesByFixture: MatchActions['getPlayerTimesByFixture'];
  calculateTotalMinutesPlayed: MatchActions['calculateTotalMinutesPlayed'];
  getActivePlayersCount: MatchActions['getActivePlayersCount'];
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
  },

  startPlayerTime: (playerId: number, playerName: string, teamId: number) => {
    const currentTime = Date.now();
    const newPlayerTime = {
      id: generateId(),
      playerId,
      playerName,
      teamId: teamId.toString(),
      teamName: '', // Will be updated when team info is available
      team: 'home' as const, // Default, should be updated based on teamId
      totalTime: 0,
      startTime: currentTime,
      isPlaying: true,
      periods: [],
      synced: false
    };

    set((state) => ({
      playerTimes: [...state.playerTimes, newPlayerTime],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    console.log('⏱️ Player time tracking started:', { playerId, playerName });
  },

  stopPlayerTime: (playerId: number) => {
    const currentTime = Date.now();
    
    set((state) => {
      const playerTime = state.playerTimes.find(pt => 
        pt.playerId === playerId && pt.isPlaying
      );
      
      if (!playerTime) return state;

      const sessionMinutes = Math.floor((currentTime - (playerTime.startTime || currentTime)) / 60000);
      
      return {
        playerTimes: state.playerTimes.map(pt => 
          pt.playerId === playerId && pt.isPlaying
            ? { 
                ...pt, 
                totalTime: pt.totalTime + sessionMinutes,
                isPlaying: false,
                periods: [
                  ...pt.periods,
                  {
                    start_time: playerTime.startTime || currentTime,
                    end_time: currentTime,
                    duration: sessionMinutes
                  }
                ],
                synced: false
              }
            : pt
        ),
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });

    console.log('⏹️ Player time tracking stopped:', { playerId });
  },

  getPlayerTimesByFixture: (fixtureId: number) => {
    const state = get();
    return state.playerTimes.filter(pt => state.fixtureId === fixtureId);
  },

  calculateTotalMinutesPlayed: (playerId: number) => {
    const state = get();
    return state.playerTimes
      .filter(pt => pt.playerId === playerId)
      .reduce((total, pt) => total + pt.totalTime, 0);
  },

  getActivePlayersCount: () => {
    const state = get();
    return state.playerTimes.filter(pt => pt.isPlaying).length;
  }
});

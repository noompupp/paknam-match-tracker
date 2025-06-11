
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';
import { playerTimeTrackingService } from '@/services/fixtures/playerTimeTrackingService';

export interface PlayerTimeSlice {
  addPlayerTime: MatchActions['addPlayerTime'];
  updatePlayerTime: MatchActions['updatePlayerTime'];
  startPlayerTime: MatchActions['startPlayerTime'];
  stopPlayerTime: MatchActions['stopPlayerTime'];
  getPlayerTimesByFixture: MatchActions['getPlayerTimesByFixture'];
  calculateTotalMinutesPlayed: MatchActions['calculateTotalMinutesPlayed'];
  getActivePlayersCount: MatchActions['getActivePlayersCount'];
  loadPlayerTimesFromDatabase: (fixtureId: number) => Promise<void>;
  syncPlayerTimesToDatabase: (fixtureId: number) => Promise<void>;
  clearPlayerTimes: () => void;
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
  },

  loadPlayerTimesFromDatabase: async (fixtureId: number) => {
    try {
      console.log('🔄 Loading player times from database for fixture:', fixtureId);
      const databasePlayerTimes = await playerTimeTrackingService.getPlayerTimesForFixture(fixtureId);
      
      // Convert database format to match store format
      const convertedPlayerTimes = databasePlayerTimes.map(dbPt => ({
        id: generateId(),
        playerId: dbPt.player_id,
        playerName: dbPt.player_name,
        teamId: dbPt.team_id.toString(),
        teamName: '',
        team: 'home' as const, // Will be determined based on teamId
        totalTime: dbPt.total_minutes,
        startTime: null,
        isPlaying: false,
        periods: dbPt.periods || [],
        synced: true
      }));

      set((state) => ({
        playerTimes: [...state.playerTimes, ...convertedPlayerTimes],
        lastUpdated: Date.now()
      }));

      console.log('✅ Loaded', convertedPlayerTimes.length, 'player time records from database');
    } catch (error) {
      console.error('❌ Error loading player times from database:', error);
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
      
      for (const pt of unsyncedPlayerTimes) {
        await playerTimeTrackingService.savePlayerTime({
          fixture_id: fixtureId,
          player_id: pt.playerId,
          player_name: pt.playerName,
          team_id: parseInt(pt.teamId),
          total_minutes: pt.totalTime,
          periods: pt.periods
        });
      }

      // Mark all player times as synced
      set((state) => ({
        playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
        hasUnsavedChanges: false,
        lastUpdated: Date.now()
      }));

      console.log('✅ Player time sync completed successfully');
    } catch (error) {
      console.error('❌ Error syncing player times to database:', error);
      throw error;
    }
  },

  clearPlayerTimes: () => {
    set((state) => ({
      playerTimes: [],
      lastUpdated: Date.now()
    }));
    console.log('🧹 Player times cleared from store');
  }
});

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
  optimizedBatchSync: (fixtureId: number) => Promise<void>;
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
    
    // Check if player is already being tracked
    const state = get();
    const existingPlayer = state.playerTimes.find(pt => pt.playerId === playerId);
    
    if (existingPlayer && existingPlayer.isPlaying) {
      console.log('⚠️ Player already being tracked:', { playerId, playerName });
      return;
    }

    const newPlayerTime = {
      id: generateId(),
      playerId,
      playerName,
      teamId: teamId.toString(),
      teamName: '',
      team: 'home' as const,
      totalTime: existingPlayer?.totalTime || 0,
      startTime: currentTime,
      isPlaying: true,
      periods: existingPlayer?.periods || [],
      synced: false
    };

    set((state) => {
      const filteredPlayerTimes = state.playerTimes.filter(pt => pt.playerId !== playerId);
      return {
        playerTimes: [...filteredPlayerTimes, newPlayerTime],
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });

    console.log('⏱️ Player time tracking started (optimized):', { playerId, playerName });
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

    console.log('⏹️ Player time tracking stopped (optimized):', { playerId });
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
      
      const convertedPlayerTimes = databasePlayerTimes.map(dbPt => ({
        id: generateId(),
        playerId: dbPt.player_id,
        playerName: dbPt.player_name,
        teamId: dbPt.team_id.toString(),
        teamName: '',
        team: 'home' as const,
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

    // Throttle sync requests - only sync if last sync was more than 30 seconds ago
    const now = Date.now();
    const lastSync = localStorage.getItem('lastPlayerTimeSync');
    const lastSyncTime = lastSync ? parseInt(lastSync) : 0;
    
    if (now - lastSyncTime < 30000) { // 30 second throttle
      console.log('⏸️ Sync throttled - too recent, queuing for later');
      return;
    }

    try {
      console.log('💾 Syncing', unsyncedPlayerTimes.length, 'player time records (throttled)');
      
      // Batch sync in chunks to avoid overwhelming the database
      const BATCH_SIZE = 5;
      for (let i = 0; i < unsyncedPlayerTimes.length; i += BATCH_SIZE) {
        const batch = unsyncedPlayerTimes.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(pt => 
          playerTimeTrackingService.savePlayerTime({
            fixture_id: fixtureId,
            player_id: pt.playerId,
            player_name: pt.playerName,
            team_id: parseInt(pt.teamId),
            total_minutes: pt.totalTime,
            periods: pt.periods
          })
        ));
        
        // Small delay between batches
        if (i + BATCH_SIZE < unsyncedPlayerTimes.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      set((state) => ({
        playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
        hasUnsavedChanges: state.goals.some(g => !g.synced) || state.cards.some(c => !c.synced),
        lastUpdated: Date.now()
      }));

      // Update last sync time
      localStorage.setItem('lastPlayerTimeSync', now.toString());

      console.log('✅ Player time sync completed successfully (optimized)');
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
  },

  optimizedBatchSync: async (fixtureId: number) => {
    const state = get();
    const unsyncedPlayerTimes = state.playerTimes.filter(pt => !pt.synced);
    
    // Only sync if we have meaningful changes and it's been long enough
    const significantChanges = unsyncedPlayerTimes.filter(pt => 
      pt.isPlaying !== undefined || pt.periods.length > 0 || pt.totalTime > 0
    );
    
    if (significantChanges.length === 0) {
      console.log('⚡ No significant player time changes to sync');
      return;
    }

    // Check throttling with more sophisticated logic
    const now = Date.now();
    const lastSync = localStorage.getItem('lastOptimizedPlayerSync');
    const lastSyncTime = lastSync ? parseInt(lastSync) : 0;
    const activePlayersCount = state.playerTimes.filter(pt => pt.isPlaying).length;
    
    // Dynamic throttling based on activity level
    const throttleTime = activePlayersCount > 5 ? 20000 : 30000; // More frequent for high activity
    
    if (now - lastSyncTime < throttleTime && significantChanges.length < 3) {
      console.log('⏸️ Optimized sync throttled - not enough activity');
      return;
    }

    try {
      console.log('⚡ Optimized batch sync for', significantChanges.length, 'significant changes');
      
      // Prioritize active players
      const activePlayers = significantChanges.filter(pt => pt.isPlaying);
      const inactivePlayers = significantChanges.filter(pt => !pt.isPlaying);
      
      // Sync active players first
      for (const pt of activePlayers) {
        await playerTimeTrackingService.savePlayerTime({
          fixture_id: fixtureId,
          player_id: pt.playerId,
          player_name: pt.playerName,
          team_id: parseInt(pt.teamId),
          total_minutes: pt.totalTime,
          periods: pt.periods
        });
      }
      
      // Then sync inactive players
      for (const pt of inactivePlayers) {
        await playerTimeTrackingService.savePlayerTime({
          fixture_id: fixtureId,
          player_id: pt.playerId,
          player_name: pt.playerName,
          team_id: parseInt(pt.teamId),
          total_minutes: pt.totalTime,
          periods: pt.periods
        });
      }

      // Mark synced items
      set((state) => ({
        playerTimes: state.playerTimes.map(pt => 
          significantChanges.some(spt => spt.id === pt.id) 
            ? { ...pt, synced: true }
            : pt
        ),
        hasUnsavedChanges: state.goals.some(g => !g.synced) || 
                          state.cards.some(c => !c.synced) || 
                          state.playerTimes.some(pt => !pt.synced && 
                            !significantChanges.some(spt => spt.id === pt.id)),
        lastUpdated: Date.now()
      }));

      localStorage.setItem('lastOptimizedPlayerSync', now.toString());

      console.log('✅ Optimized player time sync completed');
    } catch (error) {
      console.error('❌ Error in optimized player time sync:', error);
      throw error;
    }
  }
});

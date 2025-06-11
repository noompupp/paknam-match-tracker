import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';
import { playerTimeTrackingService } from '@/services/fixtures/playerTimeTrackingService';

export interface EnhancedPlayerTimeSlice {
  autoSaveOnSubIn: MatchActions['autoSaveOnSubIn'];
  syncPlayerTimesToDatabase: (fixtureId: number) => Promise<void>;
  getPlayerTimeValidationStatus: (playerId: number) => { isValid: boolean; warnings: string[] };
}

export const createEnhancedPlayerTimeSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  EnhancedPlayerTimeSlice
> = (set, get) => ({
  autoSaveOnSubIn: async (playerId: number, playerName: string, teamId: number) => {
    console.log('🔄 Enhanced Player Time: Auto-save on sub-in triggered:', { playerId, playerName });
    
    // Start player time tracking
    const currentTime = Date.now();
    const newPlayerTime = {
      id: generateId(),
      playerId,
      playerName,
      teamId: teamId.toString(),
      teamName: '',
      team: 'home' as const,
      totalTime: 0,
      startTime: currentTime,
      isPlaying: true,
      periods: [],
      synced: false
    };

    // Add to local state immediately
    set((state) => {
      const filteredPlayerTimes = state.playerTimes.filter(pt => pt.playerId !== playerId);
      return {
        playerTimes: [...filteredPlayerTimes, newPlayerTime],
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });

    // Auto-save to database in background
    try {
      const state = get();
      if (state.fixtureId) {
        await playerTimeTrackingService.savePlayerTime({
          fixture_id: state.fixtureId,
          player_id: playerId,
          player_name: playerName,
          team_id: teamId,
          total_minutes: 0,
          periods: []
        });

        // Mark as synced
        set((state) => ({
          playerTimes: state.playerTimes.map(pt => 
            pt.playerId === playerId ? { ...pt, synced: true } : pt
          ),
          lastUpdated: Date.now()
        }));

        console.log('✅ Enhanced Player Time: Auto-save successful for sub-in');
      }
    } catch (error) {
      console.error('❌ Enhanced Player Time: Auto-save failed on sub-in:', error);
      // Keep in local state for manual sync later
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
      console.log('💾 Enhanced Player Time: Syncing', unsyncedPlayerTimes.length, 'records');
      
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

      // Mark all as synced
      set((state) => ({
        playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
        hasUnsavedChanges: state.goals.some(g => !g.synced) || state.cards.some(c => !c.synced),
        lastUpdated: Date.now()
      }));

      console.log('✅ Enhanced Player Time: Sync completed successfully');
    } catch (error) {
      console.error('❌ Enhanced Player Time: Sync failed:', error);
      throw error;
    }
  },

  getPlayerTimeValidationStatus: (playerId: number) => {
    const state = get();
    const playerTime = state.playerTimes.find(pt => pt.playerId === playerId);
    
    if (!playerTime) {
      return { isValid: false, warnings: ['Player not found in tracking'] };
    }

    const warnings: string[] = [];
    
    // Check for excessive playing time (over 50 minutes in 7-a-side)
    if (playerTime.totalTime > 50) {
      warnings.push('Player has exceeded recommended playing time');
    }

    // Check if player is still playing but match might be over
    if (playerTime.isPlaying && playerTime.totalTime > 45) {
      warnings.push('Player still marked as playing with high total time');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
});

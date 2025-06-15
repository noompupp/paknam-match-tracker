
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { matchEventsApi } from '@/services/matchEventsApi';

export interface CoreSlice {
  setFixtureId: MatchActions['setFixtureId'];
  updateScore: MatchActions['updateScore'];
  markAsSaved: MatchActions['markAsSaved'];
  resetMatch: MatchActions['resetMatch'];
  resetState: MatchActions['resetState'];
  getUnsavedItemsCount: MatchActions['getUnsavedItemsCount'];
  addEvent: MatchActions['addEvent'];
  triggerUIUpdate: MatchActions['triggerUIUpdate'];
  clearPlayerTimes: MatchActions['clearPlayerTimes'];
  loadPlayerTimesFromDatabase: MatchActions['loadPlayerTimesFromDatabase'];
  syncGoalsToDatabase: MatchActions['syncGoalsToDatabase'];
  syncCardsToDatabase: MatchActions['syncCardsToDatabase'];
}

export const createCoreSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  CoreSlice
> = (set, get) => ({
  setFixtureId: (fixtureId: number) => {
    set({ fixtureId });
  },

  updateScore: (homeScore: number, awayScore: number) => {
    set({
      homeScore,
      awayScore,
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    });
  },

  markAsSaved: () => {
    set((state) => ({
      goals: state.goals.map(g => ({ ...g, synced: true })),
      cards: state.cards.map(c => ({ ...c, synced: true })),
      playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    }));
  },

  resetMatch: () => {
    set({
      fixtureId: null,
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      events: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    });
  },

  resetState: () => {
    set({
      fixtureId: null,
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      events: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    });
  },

  getUnsavedItemsCount: () => {
    const state = get();
    const unsavedGoals = state.goals.filter(g => !g.synced).length;
    const unsavedCards = state.cards.filter(c => !c.synced).length;
    const unsavedPlayerTimes = state.playerTimes.filter(pt => !pt.synced).length;
    return {
      goals: unsavedGoals,
      cards: unsavedCards,
      playerTimes: unsavedPlayerTimes
    };
  },

  addEvent: (eventType: string, description: string, time: number) => {
    const eventData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      description,
      time,
      timestamp: Date.now()
    };
    
    set((state) => ({
      events: [...state.events, eventData],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
  },

  triggerUIUpdate: () => {
    set({ lastUpdated: Date.now() });
  },

  clearPlayerTimes: () => {
    set({ playerTimes: [], hasUnsavedChanges: true, lastUpdated: Date.now() });
  },

  loadPlayerTimesFromDatabase: async (fixtureId: number) => {
    try {
      console.log('📥 Loading player times from database for fixture:', fixtureId);
      // This would typically call an API to load player times
      // For now, we'll just mark as loaded
      set({ lastUpdated: Date.now() });
    } catch (error) {
      console.error('❌ Error loading player times from database:', error);
      throw error;
    }
  },

  syncGoalsToDatabase: async (fixtureId: number) => {
    const state = get();
    const unsyncedGoals = state.goals.filter(g => !g.synced);

    if (!fixtureId || unsyncedGoals.length === 0) {
      console.log('✅ No unsynced goals to save');
      return;
    }

    try {
      console.log('💾 Syncing', unsyncedGoals.length, 'goals to database');
      for (const localGoal of unsyncedGoals) {
        // Compose event payload for matchEventsApi.create
        const payload = {
          fixture_id: fixtureId,
          player_name: localGoal.playerName || 'Unknown',
          team_id: localGoal.teamId || localGoal.team || '',
          event_time: localGoal.time ?? 0,
          event_type: 'goal' as const,
          is_own_goal: !!localGoal.isOwnGoal,
          description: localGoal.description || '',
          card_type: null, // Not used for goals
          affected_team_id: null,
          scoring_team_id: null,
        };
        await matchEventsApi.create(payload);
      }
      // Mark all as synced in local state
      set((state) => ({
        goals: state.goals.map(g => ({ ...g, synced: true })),
        lastUpdated: Date.now()
      }));
      console.log('✅ Goals sync completed successfully');
    } catch (error) {
      console.error('❌ Error syncing goals to database:', error);
      throw error;
    }
  },

  syncCardsToDatabase: async (fixtureId: number) => {
    const state = get();
    const unsyncedCards = state.cards.filter(c => !c.synced);

    if (!fixtureId || unsyncedCards.length === 0) {
      console.log('✅ No unsynced cards to save');
      return;
    }

    try {
      console.log('💾 Syncing', unsyncedCards.length, 'cards to database');
      for (const localCard of unsyncedCards) {
        // Map local type to database accepted event_type
        let event_type: "yellow_card" | "red_card" = "yellow_card";
        if (localCard.type === "yellow") event_type = "yellow_card";
        else if (localCard.type === "red") event_type = "red_card";

        // Compose event payload
        const payload = {
          fixture_id: fixtureId,
          player_name: localCard.playerName || 'Unknown',
          team_id: localCard.teamId || '',
          event_time: localCard.time ?? 0,
          event_type,
          card_type: event_type === "yellow_card" ? "yellow" : "red",
          description: '', // No description property on MatchCard
          is_own_goal: false,
          affected_team_id: null,
          scoring_team_id: null,
        };
        await matchEventsApi.create(payload);
      }
      set((state) => ({
        cards: state.cards.map(c => ({ ...c, synced: true })),
        lastUpdated: Date.now()
      }));
      console.log('✅ Cards sync completed successfully');
    } catch (error) {
      console.error('❌ Error syncing cards to database:', error);
      throw error;
    }
  }
});

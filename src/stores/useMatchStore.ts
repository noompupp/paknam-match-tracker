
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface MatchGoal {
  id: string;
  playerId?: number;
  playerName: string;
  team: 'home' | 'away';
  teamId: string;
  teamName: string;
  type: 'goal' | 'assist';
  time: number;
  isOwnGoal?: boolean;
  assistPlayerId?: number;
  assistPlayerName?: string;
  timestamp: number;
  synced: boolean;
}

export interface MatchCard {
  id: string;
  playerId: number;
  playerName: string;
  team: 'home' | 'away';
  teamId: string;
  teamName: string;
  type: 'yellow' | 'red';
  time: number;
  timestamp: number;
  synced: boolean;
}

export interface MatchPlayerTime {
  id: string;
  playerId: number;
  playerName: string;
  team: 'home' | 'away';
  teamId: string;
  teamName: string;
  totalTime: number;
  startTime: number | null;
  isPlaying: boolean;
  periods: Array<{
    start_time: number;
    end_time: number;
    duration: number;
  }>;
  synced: boolean;
}

export interface MatchEvent {
  id: string;
  type: string;
  description: string;
  time: number;
  timestamp: number;
}

interface MatchState {
  fixtureId: number | null;
  homeScore: number;
  awayScore: number;
  goals: MatchGoal[];
  cards: MatchCard[];
  playerTimes: MatchPlayerTime[];
  events: MatchEvent[];
  lastSaved: number | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  setFixtureId: (id: number | null) => void;
  addGoal: (goal: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => void;
  addAssist: (assist: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => void;
  updateGoal: (goalId: string, updates: Partial<MatchGoal>) => void;
  removeGoal: (goalId: string) => void;
  addCard: (card: Omit<MatchCard, 'id' | 'timestamp' | 'synced'>) => void;
  addPlayerTime: (playerTime: Omit<MatchPlayerTime, 'id' | 'synced'>) => void;
  updatePlayerTime: (playerId: number, updates: Partial<MatchPlayerTime>) => void;
  addEvent: (type: string, description: string, time: number) => void;
  markAsSaved: () => void;
  resetState: () => void;
  
  // Computed
  getUnsavedGoalsCount: () => number;
  getUnsavedCardsCount: () => number;
  getUnassignedGoalsCount: () => number;
  getUnsavedItemsCount: () => { goals: number; cards: number; playerTimes: number };
}

let idCounter = 0;
const generateId = () => `global_${Date.now()}_${++idCounter}`;

export const useMatchStore = create<MatchState>()(
  subscribeWithSelector((set, get) => ({
    fixtureId: null,
    homeScore: 0,
    awayScore: 0,
    goals: [],
    cards: [],
    playerTimes: [],
    events: [],
    lastSaved: null,
    hasUnsavedChanges: false,

    setFixtureId: (id) => {
      const state = get();
      if (state.fixtureId !== id) {
        // Reset state when changing fixtures
        set({
          fixtureId: id,
          homeScore: 0,
          awayScore: 0,
          goals: [],
          cards: [],
          playerTimes: [],
          events: [],
          lastSaved: null,
          hasUnsavedChanges: false
        });
        console.log('🏪 MatchStore: Fixture changed, state reset for fixture:', id);
      }
    },

    addGoal: (goalData) => {
      const newGoal: MatchGoal = {
        ...goalData,
        id: generateId(),
        timestamp: Date.now(),
        synced: false
      };

      set((state) => {
        // Only increment score for actual goals, not assists
        const newHomeScore = goalData.team === 'home' && goalData.type === 'goal' ? state.homeScore + 1 : state.homeScore;
        const newAwayScore = goalData.team === 'away' && goalData.type === 'goal' ? state.awayScore + 1 : state.awayScore;
        
        const updatedState = {
          goals: [...state.goals, newGoal],
          homeScore: newHomeScore,
          awayScore: newAwayScore,
          hasUnsavedChanges: true
        };

        console.log('🏪 MatchStore: Goal added:', {
          goal: newGoal,
          newScore: `${newHomeScore}-${newAwayScore}`,
          totalGoals: updatedState.goals.length
        });

        return updatedState;
      });

      return newGoal;
    },

    addAssist: (assistData) => {
      const newAssist: MatchGoal = {
        ...assistData,
        type: 'assist',
        id: generateId(),
        timestamp: Date.now(),
        synced: false
      };

      set((state) => {
        const updatedState = {
          goals: [...state.goals, newAssist],
          hasUnsavedChanges: true
          // NOTE: No score increment for assists
        };

        console.log('🏪 MatchStore: Assist added (no score change):', {
          assist: newAssist,
          totalGoalsAndAssists: updatedState.goals.length
        });

        return updatedState;
      });

      return newAssist;
    },

    updateGoal: (goalId, updates) => {
      set((state) => {
        const updatedGoals = state.goals.map(goal => 
          goal.id === goalId 
            ? { ...goal, ...updates, synced: updates.synced !== undefined ? updates.synced : false }
            : goal
        );

        console.log('🏪 MatchStore: Goal updated:', {
          goalId,
          updates,
          updatedGoal: updatedGoals.find(g => g.id === goalId)
        });

        return {
          goals: updatedGoals,
          hasUnsavedChanges: true
        };
      });
    },

    removeGoal: (goalId) => {
      set((state) => {
        const goalToRemove = state.goals.find(g => g.id === goalId);
        if (!goalToRemove) return state;

        // Only decrement score if it's an actual goal, not an assist
        const newHomeScore = goalToRemove.team === 'home' && goalToRemove.type === 'goal' ? state.homeScore - 1 : state.homeScore;
        const newAwayScore = goalToRemove.team === 'away' && goalToRemove.type === 'goal' ? state.awayScore - 1 : state.awayScore;

        return {
          goals: state.goals.filter(g => g.id !== goalId),
          homeScore: Math.max(0, newHomeScore),
          awayScore: Math.max(0, newAwayScore),
          hasUnsavedChanges: true
        };
      });
    },

    addCard: (cardData) => {
      const newCard: MatchCard = {
        ...cardData,
        id: generateId(),
        timestamp: Date.now(),
        synced: false
      };

      set((state) => ({
        cards: [...state.cards, newCard],
        hasUnsavedChanges: true
      }));

      console.log('🏪 MatchStore: Card added:', newCard);
      return newCard;
    },

    addPlayerTime: (playerData) => {
      const newPlayerTime: MatchPlayerTime = {
        ...playerData,
        id: generateId(),
        synced: false
      };

      set((state) => ({
        playerTimes: [...state.playerTimes, newPlayerTime],
        hasUnsavedChanges: true
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
        hasUnsavedChanges: true
      }));
    },

    addEvent: (type, description, time) => {
      const newEvent: MatchEvent = {
        id: generateId(),
        type,
        description,
        time,
        timestamp: Date.now()
      };

      set((state) => ({
        events: [...state.events, newEvent],
        hasUnsavedChanges: true
      }));

      return newEvent;
    },

    markAsSaved: () => {
      set((state) => ({
        goals: state.goals.map(g => ({ ...g, synced: true })),
        cards: state.cards.map(c => ({ ...c, synced: true })),
        playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
        lastSaved: Date.now(),
        hasUnsavedChanges: false
      }));
      console.log('🏪 MatchStore: All data marked as saved');
    },

    resetState: () => {
      set({
        homeScore: 0,
        awayScore: 0,
        goals: [],
        cards: [],
        playerTimes: [],
        events: [],
        lastSaved: null,
        hasUnsavedChanges: false
      });
      console.log('🏪 MatchStore: State reset');
    },

    // Computed getters
    getUnsavedGoalsCount: () => {
      return get().goals.filter(g => !g.synced).length;
    },

    getUnsavedCardsCount: () => {
      return get().cards.filter(c => !c.synced).length;
    },

    getUnassignedGoalsCount: () => {
      // Enhanced detection: check for "Quick Goal" OR goals without proper player details
      return get().goals.filter(g => 
        g.playerName === 'Quick Goal' || 
        g.playerName === 'Unknown Player' ||
        (!g.playerId && g.type === 'goal')
      ).length;
    },

    getUnsavedItemsCount: () => {
      const state = get();
      return {
        goals: state.goals.filter(g => !g.synced).length,
        cards: state.cards.filter(c => !c.synced).length,
        playerTimes: state.playerTimes.filter(pt => !pt.synced).length
      };
    }
  }))
);

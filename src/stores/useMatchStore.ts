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
  lastUpdated: number; // New field for tracking UI update triggers
  
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
  triggerUIUpdate: () => void; // New action to manually trigger UI updates
  
  // Enhanced Computed
  getUnsavedGoalsCount: () => number;
  getUnsavedCardsCount: () => number;
  getUnassignedGoalsCount: () => number;
  getUnassignedGoals: () => MatchGoal[];
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
    lastUpdated: Date.now(),

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
          hasUnsavedChanges: false,
          lastUpdated: Date.now()
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
          hasUnsavedChanges: true,
          lastUpdated: Date.now() // Trigger UI update
        };

        console.log('🏪 MatchStore: Goal added with UI update trigger:', {
          goal: newGoal,
          newScore: `${newHomeScore}-${newAwayScore}`,
          totalGoals: updatedState.goals.length,
          lastUpdated: updatedState.lastUpdated
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
          hasUnsavedChanges: true,
          lastUpdated: Date.now() // Trigger UI update
          // NOTE: No score increment for assists
        };

        console.log('🏪 MatchStore: Assist added with UI update trigger:', {
          assist: newAssist,
          totalGoalsAndAssists: updatedState.goals.length,
          lastUpdated: updatedState.lastUpdated
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

        const updatedState = {
          goals: updatedGoals,
          hasUnsavedChanges: true,
          lastUpdated: Date.now() // Trigger UI update
        };

        console.log('🏪 MatchStore: Goal updated with UI update trigger:', {
          goalId,
          updates,
          updatedGoal: updatedGoals.find(g => g.id === goalId),
          lastUpdated: updatedState.lastUpdated
        });

        return updatedState;
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
          hasUnsavedChanges: true,
          lastUpdated: Date.now() // Trigger UI update
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
        hasUnsavedChanges: true,
        lastUpdated: Date.now() // Trigger UI update
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
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      }));

      return newEvent;
    },

    markAsSaved: () => {
      set((state) => ({
        goals: state.goals.map(g => ({ ...g, synced: true })),
        cards: state.cards.map(c => ({ ...c, synced: true })),
        playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
        lastSaved: Date.now(),
        hasUnsavedChanges: false,
        lastUpdated: Date.now() // Trigger UI update
      }));
      console.log('🏪 MatchStore: All data marked as saved with UI update trigger');
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
        hasUnsavedChanges: false,
        lastUpdated: Date.now() // Trigger UI update
      });
      console.log('🏪 MatchStore: State reset with UI update trigger');
    },

    triggerUIUpdate: () => {
      set((state) => ({
        lastUpdated: Date.now()
      }));
      console.log('🏪 MatchStore: Manual UI update triggered');
    },

    // Enhanced computed getters
    getUnsavedGoalsCount: () => {
      return get().goals.filter(g => !g.synced).length;
    },

    getUnsavedCardsCount: () => {
      return get().cards.filter(c => !c.synced).length;
    },

    getUnassignedGoalsCount: () => {
      // Enhanced detection with real-time updates
      const unassignedCount = get().goals.filter(g => 
        g.playerName === 'Quick Goal' || 
        g.playerName === 'Unknown Player' ||
        (!g.playerId && g.type === 'goal')
      ).length;
      
      console.log('🏪 MatchStore: Real-time unassigned goals count:', unassignedCount);
      return unassignedCount;
    },

    getUnassignedGoals: () => {
      // Enhanced method with real-time updates
      const unassignedGoals = get().goals.filter(g => 
        g.playerName === 'Quick Goal' || 
        g.playerName === 'Unknown Player' ||
        (!g.playerId && g.type === 'goal')
      );
      
      console.log('🏪 MatchStore: Real-time unassigned goals:', unassignedGoals);
      return unassignedGoals;
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

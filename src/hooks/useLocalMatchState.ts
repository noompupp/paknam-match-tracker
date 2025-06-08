
import { useState, useCallback, useRef } from 'react';

export interface LocalGoal {
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

export interface LocalCard {
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

export interface LocalPlayerTime {
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

export interface LocalMatchState {
  homeScore: number;
  awayScore: number;
  goals: LocalGoal[];
  cards: LocalCard[];
  playerTimes: LocalPlayerTime[];
  events: Array<{
    id: string;
    type: string;
    description: string;
    time: number;
    timestamp: number;
  }>;
  lastSaved: number | null;
  hasUnsavedChanges: boolean;
}

interface UseLocalMatchStateProps {
  fixtureId?: number;
  initialHomeScore?: number;
  initialAwayScore?: number;
}

export const useLocalMatchState = ({
  fixtureId,
  initialHomeScore = 0,
  initialAwayScore = 0
}: UseLocalMatchStateProps = {}) => {
  const [localState, setLocalState] = useState<LocalMatchState>({
    homeScore: initialHomeScore,
    awayScore: initialAwayScore,
    goals: [],
    cards: [],
    playerTimes: [],
    events: [],
    lastSaved: null,
    hasUnsavedChanges: false
  });

  const idCounter = useRef(0);
  const generateId = useCallback(() => `local_${Date.now()}_${++idCounter.current}`, []);

  const markAsChanged = useCallback(() => {
    setLocalState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Goal management
  const addLocalGoal = useCallback((goalData: Omit<LocalGoal, 'id' | 'timestamp' | 'synced'>) => {
    const newGoal: LocalGoal = {
      ...goalData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    setLocalState(prev => {
      const newHomeScore = goalData.team === 'home' ? prev.homeScore + 1 : prev.homeScore;
      const newAwayScore = goalData.team === 'away' ? prev.awayScore + 1 : prev.awayScore;
      
      return {
        ...prev,
        goals: [...prev.goals, newGoal],
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true
      };
    });

    console.log('📊 useLocalMatchState: Added local goal:', newGoal);
    return newGoal;
  }, [generateId]);

  const updateLocalGoal = useCallback((goalId: string, updates: Partial<LocalGoal>) => {
    setLocalState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates, synced: false }
          : goal
      ),
      hasUnsavedChanges: true
    }));
  }, []);

  const removeLocalGoal = useCallback((goalId: string) => {
    setLocalState(prev => {
      const goalToRemove = prev.goals.find(g => g.id === goalId);
      if (!goalToRemove) return prev;

      const newHomeScore = goalToRemove.team === 'home' ? prev.homeScore - 1 : prev.homeScore;
      const newAwayScore = goalToRemove.team === 'away' ? prev.awayScore - 1 : prev.awayScore;

      return {
        ...prev,
        goals: prev.goals.filter(g => g.id !== goalId),
        homeScore: Math.max(0, newHomeScore),
        awayScore: Math.max(0, newAwayScore),
        hasUnsavedChanges: true
      };
    });
  }, []);

  // Card management
  const addLocalCard = useCallback((cardData: Omit<LocalCard, 'id' | 'timestamp' | 'synced'>) => {
    const newCard: LocalCard = {
      ...cardData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    setLocalState(prev => ({
      ...prev,
      cards: [...prev.cards, newCard],
      hasUnsavedChanges: true
    }));

    console.log('🟨 useLocalMatchState: Added local card:', newCard);
    return newCard;
  }, [generateId]);

  // Player time management
  const addLocalPlayerTime = useCallback((playerData: Omit<LocalPlayerTime, 'id' | 'timestamp' | 'synced'>) => {
    const newPlayerTime: LocalPlayerTime = {
      ...playerData,
      id: generateId(),
      synced: false
    };

    setLocalState(prev => ({
      ...prev,
      playerTimes: [...prev.playerTimes, newPlayerTime],
      hasUnsavedChanges: true
    }));

    return newPlayerTime;
  }, [generateId]);

  const updateLocalPlayerTime = useCallback((playerId: number, updates: Partial<LocalPlayerTime>) => {
    setLocalState(prev => ({
      ...prev,
      playerTimes: prev.playerTimes.map(pt => 
        pt.playerId === playerId 
          ? { ...pt, ...updates, synced: false }
          : pt
      ),
      hasUnsavedChanges: true
    }));
  }, []);

  // Event management
  const addLocalEvent = useCallback((type: string, description: string, time: number) => {
    const newEvent = {
      id: generateId(),
      type,
      description,
      time,
      timestamp: Date.now()
    };

    setLocalState(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
      hasUnsavedChanges: true
    }));

    return newEvent;
  }, [generateId]);

  // Reset functions
  const resetLocalState = useCallback(() => {
    setLocalState({
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      events: [],
      lastSaved: null,
      hasUnsavedChanges: false
    });
    console.log('🔄 useLocalMatchState: Local state reset');
  }, []);

  const markAsSaved = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      goals: prev.goals.map(g => ({ ...g, synced: true })),
      cards: prev.cards.map(c => ({ ...c, synced: true })),
      playerTimes: prev.playerTimes.map(pt => ({ ...pt, synced: true })),
      lastSaved: Date.now(),
      hasUnsavedChanges: false
    }));
    console.log('✅ useLocalMatchState: Marked all data as saved');
  }, []);

  // Calculate derived state
  const unsavedGoalsCount = localState.goals.filter(g => !g.synced).length;
  const unsavedCardsCount = localState.cards.filter(c => !c.synced).length;
  const unassignedGoalsCount = localState.goals.filter(g => 
    g.playerName === 'Quick Goal' || g.playerName === 'Unknown Player'
  ).length;

  return {
    // State
    localState,
    
    // Derived state
    unsavedGoalsCount,
    unsavedCardsCount,
    unassignedGoalsCount,
    
    // Goal actions
    addLocalGoal,
    updateLocalGoal,
    removeLocalGoal,
    
    // Card actions
    addLocalCard,
    
    // Player time actions
    addLocalPlayerTime,
    updateLocalPlayerTime,
    
    // Event actions
    addLocalEvent,
    
    // State management
    resetLocalState,
    markAsSaved,
    markAsChanged
  };
};

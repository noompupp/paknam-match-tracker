
import { useState } from 'react';
import type { LocalMatchState, UseLocalMatchStateProps } from './types';
import { useIdGenerator } from './utils';
import { useGoalActions } from './goalActions';
import { useCardActions } from './cardActions';
import { usePlayerTimeActions } from './playerTimeActions';
import { useEventActions } from './eventActions';
import { useStateActions } from './stateActions';

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

  const generateId = useIdGenerator();

  // Get all action hooks
  const goalActions = useGoalActions(setLocalState, generateId);
  const cardActions = useCardActions(setLocalState, generateId);
  const playerTimeActions = usePlayerTimeActions(setLocalState, generateId);
  const eventActions = useEventActions(setLocalState, generateId);
  const stateActions = useStateActions(setLocalState);

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
    ...goalActions,
    
    // Card actions
    ...cardActions,
    
    // Player time actions
    ...playerTimeActions,
    
    // Event actions
    ...eventActions,
    
    // State management
    ...stateActions
  };
};

// Re-export types for convenience
export type * from './types';

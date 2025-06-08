
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { createInitialState } from './utils';
import { createGoalSlice, GoalSlice } from './goalSlice';
import { createCardSlice, CardSlice } from './cardSlice';
import { createPlayerTimeSlice, PlayerTimeSlice } from './playerTimeSlice';
import { createCoreSlice, CoreSlice } from './coreSlice';

type MatchStore = MatchState & MatchActions;

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => ({
    // Initial state
    ...createInitialState(),
    
    // Combine all slices
    ...createGoalSlice(set, get, api),
    ...createCardSlice(set, get, api),
    ...createPlayerTimeSlice(set, get, api),
    ...createCoreSlice(set, get, api)
  }))
);

// Export types for use in other files
export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';


// This file creates the Zustand match store by composing slice objects.
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MatchState, MatchGoal, MatchCard, MatchPlayerTime } from './types';
import { MatchActions } from './actions';
import { createInitialState } from './utils';
import { createEnhancedGoalSlice } from './enhancedGoalSlice';
import { createEnhancedCardSlice } from './enhancedCardSlice';
import { createEnhancedPlayerTimeSlice } from './enhancedPlayerTimeSlice';
import { createPlayerTimeSlice } from './playerTimeSlice';
import { createCoreSlice } from './coreSlice';
import { createGoalSlice } from './goalSlice';
import { createOptimizedPlayerTimeSlice } from './optimizedPlayerTimeSlice';
import { createUtilitySlice } from './utilitySlice';

// Compose the store by spreading all the necessary slices and initial state
type MatchStore = MatchState & MatchActions;

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => ({
    ...createInitialState(),
    ...createEnhancedGoalSlice(set, get, api),
    ...createGoalSlice(set, get, api),
    ...createEnhancedCardSlice(set, get, api),
    ...createEnhancedPlayerTimeSlice(set, get, api),
    ...createPlayerTimeSlice(set, get, api),
    ...createCoreSlice(set, get, api),
    ...createOptimizedPlayerTimeSlice(set, get, api),
    ...createUtilitySlice(set, get, api),  // <-- supplies missing MatchActions
  }))
);

export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

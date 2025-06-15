
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MatchState, MatchGoal, MatchCard, MatchPlayerTime } from './types';
import { MatchActions } from './actions';
import { createInitialState, generateId } from './utils';
import { createEnhancedGoalSlice } from './enhancedGoalSlice';
import { createEnhancedCardSlice } from './enhancedCardSlice';
import { createEnhancedPlayerTimeSlice } from './enhancedPlayerTimeSlice';
import { createPlayerTimeSlice } from './playerTimeSlice';
import { createCoreSlice } from './coreSlice';
import { createGoalSlice } from './goalSlice';
import { createOptimizedPlayerTimeSlice } from './optimizedPlayerTimeSlice';

type MatchStore = MatchState & MatchActions;

// Remove ALL old legacy goalQueue logic. Everything goes through the deduped slices now.
export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => {
    return {
      ...createInitialState(),
      ...createEnhancedGoalSlice(set, get, api),
      ...createGoalSlice(set, get, api),
      ...createEnhancedCardSlice(set, get, api),
      ...createEnhancedPlayerTimeSlice(set, get, api),
      ...createPlayerTimeSlice(set, get, api),
      ...createCoreSlice(set, get, api),
      ...createOptimizedPlayerTimeSlice(set, get, api),
    };
  })
);

export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

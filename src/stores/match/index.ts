
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MatchState, MatchGoal, MatchCard, MatchPlayerTime } from './types';
import { MatchActions } from './actions';
import { createInitialState } from './utils';
import { createEnhancedGoalSlice } from './enhancedGoalSlice';
import { createEnhancedCardSlice } from './enhancedCardSlice';
import { createEnhancedPlayerTimeSlice } from './enhancedPlayerTimeSlice';
import { createPlayerTimeSlice } from './playerTimeSlice';
import { createEnhancedCoreSlice, EnhancedCoreSlice } from './enhancedCoreSlice';
import { createAutoSyncSlice, AutoSyncSlice } from './autoSyncSlice';
import { createGoalSlice } from './goalSlice';
import { createOptimizedPlayerTimeSlice } from './optimizedPlayerTimeSlice';
import { createUtilitySlice } from './utilitySlice';

// Compose the store with auto-sync functionality
type MatchStore = MatchState & MatchActions & EnhancedCoreSlice & AutoSyncSlice;

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => ({
    ...createInitialState(),
    ...createEnhancedGoalSlice(set, get, api),
    ...createGoalSlice(set, get, api),
    ...createEnhancedCardSlice(set, get, api),
    ...createEnhancedPlayerTimeSlice(set, get, api),
    ...createPlayerTimeSlice(set, get, api),
    ...createEnhancedCoreSlice(set, get, api),
    ...createAutoSyncSlice(set, get, api),
    ...createOptimizedPlayerTimeSlice(set, get, api),
    ...createUtilitySlice(set, get, api),
  }))
);

export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';
export type { EnhancedCoreSlice, AutoSyncSlice };

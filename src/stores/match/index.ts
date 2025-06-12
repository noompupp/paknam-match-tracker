
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { createInitialState } from './utils';
import { createEnhancedGoalSlice, EnhancedGoalSlice } from './enhancedGoalSlice';
import { createEnhancedCardSlice, EnhancedCardSlice } from './enhancedCardSlice';
import { createEnhancedPlayerTimeSlice, EnhancedPlayerTimeSlice } from './enhancedPlayerTimeSlice';
import { createPlayerTimeSlice, PlayerTimeSlice } from './playerTimeSlice';
import { createCoreSlice, CoreSlice } from './coreSlice';
import { createGoalSlice, GoalSlice } from './goalSlice';
import { createOptimizedPlayerTimeSlice, OptimizedPlayerTimeSlice } from './optimizedPlayerTimeSlice';

type MatchStore = MatchState & MatchActions & EnhancedPlayerTimeSlice & PlayerTimeSlice & OptimizedPlayerTimeSlice & {
  syncCardsToDatabase: (fixtureId: number) => Promise<void>;
  optimizedBatchSync: (fixtureId: number) => Promise<void>;
  syncAllToDatabase: (fixtureId: number) => Promise<void>;
};

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => ({
    // Initial state
    ...createInitialState(),
    
    // Combine all enhanced slices
    ...createEnhancedGoalSlice(set, get, api),
    ...createGoalSlice(set, get, api),
    ...createEnhancedCardSlice(set, get, api),
    ...createEnhancedPlayerTimeSlice(set, get, api),
    ...createPlayerTimeSlice(set, get, api),
    ...createCoreSlice(set, get, api),
    ...createOptimizedPlayerTimeSlice(set, get, api)
  }))
);

// Export types for use in other files
export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

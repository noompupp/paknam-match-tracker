
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { createInitialState } from './utils';
import { createEnhancedGoalSlice, EnhancedGoalSlice } from './enhancedGoalSlice';
import { createEnhancedCardSlice, EnhancedCardSlice } from './enhancedCardSlice';
import { createPlayerTimeSlice, PlayerTimeSlice } from './playerTimeSlice';
import { createCoreSlice, CoreSlice } from './coreSlice';

type MatchStore = MatchState & MatchActions & {
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
    ...createEnhancedCardSlice(set, get, api),
    ...createPlayerTimeSlice(set, get, api),
    ...createCoreSlice(set, get, api)
  }))
);

// Export types for use in other files
export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

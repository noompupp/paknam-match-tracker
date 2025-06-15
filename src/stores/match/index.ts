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
import { useBatchEventQueue } from "@/hooks/useBatchEventQueue";

type MatchStore = MatchState & MatchActions;

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => {
    // ------ FIX: REMOVE HOOKS FROM STORE! ------
    // Replace useBatchEventQueue (which uses React hooks) with vanilla JS queue implementations!

    // Vanilla queues for match event batching (not reliant on React)
    const goalQueue: any[] = [];
    const cardQueue: any[] = [];
    const playerTimeQueue: any[] = [];

    // Helper to flush a specific queue and update store state
    const flushQueue = (queue: any[], key: 'goals' | 'cards' | 'playerTimes') => {
      if (queue.length === 0) return;
      set((state) => ({
        [key]: [...(state[key] as any[]), ...queue],
        hasUnsavedChanges: true,
        lastUpdated: Date.now(),
      }));
      queue.length = 0; // clear array
    };

    return {
      ...createInitialState(),

      ...createEnhancedGoalSlice(set, get, api),
      ...createGoalSlice(set, get, api),
      ...createEnhancedCardSlice(set, get, api),
      ...createEnhancedPlayerTimeSlice(set, get, api),
      ...createPlayerTimeSlice(set, get, api),
      ...createCoreSlice(set, get, api),
      ...createOptimizedPlayerTimeSlice(set, get, api),

      // --- Override add handlers to use the (vanilla) event queues ---
      addGoal: (goalData) => {
        const newGoal: MatchGoal = {
          ...goalData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        goalQueue.push(newGoal);
        return newGoal;
      },
      addCard: (cardData) => {
        const newCard: MatchCard = {
          ...cardData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        cardQueue.push(newCard);
        return newCard;
      },
      addPlayerTime: (playerTimeData) => {
        const newPlayerTime: MatchPlayerTime = {
          ...playerTimeData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        playerTimeQueue.push(newPlayerTime);
        return newPlayerTime;
      },

      // ----- Provide flush to commit all queued events -----
      flushBatchedEvents: async () => {
        flushQueue(goalQueue, 'goals');
        flushQueue(cardQueue, 'cards');
        flushQueue(playerTimeQueue, 'playerTimes');
      },
    };
  })
);

// Export types for use in other files
export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

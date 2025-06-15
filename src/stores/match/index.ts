
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
// import { useBatchEventQueue } from "@/hooks/useBatchEventQueue"; // No longer needed

type MatchStore = MatchState & MatchActions;

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => {
    // Vanilla queues for match event batching (primarily for legacy bulk/batch save)
    const goalQueue: any[] = [];
    const cardQueue: any[] = [];
    const playerTimeQueue: any[] = [];

    // Helper function remains for bulk flush to state, rare cases
    const flushQueue = (queue: any[], key: 'goals' | 'cards' | 'playerTimes') => {
      if (queue.length === 0) return;
      set((state) => ({
        [key]: [...(state[key] as any[]), ...queue],
        hasUnsavedChanges: true,
        lastUpdated: Date.now(),
      }));
      queue.length = 0;
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

      // --- Immediate mutation: addGoal, addCard, addPlayerTime ---
      addGoal: (goalData) => {
        const newGoal: MatchGoal = {
          ...goalData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        // Add to state immediately!
        set((state) => ({
          goals: [...state.goals, newGoal],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
        // For compatibility: still add to (legacy) batch queue
        goalQueue.push(newGoal);
        // Debug logging
        console.log('🟢 useMatchStore: Goal ADDED live:', newGoal, { currentGoalsLength: get().goals.length + 1 });
        return newGoal;
      },
      addCard: (cardData) => {
        const newCard: MatchCard = {
          ...cardData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        // Add to state immediately!
        set((state) => ({
          cards: [...state.cards, newCard],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
        cardQueue.push(newCard);
        // Debug logging
        console.log('🟢 useMatchStore: Card ADDED live:', newCard, { currentCardsLength: get().cards.length + 1 });
        return newCard;
      },
      addPlayerTime: (playerTimeData) => {
        const newPlayerTime: MatchPlayerTime = {
          ...playerTimeData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        // Add to state immediately!
        set((state) => ({
          playerTimes: [...state.playerTimes, newPlayerTime],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
        playerTimeQueue.push(newPlayerTime);
        // Debug logging
        console.log('🟢 useMatchStore: PlayerTime ADDED live:', newPlayerTime, { currentPlayerTimesLength: get().playerTimes.length + 1 });
        return newPlayerTime;
      },

      // ----- Provide flush to commit queued events (for rare/bulk/legacy processing only) -----
      flushBatchedEvents: async () => {
        flushQueue(goalQueue, 'goals');
        flushQueue(cardQueue, 'cards');
        flushQueue(playerTimeQueue, 'playerTimes');
        // Debug logging
        console.log('🟠 useMatchStore: Flushed batched events.');
      },
    };
  })
);

// Export types for use in other files
export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';


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
import { createOptimizedPlayerTimeSlice } from './optimizedPlayerTimeSlice';
import { useBatchEventQueue } from "@/hooks/useBatchEventQueue";

type MatchStore = MatchState & MatchActions;

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get, api) => {
    // --- NEW: batched event queues for goals, cards, playerTimes ---
    // These will be flushed all at once when batch-save is triggered.
    const goalBatchQueue = useBatchEventQueue(
      async (events) => {
        // Add all queued goals to state (as unsynced), but don't sync yet
        set((state) => ({
          goals: [...state.goals, ...events],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
      }
    );

    const cardBatchQueue = useBatchEventQueue(
      async (events) => {
        set((state) => ({
          cards: [...state.cards, ...events],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
      }
    );

    const playerTimeBatchQueue = useBatchEventQueue(
      async (events) => {
        set((state) => ({
          playerTimes: [...state.playerTimes, ...events],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
      }
    );

    return {
      ...createInitialState(),

      ...createEnhancedGoalSlice(set, get, api),
      ...createGoalSlice(set, get, api),
      ...createEnhancedCardSlice(set, get, api),
      ...createEnhancedPlayerTimeSlice(set, get, api),
      ...createPlayerTimeSlice(set, get, api),
      ...createCoreSlice(set, get, api),
      ...createOptimizedPlayerTimeSlice(set, get, api),

      // --- Batched event queues ---
      goalBatchQueue,
      cardBatchQueue,
      playerTimeBatchQueue,

      // --- Override add handlers to use the queue (for unsynced local state until flush) ---
      addGoal: (goalData) => {
        goalBatchQueue.add({
          ...goalData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false
        });
        return goalData;
      },
      addCard: (cardData) => {
        cardBatchQueue.add({
          ...cardData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false
        });
        return cardData;
      },
      addPlayer: (player, time) => {
        playerTimeBatchQueue.add({
          ...player,
          time,
          synced: false,
        });
        return player;
      },

      // --- Batch flush to commit all queued events as true "unsynced" local state ---
      flushBatchedEvents: async () => {
        await goalBatchQueue.flush();
        await cardBatchQueue.flush();
        await playerTimeBatchQueue.flush();
      },
    }
  })
);

// Export types for use in other files
export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

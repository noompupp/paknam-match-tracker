
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
    // --- NEW: batched event queues for goals, cards, playerTimes ---
    // These will be flushed all at once when batch-save is triggered.
    const goalBatchQueue = useBatchEventQueue<MatchGoal>(
      async (events) => {
        set((state) => ({
          goals: [...state.goals, ...(events as MatchGoal[])],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
      }
    );

    const cardBatchQueue = useBatchEventQueue<MatchCard>(
      async (events) => {
        set((state) => ({
          cards: [...state.cards, ...(events as MatchCard[])],
          hasUnsavedChanges: true,
          lastUpdated: Date.now(),
        }));
      }
    );

    const playerTimeBatchQueue = useBatchEventQueue<MatchPlayerTime>(
      async (events) => {
        set((state) => ({
          playerTimes: [...state.playerTimes, ...(events as MatchPlayerTime[])],
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

      // --- Batched event queues (for test/dev/flush-inspection; not typed in MatchState) ---
      goalBatchQueue,
      cardBatchQueue,
      playerTimeBatchQueue,

      // --- Override add handlers to use the queue (for unsynced local state until flush) ---
      addGoal: (goalData) => {
        const newGoal: MatchGoal = {
          ...goalData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        goalBatchQueue.add(newGoal);
        return newGoal;
      },
      addCard: (cardData) => {
        const newCard: MatchCard = {
          ...cardData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        cardBatchQueue.add(newCard);
        return newCard;
      },
      addPlayerTime: (playerTimeData) => {
        const newPlayerTime: MatchPlayerTime = {
          ...playerTimeData,
          id: generateId(),
          timestamp: Date.now(),
          synced: false,
        };
        playerTimeBatchQueue.add(newPlayerTime);
        return newPlayerTime;
      },

      // --- Batch flush to commit all queued events as true "unsynced" local state ---
      flushBatchedEvents: async () => {
        await goalBatchQueue.flush();
        await cardBatchQueue.flush();
        await playerTimeBatchQueue.flush();
      },
    };
  })
);

// Export types for use in other files
export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

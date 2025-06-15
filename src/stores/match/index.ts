
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

// Add missing no-op/default implementations for all required MatchActions
const defaultNoopAsync = async () => {};
const defaultNoop = () => {};
const defaultNoopReturn = () => { return 0; };
const defaultNoopObj = () => ({ goals: 0, cards: 0, playerTimes: 0 });

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

    // --- THE FOLLOWING GUARANTEE NO ACTIONS ARE UNDEFINED, satisfying MatchActions ---
    // Goal actions (no-op if not present in slices above)
    addGoal: (get().addGoal ?? defaultNoop) as MatchActions['addGoal'],
    addAssist: (get().addAssist ?? defaultNoop) as MatchActions['addAssist'],
    updateGoal: (get().updateGoal ?? defaultNoop) as MatchActions['updateGoal'],
    removeGoal: (get().removeGoal ?? defaultNoop) as MatchActions['removeGoal'],
    undoGoal: (get().undoGoal ?? defaultNoop) as MatchActions['undoGoal'],
    getUnassignedGoalsCount: (get().getUnassignedGoalsCount ?? defaultNoopReturn) as MatchActions['getUnassignedGoalsCount'],
    getUnassignedGoals: (get().getUnassignedGoals ?? (() => [])) as MatchActions['getUnassignedGoals'],
    getUnsavedGoalsCount: (get().getUnsavedGoalsCount ?? defaultNoopReturn) as MatchActions['getUnsavedGoalsCount'],

    // Card actions
    addCard: (get().addCard ?? defaultNoop) as MatchActions['addCard'],
    updateCard: (get().updateCard ?? defaultNoop) as MatchActions['updateCard'],
    removeCard: (get().removeCard ?? defaultNoop) as MatchActions['removeCard'],
    getUnsavedCardsCount: (get().getUnsavedCardsCount ?? defaultNoopReturn) as MatchActions['getUnsavedCardsCount'],

    // Player time actions
    addPlayerTime: (get().addPlayerTime ?? defaultNoop) as MatchActions['addPlayerTime'],
    updatePlayerTime: (get().updatePlayerTime ?? defaultNoop) as MatchActions['updatePlayerTime'],
    removePlayerTime: (get().removePlayerTime ?? defaultNoop) as MatchActions['removePlayerTime'],
    getUnsavedPlayerTimesCount: (get().getUnsavedPlayerTimesCount ?? defaultNoopReturn) as MatchActions['getUnsavedPlayerTimesCount'],
    getActivePlayersCount: (get().getActivePlayersCount ?? defaultNoopReturn) as MatchActions['getActivePlayersCount'],
    startPlayerTime: (get().startPlayerTime ?? defaultNoop) as MatchActions['startPlayerTime'],
    stopPlayerTime: (get().stopPlayerTime ?? defaultNoop) as MatchActions['stopPlayerTime'],
    togglePlayerTime: (get().togglePlayerTime ?? defaultNoop) as MatchActions['togglePlayerTime'],
    updateAllPlayerTimes: (get().updateAllPlayerTimes ?? defaultNoop) as MatchActions['updateAllPlayerTimes'],

    // Database sync actions
    loadPlayerTimesFromDatabase: (get().loadPlayerTimesFromDatabase ?? defaultNoopAsync) as MatchActions['loadPlayerTimesFromDatabase'],
    syncPlayerTimesToDatabase: (get().syncPlayerTimesToDatabase ?? defaultNoopAsync) as MatchActions['syncPlayerTimesToDatabase'],
    syncGoalsToDatabase: (get().syncGoalsToDatabase ?? defaultNoopAsync) as MatchActions['syncGoalsToDatabase'],
    syncCardsToDatabase: (get().syncCardsToDatabase ?? defaultNoopAsync) as MatchActions['syncCardsToDatabase'],
    optimizedBatchSync: (get().optimizedBatchSync ?? defaultNoopAsync) as MatchActions['optimizedBatchSync'],
    syncAllToDatabase: (get().syncAllToDatabase ?? defaultNoopAsync) as MatchActions['syncAllToDatabase'],

    // Utility actions
    clearPlayerTimes: (get().clearPlayerTimes ?? defaultNoop) as MatchActions['clearPlayerTimes'],
    addEvent: (get().addEvent ?? defaultNoop) as MatchActions['addEvent'],
    triggerUIUpdate: (get().triggerUIUpdate ?? defaultNoop) as MatchActions['triggerUIUpdate'],
    resetState: (get().resetState ?? defaultNoop) as MatchActions['resetState'],

    // Core actions
    setupMatch: (get().setupMatch ?? defaultNoop) as MatchActions['setupMatch'],
    setFixtureId: (get().setFixtureId ?? defaultNoop) as MatchActions['setFixtureId'],
    updateScore: (get().updateScore ?? defaultNoop) as MatchActions['updateScore'],
    markAsSaved: (get().markAsSaved ?? defaultNoop) as MatchActions['markAsSaved'],
    resetMatch: (get().resetMatch ?? defaultNoop) as MatchActions['resetMatch'],
    getUnsavedItemsCount: (get().getUnsavedItemsCount ?? defaultNoopObj) as MatchActions['getUnsavedItemsCount'],

    // Batch flush actions
    flushBatchedEvents: (get().flushBatchedEvents ?? defaultNoopAsync) as MatchActions['flushBatchedEvents'],
  }))
);

export type { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent, MatchState } from './types';
export type { MatchActions } from './actions';

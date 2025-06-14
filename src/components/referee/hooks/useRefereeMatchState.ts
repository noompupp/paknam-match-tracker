
import { usePlayerTracking } from "@/hooks/usePlayerTracking";
import { useGoalManagement } from "@/hooks/useGoalManagement";
import { useLocalMatchEvents } from "@/hooks/useMatchEvents";
import { useCardManagementImproved } from "@/hooks/useCardManagementImproved";

interface RefereeMatchStateProps {
  selectedFixtureData: any;
  isRunning: boolean;
  matchTime: number;
}

export const useRefereeMatchState = ({ selectedFixtureData, isRunning, matchTime }: RefereeMatchStateProps) => {
  // Player tracking state with enhanced role-based features
  const { 
    trackedPlayers, 
    selectedPlayer: selectedTimePlayer, 
    setSelectedPlayer: setSelectedTimePlayer, 
    addPlayer, 
    removePlayer, 
    togglePlayerTime, 
    resetTracking,
    getPlayersNeedingAttention,
    getRoleBasedNotifications,
    playerHalfTimes,
    roleBasedStops
  } = usePlayerTracking(isRunning);

  // Goal management state
  const { 
    goals, 
    selectedGoalPlayer, 
    selectedGoalType, 
    setSelectedGoalPlayer, 
    setSelectedGoalType, 
    assignGoal, 
    resetGoals 
  } = useGoalManagement();

  // Events state
  const { events, addEvent, resetEvents } = useLocalMatchEvents();
  
  // Use the improved card management hook
  const { 
    cards, 
    selectedPlayer, 
    selectedTeam, 
    selectedCardType,
    setSelectedPlayer, 
    setSelectedTeam, 
    setSelectedCardType,
    addCard, 
    resetCards,
    checkForSecondYellow 
  } = useCardManagementImproved({ selectedFixtureData });

  // Check for players needing attention - fix to accept single argument
  const getPlayersNeedingAttentionForMatch = (playersForTimeTracker: any[]) => {
    return getPlayersNeedingAttention(playersForTimeTracker, matchTime);
  };

  return {
    // Player tracking state
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    resetTracking,
    getPlayersNeedingAttentionForMatch,
    getRoleBasedNotifications,
    playerHalfTimes,
    roleBasedStops,
    
    // Goal state
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    assignGoal,
    resetGoals,
    
    // Events state
    events,
    addEvent,
    resetEvents,
    
    // Card state
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    addCard,
    resetCards,
    checkForSecondYellow
  };
};

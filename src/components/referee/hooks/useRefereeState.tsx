
import { useState } from "react";
import { useFixtures } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useCreateMatchEvent, useUpdatePlayerStats } from "@/hooks/useMatchEvents";
import { useMatchTimer } from "@/hooks/useMatchTimer";
import { useScoreManagement } from "@/hooks/useScoreManagement";
import { usePlayerTracking } from "@/hooks/usePlayerTracking";
import { useGoalManagement } from "@/hooks/useGoalManagement";
import { useLocalMatchEvents } from "@/hooks/useMatchEvents";
import { useCardManagementImproved } from "@/hooks/useCardManagementImproved";
import { processFixtureAndPlayers, debugPlayerDropdownData, type ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { debugRefereeToolsData } from "@/utils/refereeToolsDebug";

// Use the ProcessedPlayer from refereeDataProcessor for consistency
interface ComponentPlayer extends ProcessedPlayer {}

interface PlayerTimeTrackerPlayer {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
  totalTime: number;
  startTime: number | null;
  isPlaying: boolean;
}

export const useRefereeState = () => {
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { data: members } = useMembers();
  const updateFixtureScore = useUpdateFixtureScore();
  const createMatchEvent = useCreateMatchEvent();
  const updatePlayerStats = useUpdatePlayerStats();

  const [selectedFixture, setSelectedFixture] = useState("");
  const [saveAttempts, setSaveAttempts] = useState(0);

  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);

  // Debug data when fixture is selected
  if (selectedFixture && selectedFixtureData && members) {
    debugRefereeToolsData(fixtures, members, selectedFixture);
  }

  // Process fixture and player data using the new utility
  const processedData = selectedFixtureData && members 
    ? processFixtureAndPlayers(selectedFixtureData, members)
    : null;

  // Custom hooks
  const { matchTime, isRunning, toggleTimer, resetTimer, formatTime } = useMatchTimer();
  const { homeScore, awayScore, addGoal, removeGoal, resetScore } = useScoreManagement();
  const { 
    trackedPlayers, 
    selectedPlayer: selectedTimePlayer, 
    setSelectedPlayer: setSelectedTimePlayer, 
    addPlayer, 
    removePlayer, 
    togglePlayerTime, 
    resetTracking,
    getPlayersNeedingAttention 
  } = usePlayerTracking(isRunning);
  const { goals, selectedGoalPlayer, selectedGoalType, setSelectedGoalPlayer, setSelectedGoalType, assignGoal, resetGoals } = useGoalManagement();
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
  
  // Get all players from processed data - these are already ProcessedPlayer type
  const allPlayers: ComponentPlayer[] = processedData?.allPlayers || [];

  // Debug player dropdown data
  if (processedData) {
    debugPlayerDropdownData(allPlayers, "All Players for Dropdowns");
  }

  // Create players specifically for PlayerTimeTracker with extended properties
  const playersForTimeTracker: PlayerTimeTrackerPlayer[] = trackedPlayers.map(trackedPlayer => ({
    id: trackedPlayer.id,
    name: trackedPlayer.name,
    team: trackedPlayer.team,
    number: typeof trackedPlayer.id === 'number' ? trackedPlayer.id : parseInt(String(trackedPlayer.id || '0')),
    position: 'Player',
    totalTime: trackedPlayer.totalTime,
    startTime: trackedPlayer.startTime,
    isPlaying: trackedPlayer.isPlaying
  }));

  // Check for players needing attention
  const playersNeedingAttention = getPlayersNeedingAttention(playersForTimeTracker, matchTime);

  console.log('🎯 useRefereeState Summary:', {
    selectedFixture,
    hasSelectedFixtureData: !!selectedFixtureData,
    totalMembers: members?.length || 0,
    processedPlayers: allPlayers.length,
    homeTeamPlayers: processedData?.homeTeamPlayers.length || 0,
    awayTeamPlayers: processedData?.awayTeamPlayers.length || 0
  });

  return {
    // Data
    fixtures,
    fixturesLoading,
    members,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    allPlayers,
    playersForTimeTracker,
    playersNeedingAttention,
    saveAttempts,
    setSaveAttempts,
    processedData, // Add processed data for debugging
    
    // Mutation hooks
    updateFixtureScore,
    createMatchEvent,
    updatePlayerStats,
    
    // Timer state
    matchTime,
    isRunning,
    toggleTimer,
    resetTimer,
    formatTime,
    
    // Score state
    homeScore,
    awayScore,
    addGoal,
    removeGoal,
    resetScore,
    
    // Improved card state
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    addCard,
    resetCards,
    checkForSecondYellow,
    
    // Player tracking state
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    resetTracking,
    
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
    resetEvents
  };
};

export type { ComponentPlayer, PlayerTimeTrackerPlayer };

import { useState, useEffect } from "react";
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
import { processFixtureAndPlayers, processPlayersForDropdowns, debugPlayerDropdownData, type ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { playerDropdownService } from "@/services/playerDropdownService";
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
  const [enhancedPlayersData, setEnhancedPlayersData] = useState<{
    allPlayers: ComponentPlayer[];
    hasValidData: boolean;
    dataIssues: string[];
  }>({
    allPlayers: [],
    hasValidData: false,
    dataIssues: []
  });

  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);

  // Debug data when fixture is selected
  if (selectedFixture && selectedFixtureData && members) {
    debugRefereeToolsData(fixtures, members, selectedFixture);
  }

  // Enhanced player data processing with async service integration
  useEffect(() => {
    async function loadEnhancedPlayerData() {
      if (!selectedFixtureData) {
        setEnhancedPlayersData({
          allPlayers: [],
          hasValidData: false,
          dataIssues: ['No fixture selected']
        });
        return;
      }

      console.log('🔄 useRefereeState: Loading enhanced player data...');
      
      try {
        // First, try to use the traditional processing
        const traditionalData = selectedFixtureData && members 
          ? processFixtureAndPlayers(selectedFixtureData, members)
          : null;

        // Then, try the enhanced dropdown service
        const enhancedData = await processPlayersForDropdowns(selectedFixtureData);

        // Use the best available data
        const finalData = enhancedData.hasValidData ? enhancedData : traditionalData;

        if (finalData) {
          setEnhancedPlayersData({
            allPlayers: finalData.allPlayers,
            hasValidData: finalData.hasValidData,
            dataIssues: finalData.dataIssues
          });

          // Debug the final data
          debugPlayerDropdownData(finalData.allPlayers, "Enhanced useRefereeState");
          
          console.log('✅ useRefereeState: Enhanced player data loaded:', {
            method: enhancedData.hasValidData ? 'enhanced' : 'traditional',
            totalPlayers: finalData.allPlayers.length,
            hasValidData: finalData.hasValidData,
            dataIssues: finalData.dataIssues
          });
        } else {
          console.warn('⚠️ useRefereeState: No valid player data available');
          setEnhancedPlayersData({
            allPlayers: [],
            hasValidData: false,
            dataIssues: ['No valid player data available']
          });
        }

      } catch (error) {
        console.error('❌ useRefereeState: Failed to load enhanced player data:', error);
        setEnhancedPlayersData({
          allPlayers: [],
          hasValidData: false,
          dataIssues: ['Failed to load player data: ' + (error instanceof Error ? error.message : 'Unknown error')]
        });
      }
    }

    loadEnhancedPlayerData();
  }, [selectedFixtureData, members]);

  // Process fixture and player data using the traditional method as fallback
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
  
  // Use enhanced players data when available, fallback to traditional processing
  const allPlayers: ComponentPlayer[] = enhancedPlayersData.hasValidData 
    ? enhancedPlayersData.allPlayers 
    : (processedData?.allPlayers || []);

  // Debug player dropdown data
  if (allPlayers.length > 0) {
    debugPlayerDropdownData(allPlayers, "Final useRefereeState Players");
  } else {
    console.warn('⚠️ useRefereeState: No players available for UI components!', {
      enhancedDataValid: enhancedPlayersData.hasValidData,
      enhancedDataIssues: enhancedPlayersData.dataIssues,
      traditionalDataAvailable: !!processedData,
      membersCount: members?.length || 0,
      selectedFixture: !!selectedFixtureData
    });
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
    enhancedPlayersCount: enhancedPlayersData.allPlayers.length,
    finalPlayersCount: allPlayers.length,
    enhancedDataValid: enhancedPlayersData.hasValidData,
    dataIssues: enhancedPlayersData.dataIssues
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
    enhancedPlayersData, // Add enhanced data for debugging
    
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

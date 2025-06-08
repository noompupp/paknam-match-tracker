import { useState, useEffect } from "react";
import { useFixtures } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useCreateMatchEvent, useUpdatePlayerStats } from "@/hooks/useMatchEvents";
import { useMatchTimer } from "@/hooks/useMatchTimer";
import { useRealTimeScore } from "@/hooks/useRealTimeScore";
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
  
  // Add team selection state for Goals and Time tabs
  const [selectedGoalTeam, setSelectedGoalTeam] = useState("");
  const [selectedTimeTeam, setSelectedTimeTeam] = useState("");
  
  const [enhancedPlayersData, setEnhancedPlayersData] = useState<{
    allPlayers: ComponentPlayer[];
    homeTeamPlayers: ComponentPlayer[];
    awayTeamPlayers: ComponentPlayer[];
    hasValidData: boolean;
    dataIssues: string[];
  }>({
    allPlayers: [],
    homeTeamPlayers: [],
    awayTeamPlayers: [],
    hasValidData: false,
    dataIssues: []
  });

  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);

  // Debug data when fixture is selected
  if (selectedFixture && selectedFixtureData && members) {
    debugRefereeToolsData(fixtures, members, selectedFixture);
  }

  // Enhanced player data processing with match-specific filtering
  useEffect(() => {
    async function loadEnhancedPlayerData() {
      if (!selectedFixtureData) {
        setEnhancedPlayersData({
          allPlayers: [],
          homeTeamPlayers: [],
          awayTeamPlayers: [],
          hasValidData: false,
          dataIssues: ['No fixture selected']
        });
        return;
      }

      console.log('🔄 useRefereeState: Loading enhanced player data for fixture:', selectedFixtureData.id);
      
      try {
        const homeTeamName = selectedFixtureData.home_team?.name;
        const awayTeamName = selectedFixtureData.away_team?.name;

        if (!homeTeamName || !awayTeamName) {
          throw new Error('Missing team names in fixture');
        }

        // Use the enhanced dropdown service for match-specific players
        const { homeTeamPlayers, awayTeamPlayers, allPlayers } = 
          await playerDropdownService.getPlayersByTeam(homeTeamName, awayTeamName);

        const dataIssues: string[] = [];
        
        if (homeTeamPlayers.length === 0) {
          dataIssues.push(`No players found for home team: ${homeTeamName}`);
        }
        
        if (awayTeamPlayers.length === 0) {
          dataIssues.push(`No players found for away team: ${awayTeamName}`);
        }

        const hasValidData = homeTeamPlayers.length > 0 && awayTeamPlayers.length > 0;

        setEnhancedPlayersData({
          allPlayers: allPlayers.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            team_id: p.team_id,
            number: p.number,
            position: p.position
          })),
          homeTeamPlayers: homeTeamPlayers.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            team_id: p.team_id,
            number: p.number,
            position: p.position
          })),
          awayTeamPlayers: awayTeamPlayers.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            team_id: p.team_id,
            number: p.number,
            position: p.position
          })),
          hasValidData,
          dataIssues
        });

        // Debug the final data
        debugPlayerDropdownData(allPlayers, "Enhanced useRefereeState - Match Specific");
        
        console.log('✅ useRefereeState: Enhanced player data loaded for match:', {
          fixture: selectedFixtureData.id,
          homeTeam: homeTeamName,
          awayTeam: awayTeamName,
          homePlayersCount: homeTeamPlayers.length,
          awayPlayersCount: awayTeamPlayers.length,
          totalPlayers: allPlayers.length,
          hasValidData
        });

      } catch (error) {
        console.error('❌ useRefereeState: Failed to load enhanced player data:', error);
        setEnhancedPlayersData({
          allPlayers: [],
          homeTeamPlayers: [],
          awayTeamPlayers: [],
          hasValidData: false,
          dataIssues: ['Failed to load player data: ' + (error instanceof Error ? error.message : 'Unknown error')]
        });
      }
    }

    loadEnhancedPlayerData();
  }, [selectedFixtureData, members]);

  // Reset team selections when fixture changes
  useEffect(() => {
    if (selectedFixture) {
      setSelectedGoalTeam("");
      setSelectedTimeTeam("");
    }
  }, [selectedFixture]);

  // Custom hooks
  const { matchTime, isRunning, toggleTimer, resetTimer, formatTime } = useMatchTimer();
  
  // Enhanced real-time score hook with force refresh capability
  const { homeScore, awayScore, addGoal, removeGoal, resetScore, refreshScore, forceRefresh } = useRealTimeScore({ 
    fixtureId: selectedFixtureData ? selectedFixtureData.id : undefined 
  });
  
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

  // Get filtered players for Goals tab based on selected team
  const getGoalFilteredPlayers = () => {
    if (!selectedGoalTeam) return [];
    
    if (selectedGoalTeam === 'home') {
      return enhancedPlayersData.homeTeamPlayers;
    } else if (selectedGoalTeam === 'away') {
      return enhancedPlayersData.awayTeamPlayers;
    }
    
    return [];
  };

  // Get filtered players for Time tab based on selected team
  const getTimeFilteredPlayers = () => {
    if (!selectedTimeTeam) return [];
    
    if (selectedTimeTeam === 'home') {
      return enhancedPlayersData.homeTeamPlayers;
    } else if (selectedTimeTeam === 'away') {
      return enhancedPlayersData.awayTeamPlayers;
    }
    
    return [];
  };

  console.log('🎯 useRefereeState Summary (Enhanced):', {
    selectedFixture,
    hasSelectedFixtureData: !!selectedFixtureData,
    totalMembers: members?.length || 0,
    homePlayersCount: enhancedPlayersData.homeTeamPlayers.length,
    awayPlayersCount: enhancedPlayersData.awayTeamPlayers.length,
    totalPlayersCount: enhancedPlayersData.allPlayers.length,
    enhancedDataValid: enhancedPlayersData.hasValidData,
    dataIssues: enhancedPlayersData.dataIssues,
    selectedGoalTeam,
    selectedTimeTeam,
    goalFilteredPlayersCount: getGoalFilteredPlayers().length,
    timeFilteredPlayersCount: getTimeFilteredPlayers().length,
    realTimeScore: { homeScore, awayScore },
    hasForceRefresh: !!forceRefresh // Added for debugging
  });

  return {
    // Data
    fixtures,
    fixturesLoading,
    members,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    
    // Enhanced player data with team filtering
    allPlayers: enhancedPlayersData.allPlayers,
    homeTeamPlayers: enhancedPlayersData.homeTeamPlayers,
    awayTeamPlayers: enhancedPlayersData.awayTeamPlayers,
    playersForTimeTracker,
    playersNeedingAttention,
    
    // Team selection for Goals and Time tabs
    selectedGoalTeam,
    setSelectedGoalTeam,
    selectedTimeTeam,
    setSelectedTimeTeam,
    getGoalFilteredPlayers,
    getTimeFilteredPlayers,
    
    saveAttempts,
    setSaveAttempts,
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
    
    // Enhanced real-time score state with force refresh
    homeScore,
    awayScore,
    addGoal,
    removeGoal,
    resetScore,
    refreshScore,
    forceRefresh, // Added enhanced refresh function
    
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

import { useState, useEffect } from "react";
import { useFixtures } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useCreateMatchEvent, useUpdatePlayerStats } from "@/hooks/useMatchEvents";
import { useMatchTimer } from "@/hooks/useMatchTimer";
import { useMatchStateSync } from "@/hooks/useMatchStateSync";
import { usePlayerTracking } from "@/hooks/usePlayerTracking";
import { useGoalManagement } from "@/hooks/useGoalManagement";
import { useLocalMatchEvents } from "@/hooks/useMatchEvents";
import { useCardManagementImproved } from "@/hooks/useCardManagementImproved";
import { useResetState } from "@/hooks/useResetState";
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
  
  // Database-driven score state (replacing legacy local state)
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  
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

  // Initialize reset state for coordinated state management
  const resetState = useResetState({ fixtureId: selectedFixtureData?.id });

  // Enhanced real-time score sync with immediate updates
  const { syncScoreFromEvents, forceRefresh } = useMatchStateSync({
    fixtureId: selectedFixtureData?.id,
    onScoreUpdate: (newHomeScore: number, newAwayScore: number) => {
      console.log('🔄 useRefereeState: Real-time score update received:', {
        oldScores: { home: homeScore, away: awayScore },
        newScores: { home: newHomeScore, away: newAwayScore }
      });
      setHomeScore(newHomeScore);
      setAwayScore(newAwayScore);
    },
    onMatchEventUpdate: (event: any) => {
      console.log('🎯 useRefereeState: Match event update received:', event);
      // Trigger immediate score sync when goals are added
      if (event.new?.event_type === 'goal') {
        console.log('⚽ useRefereeState: Goal event detected, triggering immediate sync');
        syncScoreFromEvents();
      }
    }
  });

  // Initialize scores from database when fixture changes
  useEffect(() => {
    if (selectedFixtureData) {
      console.log('🔄 useRefereeState: Initializing scores from fixture data:', {
        fixture: selectedFixtureData.id,
        homeScore: selectedFixtureData.home_score,
        awayScore: selectedFixtureData.away_score
      });
      
      setHomeScore(selectedFixtureData.home_score || 0);
      setAwayScore(selectedFixtureData.away_score || 0);
      
      // Trigger initial sync to ensure consistency
      syncScoreFromEvents();
    } else {
      setHomeScore(0);
      setAwayScore(0);
    }
  }, [selectedFixtureData?.id, selectedFixtureData?.home_score, selectedFixtureData?.away_score, syncScoreFromEvents]);

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

  // Database-driven score functions (replacing legacy local state functions)
  const addGoal = async (team: 'home' | 'away') => {
    if (team === 'home') {
      const newScore = homeScore + 1;
      setHomeScore(newScore);
      console.log('📊 useRefereeState: Local home score updated to:', newScore);
    } else {
      const newScore = awayScore + 1;
      setAwayScore(newScore);
      console.log('📊 useRefereeState: Local away score updated to:', newScore);
    }
  };

  const removeGoal = (team: 'home' | 'away') => {
    if (team === 'home' && homeScore > 0) {
      const newScore = homeScore - 1;
      setHomeScore(newScore);
      console.log('📊 useRefereeState: Local home score decreased to:', newScore);
    } else if (team === 'away' && awayScore > 0) {
      const newScore = awayScore - 1;
      setAwayScore(newScore);
      console.log('📊 useRefereeState: Local away score decreased to:', newScore);
    }
  };

  const resetScore = () => {
    console.log('🔄 useRefereeState: Resetting scores to 0-0');
    setHomeScore(0);
    setAwayScore(0);
  };

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

  console.log('🎯 useRefereeState Summary (Database-Driven Scores):', {
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
    databaseDrivenScore: { homeScore, awayScore },
    hasRealTimeSync: !!forceRefresh
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
    
    // Database-driven score state with real-time sync
    homeScore,
    awayScore,
    addGoal,
    removeGoal,
    resetScore,
    forceRefresh, // Enhanced refresh function for immediate sync
    
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
    resetEvents,
    
    // Reset state coordination
    resetState
  };
};

export type { ComponentPlayer, PlayerTimeTrackerPlayer };

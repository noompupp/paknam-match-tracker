
import { useState, useEffect } from "react";
import { playerDropdownService } from "@/services/playerDropdownService";
import { debugPlayerDropdownData, debugRefereeToolsData } from "@/utils/refereeToolsDebug";
import type { ComponentPlayer, PlayerTimeTrackerPlayer } from "./useRefereeState";

interface RefereePlayerDataProps {
  selectedFixture: string;
  selectedFixtureData: any;
  fixtures: any[] | undefined;
  members: any[] | undefined;
  trackedPlayers: any[];
}

export const useRefereePlayerData = ({
  selectedFixture,
  selectedFixtureData,
  fixtures,
  members,
  trackedPlayers
}: RefereePlayerDataProps) => {
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

      console.log('🔄 useRefereePlayerData: Loading enhanced player data for fixture:', selectedFixtureData.id);
      
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
        debugPlayerDropdownData(allPlayers, "Enhanced useRefereePlayerData - Match Specific");
        
        console.log('✅ useRefereePlayerData: Enhanced player data loaded for match:', {
          fixture: selectedFixtureData.id,
          homeTeam: homeTeamName,
          awayTeam: awayTeamName,
          homePlayersCount: homeTeamPlayers.length,
          awayPlayersCount: awayTeamPlayers.length,
          totalPlayers: allPlayers.length,
          hasValidData
        });

      } catch (error) {
        console.error('❌ useRefereePlayerData: Failed to load enhanced player data:', error);
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

  return {
    enhancedPlayersData,
    
    // Enhanced player data with team filtering
    allPlayers: enhancedPlayersData.allPlayers,
    homeTeamPlayers: enhancedPlayersData.homeTeamPlayers,
    awayTeamPlayers: enhancedPlayersData.awayTeamPlayers,
    playersForTimeTracker
  };
};

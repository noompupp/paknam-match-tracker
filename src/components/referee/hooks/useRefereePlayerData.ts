
import { useState, useEffect } from "react";
import { useMembers } from "@/hooks/useMembers";
import { processFixtureAndPlayers, processPlayersForDropdowns, debugPlayerDropdownData, type ProcessedPlayer } from "@/utils/refereeDataProcessor";
import type { ComponentPlayer, PlayerTimeTrackerPlayer } from "./useRefereeState";

interface UseRefereePlayerDataProps {
  selectedFixture: string;
  selectedFixtureData: any;
  fixtures: any[];
  members: any[];
  trackedPlayers: PlayerTimeTrackerPlayer[];
}

export const useRefereePlayerData = ({
  selectedFixture,
  selectedFixtureData,
  fixtures,
  members,
  trackedPlayers
}: UseRefereePlayerDataProps) => {
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
    dataIssues: ['No fixture selected']
  });

  // Enhanced player data processing with dropdown service integration
  useEffect(() => {
    const processEnhancedPlayerData = async () => {
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

      try {
        console.log('🎯 Processing enhanced player data for fixture:', selectedFixtureData.id);
        
        // Use the dropdown service integration for more reliable data
        const enhancedData = await processPlayersForDropdowns(selectedFixtureData);
        
        setEnhancedPlayersData(enhancedData);
        
        console.log('✅ Enhanced player data processed:', {
          totalPlayers: enhancedData.allPlayers.length,
          homeTeamPlayers: enhancedData.homeTeamPlayers.length,
          awayTeamPlayers: enhancedData.awayTeamPlayers.length,
          hasValidData: enhancedData.hasValidData,
          rolesFound: [...new Set(enhancedData.allPlayers.map(p => p.role))]
        });

      } catch (error) {
        console.error('❌ Failed to process enhanced player data:', error);
        setEnhancedPlayersData({
          allPlayers: [],
          homeTeamPlayers: [],
          awayTeamPlayers: [],
          hasValidData: false,
          dataIssues: ['Failed to process player data: ' + (error instanceof Error ? error.message : 'Unknown error')]
        });
      }
    };

    processEnhancedPlayerData();
  }, [selectedFixtureData]);

  // Legacy processing (fallback) - updated to include role field
  const legacyProcessedData = processFixtureAndPlayers(selectedFixtureData, members);
  
  // Ensure all player arrays include the role field
  const allPlayers: ComponentPlayer[] = enhancedPlayersData.hasValidData 
    ? enhancedPlayersData.allPlayers.map(p => ({
        ...p,
        role: p.role || 'Starter' // Ensure role is always present
      }))
    : (legacyProcessedData?.allPlayers.map(p => ({
        ...p,
        role: p.role || 'Starter' // Ensure role is always present
      })) || []);

  const homeTeamPlayers: ComponentPlayer[] = enhancedPlayersData.hasValidData 
    ? enhancedPlayersData.homeTeamPlayers.map(p => ({
        ...p,
        role: p.role || 'Starter' // Ensure role is always present
      }))
    : (legacyProcessedData?.homeTeamPlayers.map(p => ({
        ...p,
        role: p.role || 'Starter' // Ensure role is always present
      })) || []);

  const awayTeamPlayers: ComponentPlayer[] = enhancedPlayersData.hasValidData 
    ? enhancedPlayersData.awayTeamPlayers.map(p => ({
        ...p,
        role: p.role || 'Starter' // Ensure role is always present
      }))
    : (legacyProcessedData?.awayTeamPlayers.map(p => ({
        ...p,
        role: p.role || 'Starter' // Ensure role is always present
      })) || []);

  // Convert to time tracker format with role field
  const playersForTimeTracker: PlayerTimeTrackerPlayer[] = trackedPlayers.map(tracked => {
    const playerInfo = allPlayers.find(p => p.id === tracked.id);
    return {
      ...tracked,
      number: playerInfo?.number ? parseInt(playerInfo.number) : 0,
      position: playerInfo?.role || 'Starter' // Use role instead of position
    };
  });

  return {
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    playersForTimeTracker,
    enhancedPlayersData,
    legacyProcessedData
  };
};

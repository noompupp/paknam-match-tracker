
import { useState, useEffect } from "react";
import type { ComponentPlayer } from "./useRefereeState";

interface RefereeTeamSelectionProps {
  selectedFixture: string;
  homeTeamPlayers: ComponentPlayer[];
  awayTeamPlayers: ComponentPlayer[];
}

export const useRefereeTeamSelection = ({ 
  selectedFixture, 
  homeTeamPlayers, 
  awayTeamPlayers 
}: RefereeTeamSelectionProps) => {
  // Team selection state for Goals and Time tabs
  const [selectedGoalTeam, setSelectedGoalTeam] = useState("");
  const [selectedTimeTeam, setSelectedTimeTeam] = useState("");

  // Reset team selections when fixture changes
  useEffect(() => {
    if (selectedFixture) {
      setSelectedGoalTeam("");
      setSelectedTimeTeam("");
    }
  }, [selectedFixture]);

  // Get filtered players for Goals tab based on selected team
  const getGoalFilteredPlayers = () => {
    if (!selectedGoalTeam) return [];
    
    if (selectedGoalTeam === 'home') {
      return homeTeamPlayers;
    } else if (selectedGoalTeam === 'away') {
      return awayTeamPlayers;
    }
    
    return [];
  };

  // Get filtered players for Time tab based on selected team
  const getTimeFilteredPlayers = () => {
    if (!selectedTimeTeam) return [];
    
    if (selectedTimeTeam === 'home') {
      return homeTeamPlayers;
    } else if (selectedTimeTeam === 'away') {
      return awayTeamPlayers;
    }
    
    return [];
  };

  console.log('🎯 useRefereeTeamSelection: Team selection state:', {
    selectedGoalTeam,
    selectedTimeTeam,
    goalFilteredPlayersCount: getGoalFilteredPlayers().length,
    timeFilteredPlayersCount: getTimeFilteredPlayers().length
  });

  return {
    // Team selection for Goals and Time tabs
    selectedGoalTeam,
    setSelectedGoalTeam,
    selectedTimeTeam,
    setSelectedTimeTeam,
    getGoalFilteredPlayers,
    getTimeFilteredPlayers
  };
};

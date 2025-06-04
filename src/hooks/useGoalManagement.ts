
import { useState } from "react";
import { unifiedGoalService } from "@/services/unifiedGoalService";
import { resolveTeamIdForMatchEvent } from "@/utils/teamIdMapping";

interface GoalData {
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  type: 'goal' | 'assist';
}

export const useGoalManagement = () => {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState("");
  const [selectedGoalType, setSelectedGoalType] = useState<'goal' | 'assist'>('goal');

  const assignGoal = async (
    player: any, 
    matchTime: number, 
    fixtureId: number, 
    homeTeam: { id: number; name: string }, 
    awayTeam: { id: number; name: string }
  ) => {
    if (!player) {
      throw new Error('Player is required for goal assignment');
    }

    console.log('⚽ useGoalManagement: Starting unified goal assignment:', {
      player: player.name,
      team: player.team,
      type: selectedGoalType,
      time: matchTime,
      fixtureId,
      homeTeam: homeTeam?.name,
      awayTeam: awayTeam?.name
    });

    // Validate that we have all required data
    if (!fixtureId || !homeTeam || !awayTeam) {
      throw new Error('Missing required data for goal assignment');
    }

    try {
      // Resolve the numeric team ID for the database
      const teamId = resolveTeamIdForMatchEvent(player.team, homeTeam, awayTeam);
      
      console.log('✅ useGoalManagement: Team ID resolved:', {
        playerTeam: player.team,
        resolvedTeamId: teamId,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name
      });

      // Use the unified goal service
      const result = await unifiedGoalService.assignGoalWithScoreUpdate({
        fixtureId,
        playerId: player.id,
        playerName: player.name,
        teamId,
        teamName: player.team,
        goalType: selectedGoalType,
        eventTime: matchTime,
        homeTeam,
        awayTeam
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to assign goal');
      }

      // Add to local state only if successful
      const newGoal: GoalData = {
        playerId: player.id,
        playerName: player.name,
        team: player.team,
        time: matchTime,
        type: selectedGoalType
      };

      setGoals(prev => [...prev, newGoal]);
      setSelectedGoalPlayer("");
      
      console.log('✅ useGoalManagement: Goal successfully assigned with unified service');
      
      return {
        ...result.goalData,
        shouldUpdateScore: result.shouldUpdateScore
      };

    } catch (error) {
      console.error('❌ useGoalManagement: Failed to assign goal:', error);
      throw error;
    }
  };

  const resetGoals = () => {
    setGoals([]);
    setSelectedGoalPlayer("");
    setSelectedGoalType('goal');
  };

  return {
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    assignGoal,
    resetGoals
  };
};

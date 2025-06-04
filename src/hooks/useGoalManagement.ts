
import { useState } from "react";
import { unifiedGoalService } from "@/services/unifiedGoalService";
import { resolveTeamIdForMatchEvent } from "@/utils/teamIdMapping";

interface GoalData {
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  type: 'goal' | 'assist';
  id?: string; // Add unique identifier for better deduplication
}

export const useGoalManagement = () => {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState("");
  const [selectedGoalType, setSelectedGoalType] = useState<'goal' | 'assist'>('goal');

  // Helper function to create unique identifier for goals
  const createGoalId = (playerId: number, time: number, type: string, team: string): string => {
    return `${playerId}-${time}-${type}-${team}-${Date.now()}`;
  };

  // Helper function to check for duplicates
  const isDuplicateGoal = (newGoal: Omit<GoalData, 'id'>, existingGoals: GoalData[]): boolean => {
    return existingGoals.some(existingGoal => 
      existingGoal.playerId === newGoal.playerId &&
      existingGoal.time === newGoal.time &&
      existingGoal.type === newGoal.type &&
      existingGoal.team === newGoal.team
    );
  };

  const assignGoal = async (
    player: any, 
    matchTime: number, 
    fixtureId: number, 
    homeTeam: { id: string; name: string }, // Changed to string
    awayTeam: { id: string; name: string }  // Changed to string
  ) => {
    if (!player) {
      throw new Error('Player is required for goal assignment');
    }

    // Create preliminary goal data for duplicate checking
    const preliminaryGoal: Omit<GoalData, 'id'> = {
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      time: matchTime,
      type: selectedGoalType
    };

    // Check for duplicates in local state
    if (isDuplicateGoal(preliminaryGoal, goals)) {
      console.warn('🚫 useGoalManagement: Duplicate goal detected in local state, skipping assignment');
      throw new Error('This goal/assist has already been assigned to this player at this time');
    }

    console.log('⚽ useGoalManagement: Starting unified goal assignment with enhanced duplicate prevention:', {
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
      // Resolve the text team ID for the database
      const teamId = resolveTeamIdForMatchEvent(player.team, homeTeam, awayTeam);
      
      console.log('✅ useGoalManagement: Team ID resolved:', {
        playerTeam: player.team,
        resolvedTeamId: teamId,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name
      });

      // Use the unified goal service with automatic score update
      const result = await unifiedGoalService.assignGoalWithScoreUpdate({
        fixtureId,
        playerId: player.id,
        playerName: player.name,
        teamId, // This is now a string
        teamName: player.team,
        goalType: selectedGoalType,
        eventTime: matchTime,
        homeTeam,
        awayTeam
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to assign goal');
      }

      // Add to local state only if successful and not duplicate
      const newGoal: GoalData = {
        ...preliminaryGoal,
        id: createGoalId(player.id, matchTime, selectedGoalType, player.team)
      };

      setGoals(prev => {
        // Double-check for duplicates before adding
        if (isDuplicateGoal(newGoal, prev)) {
          console.warn('🚫 useGoalManagement: Duplicate detected during state update, skipping');
          return prev;
        }
        return [...prev, newGoal];
      });
      
      setSelectedGoalPlayer("");
      
      console.log('✅ useGoalManagement: Goal successfully assigned with enhanced duplicate prevention');
      
      return {
        ...result.goalData,
        shouldUpdateScore: result.shouldUpdateScore,
        autoScoreUpdated: selectedGoalType === 'goal',
        goalId: newGoal.id
      };

    } catch (error) {
      console.error('❌ useGoalManagement: Failed to assign goal:', error);
      throw error;
    }
  };

  const removeGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    console.log('🗑️ useGoalManagement: Goal removed:', goalId);
  };

  const resetGoals = () => {
    setGoals([]);
    setSelectedGoalPlayer("");
    setSelectedGoalType('goal');
    console.log('🔄 useGoalManagement: Goals reset');
  };

  return {
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    assignGoal,
    removeGoal,
    resetGoals,
    isDuplicateGoal: (goal: Omit<GoalData, 'id'>) => isDuplicateGoal(goal, goals)
  };
};


import { useState } from "react";
import { assignGoalToPlayer } from "@/services/fixtures/goalAssignmentService";

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

  const assignGoal = async (player: any, matchTime: number, fixtureId?: number, teamId?: number) => {
    if (!player) return null;

    const newGoal: GoalData = {
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      time: matchTime,
      type: selectedGoalType
    };

    setGoals(prev => [...prev, newGoal]);
    setSelectedGoalPlayer("");

    // If we have fixtureId and teamId, also save to database
    if (fixtureId && teamId) {
      try {
        await assignGoalToPlayer({
          fixtureId,
          playerId: player.id,
          playerName: player.name,
          teamId,
          eventTime: matchTime,
          type: selectedGoalType
        });
        console.log('✅ useGoalManagement: Goal assigned to database successfully');
      } catch (error) {
        console.error('❌ useGoalManagement: Failed to assign goal to database:', error);
        // Don't throw error here as the local goal assignment was successful
      }
    }

    return newGoal;
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

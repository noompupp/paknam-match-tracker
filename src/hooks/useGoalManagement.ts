
import { useState } from "react";

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

  const assignGoal = (player: any, matchTime: number) => {
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

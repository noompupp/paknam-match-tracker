
import { TeamStatsUpdate } from './types';

// Calculate team stats updates based on match result
export const calculateTeamStatsUpdate = (
  currentStats: any,
  goalsFor: number,
  goalsAgainst: number,
  isWin: boolean,
  isDraw: boolean,
  isLoss: boolean
): TeamStatsUpdate => {
  const newPlayed = (currentStats.played || 0) + 1;
  const newWon = (currentStats.won || 0) + (isWin ? 1 : 0);
  const newDrawn = (currentStats.drawn || 0) + (isDraw ? 1 : 0);
  const newLost = (currentStats.lost || 0) + (isLoss ? 1 : 0);
  const newGoalsFor = (currentStats.goals_for || 0) + goalsFor;
  const newGoalsAgainst = (currentStats.goals_against || 0) + goalsAgainst;
  const newGoalDifference = newGoalsFor - newGoalsAgainst;
  const newPoints = (currentStats.points || 0) + (isWin ? 3 : isDraw ? 1 : 0);

  return {
    played: newPlayed,
    won: newWon,
    drawn: newDrawn,
    lost: newLost,
    goals_for: newGoalsFor,
    goals_against: newGoalsAgainst,
    goal_difference: newGoalDifference,
    points: newPoints
  };
};

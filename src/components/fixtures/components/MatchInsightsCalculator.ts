
import { Team } from "@/types/database";

export interface MatchInsight {
  type: 'advantage' | 'neutral' | 'warning' | 'info';
  title: string;
  description: string;
  color: string;
}

export const calculateMatchInsights = (homeTeam: Team, awayTeam: Team): MatchInsight[] => {
  const insights: MatchInsight[] = [];
  
  // League position analysis
  const positionDiff = Math.abs(homeTeam.position - awayTeam.position);
  if (positionDiff >= 5) {
    const higherTeam = homeTeam.position < awayTeam.position ? homeTeam : awayTeam;
    const lowerTeam = homeTeam.position < awayTeam.position ? awayTeam : homeTeam;
    insights.push({
      type: 'advantage',
      title: 'League Position Advantage',
      description: `${higherTeam.name} sits ${positionDiff} places higher in the table and will be looking to maintain their superior league standing.`,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    });
  } else if (positionDiff <= 2) {
    insights.push({
      type: 'neutral',
      title: 'Closely Matched Teams',
      description: `Both teams are within ${positionDiff || 'the same'} position${positionDiff !== 1 ? 's' : ''} of each other - expect a competitive encounter.`,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    });
  }

  // Attack strength analysis
  const homeAttack = homeTeam.goals_for / Math.max(homeTeam.played, 1);
  const awayAttack = awayTeam.goals_for / Math.max(awayTeam.played, 1);
  const attackDiff = Math.abs(homeAttack - awayAttack);
  
  if (attackDiff >= 0.5) {
    const strongerTeam = homeAttack > awayAttack ? homeTeam : awayTeam;
    const avgGoals = homeAttack > awayAttack ? homeAttack : awayAttack;
    insights.push({
      type: 'info',
      title: 'Attack Strength',
      description: `${strongerTeam.name} boasts a stronger attack, averaging ${avgGoals.toFixed(1)} goals per game this season.`,
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    });
  }

  // Defensive analysis
  const homeDefense = homeTeam.goals_against / Math.max(homeTeam.played, 1);
  const awayDefense = awayTeam.goals_against / Math.max(awayTeam.played, 1);
  const defenseDiff = Math.abs(homeDefense - awayDefense);
  
  if (defenseDiff >= 0.5) {
    const strongerDefense = homeDefense < awayDefense ? homeTeam : awayTeam;
    const betterRecord = homeDefense < awayDefense ? homeDefense : awayDefense;
    insights.push({
      type: 'info',
      title: 'Defensive Strength',
      description: `${strongerDefense.name} has the more solid defense, conceding just ${betterRecord.toFixed(1)} goals per game.`,
      color: 'bg-green-50 border-green-200 text-green-800'
    });
  }

  // Form analysis
  const homeWinRate = homeTeam.won / Math.max(homeTeam.played, 1);
  const awayWinRate = awayTeam.won / Math.max(awayTeam.played, 1);
  const formDiff = Math.abs(homeWinRate - awayWinRate);
  
  if (formDiff >= 0.3) {
    const betterForm = homeWinRate > awayWinRate ? homeTeam : awayTeam;
    const winPercentage = Math.max(homeWinRate, awayWinRate) * 100;
    insights.push({
      type: 'advantage',
      title: 'Current Form',
      description: `${betterForm.name} enters this match in better form, winning ${winPercentage.toFixed(0)}% of their league matches this season.`,
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    });
  }

  // Goal difference analysis
  const homeGD = homeTeam.goal_difference;
  const awayGD = awayTeam.goal_difference;
  const gdDiff = Math.abs(homeGD - awayGD);
  
  if (gdDiff >= 5) {
    const betterGD = homeGD > awayGD ? homeTeam : awayTeam;
    const gdValue = Math.max(homeGD, awayGD);
    insights.push({
      type: 'info',
      title: 'Goal Difference',
      description: `${betterGD.name} has a superior goal difference of ${gdValue > 0 ? '+' : ''}${gdValue}, indicating their overall strength this season.`,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    });
  }

  // If no significant insights, add a general match preview
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      title: 'Evenly Matched Contest',
      description: `Both teams appear evenly matched across key metrics - this promises to be an exciting and unpredictable encounter.`,
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    });
  }

  return insights.slice(0, 4); // Limit to 4 insights max
};

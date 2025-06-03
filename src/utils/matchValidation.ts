
import { Fixture } from "@/types/database";

export interface MatchValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateMatchData = (
  fixture: Fixture,
  homeScore: number,
  awayScore: number,
  matchTime: number
): MatchValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (homeScore < 0 || awayScore < 0) {
    errors.push("Scores cannot be negative");
  }

  if (!fixture.home_team || !fixture.away_team) {
    errors.push("Match teams not found");
  }

  if (homeScore > 20 || awayScore > 20) {
    warnings.push("Unusually high score detected - please verify");
  }

  // Time validation
  if (matchTime < 45 * 60) {
    warnings.push("Match duration is less than 45 minutes");
  }

  if (matchTime > 120 * 60) {
    warnings.push("Match duration exceeds 120 minutes (including extra time)");
  }

  // Score difference validation
  const scoreDifference = Math.abs(homeScore - awayScore);
  if (scoreDifference > 10) {
    warnings.push("Large score difference detected - please verify result");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const formatMatchResult = (
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number
): string => {
  return `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;
};

export const getMatchOutcome = (homeScore: number, awayScore: number): 'home_win' | 'away_win' | 'draw' => {
  if (homeScore > awayScore) return 'home_win';
  if (awayScore > homeScore) return 'away_win';
  return 'draw';
};

export const calculateMatchStats = (homeScore: number, awayScore: number) => {
  return {
    totalGoals: homeScore + awayScore,
    outcome: getMatchOutcome(homeScore, awayScore),
    scoreDifference: Math.abs(homeScore - awayScore),
    isHighScoring: (homeScore + awayScore) > 4,
    isCleanSheet: homeScore === 0 || awayScore === 0
  };
};

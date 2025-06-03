
import { Fixture } from "@/types/database";
import { SEVEN_A_SIDE_CONSTANTS } from "@/utils/timeUtils";

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

  // Enhanced team validation
  if (!fixture.home_team && !fixture.home_team_id) {
    errors.push("Home team not found");
  }
  
  if (!fixture.away_team && !fixture.away_team_id) {
    errors.push("Away team not found");
  }

  // 7-a-side specific score validation
  if (homeScore > 15 || awayScore > 15) {
    warnings.push("Unusually high score for 7-a-side match - please verify");
  }

  // 7-a-side time validation
  const standardDuration = SEVEN_A_SIDE_CONSTANTS.STANDARD_MATCH_DURATION;
  const halfDuration = SEVEN_A_SIDE_CONSTANTS.HALF_DURATION;
  
  if (matchTime < halfDuration - 300) { // Less than 20 minutes (25min - 5min tolerance)
    warnings.push("Match duration is unusually short for 7-a-side (standard: 50 minutes)");
  }

  if (matchTime > standardDuration + SEVEN_A_SIDE_CONSTANTS.MAX_OVERTIME) {
    warnings.push("Match duration exceeds standard 7-a-side time including maximum overtime");
  }

  // Score difference validation for 7-a-side
  const scoreDifference = Math.abs(homeScore - awayScore);
  if (scoreDifference > 8) {
    warnings.push("Large score difference detected for 7-a-side match - please verify result");
  }

  // Check if match is approximately at half-time
  if (Math.abs(matchTime - halfDuration) < 60) { // Within 1 minute of half-time
    warnings.push("Match time is near half-time (25 minutes) - consider half-time break");
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
    isHighScoring: (homeScore + awayScore) > 6, // Adjusted for 7-a-side
    isCleanSheet: homeScore === 0 || awayScore === 0,
    isLowScoring: (homeScore + awayScore) < 2 // New metric for 7-a-side
  };
};

// 7-a-side specific match analysis
export const analyze7aSideMatch = (homeScore: number, awayScore: number, matchTime: number) => {
  const stats = calculateMatchStats(homeScore, awayScore);
  const isFirstHalf = matchTime <= SEVEN_A_SIDE_CONSTANTS.HALF_DURATION;
  
  return {
    ...stats,
    currentHalf: isFirstHalf ? 1 : 2,
    averageGoalsPerMinute: stats.totalGoals / (matchTime / 60),
    isOnPaceForHighScoring: (stats.totalGoals / (matchTime / 60)) * 50 > 6,
    matchPhase: isFirstHalf ? 'first_half' : 'second_half'
  };
};

// Team validation helper
export const validateTeams = (fixture: Fixture): boolean => {
  return !!(
    (fixture.home_team || fixture.home_team_id || fixture.team1) && 
    (fixture.away_team || fixture.away_team_id || fixture.team2)
  );
};


export interface Goal {
  id: number | string;
  playerId: number;
  playerName: string;
  team: string;
  teamId: string;
  type: 'goal' | 'assist';
  time: number;
  timestamp: number;
  assistPlayerName?: string | null;
  assistTeamId?: string | null;
  isOwnGoal?: boolean; // Add own goal flag
}

export interface Card {
  id: number | string;
  playerId: number;
  playerName: string;
  team: string;
  teamId: string;
  cardType: 'yellow' | 'red';
  type: 'yellow' | 'red';
  time: number;
  timestamp: number;
}

export interface PlayerTime {
  playerId: number;
  playerName: string;
  team: string;
  teamId: string;
  totalMinutes: number;
  periods: any[];
}

export interface TimelineEvent {
  id: number | string;
  type: string;
  time: number;
  playerName: string;
  teamId: string;
  teamName: string;
  cardType?: string;
  assistPlayerName?: string | null;
  assistTeamId?: string | null;
  description: string;
  timestamp: number;
  isOwnGoal?: boolean; // Add own goal flag
}

export interface SummaryStats {
  totalGoals: number;
  totalRegularGoals: number; // Add regular goals count
  totalOwnGoals: number; // Add own goals count
  totalAssists: number;
  totalCards: number;
  homeTeamGoals: number;
  awayTeamGoals: number;
  homeTeamRegularGoals: number; // Add home team regular goals
  awayTeamRegularGoals: number; // Add away team regular goals
  homeTeamOwnGoals: number; // Add home team own goals
  awayTeamOwnGoals: number; // Add away team own goals
  homeTeamCards: number;
  awayTeamCards: number;
  playersTracked: number;
}

export interface EnhancedMatchSummaryData {
  goals: Goal[];
  cards: Card[];
  playerTimes: PlayerTime[];
  timelineEvents: TimelineEvent[];
  summary: SummaryStats;
}

export interface EnhancedMatchSummaryWithTeams extends EnhancedMatchSummaryData {
  teams: {
    home: string;
    away: string;
  };
}

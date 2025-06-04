
export interface EnhancedMatchSummaryData {
  goals: Array<{
    id: number;
    playerId: number;
    playerName: string;
    team: string;
    teamId: string;
    type: 'goal' | 'assist';
    time: number;
    timestamp: string;
    assistPlayerName?: string;
    assistTeamId?: string;
  }>;
  cards: Array<{
    id: number;
    playerId: number;
    playerName: string;
    team: string;
    teamId: string;
    cardType: 'yellow' | 'red';
    type: 'yellow' | 'red';
    time: number;
    timestamp: string;
  }>;
  playerTimes: Array<{
    playerId: number;
    playerName: string;
    team: string;
    teamId: string;
    totalMinutes: number;
    periods: Array<{
      start_time: number;
      end_time: number;
      duration: number;
    }>;
  }>;
  summary: {
    totalGoals: number;
    totalAssists: number;
    totalCards: number;
    playersTracked: number;
    homeTeamGoals: number;
    awayTeamGoals: number;
    homeTeamCards: number;
    awayTeamCards: number;
  };
  timelineEvents?: Array<{
    id: number;
    type: string;
    time: number;
    playerName: string;
    teamId: string;
    teamName: string;
    cardType?: string;
    assistPlayerName?: string;
    assistTeamId?: string;
    description: string;
    timestamp: string;
  }>;
}

export interface EnhancedMatchSummaryWithTeams extends EnhancedMatchSummaryData {
  teams: {
    home: string;
    away: string;
  };
}

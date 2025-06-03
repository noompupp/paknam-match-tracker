
export interface FixtureWithTeams {
  id: number;
  team1: string;
  team2: string;
  match_date: string;
  match_time: string;
  home_score: number | null;
  away_score: number | null;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  venue: string | null;
  created_at: string;
  updated_at: string;
  home_team?: any;
  away_team?: any;
}

export interface TeamStatsUpdate {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

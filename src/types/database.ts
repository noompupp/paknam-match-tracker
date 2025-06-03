
export interface Team {
  id: number;
  name: string;
  logo: string;
  founded: string;
  captain: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  name: string;
  number: number;
  position: string;
  role: string;
  goals: number;
  assists: number;
  team_id: number;
  created_at: string;
  updated_at: string;
  team?: Team;
}

export interface Fixture {
  id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  match_time: string;
  home_score: number | null;
  away_score: number | null;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  venue: string | null;
  created_at: string;
  updated_at: string;
  __id__?: string;
  home_team?: Team;
  away_team?: Team;
}

export interface MatchEvent {
  id: number;
  fixture_id: number;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'other';
  player_name: string;
  team_id: number;
  event_time: number;
  description: string;
  created_at: string;
}

export interface PlayerTime {
  id: number;
  name: string;
  team: string;
  totalTime: number;
  isPlaying: boolean;
  startTime: number | null;
}

// API Response types
export interface TeamsResponse {
  data: Team[] | null;
  error: any;
}

export interface MembersResponse {
  data: Member[] | null;
  error: any;
}

export interface FixturesResponse {
  data: Fixture[] | null;
  error: any;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  logoURL?: string;
  founded: string;
  captain: string;
  position: number;
  previous_position?: number | null; // Add previous position for rank change tracking
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  color?: string;
  created_at: string;
  updated_at: string;
  __id__?: string; // Add the text ID used in database queries
}

export interface Member {
  id: number;
  name: string;
  nickname?: string;
  number: string; // Keep as string to match database
  position: string;
  role: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  total_minutes_played: number;
  matches_played: number;
  team_id: string; // Keep as string
  created_at: string;
  updated_at: string;
  ProfileURL?: string; // Add ProfileURL property
  team?: Team;
  contributionScore?: number; // <-- Add this line to fix the type error
}

export interface Fixture {
  id: number;
  home_team_id: string; // Keep as string
  away_team_id: string; // Keep as string
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
  event_type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'other';
  player_name: string;
  team_id: string; // Keep as string
  event_time: number;
  description: string;
  created_at: string;
  card_type?: 'yellow' | 'red';
  is_own_goal: boolean;
  scoring_team_id?: string;
  affected_team_id?: string;
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

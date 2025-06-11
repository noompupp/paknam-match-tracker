
// Simplified player stats types for enhanced hooks
export interface PlayerStats {
  id: number;
  name: string;
  team_name: string;
  goals?: number;
  assists?: number;
}

export interface TopScorer extends PlayerStats {
  goals: number;
}

export interface TopAssister extends PlayerStats {
  assists: number;
}

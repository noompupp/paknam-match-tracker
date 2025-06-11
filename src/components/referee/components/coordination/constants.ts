
export const ROLE_LABELS = {
  home_team: 'Home Team Referee',
  away_team: 'Away Team Referee',
  score_goals: 'Score & Goals',
  cards_discipline: 'Cards & Discipline',
  time_tracking: 'Time Tracking',
  coordination: 'Match Coordination',
  main_referee: 'Main Referee',
  assistant_referee: 'Assistant Referee'
} as const;

export const STATUS_VARIANTS = {
  assigned: 'outline' as const,
  active: 'secondary' as const,
  completed: 'default' as const
} as const;

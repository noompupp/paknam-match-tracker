
export const ROLE_LABELS = {
  home_team: 'Home Team Referee',
  away_team: 'Away Team Referee',
  score_goals: 'Score & Goals',
  cards_discipline: 'Cards & Discipline',
  time_tracking: 'Time Tracking',
  coordination: 'Match Coordination'
} as const;

export const STATUS_COLORS = {
  assigned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
} as const;

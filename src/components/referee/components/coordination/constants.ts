
import { Users, Target, AlertTriangle, Clock, UserCheck, Trophy } from "lucide-react";

export const ROLE_LABELS = {
  home_team: 'Home Team Referee',
  away_team: 'Away Team Referee',
  score_goals: 'Score & Goals',
  cards_discipline: 'Cards & Discipline',
  time_tracking: 'Time Tracking',
  coordination: 'Match Coordination'
};

export const ROLE_ICONS = {
  home_team: Users,
  away_team: Users,
  score_goals: Target,
  cards_discipline: AlertTriangle,
  time_tracking: Clock,
  coordination: UserCheck
};

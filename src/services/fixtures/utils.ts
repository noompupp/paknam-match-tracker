
import { Fixture } from '@/types/database';

// Helper function to normalize IDs for consistent matching
export const normalizeId = (id: any): string => {
  if (id === null || id === undefined) return '';
  return String(id).trim().toLowerCase();
};

export const transformFixture = (fixture: any): Fixture => ({
  id: fixture.id || 0,
  home_team_id: fixture.home_team_id || '',
  away_team_id: fixture.away_team_id || '',
  match_date: fixture.match_date || fixture.date?.toString() || '',
  match_time: fixture.match_time?.toString() || fixture.time?.toString() || '',
  home_score: fixture.home_score,
  away_score: fixture.away_score,
  status: (fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
  venue: fixture.venue,
  created_at: fixture.created_at || new Date().toISOString(),
  updated_at: fixture.updated_at || new Date().toISOString(),
  home_team: fixture.home_team,
  away_team: fixture.away_team
});

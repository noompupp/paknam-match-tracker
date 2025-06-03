
import { MatchEvent } from '@/types/database';

// Match Events API (simplified for now as this table doesn't exist yet)
export const matchEventsApi = {
  getByFixture: async (fixtureId: number) => {
    // For now, return empty array as match_events table doesn't exist
    console.log('Match events not implemented yet for fixture:', fixtureId);
    return [] as MatchEvent[];
  },

  create: async (event: Omit<MatchEvent, 'id' | 'created_at'>) => {
    // For now, return a mock event
    console.log('Match event creation not implemented yet:', event);
    return {
      id: Date.now(),
      ...event,
      created_at: new Date().toISOString()
    } as MatchEvent;
  }
};

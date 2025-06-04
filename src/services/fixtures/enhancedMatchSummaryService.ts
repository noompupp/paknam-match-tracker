
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedMatchEvent {
  id: number;
  fixtureId: number;
  playerId: number;
  playerName: string;
  team: string;
  eventType: 'goal' | 'assist' | 'card' | 'substitution';
  eventTime: number;
  cardType?: 'yellow' | 'red';
  description: string;
  additionalData?: any;
}

export interface EnhancedPlayerTime {
  playerId: number;
  playerName: string;
  team: string;
  totalMinutes: number;
  periods: Array<{ start_time: number; end_time: number; duration: number }>;
}

export interface EnhancedMatchSummaryData {
  fixture: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: string;
  };
  events: EnhancedMatchEvent[];
  goals: EnhancedMatchEvent[];
  assists: EnhancedMatchEvent[];
  cards: EnhancedMatchEvent[];
  playerTimes: EnhancedPlayerTime[];
  statistics: {
    totalEvents: number;
    homeTeamGoals: number;
    awayTeamGoals: number;
    homeTeamCards: number;
    awayTeamCards: number;
    totalPlayersTracked: number;
    totalMinutesPlayed: number;
  };
}

export const enhancedMatchSummaryService = {
  async getEnhancedMatchSummary(fixtureId: number): Promise<EnhancedMatchSummaryData> {
    console.log('📊 EnhancedMatchSummaryService: Fetching comprehensive match summary for fixture:', fixtureId);
    
    try {
      // Fetch fixture details
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('*')
        .eq('id', fixtureId)
        .single();

      if (fixtureError) {
        console.error('❌ EnhancedMatchSummaryService: Error fetching fixture:', fixtureError);
        throw fixtureError;
      }

      // Fetch all match events with enhanced details
      const { data: matchEvents, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('event_time', { ascending: true });

      if (eventsError) {
        console.error('❌ EnhancedMatchSummaryService: Error fetching match events:', eventsError);
        throw eventsError;
      }

      // Fetch player time tracking with periods
      const { data: playerTimeData, error: timeError } = await supabase
        .from('player_time_tracking')
        .select('*')
        .eq('fixture_id', fixtureId);

      if (timeError) {
        console.error('❌ EnhancedMatchSummaryService: Error fetching player times:', timeError);
        throw timeError;
      }

      // Process and enhance events
      const enhancedEvents: EnhancedMatchEvent[] = (matchEvents || []).map(event => ({
        id: event.id,
        fixtureId: event.fixture_id,
        playerId: parseInt(event.player_name) || 0,
        playerName: event.player_name,
        team: event.team_id,
        eventType: this.normalizeEventType(event.event_type),
        eventTime: event.event_time,
        cardType: event.card_type as 'yellow' | 'red' | undefined,
        description: event.description || this.generateEventDescription(event),
        additionalData: {
          originalEventType: event.event_type,
          rawTeamId: event.team_id
        }
      }));

      // Categorize events
      const goals = enhancedEvents.filter(e => e.eventType === 'goal');
      const assists = enhancedEvents.filter(e => e.eventType === 'assist');
      const cards = enhancedEvents.filter(e => e.eventType === 'card');

      // Process player times
      const playerTimes: EnhancedPlayerTime[] = (playerTimeData || []).map(timeRecord => ({
        playerId: timeRecord.player_id,
        playerName: timeRecord.player_name,
        team: timeRecord.team_id.toString(),
        totalMinutes: timeRecord.total_minutes,
        periods: (timeRecord.periods as any) || []
      }));

      // Calculate statistics
      const homeTeam = fixture.home_team_id || fixture.team1;
      const awayTeam = fixture.away_team_id || fixture.team2;
      
      const statistics = {
        totalEvents: enhancedEvents.length,
        homeTeamGoals: goals.filter(g => g.team === homeTeam).length,
        awayTeamGoals: goals.filter(g => g.team === awayTeam).length,
        homeTeamCards: cards.filter(c => c.team === homeTeam).length,
        awayTeamCards: cards.filter(c => c.team === awayTeam).length,
        totalPlayersTracked: playerTimes.length,
        totalMinutesPlayed: playerTimes.reduce((sum, p) => sum + p.totalMinutes, 0)
      };

      const result: EnhancedMatchSummaryData = {
        fixture: {
          id: fixture.id,
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          homeScore: fixture.home_score || 0,
          awayScore: fixture.away_score || 0,
          status: fixture.status
        },
        events: enhancedEvents,
        goals,
        assists,
        cards,
        playerTimes,
        statistics
      };

      console.log('✅ EnhancedMatchSummaryService: Successfully processed enhanced match summary:', {
        fixtureId,
        totalEvents: enhancedEvents.length,
        goals: goals.length,
        assists: assists.length,
        cards: cards.length,
        playerTimes: playerTimes.length,
        statistics
      });

      return result;

    } catch (error) {
      console.error('❌ EnhancedMatchSummaryService: Critical error fetching enhanced match summary:', error);
      throw error;
    }
  },

  normalizeEventType(eventType: string): 'goal' | 'assist' | 'card' | 'substitution' {
    const normalized = eventType.toLowerCase().trim();
    
    if (normalized === 'goal') return 'goal';
    if (normalized === 'assist') return 'assist';
    if (normalized === 'card' || normalized === 'yellow_card' || normalized === 'red_card') return 'card';
    if (normalized === 'substitution' || normalized === 'sub') return 'substitution';
    
    // Default fallback
    return 'goal';
  },

  generateEventDescription(event: any): string {
    const time = Math.floor(event.event_time / 60);
    const eventType = event.event_type.toLowerCase();
    
    if (eventType === 'goal') {
      return `${event.player_name} scored at ${time}'`;
    } else if (eventType === 'assist') {
      return `${event.player_name} assisted at ${time}'`;
    } else if (eventType === 'card') {
      return `${event.player_name} received ${event.card_type} card at ${time}'`;
    }
    
    return `${event.player_name} - ${eventType} at ${time}'`;
  }
};

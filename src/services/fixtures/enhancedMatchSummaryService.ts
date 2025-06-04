
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedMatchEvent {
  id: number;
  type: 'goal' | 'assist' | 'card';
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  details?: {
    cardType?: 'yellow' | 'red';
    assistedBy?: string;
    description?: string;
  };
}

export interface EnhancedPlayerTime {
  playerId: number;
  playerName: string;
  team: string;
  totalMinutes: number;
  periods: any[];
}

export interface EnhancedMatchStatistics {
  homeTeamGoals: number;
  awayTeamGoals: number;
  homeTeamCards: number;
  awayTeamCards: number;
  totalPlayersTracked: number;
  totalMinutesPlayed: number;
}

export interface EnhancedMatchSummary {
  fixtureId: number;
  goals: EnhancedMatchEvent[];
  cards: EnhancedMatchEvent[];
  playerTimes: EnhancedPlayerTime[];
  statistics: EnhancedMatchStatistics;
  lastUpdated: string;
}

export const enhancedMatchSummaryService = {
  async getEnhancedMatchSummary(fixtureId: number): Promise<EnhancedMatchSummary> {
    console.log('📊 EnhancedMatchSummaryService: Fetching comprehensive data for fixture:', fixtureId);
    
    try {
      // Fetch all match events
      const { data: matchEvents, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('event_time', { ascending: true });

      if (eventsError) {
        console.error('❌ EnhancedMatchSummaryService: Error fetching match events:', eventsError);
        throw eventsError;
      }

      // Fetch player time tracking data
      const { data: playerTimeData, error: timeError } = await supabase
        .from('player_time_tracking')
        .select('*')
        .eq('fixture_id', fixtureId);

      if (timeError) {
        console.error('❌ EnhancedMatchSummaryService: Error fetching player times:', timeError);
        throw timeError;
      }

      // Fetch fixture info for team details
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('home_team_id, away_team_id')
        .eq('id', fixtureId)
        .single();

      if (fixtureError) {
        console.error('❌ EnhancedMatchSummaryService: Error fetching fixture:', fixtureError);
        throw fixtureError;
      }

      // Process match events into structured data
      const goals: EnhancedMatchEvent[] = [];
      const cards: EnhancedMatchEvent[] = [];

      matchEvents?.forEach(event => {
        const baseEvent = {
          id: event.id,
          playerId: parseInt(event.player_name) || 0, // Handle if player_name contains ID
          playerName: event.player_name,
          team: event.team_id,
          time: event.event_time
        };

        if (event.event_type === 'goal') {
          goals.push({
            ...baseEvent,
            type: 'goal',
            details: {
              description: event.description
            }
          });
        } else if (event.event_type === 'assist') {
          goals.push({
            ...baseEvent,
            type: 'assist',
            details: {
              description: event.description
            }
          });
        } else if (event.event_type === 'card') {
          cards.push({
            ...baseEvent,
            type: 'card',
            details: {
              cardType: event.card_type as 'yellow' | 'red',
              description: event.description
            }
          });
        }
      });

      // Process player time data
      const playerTimes: EnhancedPlayerTime[] = playerTimeData?.map(timeRecord => ({
        playerId: timeRecord.player_id,
        playerName: timeRecord.player_name,
        team: timeRecord.team_id.toString(),
        totalMinutes: timeRecord.total_minutes,
        periods: timeRecord.periods || []
      })) || [];

      // Calculate enhanced statistics
      const homeTeamGoals = goals.filter(goal => 
        goal.team === fixture?.home_team_id && goal.type === 'goal'
      ).length;
      
      const awayTeamGoals = goals.filter(goal => 
        goal.team === fixture?.away_team_id && goal.type === 'goal'
      ).length;

      const homeTeamCards = cards.filter(card => 
        card.team === fixture?.home_team_id
      ).length;
      
      const awayTeamCards = cards.filter(card => 
        card.team === fixture?.away_team_id
      ).length;

      const totalMinutesPlayed = playerTimes.reduce((sum, player) => 
        sum + player.totalMinutes, 0
      );

      const statistics: EnhancedMatchStatistics = {
        homeTeamGoals,
        awayTeamGoals,
        homeTeamCards,
        awayTeamCards,
        totalPlayersTracked: playerTimes.length,
        totalMinutesPlayed
      };

      const summary: EnhancedMatchSummary = {
        fixtureId,
        goals,
        cards,
        playerTimes,
        statistics,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ EnhancedMatchSummaryService: Successfully processed enhanced match summary:', {
        goalsCount: goals.length,
        cardsCount: cards.length,
        playersTracked: playerTimes.length,
        statistics
      });

      return summary;

    } catch (error) {
      console.error('❌ EnhancedMatchSummaryService: Critical error:', error);
      throw error;
    }
  },

  async refreshMatchSummary(fixtureId: number): Promise<{ success: boolean; message: string }> {
    console.log('🔄 EnhancedMatchSummaryService: Refreshing match summary for fixture:', fixtureId);
    
    try {
      const summary = await this.getEnhancedMatchSummary(fixtureId);
      
      return {
        success: true,
        message: `Match summary refreshed: ${summary.goals.length} goals, ${summary.cards.length} cards, ${summary.playerTimes.length} players tracked`
      };
    } catch (error) {
      console.error('❌ EnhancedMatchSummaryService: Error refreshing match summary:', error);
      return {
        success: false,
        message: `Failed to refresh match summary: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

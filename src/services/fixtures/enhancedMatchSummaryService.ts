
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedMatchSummaryData {
  goals: Array<{
    id: number;
    playerId: number;
    playerName: string;
    team: string;
    teamId: string;
    type: 'goal' | 'assist';
    time: number;
    timestamp: string;
  }>;
  cards: Array<{
    id: number;
    playerId: number;
    playerName: string;
    team: string;
    teamId: string;
    cardType: 'yellow' | 'red';
    type: 'yellow' | 'red';
    time: number;
    timestamp: string;
  }>;
  playerTimes: Array<{
    playerId: number;
    playerName: string;
    team: string;
    teamId: string;
    totalMinutes: number;
    periods: Array<{
      start_time: number;
      end_time: number;
      duration: number;
    }>;
  }>;
  summary: {
    totalGoals: number;
    totalAssists: number;
    totalCards: number;
    playersTracked: number;
    homeTeamGoals: number;
    awayTeamGoals: number;
    homeTeamCards: number;
    awayTeamCards: number;
  };
}

export const enhancedMatchSummaryService = {
  async getEnhancedMatchSummary(fixtureId: number): Promise<EnhancedMatchSummaryData> {
    console.log('🎯 EnhancedMatchSummaryService: Fetching comprehensive match data for fixture:', fixtureId);
    
    try {
      // Fetch match events with proper joins to get player names and team info
      const { data: matchEvents, error: eventsError } = await supabase
        .from('match_events')
        .select(`
          id,
          event_type,
          player_name,
          team_id,
          event_time,
          card_type,
          description,
          created_at
        `)
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

      // Get fixture details for team information
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select(`
          id,
          home_team_id,
          away_team_id,
          home_score,
          away_score
        `)
        .eq('id', fixtureId)
        .single();

      if (fixtureError) {
        console.error('❌ EnhancedMatchSummaryService: Error fetching fixture:', fixtureError);
        throw fixtureError;
      }

      // Process goals and assists with enhanced data structure
      const goals = matchEvents
        ?.filter(event => event.event_type === 'goal' || event.event_type === 'assist')
        .map(event => {
          // Extract player ID if it exists in player_name (fallback pattern)
          const playerId = parseInt(event.player_name) || 0;
          
          return {
            id: event.id,
            playerId,
            playerName: event.player_name,
            team: event.team_id,
            teamId: event.team_id,
            type: event.event_type as 'goal' | 'assist',
            time: event.event_time,
            timestamp: new Date(event.created_at).toISOString()
          };
        }) || [];

      // Process cards with enhanced data structure
      const cards = matchEvents
        ?.filter(event => event.event_type === 'yellow_card' || event.event_type === 'red_card')
        .map(event => {
          const playerId = parseInt(event.player_name) || 0;
          const cardType = event.card_type || (event.event_type === 'yellow_card' ? 'yellow' : 'red');
          
          return {
            id: event.id,
            playerId,
            playerName: event.player_name,
            team: event.team_id,
            teamId: event.team_id,
            cardType: cardType as 'yellow' | 'red',
            type: cardType as 'yellow' | 'red',
            time: event.event_time,
            timestamp: new Date(event.created_at).toISOString()
          };
        }) || [];

      // Process player time data with enhanced structure
      const playerTimes = playerTimeData?.map(timeRecord => ({
        playerId: timeRecord.player_id,
        playerName: timeRecord.player_name,
        team: timeRecord.team_id.toString(),
        teamId: timeRecord.team_id.toString(),
        totalMinutes: timeRecord.total_minutes,
        periods: timeRecord.periods || []
      })) || [];

      // Calculate enhanced summary statistics
      const homeTeamGoals = goals.filter(goal => 
        goal.type === 'goal' && goal.teamId === fixture.home_team_id
      ).length;
      
      const awayTeamGoals = goals.filter(goal => 
        goal.type === 'goal' && goal.teamId === fixture.away_team_id
      ).length;

      const homeTeamCards = cards.filter(card => 
        card.teamId === fixture.home_team_id
      ).length;
      
      const awayTeamCards = cards.filter(card => 
        card.teamId === fixture.away_team_id
      ).length;

      const summary = {
        totalGoals: goals.filter(g => g.type === 'goal').length,
        totalAssists: goals.filter(g => g.type === 'assist').length,
        totalCards: cards.length,
        playersTracked: playerTimes.length,
        homeTeamGoals,
        awayTeamGoals,
        homeTeamCards,
        awayTeamCards
      };

      console.log('✅ EnhancedMatchSummaryService: Successfully processed enhanced match summary:', {
        goalsCount: goals.length,
        cardsCount: cards.length,
        playersWithTime: playerTimes.length,
        summary
      });

      return {
        goals,
        cards,
        playerTimes,
        summary
      };

    } catch (error) {
      console.error('❌ EnhancedMatchSummaryService: Critical error:', error);
      throw error;
    }
  },

  async getMatchSummaryWithTeamNames(fixtureId: number): Promise<EnhancedMatchSummaryData & { teams: { home: string; away: string } }> {
    console.log('🏟️ EnhancedMatchSummaryService: Fetching match summary with team names for fixture:', fixtureId);
    
    try {
      // Get the enhanced match summary
      const enhancedData = await this.getEnhancedMatchSummary(fixtureId);
      
      // Get fixture with team details
      const { data: fixtureWithTeams, error } = await supabase
        .from('fixtures')
        .select(`
          id,
          home_team_id,
          away_team_id,
          home_score,
          away_score
        `)
        .eq('id', fixtureId)
        .single();

      if (error) {
        console.error('❌ Error fetching fixture with teams:', error);
        throw error;
      }

      // For now, use team IDs as names (could be enhanced to join with teams table)
      const teams = {
        home: fixtureWithTeams.home_team_id || 'Home Team',
        away: fixtureWithTeams.away_team_id || 'Away Team'
      };

      console.log('✅ EnhancedMatchSummaryService: Retrieved team names:', teams);

      return {
        ...enhancedData,
        teams
      };

    } catch (error) {
      console.error('❌ EnhancedMatchSummaryService: Error getting match summary with team names:', error);
      throw error;
    }
  }
};


import { EnhancedMatchSummaryData, EnhancedMatchSummaryWithTeams } from './types';
import { fetchMatchEvents, fetchPlayerTimeData, fetchFixtureDetails } from './dataFetchers';
import { 
  processGoalsAndAssists, 
  processCards, 
  processPlayerTimes, 
  processTimelineEvents,
  calculateSummaryStats,
  processEnhancedFunctionData
} from './utils';
import { supabase } from '@/integrations/supabase/client';

export const enhancedMatchSummaryService = {
  async getEnhancedMatchSummary(fixtureId: number): Promise<EnhancedMatchSummaryData> {
    console.log('🎯 EnhancedMatchSummaryService: Fetching comprehensive match data for fixture:', fixtureId);
    
    try {
      // First try to use the new enhanced database function
      console.log('📊 Attempting to use enhanced database function...');
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_enhanced_match_summary', { p_fixture_id: fixtureId });

      if (!functionError && functionResult && functionResult.length > 0) {
        console.log('✅ Enhanced database function returned data:', functionResult[0]);
        return processEnhancedFunctionData(functionResult[0]);
      }

      console.log('⚠️ Enhanced database function did not return data, falling back to individual queries');

      // Fallback to individual data fetching
      const [matchEvents, playerTimeData, fixture] = await Promise.all([
        fetchMatchEvents(fixtureId),
        fetchPlayerTimeData(fixtureId),
        fetchFixtureDetails(fixtureId)
      ]);

      // Process the data using utility functions
      const goals = processGoalsAndAssists(matchEvents);
      const cards = processCards(matchEvents);
      const playerTimes = processPlayerTimes(playerTimeData);
      const timelineEvents = processTimelineEvents(matchEvents);
      const summary = calculateSummaryStats(goals, cards, playerTimes, fixture);

      console.log('✅ EnhancedMatchSummaryService: Successfully processed enhanced match summary with fallback:', {
        goalsCount: goals.length,
        cardsCount: cards.length,
        playersWithTime: playerTimes.length,
        timelineEventsCount: timelineEvents.length,
        summary
      });

      return {
        goals,
        cards,
        playerTimes,
        timelineEvents,
        summary
      };

    } catch (error) {
      console.error('❌ EnhancedMatchSummaryService: Critical error:', error);
      throw error;
    }
  },

  async getMatchSummaryWithTeamNames(fixtureId: number): Promise<EnhancedMatchSummaryWithTeams> {
    console.log('🏟️ EnhancedMatchSummaryService: Fetching match summary with team names for fixture:', fixtureId);
    
    try {
      // Get the enhanced match summary and fixture details
      const [enhancedData, fixture] = await Promise.all([
        this.getEnhancedMatchSummary(fixtureId),
        fetchFixtureDetails(fixtureId)
      ]);

      // Fetch team names from the teams table
      const { data: homeTeam } = await supabase
        .from('teams')
        .select('name')
        .eq('__id__', fixture.home_team_id)
        .single();

      const { data: awayTeam } = await supabase
        .from('teams')
        .select('name')
        .eq('__id__', fixture.away_team_id)
        .single();

      const teams = {
        home: homeTeam?.name || fixture.home_team_id || 'Home Team',
        away: awayTeam?.name || fixture.away_team_id || 'Away Team'
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


import { EnhancedMatchSummaryData, EnhancedMatchSummaryWithTeams } from './types';
import { fetchMatchEvents, fetchPlayerTimeData, fetchFixtureDetails } from './dataFetchers';
import { 
  processGoalsAndAssists, 
  processCards, 
  processPlayerTimes, 
  calculateSummaryStats 
} from './utils';

export const enhancedMatchSummaryService = {
  async getEnhancedMatchSummary(fixtureId: number): Promise<EnhancedMatchSummaryData> {
    console.log('🎯 EnhancedMatchSummaryService: Fetching comprehensive match data for fixture:', fixtureId);
    
    try {
      // Fetch all required data in parallel
      const [matchEvents, playerTimeData, fixture] = await Promise.all([
        fetchMatchEvents(fixtureId),
        fetchPlayerTimeData(fixtureId),
        fetchFixtureDetails(fixtureId)
      ]);

      // Process the data using utility functions
      const goals = processGoalsAndAssists(matchEvents);
      const cards = processCards(matchEvents);
      const playerTimes = processPlayerTimes(playerTimeData);
      const summary = calculateSummaryStats(goals, cards, playerTimes, fixture);

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

  async getMatchSummaryWithTeamNames(fixtureId: number): Promise<EnhancedMatchSummaryWithTeams> {
    console.log('🏟️ EnhancedMatchSummaryService: Fetching match summary with team names for fixture:', fixtureId);
    
    try {
      // Get the enhanced match summary and fixture details in parallel
      const [enhancedData, fixtureWithTeams] = await Promise.all([
        this.getEnhancedMatchSummary(fixtureId),
        fetchFixtureDetails(fixtureId)
      ]);

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

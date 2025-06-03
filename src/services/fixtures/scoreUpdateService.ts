
import { Fixture } from '@/types/database';
import { fetchFixtureWithTeams, updateFixtureInDatabase, createFixtureResult } from './fixtureDataService';
import { updateTeamStats } from './teamStatsService';

export const updateFixtureScore = async (id: number, homeScore: number, awayScore: number): Promise<Fixture> => {
  console.log('🔍 ScoreUpdateService: Starting fixture score update:', { id, homeScore, awayScore });
  
  try {
    // Validate input parameters
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid fixture ID provided');
    }
    
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      throw new Error('Invalid scores provided - scores must be non-negative integers');
    }

    // Fetch fixture and team data
    console.log('📊 ScoreUpdateService: Fetching fixture and team data...');
    const { fixture: currentFixture, homeTeam, awayTeam } = await fetchFixtureWithTeams(id);

    // Validate that we have both teams
    if (!homeTeam || !awayTeam) {
      throw new Error('Could not find both teams for this fixture');
    }

    console.log('✅ ScoreUpdateService: Teams found:', {
      home: homeTeam.name,
      away: awayTeam.name
    });

    // Update fixture first
    console.log('💾 ScoreUpdateService: Updating fixture in database...');
    const updatedFixture = await updateFixtureInDatabase(id, homeScore, awayScore);

    // Update team stats
    console.log('📈 ScoreUpdateService: Updating team statistics...');
    await updateTeamStats(homeTeam, awayTeam, homeScore, awayScore, currentFixture);

    // Return simplified fixture object to avoid deep type instantiation
    const result = createFixtureResult(updatedFixture, homeTeam, awayTeam);
    
    console.log('✅ ScoreUpdateService: Successfully completed fixture score update');
    return result;

  } catch (error) {
    console.error('❌ ScoreUpdateService: Critical error in updateScore:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('team not found')) {
        throw new Error('One or both teams could not be found in the database. Please check that the teams exist.');
      }
      if (error.message.includes('fixture')) {
        throw new Error('Fixture could not be found or updated. Please check that the fixture exists.');
      }
      if (error.message.includes('stats')) {
        throw new Error('Failed to update team statistics. The fixture score was saved but team stats may be inconsistent.');
      }
    }
    
    throw error; // Re-throw the error so it can be handled by the calling code
  }
};

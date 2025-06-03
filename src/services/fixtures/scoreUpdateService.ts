
import { Fixture } from '@/types/database';
import { fetchFixtureWithTeams, updateFixtureInDatabase, createFixtureResult } from './fixtureDataService';
import { updateTeamStats } from './teamStatsService';

export const updateFixtureScore = async (id: number, homeScore: number, awayScore: number): Promise<Fixture> => {
  console.log('🔍 ScoreUpdateService: Updating fixture score:', { id, homeScore, awayScore });
  
  try {
    // Fetch fixture and team data
    const { fixture: currentFixture, homeTeam, awayTeam } = await fetchFixtureWithTeams(id);

    // Update fixture first
    const updatedFixture = await updateFixtureInDatabase(id, homeScore, awayScore);

    // Update team stats
    await updateTeamStats(homeTeam, awayTeam, homeScore, awayScore, currentFixture);

    // Return simplified fixture object to avoid deep type instantiation
    const result = createFixtureResult(updatedFixture, homeTeam, awayTeam);
    return result;

  } catch (error) {
    console.error('❌ ScoreUpdateService: Critical error in updateScore:', error);
    throw error; // Re-throw the error so it can be handled by the calling code
  }
};

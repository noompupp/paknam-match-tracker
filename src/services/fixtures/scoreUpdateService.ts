
import { Fixture } from '@/types/database';
import { fetchFixtureWithTeams, updateFixtureInDatabase, createFixtureResult } from './fixtureDataService';
import { updateTeamStats } from './teamStatsService';
import { calculateAndUpdatePositions } from './positionCalculationService';
import { createGoalEventsWithDuplicateCheck } from './matchEventsCreationService';

export const updateFixtureScore = async (id: number, homeScore: number, awayScore: number): Promise<Fixture> => {
  console.log('🔍 ScoreUpdateService: Starting fixture score update with H2H tie-breaking:', { id, homeScore, awayScore });
  
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

    console.log('✅ ScoreUpdateService: Teams found with correct team IDs:', {
      home: homeTeam.name,
      homeTextId: homeTeam.__id__,
      away: awayTeam.name,
      awayTextId: awayTeam.__id__,
      currentScore: `${currentFixture.home_score || 0}-${currentFixture.away_score || 0}`,
      newScore: `${homeScore}-${awayScore}`
    });

    // Store current scores for goal event creation
    const currentHomeScore = currentFixture.home_score || 0;
    const currentAwayScore = currentFixture.away_score || 0;

    // Update fixture first
    console.log('💾 ScoreUpdateService: Updating fixture in database...');
    const updatedFixture = await updateFixtureInDatabase(id, homeScore, awayScore);

    // Update team stats
    console.log('📈 ScoreUpdateService: Updating team statistics...');
    await updateTeamStats(homeTeam, awayTeam, homeScore, awayScore, currentFixture);

    // Calculate and update league positions with H2H tie-breaking
    console.log('🏆 ScoreUpdateService: Updating league table positions with H2H...');
    await calculateAndUpdatePositions();

    // Create goal events for the score change with correct team IDs
    console.log('⚽ ScoreUpdateService: Creating goal events with correct team IDs...');
    await createGoalEventsWithDuplicateCheck(
      id,
      { id: homeTeam.__id__ || homeTeam.id.toString(), name: homeTeam.name },
      { id: awayTeam.__id__ || awayTeam.id.toString(), name: awayTeam.name },
      homeScore,
      awayScore,
      currentHomeScore,
      currentAwayScore
    );

    // Return simplified fixture object
    const result = createFixtureResult(updatedFixture, homeTeam, awayTeam);
    
    console.log('✅ ScoreUpdateService: Successfully completed fixture score update with H2H tie-breaking');
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
      if (error.message.includes('position')) {
        throw new Error('Failed to update league positions. The match was saved but league table may be inconsistent.');
      }
    }
    
    throw error;
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Fixture } from '@/types/database';
import { calculateTeamStatsUpdate } from './statsCalculator';

interface SimpleTeam {
  id: number;
  name: string;
  played: number;
  points: number;
}

export const updateFixtureScore = async (id: number, homeScore: number, awayScore: number): Promise<Fixture> => {
  console.log('🔍 FixturesUpdates: Updating fixture score with enhanced team lookup:', { id, homeScore, awayScore });
  
  try {
    // First, get the current fixture to access team information
    const { data: currentFixture, error: fetchError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ FixturesUpdates: Error fetching current fixture:', fetchError);
      throw fetchError;
    }

    console.log('📊 FixturesUpdates: Current fixture data:', currentFixture);

    // Get teams using the consistent team ID approach
    let homeTeam: SimpleTeam | null = null;
    let awayTeam: SimpleTeam | null = null;

    // Use the standardized team1/team2 fields after our migration
    const homeTeamId = currentFixture.team1;
    const awayTeamId = currentFixture.team2;

    console.log('🔍 FixturesUpdates: Team IDs found:', { homeTeamId, awayTeamId });

    // Find home team
    if (homeTeamId) {
      const { data: team, error: homeTeamError } = await supabase
        .from('teams')
        .select('id, name, played, points')
        .eq('__id__', homeTeamId)
        .maybeSingle();
      
      if (homeTeamError) {
        console.error('❌ FixturesUpdates: Error fetching home team:', homeTeamError);
        throw new Error(`Failed to fetch home team: ${homeTeamError.message}`);
      }
      
      if (team) {
        homeTeam = team;
        console.log('✅ FixturesUpdates: Found home team:', team.name);
      } else {
        console.error('❌ FixturesUpdates: Home team not found for ID:', homeTeamId);
        throw new Error(`Home team not found for ID: ${homeTeamId}`);
      }
    } else {
      throw new Error('Home team ID is missing from fixture');
    }

    // Find away team
    if (awayTeamId) {
      const { data: team, error: awayTeamError } = await supabase
        .from('teams')
        .select('id, name, played, points')
        .eq('__id__', awayTeamId)
        .maybeSingle();
      
      if (awayTeamError) {
        console.error('❌ FixturesUpdates: Error fetching away team:', awayTeamError);
        throw new Error(`Failed to fetch away team: ${awayTeamError.message}`);
      }
      
      if (team) {
        awayTeam = team;
        console.log('✅ FixturesUpdates: Found away team:', team.name);
      } else {
        console.error('❌ FixturesUpdates: Away team not found for ID:', awayTeamId);
        throw new Error(`Away team not found for ID: ${awayTeamId}`);
      }
    } else {
      throw new Error('Away team ID is missing from fixture');
    }

    // Check if this is an update to an already completed match
    const isMatchAlreadyCompleted = currentFixture.status === 'completed' && 
      currentFixture.home_score !== null && 
      currentFixture.away_score !== null;

    // Determine match result
    const isHomeWin = homeScore > awayScore;
    const isAwayWin = awayScore > homeScore;
    const isDraw = homeScore === awayScore;

    // Update fixture first
    const { data: updatedFixture, error: fixtureError } = await supabase
      .from('fixtures')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (fixtureError) {
      console.error('❌ FixturesUpdates: Error updating fixture:', fixtureError);
      throw new Error(`Failed to update fixture: ${fixtureError.message}`);
    }

    console.log('✅ FixturesUpdates: Fixture updated successfully:', updatedFixture);

    // Update team stats if this is the first time the match is being completed or if we're changing the result
    if (!isMatchAlreadyCompleted || 
        currentFixture.home_score !== homeScore || 
        currentFixture.away_score !== awayScore) {
      
      // If match was already completed, we need to reverse the previous stats first
      if (isMatchAlreadyCompleted) {
        console.log('🔄 FixturesUpdates: Reversing previous match stats...');
        
        const prevHomeScore = currentFixture.home_score || 0;
        const prevAwayScore = currentFixture.away_score || 0;
        const prevIsHomeWin = prevHomeScore > prevAwayScore;
        const prevIsAwayWin = prevAwayScore > prevHomeScore;
        const prevIsDraw = prevHomeScore === prevAwayScore;

        // Reverse previous home team stats
        const reversedHomeStats = calculateTeamStatsUpdate(
          homeTeam,
          -prevHomeScore,  // Subtract previous goals
          -prevAwayScore,  // Subtract previous goals against
          false,  // No wins to add when reversing
          false,  // No draws to add when reversing  
          false   // No losses to add when reversing
        );
        reversedHomeStats.played = (homeTeam.played || 1) - 1;
        reversedHomeStats.points = (homeTeam.points || 0) - 
          (prevIsHomeWin ? 3 : prevIsDraw ? 1 : 0);

        const { error: homeReverseError } = await supabase
          .from('teams')
          .update(reversedHomeStats)
          .eq('id', homeTeam.id);

        if (homeReverseError) {
          console.error('❌ FixturesUpdates: Error reversing home team stats:', homeReverseError);
          throw new Error(`Failed to reverse home team stats: ${homeReverseError.message}`);
        }

        // Reverse previous away team stats
        const reversedAwayStats = calculateTeamStatsUpdate(
          awayTeam,
          -prevAwayScore,  // Subtract previous goals
          -prevHomeScore,  // Subtract previous goals against
          false,  // No wins to add when reversing
          false,  // No draws to add when reversing
          false   // No losses to add when reversing
        );
        reversedAwayStats.played = (awayTeam.played || 1) - 1;
        reversedAwayStats.points = (awayTeam.points || 0) - 
          (prevIsAwayWin ? 3 : prevIsDraw ? 1 : 0);

        const { error: awayReverseError } = await supabase
          .from('teams')
          .update(reversedAwayStats)
          .eq('id', awayTeam.id);

        if (awayReverseError) {
          console.error('❌ FixturesUpdates: Error reversing away team stats:', awayReverseError);
          throw new Error(`Failed to reverse away team stats: ${awayReverseError.message}`);
        }
      }

      // Now apply the new stats
      console.log('📊 FixturesUpdates: Updating team stats...');

      // Update home team stats
      const homeTeamStats = calculateTeamStatsUpdate(
        homeTeam,
        homeScore,
        awayScore,
        isHomeWin,
        isDraw,
        isAwayWin
      );

      console.log('🏠 FixturesUpdates: Updating home team stats:', homeTeamStats);

      const { error: homeStatsError } = await supabase
        .from('teams')
        .update(homeTeamStats)
        .eq('id', homeTeam.id);

      if (homeStatsError) {
        console.error('❌ FixturesUpdates: Error updating home team stats:', homeStatsError);
        throw new Error(`Failed to update home team stats: ${homeStatsError.message}`);
      }

      // Update away team stats
      const awayTeamStats = calculateTeamStatsUpdate(
        awayTeam,
        awayScore,
        homeScore,
        isAwayWin,
        isDraw,
        isHomeWin
      );

      console.log('🏃 FixturesUpdates: Updating away team stats:', awayTeamStats);

      const { error: awayStatsError } = await supabase
        .from('teams')
        .update(awayTeamStats)
        .eq('id', awayTeam.id);

      if (awayStatsError) {
        console.error('❌ FixturesUpdates: Error updating away team stats:', awayStatsError);
        throw new Error(`Failed to update away team stats: ${awayStatsError.message}`);
      }

      console.log('✅ FixturesUpdates: Team stats updated successfully');
    } else {
      console.log('ℹ️ FixturesUpdates: No team stats update needed - match result unchanged');
    }

    // Return simplified fixture object to avoid deep type instantiation
    const result: Fixture = {
      id: updatedFixture.id || 0,
      home_team_id: homeTeam?.id || 0,
      away_team_id: awayTeam?.id || 0,
      home_team: homeTeam ? {
        id: homeTeam.id,
        name: homeTeam.name,
        logo: '⚽',
        founded: '2020',
        captain: '',
        position: 1,
        points: homeTeam.points,
        played: homeTeam.played,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        created_at: '',
        updated_at: ''
      } : undefined,
      away_team: awayTeam ? {
        id: awayTeam.id,
        name: awayTeam.name,
        logo: '⚽',
        founded: '2020',
        captain: '',
        position: 1,
        points: awayTeam.points,
        played: awayTeam.played,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        created_at: '',
        updated_at: ''
      } : undefined,
      match_date: updatedFixture.match_date || updatedFixture.date?.toString() || '',
      match_time: updatedFixture.match_time?.toString() || updatedFixture.time?.toString() || '',
      home_score: updatedFixture.home_score,
      away_score: updatedFixture.away_score,
      status: (updatedFixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'completed',
      venue: updatedFixture.venue,
      created_at: updatedFixture.created_at || new Date().toISOString(),
      updated_at: updatedFixture.updated_at || new Date().toISOString()
    };

    return result;

  } catch (error) {
    console.error('❌ FixturesUpdates: Critical error in updateScore:', error);
    throw error; // Re-throw the error so it can be handled by the calling code
  }
};

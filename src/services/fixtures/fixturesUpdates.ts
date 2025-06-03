
import { supabase } from '@/integrations/supabase/client';
import { Fixture } from '@/types/database';
import { calculateTeamStatsUpdate } from './statsCalculator';

export const updateFixtureScore = async (id: number, homeScore: number, awayScore: number): Promise<Fixture> => {
  console.log('🔍 FixturesUpdates: Updating fixture score with team stats:', { id, homeScore, awayScore });
  
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

    // Get the teams separately to ensure we have proper team objects
    const { data: homeTeam, error: homeTeamError } = await supabase
      .from('teams')
      .select('*')
      .eq('__id__', currentFixture.team1)
      .single();

    const { data: awayTeam, error: awayTeamError } = await supabase
      .from('teams')
      .select('*')
      .eq('__id__', currentFixture.team2)
      .single();

    if (homeTeamError || awayTeamError) {
      console.error('❌ FixturesUpdates: Error fetching team data:', { homeTeamError, awayTeamError });
      throw homeTeamError || awayTeamError;
    }

    console.log('📊 FixturesUpdates: Team data:', { homeTeam, awayTeam });

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
      throw fixtureError;
    }

    console.log('✅ FixturesUpdates: Fixture updated successfully:', updatedFixture);

    // Only update team stats if this is the first time the match is being completed
    // or if we're changing the result of a completed match
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
        if (homeTeam) {
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

          await supabase
            .from('teams')
            .update(reversedHomeStats)
            .eq('id', homeTeam.id);
        }

        // Reverse previous away team stats
        if (awayTeam) {
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

          await supabase
            .from('teams')
            .update(reversedAwayStats)
            .eq('id', awayTeam.id);
        }
      }

      // Now apply the new stats
      console.log('📊 FixturesUpdates: Updating team stats...');

      // Update home team stats
      if (homeTeam) {
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
          throw homeStatsError;
        }
      }

      // Update away team stats
      if (awayTeam) {
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
          throw awayStatsError;
        }
      }

      console.log('✅ FixturesUpdates: Team stats updated successfully');
    } else {
      console.log('ℹ️ FixturesUpdates: No team stats update needed - match result unchanged');
    }

    return {
      id: updatedFixture.id || 0,
      home_team_id: homeTeam?.id || 0,
      away_team_id: awayTeam?.id || 0,
      match_date: updatedFixture.match_date || updatedFixture.date?.toString() || '',
      match_time: updatedFixture.match_time?.toString() || updatedFixture.time?.toString() || '',
      home_score: updatedFixture.home_score,
      away_score: updatedFixture.away_score,
      status: (updatedFixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'completed',
      venue: updatedFixture.venue,
      created_at: updatedFixture.created_at || new Date().toISOString(),
      updated_at: updatedFixture.updated_at || new Date().toISOString()
    } as Fixture;

  } catch (error) {
    console.error('❌ FixturesUpdates: Critical error in updateScore:', error);
    throw error;
  }
};

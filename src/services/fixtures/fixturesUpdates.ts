
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

    // Enhanced team lookup - try multiple approaches to find teams
    let homeTeam: SimpleTeam | null = null;
    let awayTeam: SimpleTeam | null = null;

    // Try to get teams using different ID fields
    const teamFields = ['__id__', 'id'];
    const homeTeamIds = [currentFixture.team1, currentFixture.home_team_id].filter(Boolean);
    const awayTeamIds = [currentFixture.team2, currentFixture.away_team_id].filter(Boolean);

    console.log('🔍 FixturesUpdates: Team ID candidates:', { homeTeamIds, awayTeamIds });

    // Try to find home team
    for (const teamId of homeTeamIds) {
      for (const field of teamFields) {
        const { data: team, error } = await supabase
          .from('teams')
          .select('id, name, played, points')
          .eq(field, teamId)
          .maybeSingle();

        if (!error && team) {
          homeTeam = team;
          console.log('✅ FixturesUpdates: Found home team:', { field, teamId, team: team.name });
          break;
        }
      }
      if (homeTeam) break;
    }

    // Try to find away team
    for (const teamId of awayTeamIds) {
      for (const field of teamFields) {
        const { data: team, error } = await supabase
          .from('teams')
          .select('id, name, played, points')
          .eq(field, teamId)
          .maybeSingle();

        if (!error && team) {
          awayTeam = team;
          console.log('✅ FixturesUpdates: Found away team:', { field, teamId, team: team.name });
          break;
        }
      }
      if (awayTeam) break;
    }

    if (!homeTeam || !awayTeam) {
      console.warn('⚠️ FixturesUpdates: Could not find one or both teams:', { 
        homeTeamFound: !!homeTeam,
        awayTeamFound: !!awayTeam, 
        fixture: currentFixture 
      });
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
      throw fixtureError;
    }

    console.log('✅ FixturesUpdates: Fixture updated successfully:', updatedFixture);

    // Only update team stats if we have both teams and this is the first time 
    // the match is being completed or if we're changing the result
    if (homeTeam && awayTeam && 
        (!isMatchAlreadyCompleted || 
        currentFixture.home_score !== homeScore || 
        currentFixture.away_score !== awayScore)) {
      
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

        await supabase
          .from('teams')
          .update(reversedHomeStats)
          .eq('id', homeTeam.id);

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

        await supabase
          .from('teams')
          .update(reversedAwayStats)
          .eq('id', awayTeam.id);
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
        throw homeStatsError;
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
        throw awayStatsError;
      }

      console.log('✅ FixturesUpdates: Team stats updated successfully');
    } else {
      console.log('ℹ️ FixturesUpdates: No team stats update needed - team not found or match result unchanged');
    }

    // Return simplified fixture object to avoid deep type instantiation
    const result: Fixture = {
      id: updatedFixture.id || 0,
      home_team_id: homeTeam?.id || 0,
      away_team_id: awayTeam?.id || 0,
      home_team: homeTeam ? { 
        ...homeTeam, 
        logo: '⚽', 
        founded: '2020', 
        captain: '', 
        position: 1, // Add missing position property
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
        ...awayTeam, 
        logo: '⚽', 
        founded: '2020', 
        captain: '', 
        position: 1, // Add missing position property
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
    throw error;
  }
};

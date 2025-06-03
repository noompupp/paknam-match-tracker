
import { supabase } from '@/integrations/supabase/client';
import { Fixture } from '@/types/database';

// Helper function to normalize IDs for consistent matching
const normalizeId = (id: any): string => {
  if (id === null || id === undefined) return '';
  return String(id).trim().toLowerCase();
};

const transformFixture = (fixture: any): Fixture => ({
  id: fixture.id || 0,
  home_team_id: fixture.home_team?.id || 0,
  away_team_id: fixture.away_team?.id || 0,
  match_date: fixture.match_date || fixture.date?.toString() || '',
  match_time: fixture.match_time?.toString() || fixture.time?.toString() || '',
  home_score: fixture.home_score,
  away_score: fixture.away_score,
  status: (fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
  venue: fixture.venue,
  created_at: fixture.created_at || new Date().toISOString(),
  updated_at: fixture.updated_at || new Date().toISOString(),
  home_team: fixture.home_team,
  away_team: fixture.away_team
});

const createTeamObject = (team: any) => {
  const teamObj = {
    id: team.id || 0,
    name: team.name || '',
    logo: team.logo || '⚽',
    logoURL: team.logoURL || undefined,
    color: team.color || undefined,
    founded: team.founded || '2020',
    captain: team.captain || '',
    position: team.position || 1,
    points: team.points || 0,
    played: team.played || 0,
    won: team.won || 0,
    drawn: team.drawn || 0,
    lost: team.lost || 0,
    goals_for: team.goals_for || 0,
    goals_against: team.goals_against || 0,
    goal_difference: team.goal_difference || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('🔧 FixturesAPI: Created team object:', {
    name: teamObj.name,
    hasLogoURL: !!teamObj.logoURL,
    logoURL: teamObj.logoURL,
    logo: teamObj.logo
  });
  
  return teamObj;
};

// Calculate team stats updates based on match result
const calculateTeamStatsUpdate = (
  currentStats: any,
  goalsFor: number,
  goalsAgainst: number,
  isWin: boolean,
  isDraw: boolean,
  isLoss: boolean
) => {
  const newPlayed = (currentStats.played || 0) + 1;
  const newWon = (currentStats.won || 0) + (isWin ? 1 : 0);
  const newDrawn = (currentStats.drawn || 0) + (isDraw ? 1 : 0);
  const newLost = (currentStats.lost || 0) + (isLoss ? 1 : 0);
  const newGoalsFor = (currentStats.goals_for || 0) + goalsFor;
  const newGoalsAgainst = (currentStats.goals_against || 0) + goalsAgainst;
  const newGoalDifference = newGoalsFor - newGoalsAgainst;
  const newPoints = (currentStats.points || 0) + (isWin ? 3 : isDraw ? 1 : 0);

  return {
    played: newPlayed,
    won: newWon,
    drawn: newDrawn,
    lost: newLost,
    goals_for: newGoalsFor,
    goals_against: newGoalsAgainst,
    goal_difference: newGoalDifference,
    points: newPoints
  };
};

export const fixturesApi = {
  getAll: async () => {
    console.log('🔍 FixturesAPI: Starting getAll request...');
    
    // First get all fixtures
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date', { ascending: false });
    
    if (fixturesError) {
      console.error('❌ FixturesAPI: Error fetching fixtures:', fixturesError);
      throw fixturesError;
    }

    console.log('📊 FixturesAPI: Raw fixtures data from database:', {
      count: fixtures?.length || 0,
      sample: fixtures?.[0] || null,
      teamMappings: fixtures?.map(f => ({
        id: f.id,
        team1: f.team1,
        team2: f.team2,
        normalizedTeam1: normalizeId(f.team1),
        normalizedTeam2: normalizeId(f.team2)
      })) || []
    });

    if (!fixtures || fixtures.length === 0) {
      console.warn('⚠️ FixturesAPI: No fixtures found in database');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ FixturesAPI: Error fetching teams for fixtures:', teamsError);
      throw teamsError;
    }

    console.log('📊 FixturesAPI: Teams data for joining:', {
      count: teams?.length || 0,
      idMappings: teams?.map(t => ({
        name: t.name,
        numericId: t.id,
        textId: t.__id__,
        logoURL: t.logoURL,
        hasLogoURL: !!t.logoURL,
        normalized: normalizeId(t.__id__)
      })) || []
    });

    // Manually join fixtures with teams using normalized IDs
    const fixturesWithTeams = fixtures.map(fixture => {
      // Find home team using normalized team1 field
      const normalizedTeam1 = normalizeId(fixture.team1);
      const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam1);
      
      // Find away team using normalized team2 field  
      const normalizedTeam2 = normalizeId(fixture.team2);
      const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam2);

      console.log('🔄 FixturesAPI: Transforming fixture:', {
        fixtureId: fixture.id,
        team1: fixture.team1,
        team2: fixture.team2,
        normalizedTeam1,
        normalizedTeam2,
        foundHomeTeam: homeTeam ? { 
          id: homeTeam.id, 
          name: homeTeam.name,
          textId: homeTeam.__id__,
          logoURL: homeTeam.logoURL,
          hasLogoURL: !!homeTeam.logoURL,
          normalized: normalizeId(homeTeam.__id__)
        } : null,
        foundAwayTeam: awayTeam ? { 
          id: awayTeam.id, 
          name: awayTeam.name,
          textId: awayTeam.__id__,
          logoURL: awayTeam.logoURL,
          hasLogoURL: !!awayTeam.logoURL,
          normalized: normalizeId(awayTeam.__id__)
        } : null,
        availableTeams: teams?.map(t => ({
          name: t.name,
          textId: t.__id__,
          logoURL: t.logoURL,
          normalized: normalizeId(t.__id__)
        })) || []
      });

      return {
        ...fixture,
        home_team: homeTeam ? createTeamObject(homeTeam) : undefined,
        away_team: awayTeam ? createTeamObject(awayTeam) : undefined
      };
    });

    console.log('✅ FixturesAPI: Successfully transformed fixtures:', {
      count: fixturesWithTeams.length,
      fixturesWithBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length,
      fixturesWithoutTeams: fixturesWithTeams.filter(f => !f.home_team || !f.away_team).length,
      teamsWithLogos: fixturesWithTeams.filter(f => f.home_team?.logoURL || f.away_team?.logoURL).length
    });
    
    return fixturesWithTeams.map(transformFixture);
  },

  getUpcoming: async () => {
    console.log('🔍 FixturesAPI: Getting upcoming fixtures...');
    
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(5);
    
    if (fixturesError) {
      console.error('❌ FixturesAPI: Error fetching upcoming fixtures:', fixturesError);
      throw fixturesError;
    }

    console.log('📊 FixturesAPI: Upcoming fixtures data:', {
      count: fixtures?.length || 0,
      fixtures: fixtures || []
    });

    if (!fixtures || fixtures.length === 0) {
      console.warn('⚠️ FixturesAPI: No upcoming fixtures found');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ FixturesAPI: Error fetching teams for upcoming fixtures:', teamsError);
      throw teamsError;
    }

    // Manually join fixtures with teams using normalized IDs
    const fixturesWithTeams = fixtures.map(fixture => {
      const normalizedTeam1 = normalizeId(fixture.team1);
      const normalizedTeam2 = normalizeId(fixture.team2);
      const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam1);
      const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam2);

      console.log('🔄 FixturesAPI: Processing upcoming fixture:', {
        fixtureId: fixture.id,
        foundHome: !!homeTeam,
        foundAway: !!awayTeam,
        homeTeamName: homeTeam?.name,
        awayTeamName: awayTeam?.name
      });

      return {
        ...fixture,
        home_team: homeTeam ? createTeamObject(homeTeam) : undefined,
        away_team: awayTeam ? createTeamObject(awayTeam) : undefined
      };
    });
    
    console.log('✅ FixturesAPI: Successfully processed upcoming fixtures:', {
      count: fixturesWithTeams.length,
      withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length
    });
    
    return fixturesWithTeams.map(transformFixture);
  },

  getRecent: async () => {
    console.log('🔍 FixturesAPI: Getting recent fixtures...');
    
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'completed')
      .order('match_date', { ascending: false })
      .limit(5);
    
    if (fixturesError) {
      console.error('❌ FixturesAPI: Error fetching recent fixtures:', fixturesError);
      throw fixturesError;
    }

    console.log('📊 FixturesAPI: Recent fixtures data:', {
      count: fixtures?.length || 0,
      fixtures: fixtures || []
    });

    if (!fixtures || fixtures.length === 0) {
      console.warn('⚠️ FixturesAPI: No recent fixtures found');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ FixturesAPI: Error fetching teams for recent fixtures:', teamsError);
      throw teamsError;
    }

    // Manually join fixtures with teams using normalized IDs
    const fixturesWithTeams = fixtures.map(fixture => {
      const normalizedTeam1 = normalizeId(fixture.team1);
      const normalizedTeam2 = normalizeId(fixture.team2);
      const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam1);
      const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam2);

      console.log('🔄 FixturesAPI: Processing recent fixture:', {
        fixtureId: fixture.id,
        foundHome: !!homeTeam,
        foundAway: !!awayTeam,
        homeTeamName: homeTeam?.name,
        awayTeamName: awayTeam?.name
      });

      return {
        ...fixture,
        home_team: homeTeam ? createTeamObject(homeTeam) : undefined,
        away_team: awayTeam ? createTeamObject(awayTeam) : undefined
      };
    });
    
    console.log('✅ FixturesAPI: Successfully processed recent fixtures:', {
      count: fixturesWithTeams.length,
      withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length
    });
    
    return fixturesWithTeams.map(transformFixture);
  },

  updateScore: async (id: number, homeScore: number, awayScore: number) => {
    console.log('🔍 FixturesAPI: Updating fixture score with team stats:', { id, homeScore, awayScore });
    
    try {
      // First, get the current fixture to access team information
      const { data: currentFixture, error: fetchError } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_team1_fkey(id, name, played, won, drawn, lost, goals_for, goals_against, goal_difference, points),
          away_team:teams!fixtures_team2_fkey(id, name, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ FixturesAPI: Error fetching current fixture:', fetchError);
        throw fetchError;
      }

      console.log('📊 FixturesAPI: Current fixture data:', currentFixture);

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
        console.error('❌ FixturesAPI: Error updating fixture:', fixtureError);
        throw fixtureError;
      }

      console.log('✅ FixturesAPI: Fixture updated successfully:', updatedFixture);

      // Only update team stats if this is the first time the match is being completed
      // or if we're changing the result of a completed match
      if (!isMatchAlreadyCompleted || 
          currentFixture.home_score !== homeScore || 
          currentFixture.away_score !== awayScore) {
        
        // If match was already completed, we need to reverse the previous stats first
        if (isMatchAlreadyCompleted) {
          console.log('🔄 FixturesAPI: Reversing previous match stats...');
          
          const prevHomeScore = currentFixture.home_score || 0;
          const prevAwayScore = currentFixture.away_score || 0;
          const prevIsHomeWin = prevHomeScore > prevAwayScore;
          const prevIsAwayWin = prevAwayScore > prevHomeScore;
          const prevIsDraw = prevHomeScore === prevAwayScore;

          // Reverse previous home team stats
          if (currentFixture.home_team) {
            const reversedHomeStats = calculateTeamStatsUpdate(
              currentFixture.home_team,
              -prevHomeScore,  // Subtract previous goals
              -prevAwayScore,  // Subtract previous goals against
              -prevIsHomeWin ? 1 : 0,  // Subtract previous wins
              -prevIsDraw ? 1 : 0,     // Subtract previous draws
              -prevIsAwayWin ? 1 : 0   // Subtract previous losses
            );
            reversedHomeStats.played = (currentFixture.home_team.played || 1) - 1;
            reversedHomeStats.points = (currentFixture.home_team.points || 0) - 
              (prevIsHomeWin ? 3 : prevIsDraw ? 1 : 0);

            await supabase
              .from('teams')
              .update(reversedHomeStats)
              .eq('id', currentFixture.home_team.id);
          }

          // Reverse previous away team stats
          if (currentFixture.away_team) {
            const reversedAwayStats = calculateTeamStatsUpdate(
              currentFixture.away_team,
              -prevAwayScore,  // Subtract previous goals
              -prevHomeScore,  // Subtract previous goals against
              -prevIsAwayWin ? 1 : 0,  // Subtract previous wins
              -prevIsDraw ? 1 : 0,     // Subtract previous draws
              -prevIsHomeWin ? 1 : 0   // Subtract previous losses
            );
            reversedAwayStats.played = (currentFixture.away_team.played || 1) - 1;
            reversedAwayStats.points = (currentFixture.away_team.points || 0) - 
              (prevIsAwayWin ? 3 : prevIsDraw ? 1 : 0);

            await supabase
              .from('teams')
              .update(reversedAwayStats)
              .eq('id', currentFixture.away_team.id);
          }
        }

        // Now apply the new stats
        console.log('📊 FixturesAPI: Updating team stats...');

        // Update home team stats
        if (currentFixture.home_team) {
          const homeTeamStats = calculateTeamStatsUpdate(
            currentFixture.home_team,
            homeScore,
            awayScore,
            isHomeWin,
            isDraw,
            isAwayWin
          );

          console.log('🏠 FixturesAPI: Updating home team stats:', homeTeamStats);

          const { error: homeStatsError } = await supabase
            .from('teams')
            .update(homeTeamStats)
            .eq('id', currentFixture.home_team.id);

          if (homeStatsError) {
            console.error('❌ FixturesAPI: Error updating home team stats:', homeStatsError);
            throw homeStatsError;
          }
        }

        // Update away team stats
        if (currentFixture.away_team) {
          const awayTeamStats = calculateTeamStatsUpdate(
            currentFixture.away_team,
            awayScore,
            homeScore,
            isAwayWin,
            isDraw,
            isHomeWin
          );

          console.log('🏃 FixturesAPI: Updating away team stats:', awayTeamStats);

          const { error: awayStatsError } = await supabase
            .from('teams')
            .update(awayTeamStats)
            .eq('id', currentFixture.away_team.id);

          if (awayStatsError) {
            console.error('❌ FixturesAPI: Error updating away team stats:', awayStatsError);
            throw awayStatsError;
          }
        }

        console.log('✅ FixturesAPI: Team stats updated successfully');
      } else {
        console.log('ℹ️ FixturesAPI: No team stats update needed - match result unchanged');
      }

      return {
        id: updatedFixture.id || 0,
        home_team_id: currentFixture.home_team?.id || 0,
        away_team_id: currentFixture.away_team?.id || 0,
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
      console.error('❌ FixturesAPI: Critical error in updateScore:', error);
      throw error;
    }
  }
};

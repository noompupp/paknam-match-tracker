
import { supabase } from '@/integrations/supabase/client';

export interface LeagueTableEntry {
  id: number;
  __id__: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number;
  previous_position: number | null;
  logoURL: string | null;
  logo: string;
  color: string | null;
  captain?: string | null; // <-- add captain
}

export const leagueTableService = {
  async getDeduplicatedLeagueTable(): Promise<LeagueTableEntry[]> {
    console.log('🏆 Getting deduplicated league table...');
    
    try {
      // Get all teams with their current stats and logo information
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('position', { ascending: true });

      if (teamsError) throw teamsError;

      if (!teams || teams.length === 0) {
        return [];
      }

      // Verify and recalculate stats based on actual fixture results with deduplication
      const verifiedTeams: LeagueTableEntry[] = [];

      for (const team of teams) {
        // Get deduplicated fixtures for this team - only the most recent version of each fixture
        const { data: fixtures, error: fixturesError } = await supabase
          .from('fixtures')
          .select('*')
          .or(`home_team_id.eq.${team.__id__},away_team_id.eq.${team.__id__}`)
          .not('home_score', 'is', null)
          .not('away_score', 'is', null)
          .order('updated_at', { ascending: false }); // Most recent first

        if (fixturesError) {
          console.error('Error fetching fixtures for team:', team.name, fixturesError);
          continue;
        }

        // Deduplicate fixtures by ID, keeping only the most recent version
        const deduplicatedFixtures = new Map();
        (fixtures || []).forEach(fixture => {
          if (!deduplicatedFixtures.has(fixture.id) || 
              new Date(fixture.updated_at) > new Date(deduplicatedFixtures.get(fixture.id).updated_at)) {
            deduplicatedFixtures.set(fixture.id, fixture);
          }
        });

        const uniqueFixtures = Array.from(deduplicatedFixtures.values());

        console.log(`📊 Team ${team.name}: Found ${fixtures?.length || 0} fixture entries, deduplicated to ${uniqueFixtures.length} unique fixtures`);

        // Calculate actual stats from deduplicated fixture results
        let played = 0;
        let won = 0;
        let drawn = 0;
        let lost = 0;
        let goalsFor = 0;
        let goalsAgainst = 0;

        for (const fixture of uniqueFixtures) {
          const isHome = fixture.home_team_id === team.__id__;
          const teamScore = isHome ? fixture.home_score : fixture.away_score;
          const opponentScore = isHome ? fixture.away_score : fixture.home_score;

          played++;
          goalsFor += teamScore;
          goalsAgainst += opponentScore;

          if (teamScore > opponentScore) {
            won++;
          } else if (teamScore === opponentScore) {
            drawn++;
          } else {
            lost++;
          }
        }

        const goalDifference = goalsFor - goalsAgainst;
        const points = (won * 3) + drawn;

        // CHANGED: set __id__ from the team's actual __id__ field
        verifiedTeams.push({
          id: team.id,
          __id__: team.__id__ || team.id?.toString() || '',
          name: team.name || '',
          played,
          won,
          drawn,
          lost,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
          goal_difference: goalDifference,
          points,
          position: team.position || 1,
          previous_position: team.previous_position,
          logoURL: team.logoURL,
          logo: team.logo || '⚽',
          color: team.color,
          captain: team.captain ?? null, // <-- ensure captain is included
        });
      }

      // Sort by points, then goal difference, then goals for
      verifiedTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        return b.goals_for - a.goals_for;
      });

      // Update positions
      verifiedTeams.forEach((team, index) => {
        team.position = index + 1;
      });

      console.log('✅ League table deduplicated and verified:', {
        teamsCount: verifiedTeams.length,
        totalMatches: verifiedTeams.reduce((sum, team) => sum + team.played, 0) / 2 // Divide by 2 as each match involves 2 teams
      });

      // Update team stats in database to reflect correct calculations
      await this.updateTeamStatsInDatabase(verifiedTeams);

      return verifiedTeams;

    } catch (error) {
      console.error('❌ Error getting deduplicated league table:', error);
      throw error;
    }
  },

  async updateTeamStatsInDatabase(verifiedTeams: LeagueTableEntry[]): Promise<void> {
    console.log('🔄 Updating team stats in database with verified calculations...');
    
    try {
      for (const team of verifiedTeams) {
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goals_for: team.goals_for,
            goals_against: team.goals_against,
            goal_difference: team.goal_difference,
            points: team.points,
            previous_position: team.position !== team.previous_position ? team.previous_position : null,
            position: team.position
          })
          .eq('id', team.id);

        if (updateError) {
          console.error(`Failed to update team ${team.name}:`, updateError);
        }
      }
      
      console.log('✅ Team stats updated in database');
    } catch (error) {
      console.error('❌ Error updating team stats in database:', error);
    }
  },

  async syncTeamStatsWithFixtures(): Promise<{ updated: number; errors: string[] }> {
    console.log('🔄 Syncing team stats with fixture results...');
    
    const errors: string[] = [];
    let updated = 0;

    try {
      const verifiedTeams = await this.getDeduplicatedLeagueTable();
      updated = verifiedTeams.length;

      console.log('✅ Team stats sync completed:', { updated, errors: errors.length });
      return { updated, errors };

    } catch (error) {
      console.error('❌ Error syncing team stats:', error);
      return { 
        updated: 0, 
        errors: [error instanceof Error ? error.message : 'Unknown error during sync'] 
      };
    }
  }
};


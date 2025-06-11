
import { supabase } from '@/integrations/supabase/client';

export interface LeagueTableEntry {
  id: number;
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
}

export const leagueTableService = {
  async getDeduplicatedLeagueTable(): Promise<LeagueTableEntry[]> {
    console.log('🏆 Getting deduplicated league table...');
    
    try {
      // Get all teams with their current stats
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('position', { ascending: true });

      if (teamsError) throw teamsError;

      if (!teams || teams.length === 0) {
        return [];
      }

      // Verify and recalculate stats based on actual fixture results
      const verifiedTeams: LeagueTableEntry[] = [];

      for (const team of teams) {
        // Get all fixtures for this team
        const { data: fixtures, error: fixturesError } = await supabase
          .from('fixtures')
          .select('*')
          .or(`home_team_id.eq.${team.__id__},away_team_id.eq.${team.__id__}`)
          .not('home_score', 'is', null)
          .not('away_score', 'is', null);

        if (fixturesError) {
          console.error('Error fetching fixtures for team:', team.name, fixturesError);
          continue;
        }

        // Calculate actual stats from fixture results
        let played = 0;
        let won = 0;
        let drawn = 0;
        let lost = 0;
        let goalsFor = 0;
        let goalsAgainst = 0;

        const processedFixtures = new Set<number>(); // Prevent duplicate processing

        for (const fixture of fixtures || []) {
          // Skip if already processed (duplicate prevention)
          if (processedFixtures.has(fixture.id)) {
            console.log('⚠️ Skipping duplicate fixture:', fixture.id);
            continue;
          }
          processedFixtures.add(fixture.id);

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

        verifiedTeams.push({
          id: team.id,
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
          previous_position: team.previous_position
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

      return verifiedTeams;

    } catch (error) {
      console.error('❌ Error getting deduplicated league table:', error);
      throw error;
    }
  },

  async syncTeamStatsWithFixtures(): Promise<{ updated: number; errors: string[] }> {
    console.log('🔄 Syncing team stats with fixture results...');
    
    const errors: string[] = [];
    let updated = 0;

    try {
      const verifiedTeams = await this.getDeduplicatedLeagueTable();

      // Update each team's stats in the database
      for (const team of verifiedTeams) {
        try {
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
            errors.push(`Failed to update ${team.name}: ${updateError.message}`);
          } else {
            updated++;
          }
        } catch (error) {
          errors.push(`Error updating ${team.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

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

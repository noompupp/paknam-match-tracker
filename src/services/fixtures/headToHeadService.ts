
import { supabase } from '@/integrations/supabase/client';

interface HeadToHeadResult {
  teamId: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
}

/**
 * Calculate head-to-head results between teams with identical points, goal difference, and goals scored
 */
export const calculateHeadToHeadResults = async (teams: any[]): Promise<any[]> => {
  console.log('🤝 HeadToHeadService: Starting head-to-head calculation for teams:', teams.map(t => t.name));

  if (teams.length <= 1) {
    return teams;
  }

  try {
    // Get all completed fixtures between these teams
    const teamIds = teams.map(t => t.__id__ || t.id.toString());
    
    const { data: h2hFixtures, error } = await supabase
      .from('fixtures')
      .select('home_team_id, away_team_id, home_score, away_score')
      .eq('status', 'completed')
      .in('home_team_id', teamIds)
      .in('away_team_id', teamIds)
      .not('home_score', 'is', null)
      .not('away_score', 'is', null);

    if (error) {
      console.error('❌ HeadToHeadService: Error fetching H2H fixtures:', error);
      return teams; // Fall back to alphabetical if H2H fails
    }

    if (!h2hFixtures || h2hFixtures.length === 0) {
      console.log('⚠️ HeadToHeadService: No H2H fixtures found, using alphabetical order');
      return teams.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Calculate H2H results for each team
    const h2hResults: Record<string, HeadToHeadResult> = {};
    
    teamIds.forEach(teamId => {
      h2hResults[teamId] = {
        teamId,
        points: 0,
        goalDifference: 0,
        goalsFor: 0
      };
    });

    // Process each H2H fixture
    h2hFixtures.forEach(fixture => {
      const homeTeamId = fixture.home_team_id;
      const awayTeamId = fixture.away_team_id;
      const homeScore = fixture.home_score || 0;
      const awayScore = fixture.away_score || 0;

      // Only count if both teams are in our group
      if (teamIds.includes(homeTeamId) && teamIds.includes(awayTeamId)) {
        // Update home team H2H stats
        h2hResults[homeTeamId].goalsFor += homeScore;
        h2hResults[homeTeamId].goalDifference += (homeScore - awayScore);
        
        // Update away team H2H stats
        h2hResults[awayTeamId].goalsFor += awayScore;
        h2hResults[awayTeamId].goalDifference += (awayScore - homeScore);
        
        // Award points
        if (homeScore > awayScore) {
          h2hResults[homeTeamId].points += 3;
        } else if (awayScore > homeScore) {
          h2hResults[awayTeamId].points += 3;
        } else {
          h2hResults[homeTeamId].points += 1;
          h2hResults[awayTeamId].points += 1;
        }
      }
    });

    // Sort teams by H2H results using the same criteria
    const sortedTeams = teams.sort((a, b) => {
      const teamAId = a.__id__ || a.id.toString();
      const teamBId = b.__id__ || b.id.toString();
      
      const h2hA = h2hResults[teamAId];
      const h2hB = h2hResults[teamBId];
      
      // 1st: H2H Points
      if (h2hB.points !== h2hA.points) {
        return h2hB.points - h2hA.points;
      }
      
      // 2nd: H2H Goal Difference
      if (h2hB.goalDifference !== h2hA.goalDifference) {
        return h2hB.goalDifference - h2hA.goalDifference;
      }
      
      // 3rd: H2H Goals Scored
      if (h2hB.goalsFor !== h2hA.goalsFor) {
        return h2hB.goalsFor - h2hA.goalsFor;
      }
      
      // Final: Alphabetical
      return a.name.localeCompare(b.name);
    });

    console.log('✅ HeadToHeadService: H2H calculation completed:', {
      teams: sortedTeams.map(t => t.name),
      h2hResults: Object.entries(h2hResults).map(([teamId, result]) => ({
        teamId,
        teamName: teams.find(t => (t.__id__ || t.id.toString()) === teamId)?.name,
        h2hPoints: result.points,
        h2hGD: result.goalDifference,
        h2hGF: result.goalsFor
      }))
    });

    return sortedTeams;

  } catch (error) {
    console.error('❌ HeadToHeadService: Error in H2H calculation:', error);
    return teams.sort((a, b) => a.name.localeCompare(b.name)); // Fall back to alphabetical
  }
};


import { supabase } from '@/integrations/supabase/client';

interface SimpleTeam {
  id: number;
  name: string;
  played: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
}

export const updateTeamStats = async (
  homeTeam: SimpleTeam, 
  awayTeam: SimpleTeam, 
  homeScore: number, 
  awayScore: number, 
  currentFixture: any
): Promise<void> => {
  console.log('🔄 TeamStatsService: Starting team stats update:', {
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    homeScore,
    awayScore,
    fixtureStatus: currentFixture.status
  });

  // Calculate match results
  const homeWin = homeScore > awayScore;
  const awayWin = awayScore > homeScore;
  const draw = homeScore === awayScore;

  // Only update stats if this is a new result (not already completed)
  const isNewResult = currentFixture.status !== 'completed' || 
                     currentFixture.home_score !== homeScore || 
                     currentFixture.away_score !== awayScore;

  if (!isNewResult) {
    console.log('📊 TeamStatsService: Match result unchanged, skipping stats update');
    return;
  }

  // Calculate stat changes for home team
  const homeStatsUpdate = {
    played: homeTeam.played + (currentFixture.status !== 'completed' ? 1 : 0),
    won: homeTeam.won + (homeWin ? 1 : 0),
    drawn: homeTeam.drawn + (draw ? 1 : 0),
    lost: homeTeam.lost + (awayWin ? 1 : 0),
    goals_for: homeTeam.goals_for + homeScore - (currentFixture.home_score || 0),
    goals_against: homeTeam.goals_against + awayScore - (currentFixture.away_score || 0),
  };
  homeStatsUpdate.goal_difference = homeStatsUpdate.goals_for - homeStatsUpdate.goals_against;
  homeStatsUpdate.points = homeTeam.points + (homeWin ? 3 : draw ? 1 : 0) - 
                          (currentFixture.status === 'completed' ? 
                            (currentFixture.home_score > currentFixture.away_score ? 3 : 
                             currentFixture.home_score === currentFixture.away_score ? 1 : 0) : 0);

  // Calculate stat changes for away team
  const awayStatsUpdate = {
    played: awayTeam.played + (currentFixture.status !== 'completed' ? 1 : 0),
    won: awayTeam.won + (awayWin ? 1 : 0),
    drawn: awayTeam.drawn + (draw ? 1 : 0),
    lost: awayTeam.lost + (homeWin ? 1 : 0),
    goals_for: awayTeam.goals_for + awayScore - (currentFixture.away_score || 0),
    goals_against: awayTeam.goals_against + homeScore - (currentFixture.home_score || 0),
  };
  awayStatsUpdate.goal_difference = awayStatsUpdate.goals_for - awayStatsUpdate.goals_against;
  awayStatsUpdate.points = awayTeam.points + (awayWin ? 3 : draw ? 1 : 0) - 
                          (currentFixture.status === 'completed' ? 
                            (currentFixture.away_score > currentFixture.home_score ? 3 : 
                             currentFixture.away_score === currentFixture.home_score ? 1 : 0) : 0);

  // Update home team stats
  console.log('🏠 TeamStatsService: Updating home team stats:', homeStatsUpdate);
  const { error: homeError } = await supabase
    .from('teams')
    .update(homeStatsUpdate)
    .eq('__id__', currentFixture.team1);

  if (homeError) {
    console.error('❌ TeamStatsService: Failed to update home team stats:', homeError);
    throw new Error(`Failed to update home team stats: ${homeError.message}`);
  }

  // Update away team stats
  console.log('🚗 TeamStatsService: Updating away team stats:', awayStatsUpdate);
  const { error: awayError } = await supabase
    .from('teams')
    .update(awayStatsUpdate)
    .eq('__id__', currentFixture.team2);

  if (awayError) {
    console.error('❌ TeamStatsService: Failed to update away team stats:', awayError);
    throw new Error(`Failed to update away team stats: ${awayError.message}`);
  }

  console.log('✅ TeamStatsService: Successfully updated both team stats');
};

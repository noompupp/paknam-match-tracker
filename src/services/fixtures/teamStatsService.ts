
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
  const newHomePlayed = homeTeam.played + (currentFixture.status !== 'completed' ? 1 : 0);
  const newHomeWon = homeTeam.won + (homeWin ? 1 : 0);
  const newHomeDrawn = homeTeam.drawn + (draw ? 1 : 0);
  const newHomeLost = homeTeam.lost + (awayWin ? 1 : 0);
  const newHomeGoalsFor = homeTeam.goals_for + homeScore - (currentFixture.home_score || 0);
  const newHomeGoalsAgainst = homeTeam.goals_against + awayScore - (currentFixture.away_score || 0);
  const newHomeGoalDifference = newHomeGoalsFor - newHomeGoalsAgainst;
  const newHomePoints = homeTeam.points + (homeWin ? 3 : draw ? 1 : 0) - 
                       (currentFixture.status === 'completed' ? 
                         (currentFixture.home_score > currentFixture.away_score ? 3 : 
                          currentFixture.home_score === currentFixture.away_score ? 1 : 0) : 0);

  const homeStatsUpdate = {
    played: newHomePlayed,
    won: newHomeWon,
    drawn: newHomeDrawn,
    lost: newHomeLost,
    goals_for: newHomeGoalsFor,
    goals_against: newHomeGoalsAgainst,
    goal_difference: newHomeGoalDifference,
    points: newHomePoints
  };

  // Calculate stat changes for away team
  const newAwayPlayed = awayTeam.played + (currentFixture.status !== 'completed' ? 1 : 0);
  const newAwayWon = awayTeam.won + (awayWin ? 1 : 0);
  const newAwayDrawn = awayTeam.drawn + (draw ? 1 : 0);
  const newAwayLost = awayTeam.lost + (homeWin ? 1 : 0);
  const newAwayGoalsFor = awayTeam.goals_for + awayScore - (currentFixture.away_score || 0);
  const newAwayGoalsAgainst = awayTeam.goals_against + homeScore - (currentFixture.home_score || 0);
  const newAwayGoalDifference = newAwayGoalsFor - newAwayGoalsAgainst;
  const newAwayPoints = awayTeam.points + (awayWin ? 3 : draw ? 1 : 0) - 
                       (currentFixture.status === 'completed' ? 
                         (currentFixture.away_score > currentFixture.home_score ? 3 : 
                          currentFixture.away_score === currentFixture.home_score ? 1 : 0) : 0);

  const awayStatsUpdate = {
    played: newAwayPlayed,
    won: newAwayWon,
    drawn: newAwayDrawn,
    lost: newAwayLost,
    goals_for: newAwayGoalsFor,
    goals_against: newAwayGoalsAgainst,
    goal_difference: newAwayGoalDifference,
    points: newAwayPoints
  };

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

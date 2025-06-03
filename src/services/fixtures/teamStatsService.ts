
import { supabase } from '@/integrations/supabase/client';
import { calculateTeamStatsUpdate } from './statsCalculator';

interface SimpleTeam {
  id: number;
  name: string;
  played: number;
  points: number;
}

export const updateTeamStats = async (
  homeTeam: SimpleTeam,
  awayTeam: SimpleTeam,
  homeScore: number,
  awayScore: number,
  currentFixture: any
): Promise<void> => {
  console.log('📊 TeamStatsService: Starting team stats update...');

  // Check if this is an update to an already completed match
  const isMatchAlreadyCompleted = currentFixture.status === 'completed' && 
    currentFixture.home_score !== null && 
    currentFixture.away_score !== null;

  // Determine match result
  const isHomeWin = homeScore > awayScore;
  const isAwayWin = awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  // Update team stats if this is the first time the match is being completed or if we're changing the result
  if (!isMatchAlreadyCompleted || 
      currentFixture.home_score !== homeScore || 
      currentFixture.away_score !== awayScore) {
    
    // If match was already completed, we need to reverse the previous stats first
    if (isMatchAlreadyCompleted) {
      await reversePreviousStats(homeTeam, awayTeam, currentFixture);
    }

    // Now apply the new stats
    await applyNewStats(homeTeam, awayTeam, homeScore, awayScore, isHomeWin, isAwayWin, isDraw);
  } else {
    console.log('ℹ️ TeamStatsService: No team stats update needed - match result unchanged');
  }
};

const reversePreviousStats = async (
  homeTeam: SimpleTeam,
  awayTeam: SimpleTeam,
  currentFixture: any
): Promise<void> => {
  console.log('🔄 TeamStatsService: Reversing previous match stats...');
  
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
    console.error('❌ TeamStatsService: Error reversing home team stats:', homeReverseError);
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
    console.error('❌ TeamStatsService: Error reversing away team stats:', awayReverseError);
    throw new Error(`Failed to reverse away team stats: ${awayReverseError.message}`);
  }
};

const applyNewStats = async (
  homeTeam: SimpleTeam,
  awayTeam: SimpleTeam,
  homeScore: number,
  awayScore: number,
  isHomeWin: boolean,
  isAwayWin: boolean,
  isDraw: boolean
): Promise<void> => {
  console.log('📊 TeamStatsService: Applying new team stats...');

  // Update home team stats
  const homeTeamStats = calculateTeamStatsUpdate(
    homeTeam,
    homeScore,
    awayScore,
    isHomeWin,
    isDraw,
    isAwayWin
  );

  console.log('🏠 TeamStatsService: Updating home team stats:', homeTeamStats);

  const { error: homeStatsError } = await supabase
    .from('teams')
    .update(homeTeamStats)
    .eq('id', homeTeam.id);

  if (homeStatsError) {
    console.error('❌ TeamStatsService: Error updating home team stats:', homeStatsError);
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

  console.log('🏃 TeamStatsService: Updating away team stats:', awayTeamStats);

  const { error: awayStatsError } = await supabase
    .from('teams')
    .update(awayTeamStats)
    .eq('id', awayTeam.id);

  if (awayStatsError) {
    console.error('❌ TeamStatsService: Error updating away team stats:', awayStatsError);
    throw new Error(`Failed to update away team stats: ${awayStatsError.message}`);
  }

  console.log('✅ TeamStatsService: Team stats updated successfully');
};

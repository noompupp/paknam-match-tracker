import { supabase } from '@/integrations/supabase/client';
import { playerTimeTrackingService } from './playerTimeTrackingService';

interface MatchResetResult {
  success: boolean;
  message: string;
  details: {
    eventsRemoved: number;
    cardsRemoved: number;
    playerTimesRemoved: number;
    scoreReset: boolean;
    statusReset: boolean;
  };
  errors: string[];
}

export const matchResetService = {
  async resetMatchData(fixtureId: number): Promise<MatchResetResult> {
    console.log('🔄 MatchResetService: Starting comprehensive match reset for fixture:', fixtureId);
    
    const result: MatchResetResult = {
      success: false,
      message: '',
      details: {
        eventsRemoved: 0,
        cardsRemoved: 0,
        playerTimesRemoved: 0,
        scoreReset: false,
        statusReset: false
      },
      errors: []
    };

    try {
      // Validate fixture exists and get current state
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('id, home_team_id, away_team_id, status, home_score, away_score')
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixture) {
        throw new Error(`Fixture ${fixtureId} not found`);
      }

      console.log('✅ MatchResetService: Fixture found, current state:', {
        status: fixture.status,
        score: `${fixture.home_score || 0}-${fixture.away_score || 0}`
      });

      // 1. Remove all match events
      const { data: deletedEvents, error: eventsError } = await supabase
        .from('match_events')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (eventsError) {
        result.errors.push(`Failed to delete match events: ${eventsError.message}`);
      } else {
        result.details.eventsRemoved = deletedEvents?.length || 0;
        console.log(`✅ MatchResetService: Removed ${result.details.eventsRemoved} match events`);
      }

      // 2. Remove all cards
      const { data: deletedCards, error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (cardsError) {
        result.errors.push(`Failed to delete cards: ${cardsError.message}`);
      } else {
        result.details.cardsRemoved = deletedCards?.length || 0;
        console.log(`✅ MatchResetService: Removed ${result.details.cardsRemoved} cards`);
      }

      // 3. Remove all player time tracking
      try {
        result.details.playerTimesRemoved = await playerTimeTrackingService.deletePlayerTimesForFixture(fixtureId);
        console.log(`✅ MatchResetService: Removed ${result.details.playerTimesRemoved} player time records`);
      } catch (error) {
        result.errors.push(`Failed to delete player times: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // 4. Reset fixture score AND status to scheduled
      const { error: scoreResetError } = await supabase
        .from('fixtures')
        .update({
          home_score: 0,
          away_score: 0,
          status: 'scheduled' // This is crucial - reset status back to scheduled
        })
        .eq('id', fixtureId);

      if (scoreResetError) {
        result.errors.push(`Failed to reset fixture: ${scoreResetError.message}`);
      } else {
        result.details.scoreReset = true;
        result.details.statusReset = true;
        console.log('✅ MatchResetService: Fixture score reset to 0-0 and status reset to scheduled');
      }

      // 5. Reset team statistics if the match was previously completed
      if (fixture.status === 'completed') {
        await this.resetTeamStatsFromMatch(fixtureId, fixture);
      }

      // 6. Reset player stats that were affected by this match
      await this.resetPlayerStatsFromMatch(fixtureId);

      // Determine overall success
      result.success = result.errors.length === 0;
      
      if (result.success) {
        result.message = `Match data successfully reset. Removed ${result.details.eventsRemoved} events, ${result.details.cardsRemoved} cards, ${result.details.playerTimesRemoved} player time records. Score reset to 0-0 and status changed to scheduled.`;
      } else {
        result.message = `Match reset completed with ${result.errors.length} errors. Some data may not have been reset properly.`;
      }

      console.log('✅ MatchResetService: Match reset completed:', result);
      return result;

    } catch (error) {
      console.error('❌ MatchResetService: Critical error during match reset:', error);
      result.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.message = 'Match reset failed due to critical error';
      return result;
    }
  },

  async resetTeamStatsFromMatch(fixtureId: number, fixture: any): Promise<void> {
    console.log('📊 MatchResetService: Resetting team stats for completed match:', fixtureId);
    
    try {
      const homeScore = fixture.home_score || 0;
      const awayScore = fixture.away_score || 0;
      
      // Get both teams
      const { data: homeTeam, error: homeError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', fixture.home_team_id)
        .single();

      const { data: awayTeam, error: awayError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', fixture.away_team_id)
        .single();

      if (homeError || awayError || !homeTeam || !awayTeam) {
        console.error('❌ MatchResetService: Could not find teams for stats reset');
        return;
      }

      // Calculate stat adjustments (reverse the match impact)
      const homeWin = homeScore > awayScore;
      const awayWin = awayScore > homeScore;
      const draw = homeScore === awayScore;

      // Home team adjustments
      const homeGoalsFor = Math.max(0, homeTeam.goals_for - homeScore);
      const homeGoalsAgainst = Math.max(0, homeTeam.goals_against - awayScore);
      const homeAdjustments = {
        played: Math.max(0, homeTeam.played - 1),
        won: Math.max(0, homeTeam.won - (homeWin ? 1 : 0)),
        drawn: Math.max(0, homeTeam.drawn - (draw ? 1 : 0)),
        lost: Math.max(0, homeTeam.lost - (awayWin ? 1 : 0)),
        goals_for: homeGoalsFor,
        goals_against: homeGoalsAgainst,
        goal_difference: homeGoalsFor - homeGoalsAgainst,
        points: Math.max(0, homeTeam.points - (homeWin ? 3 : draw ? 1 : 0))
      };

      // Away team adjustments
      const awayGoalsFor = Math.max(0, awayTeam.goals_for - awayScore);
      const awayGoalsAgainst = Math.max(0, awayTeam.goals_against - homeScore);
      const awayAdjustments = {
        played: Math.max(0, awayTeam.played - 1),
        won: Math.max(0, awayTeam.won - (awayWin ? 1 : 0)),
        drawn: Math.max(0, awayTeam.drawn - (draw ? 1 : 0)),
        lost: Math.max(0, awayTeam.lost - (homeWin ? 1 : 0)),
        goals_for: awayGoalsFor,
        goals_against: awayGoalsAgainst,
        goal_difference: awayGoalsFor - awayGoalsAgainst,
        points: Math.max(0, awayTeam.points - (awayWin ? 3 : draw ? 1 : 0))
      };

      // Update home team
      await supabase
        .from('teams')
        .update(homeAdjustments)
        .eq('id', fixture.home_team_id);

      // Update away team
      await supabase
        .from('teams')
        .update(awayAdjustments)
        .eq('id', fixture.away_team_id);

      console.log('✅ MatchResetService: Team stats successfully reset');
      
    } catch (error) {
      console.error('❌ MatchResetService: Error resetting team stats:', error);
    }
  },

  async resetPlayerStatsFromMatch(fixtureId: number): Promise<void> {
    console.log('📊 MatchResetService: Resetting player stats affected by match:', fixtureId);
    
    try {
      // Get all goal and assist events for this match
      const { data: events, error } = await supabase
        .from('match_events')
        .select('player_name, event_type')
        .eq('fixture_id', fixtureId)
        .in('event_type', ['goal', 'assist']);

      if (error || !events) {
        console.log('ℹ️ MatchResetService: No events found to reset player stats');
        return;
      }

      // Group events by player
      const playerStatsToReset = new Map();
      
      events.forEach(event => {
        if (!playerStatsToReset.has(event.player_name)) {
          playerStatsToReset.set(event.player_name, { goals: 0, assists: 0 });
        }
        
        if (event.event_type === 'goal') {
          playerStatsToReset.get(event.player_name).goals++;
        } else if (event.event_type === 'assist') {
          playerStatsToReset.get(event.player_name).assists++;
        }
      });

      // Reset each player's stats
      for (const [playerName, stats] of playerStatsToReset) {
        const { data: player, error: playerError } = await supabase
          .from('members')
          .select('id, goals, assists')
          .ilike('name', playerName)
          .single();

        if (playerError || !player) {
          console.warn(`⚠️ MatchResetService: Player ${playerName} not found for stats reset`);
          continue;
        }

        const newGoals = Math.max(0, (player.goals || 0) - stats.goals);
        const newAssists = Math.max(0, (player.assists || 0) - stats.assists);

        await supabase
          .from('members')
          .update({
            goals: newGoals,
            assists: newAssists
          })
          .eq('id', player.id);

        console.log(`✅ MatchResetService: Reset stats for ${playerName}: -${stats.goals} goals, -${stats.assists} assists`);
      }
      
      console.log('✅ MatchResetService: Player stats reset completed');
      
    } catch (error) {
      console.error('❌ MatchResetService: Error resetting player stats:', error);
    }
  },

  async confirmResetSafety(fixtureId: number): Promise<{ canReset: boolean; warnings: string[]; info: any }> {
    console.log('🔍 MatchResetService: Checking reset safety for fixture:', fixtureId);
    
    const warnings: string[] = [];
    const info: any = {};

    try {
      // Check what data will be lost
      const { data: events } = await supabase
        .from('match_events')
        .select('event_type')
        .eq('fixture_id', fixtureId);

      const { data: cards } = await supabase
        .from('cards')
        .select('id')
        .eq('fixture_id', fixtureId);

      const { data: playerTimes } = await supabase
        .from('player_time_tracking')
        .select('id')
        .eq('fixture_id', fixtureId);

      info.eventsToDelete = events?.length || 0;
      info.cardsToDelete = cards?.length || 0;
      info.playerTimesToDelete = playerTimes?.length || 0;

      // Generate warnings
      if (info.eventsToDelete > 0) {
        warnings.push(`${info.eventsToDelete} match events will be permanently deleted`);
      }
      if (info.cardsToDelete > 0) {
        warnings.push(`${info.cardsToDelete} cards will be permanently deleted`);
      }
      if (info.playerTimesToDelete > 0) {
        warnings.push(`${info.playerTimesToDelete} player time records will be permanently deleted`);
      }

      warnings.push('Team statistics will be adjusted to remove this match impact');
      warnings.push('Player statistics will be recalculated');
      warnings.push('Match status will be reset to "scheduled"');
      warnings.push('This action cannot be undone');

      return {
        canReset: true,
        warnings,
        info
      };

    } catch (error) {
      console.error('❌ MatchResetService: Error checking reset safety:', error);
      return {
        canReset: false,
        warnings: ['Error checking reset safety - reset not recommended'],
        info: {}
      };
    }
  }
};

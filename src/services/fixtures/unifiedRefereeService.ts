import { supabase } from '@/integrations/supabase/client';
import { updateFixtureScore } from './scoreUpdateService';
import { assignGoalToPlayer } from './goalAssignmentService';
import { cardsApi } from '@/services/cardsApi';
import { playerTimeTrackingService } from './playerTimeTrackingService';
import { enhancedDuplicatePreventionService } from './enhancedDuplicatePreventionService';
import { enhancedMemberStatsService } from '@/services/enhancedMemberStatsService';
import { operationLoggingService } from '@/services/operationLoggingService';

export interface UnifiedSaveResult {
  success: boolean;
  message: string;
  errors: string[];
  data?: {
    scoreUpdated: boolean;
    goalsAssigned: number;
    cardsCreated: number;
    playerTimesUpdated: number;
  };
}

export interface MatchDataToSave {
  fixtureId: number;
  homeScore: number;
  awayScore: number;
  goals: Array<{
    playerId: number;
    playerName: string;
    team: string;
    type: 'goal' | 'assist';
    time: number;
  }>;
  cards: Array<{
    playerId: number;
    playerName: string;
    team: string;
    type: 'yellow' | 'red';
    time: number;
  }>;
  playerTimes: Array<{
    playerId: number;
    playerName: string;
    team: string;
    totalTime: number;
    periods: Array<{
      start_time: number;
      end_time: number;
      duration: number;
    }>;
  }>;
  homeTeam: { id: string; name: string }; // Already correct as string
  awayTeam: { id: string; name: string }; // Already correct as string
}

export const unifiedRefereeService = {
  async saveCompleteMatchData(matchData: MatchDataToSave): Promise<UnifiedSaveResult> {
    console.log('💾 UnifiedRefereeService: Starting complete match data save...', {
      fixture: matchData.fixtureId,
      homeScore: matchData.homeScore,
      awayScore: matchData.awayScore,
      goals: matchData.goals.length,
      cards: matchData.cards.length,
      playerTimes: matchData.playerTimes.length
    });

    // Log the operation start
    await operationLoggingService.logOperation({
      operation_type: 'referee_match_save_start',
      table_name: 'fixtures',
      record_id: matchData.fixtureId.toString(),
      payload: {
        fixture_id: matchData.fixtureId,
        goals_count: matchData.goals.length,
        cards_count: matchData.cards.length,
        player_times_count: matchData.playerTimes.length
      },
      success: true
    });

    const errors: string[] = [];
    let scoreUpdated = false;
    let goalsAssigned = 0;
    let cardsCreated = 0;
    let playerTimesUpdated = 0;

    try {
      // First, cleanup any existing duplicates
      console.log('🧹 Cleaning up existing duplicates before save...');
      await enhancedDuplicatePreventionService.cleanupAllDuplicateEvents();

      // 1. Update fixture score
      try {
        console.log('📊 Updating fixture score...');
        await updateFixtureScore(matchData.fixtureId, matchData.homeScore, matchData.awayScore);
        scoreUpdated = true;
        console.log('✅ Fixture score updated successfully');
        
        await operationLoggingService.logOperation({
          operation_type: 'fixture_score_update',
          table_name: 'fixtures',
          record_id: matchData.fixtureId.toString(),
          payload: { home_score: matchData.homeScore, away_score: matchData.awayScore },
          success: true
        });
      } catch (error) {
        const errorMsg = `Failed to update score: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
        
        await operationLoggingService.logOperation({
          operation_type: 'fixture_score_update',
          table_name: 'fixtures',
          record_id: matchData.fixtureId.toString(),
          payload: { home_score: matchData.homeScore, away_score: matchData.awayScore },
          error_message: errorMsg,
          success: false
        });
      }

      // 2. Assign goals and assists with duplicate prevention and enhanced member stats update
      const memberStatsUpdates = new Map<number, { goals: number; assists: number }>();
      
      for (const goal of matchData.goals) {
        try {
          console.log(`⚽ Assigning ${goal.type} to ${goal.playerName}...`);
          
          // Resolve team ID to string format
          const teamId = goal.team === matchData.homeTeam.name ? matchData.homeTeam.id : matchData.awayTeam.id;
          const canCreate = await enhancedDuplicatePreventionService.preventDuplicateGoalEvent(
            matchData.fixtureId,
            teamId,
            goal.playerName
          );

          if (canCreate) {
            await assignGoalToPlayer({
              fixtureId: matchData.fixtureId,
              playerId: goal.playerId,
              playerName: goal.playerName,
              teamId,
              eventTime: goal.time,
              type: goal.type
            });
            goalsAssigned++;
            
            // Track member stats updates
            if (!memberStatsUpdates.has(goal.playerId)) {
              memberStatsUpdates.set(goal.playerId, { goals: 0, assists: 0 });
            }
            const stats = memberStatsUpdates.get(goal.playerId)!;
            if (goal.type === 'goal') {
              stats.goals += 1;
            } else if (goal.type === 'assist') {
              stats.assists += 1;
            }
            
            console.log(`✅ ${goal.type} assigned to ${goal.playerName}`);
          } else {
            console.log(`⚠️ Skipped duplicate ${goal.type} for ${goal.playerName}`);
          }
        } catch (error) {
          const errorMsg = `Failed to assign ${goal.type} to ${goal.playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // Update member stats using the enhanced service
      for (const [playerId, stats] of memberStatsUpdates) {
        try {
          const result = await enhancedMemberStatsService.updateMemberStats({
            memberId: playerId,
            goals: stats.goals > 0 ? stats.goals : undefined,
            assists: stats.assists > 0 ? stats.assists : undefined
          });
          
          if (!result.success) {
            errors.push(`Failed to update stats for player ${playerId}: ${result.message}`);
          } else {
            console.log(`✅ Enhanced stats update for player ${playerId}:`, stats);
          }
        } catch (error) {
          const errorMsg = `Critical error updating stats for player ${playerId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // 3. Create cards with duplicate prevention
      for (const card of matchData.cards) {
        try {
          console.log(`🟨 Creating ${card.type} card for ${card.playerName}...`);
          
          const teamId = card.team === matchData.homeTeam.name ? matchData.homeTeam.id : matchData.awayTeam.id;
          
          await cardsApi.create({
            fixture_id: matchData.fixtureId,
            player_id: card.playerId,
            player_name: card.playerName,
            team_id: teamId,
            card_type: card.type,
            event_time: card.time,
            description: `${card.type} card for ${card.playerName}`
          });
          cardsCreated++;
          console.log(`✅ ${card.type} card created for ${card.playerName}`);
        } catch (error) {
          const errorMsg = `Failed to create ${card.type} card for ${card.playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // 4. Save player time tracking data
      for (const playerTime of matchData.playerTimes) {
        try {
          console.log(`⏱️ Saving time data for ${playerTime.playerName}...`);
          
          const teamId = playerTime.team === matchData.homeTeam.name ? matchData.homeTeam.id : matchData.awayTeam.id;
          
          await playerTimeTrackingService.savePlayerTime({
            fixture_id: matchData.fixtureId,
            player_id: playerTime.playerId,
            player_name: playerTime.playerName,
            team_id: parseInt(teamId) || 0,
            total_minutes: playerTime.totalTime,
            periods: playerTime.periods
          });
          playerTimesUpdated++;
          console.log(`✅ Time data saved for ${playerTime.playerName}`);
        } catch (error) {
          const errorMsg = `Failed to save time data for ${playerTime.playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // Final cleanup of any duplicates that might have been created
      console.log('🧹 Final duplicate cleanup...');
      await enhancedDuplicatePreventionService.cleanupAllDuplicateEvents();

      const success = errors.length === 0;
      const message = success 
        ? `Match data saved successfully: Score updated, ${goalsAssigned} goals/assists assigned, ${cardsCreated} cards created, ${playerTimesUpdated} player times saved`
        : `Match data partially saved with ${errors.length} errors`;

      // Log the final result
      await operationLoggingService.logOperation({
        operation_type: 'referee_match_save_complete',
        table_name: 'fixtures',
        record_id: matchData.fixtureId.toString(),
        payload: {
          fixture_id: matchData.fixtureId,
          total_errors: errors.length
        },
        result: {
          score_updated: scoreUpdated,
          goals_assigned: goalsAssigned,
          cards_created: cardsCreated,
          player_times_updated: playerTimesUpdated
        },
        error_message: errors.length > 0 ? errors.join('; ') : null,
        success
      });

      console.log(success ? '✅' : '⚠️', 'UnifiedRefereeService save completed:', {
        success,
        scoreUpdated,
        goalsAssigned,
        cardsCreated,
        playerTimesUpdated,
        errorsCount: errors.length
      });

      return {
        success,
        message,
        errors,
        data: {
          scoreUpdated,
          goalsAssigned,
          cardsCreated,
          playerTimesUpdated
        }
      };

    } catch (error) {
      console.error('❌ UnifiedRefereeService: Critical error during save:', error);
      
      await operationLoggingService.logOperation({
        operation_type: 'referee_match_save_critical_error',
        table_name: 'fixtures',
        record_id: matchData.fixtureId.toString(),
        error_message: error instanceof Error ? error.message : 'Unknown critical error',
        success: false
      });
      
      return {
        success: false,
        message: 'Critical error during match data save',
        errors: [error instanceof Error ? error.message : 'Unknown critical error']
      };
    }
  },

  async validateMatchData(matchData: MatchDataToSave): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate fixture exists
    if (!matchData.fixtureId || matchData.fixtureId <= 0) {
      errors.push('Invalid fixture ID');
    }

    // Validate scores
    if (matchData.homeScore < 0 || matchData.awayScore < 0) {
      errors.push('Scores cannot be negative');
    }

    // Validate team data
    if (!matchData.homeTeam.id || !matchData.homeTeam.name || !matchData.awayTeam.id || !matchData.awayTeam.name) {
      errors.push('Invalid team data - missing team IDs or names');
    }

    // Validate goals data
    for (const goal of matchData.goals) {
      if (!goal.playerId || !goal.playerName || !goal.team || !['goal', 'assist'].includes(goal.type)) {
        errors.push(`Invalid goal data for ${goal.playerName || 'unknown player'}`);
      }
    }

    // Validate cards data
    for (const card of matchData.cards) {
      if (!card.playerId || !card.playerName || !card.team || !['yellow', 'red'].includes(card.type)) {
        errors.push(`Invalid card data for ${card.playerName || 'unknown player'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

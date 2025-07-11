import { supabase } from '@/integrations/supabase/client';
import { updateFixtureScore } from './scoreUpdateService';
import { assignGoalToPlayer } from './simplifiedGoalAssignmentService';
import { enhancedOwnGoalService } from './enhancedOwnGoalService';
import { cardsApi } from '@/services/cardsApi';
import { playerTimeTrackingService } from './playerTimeTrackingService';
import { enhancedDuplicatePreventionService } from './enhancedDuplicatePreventionService';
import { enhancedMemberStatsService } from '@/services/enhancedMemberStatsService';
import { matchParticipationService } from './matchParticipationService';
import { operationLoggingService } from '@/services/operationLoggingService';
import { inputValidationService } from '@/services/security/inputValidationService';
import { securityMonitoringService } from '@/services/security/securityMonitoringService';
import { realTimeScoreService } from './realTimeScoreService';

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
    isOwnGoal?: boolean;
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
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
}

export const unifiedRefereeService = {
  async saveCompleteMatchData(matchData: MatchDataToSave): Promise<UnifiedSaveResult> {
    console.log('💾 UnifiedRefereeService: Starting match data save with real-time score sync...', {
      fixture: matchData.fixtureId,
      homeScore: matchData.homeScore,
      awayScore: matchData.awayScore,
      goals: matchData.goals.length,
      ownGoals: matchData.goals.filter(g => g.isOwnGoal).length,
      cards: matchData.cards.length,
      playerTimes: matchData.playerTimes.length
    });

    // Security validation first
    const validationResult = await this.validateMatchData(matchData);
    if (!validationResult.isValid) {
      await securityMonitoringService.logSuspiciousActivity(
        'system',
        'Invalid match data submission',
        { errors: validationResult.errors, matchData }
      );
      return {
        success: false,
        message: 'Match data validation failed',
        errors: validationResult.errors
      };
    }

    // Log the operation start
    await operationLoggingService.logOperation({
      operation_type: 'referee_match_save_start',
      table_name: 'fixtures',
      record_id: matchData.fixtureId.toString(),
      payload: {
        fixture_id: matchData.fixtureId,
        goals_count: matchData.goals.length,
        own_goals_count: matchData.goals.filter(g => g.isOwnGoal).length,
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
    let matchParticipationUpdated = false;

    try {
      // First, cleanup any existing duplicates
      console.log('🧹 Cleaning up existing duplicates before save...');
      await enhancedDuplicatePreventionService.cleanupAllDuplicateEvents();

      // 1. Process goals with real-time score updates
      const memberStatsUpdates = new Map<number, { goals: number; assists: number }>();
      
      for (const goal of matchData.goals) {
        try {
          console.log(`⚽ Processing ${goal.type} for ${goal.playerName} (Own Goal: ${goal.isOwnGoal})...`);
          
          // Validate player name
          const playerValidation = await inputValidationService.validatePlayerName(goal.playerName);
          if (!playerValidation.isValid) {
            throw new Error(`Invalid player name: ${playerValidation.error}`);
          }
          
          // Resolve team ID to string format
          const teamId = goal.team === matchData.homeTeam.name ? matchData.homeTeam.id : matchData.awayTeam.id;
          
          // Use enhanced own goal service for own goals
          if (goal.type === 'goal' && goal.isOwnGoal) {
            console.log('🥅 Processing own goal with enhanced service...');
            
            const ownGoalResult = await enhancedOwnGoalService.addOwnGoal({
              fixtureId: matchData.fixtureId,
              playerId: goal.playerId,
              playerName: playerValidation.sanitizedValue,
              playerTeamId: teamId,
              playerTeamName: goal.team,
              eventTime: goal.time,
              homeTeam: matchData.homeTeam,
              awayTeam: matchData.awayTeam
            });
            
            if (ownGoalResult.success) {
              goalsAssigned++;
              console.log(`✅ Own goal processed successfully for ${goal.playerName}`);
            } else {
              throw new Error(ownGoalResult.error || 'Failed to process own goal');
            }
          } else {
            // Regular goals and assists
            const canCreate = await enhancedDuplicatePreventionService.preventDuplicateGoalEvent(
              matchData.fixtureId,
              teamId,
              goal.playerName
            );

            if (canCreate) {
              await assignGoalToPlayer({
                fixtureId: matchData.fixtureId,
                playerId: goal.playerId,
                playerName: playerValidation.sanitizedValue,
                teamId,
                eventTime: goal.time,
                type: goal.type,
                isOwnGoal: false
              });
              goalsAssigned++;
              
              // Track member stats updates ONLY for regular goals/assists
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
          }
        } catch (error) {
          const errorMsg = `Failed to assign ${goal.type} to ${goal.playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // Trigger real-time score update after processing all goals
      if (goalsAssigned > 0) {
        try {
          console.log('🔄 Triggering real-time score update after goal processing...');
          const scoreResult = await realTimeScoreService.updateFixtureScoreRealTime(matchData.fixtureId);
          
          if (scoreResult.success) {
            scoreUpdated = true;
            console.log(`✅ Real-time score updated to ${scoreResult.homeScore}-${scoreResult.awayScore}`);
            
            await operationLoggingService.logOperation({
              operation_type: 'real_time_score_update',
              table_name: 'fixtures',
              record_id: matchData.fixtureId.toString(),
              payload: { home_score: scoreResult.homeScore, away_score: scoreResult.awayScore },
              success: true
            });
          } else {
            throw new Error(scoreResult.error || 'Real-time score update failed');
          }
        } catch (error) {
          const errorMsg = `Failed to update score in real-time: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // Update member stats using the enhanced service (SKIP own goal scorers)
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

      // 2. Create cards with validation and duplicate prevention
      for (const card of matchData.cards) {
        try {
          console.log(`🟨 Creating ${card.type} card for ${card.playerName}...`);
          
          // Validate player name
          const playerValidation = await inputValidationService.validatePlayerName(card.playerName);
          if (!playerValidation.isValid) {
            throw new Error(`Invalid player name: ${playerValidation.error}`);
          }
          
          const teamId = card.team === matchData.homeTeam.name ? matchData.homeTeam.id : matchData.awayTeam.id;
          
          await cardsApi.create({
            fixture_id: matchData.fixtureId,
            player_id: card.playerId,
            player_name: playerValidation.sanitizedValue,
            team_id: teamId,
            card_type: card.type,
            event_time: card.time,
            description: `${card.type} card for ${playerValidation.sanitizedValue}`
          });
          cardsCreated++;
          console.log(`✅ ${card.type} card created for ${card.playerName}`);
        } catch (error) {
          const errorMsg = `Failed to create ${card.type} card for ${card.playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // 3. Save player time tracking data with validation
      for (const playerTime of matchData.playerTimes) {
        try {
          console.log(`⏱️ Saving time data for ${playerTime.playerName}...`);
          
          // Validate player name
          const playerValidation = await inputValidationService.validatePlayerName(playerTime.playerName);
          if (!playerValidation.isValid) {
            throw new Error(`Invalid player name: ${playerValidation.error}`);
          }
          
          // Validate time data
          const timeValidation = await inputValidationService.validateInteger(playerTime.totalTime, 0, 7200); // Max 2 hours
          if (!timeValidation.isValid) {
            throw new Error(`Invalid time data: ${timeValidation.error}`);
          }
          
          const teamId = playerTime.team === matchData.homeTeam.name ? matchData.homeTeam.id : matchData.awayTeam.id;
          
          await playerTimeTrackingService.savePlayerTime({
            fixture_id: matchData.fixtureId,
            player_id: playerTime.playerId,
            player_name: playerValidation.sanitizedValue,
            team_id: parseInt(teamId) || 0,
            total_minutes: timeValidation.sanitizedValue,
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

      // 4. Update match participation based on actual playtime
      if (playerTimesUpdated > 0) {
        try {
          console.log('📊 Updating match participation for players with playtime...');
          const participationResult = await matchParticipationService.updateMatchParticipation(matchData.fixtureId);
          
          if (participationResult.success) {
            matchParticipationUpdated = true;
            console.log(`✅ Match participation updated for ${participationResult.playersUpdated} players`);
            
            await operationLoggingService.logOperation({
              operation_type: 'match_participation_update',
              table_name: 'members',
              record_id: matchData.fixtureId.toString(),
              payload: { fixture_id: matchData.fixtureId, players_updated: participationResult.playersUpdated },
              success: true
            });
          } else {
            const errorMsg = `Failed to update match participation: ${participationResult.message}`;
            errors.push(errorMsg);
            console.error('❌', errorMsg);
          }
        } catch (error) {
          const errorMsg = `Critical error updating match participation: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      // Final cleanup of any duplicates that might have been created
      console.log('🧹 Final duplicate cleanup...');
      await enhancedDuplicatePreventionService.cleanupAllDuplicateEvents();

      const success = errors.length === 0;
      const message = success 
        ? `Match data saved successfully with real-time score sync: Score updated, ${goalsAssigned} goals/assists assigned, ${cardsCreated} cards created, ${playerTimesUpdated} player times saved, ${matchParticipationUpdated ? 'match participation updated' : 'no participation update needed'}`
        : `Match data partially saved with ${errors.length} errors`;

      // Log the final result with enhanced tracking
      await operationLoggingService.logOperation({
        operation_type: 'referee_match_save_complete',
        table_name: 'fixtures',
        record_id: matchData.fixtureId.toString(),
        payload: {
          fixture_id: matchData.fixtureId,
          total_errors: errors.length,
          own_goals_processed: matchData.goals.filter(g => g.isOwnGoal).length,
          match_participation_updated: matchParticipationUpdated,
          real_time_score_updated: scoreUpdated
        },
        result: {
          score_updated: scoreUpdated,
          goals_assigned: goalsAssigned,
          cards_created: cardsCreated,
          player_times_updated: playerTimesUpdated,
          match_participation_updated: matchParticipationUpdated
        },
        error_message: errors.length > 0 ? errors.join('; ') : null,
        success
      });

      if (errors.length > 0) {
        await securityMonitoringService.logSecurityEvent({
          type: 'data_access',
          severity: 'medium',
          description: `Match save completed with ${errors.length} errors`,
          metadata: { fixtureId: matchData.fixtureId, errors }
        });
      }

      console.log(success ? '✅' : '⚠️', 'UnifiedRefereeService save completed with real-time score sync:', {
        success,
        scoreUpdated,
        goalsAssigned,
        cardsCreated,
        playerTimesUpdated,
        matchParticipationUpdated,
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

      await securityMonitoringService.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        description: 'Critical error during match save operation',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error', fixtureId: matchData.fixtureId }
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
    const scoreValidation = await inputValidationService.validateFixtureScore(
      matchData.homeScore, 
      matchData.awayScore
    );
    if (!scoreValidation.isValid) {
      errors.push(scoreValidation.error || 'Invalid scores');
    }

    // Validate team data
    if (!matchData.homeTeam.id || !matchData.homeTeam.name || !matchData.awayTeam.id || !matchData.awayTeam.name) {
      errors.push('Invalid team data - missing team IDs or names');
    }

    // Validate goals data with security checks and own goal support
    for (const goal of matchData.goals) {
      if (!goal.playerId || !goal.playerName || !goal.team || !['goal', 'assist'].includes(goal.type)) {
        errors.push(`Invalid goal data for ${goal.playerName || 'unknown player'}`);
      }
      
      const playerValidation = await inputValidationService.validatePlayerName(goal.playerName);
      if (!playerValidation.isValid) {
        errors.push(`Invalid player name in goals: ${playerValidation.error}`);
      }
      
      // Validate own goal flag is boolean if present
      if (goal.isOwnGoal !== undefined && typeof goal.isOwnGoal !== 'boolean') {
        errors.push(`Invalid own goal flag for ${goal.playerName}`);
      }
    }

    // Validate cards data with security checks
    for (const card of matchData.cards) {
      if (!card.playerId || !card.playerName || !card.team || !['yellow', 'red'].includes(card.type)) {
        errors.push(`Invalid card data for ${card.playerName || 'unknown player'}`);
      }
      
      const playerValidation = await inputValidationService.validatePlayerName(card.playerName);
      if (!playerValidation.isValid) {
        errors.push(`Invalid player name in cards: ${playerValidation.error}`);
      }
    }

    // Validate player time data
    for (const playerTime of matchData.playerTimes) {
      const playerValidation = await inputValidationService.validatePlayerName(playerTime.playerName);
      if (!playerValidation.isValid) {
        errors.push(`Invalid player name in time tracking: ${playerValidation.error}`);
      }
      
      const timeValidation = await inputValidationService.validateInteger(playerTime.totalTime, 0, 7200);
      if (!timeValidation.isValid) {
        errors.push(`Invalid time data for ${playerTime.playerName}: ${timeValidation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

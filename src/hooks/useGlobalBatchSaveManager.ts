
import { useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMatchStore, MatchGoal, MatchCard, MatchPlayerTime } from '@/stores/useMatchStore';
import { unifiedRefereeService } from '@/services/fixtures/unifiedRefereeService';

interface UseGlobalBatchSaveManagerProps {
  homeTeamData?: { id: string; name: string };
  awayTeamData?: { id: string; name: string };
}

export const useGlobalBatchSaveManager = ({
  homeTeamData,
  awayTeamData
}: UseGlobalBatchSaveManagerProps) => {
  const { toast } = useToast();
  const isSaving = useRef(false);
  
  const {
    fixtureId,
    homeScore,
    awayScore,
    goals,
    cards,
    playerTimes,
    hasUnsavedChanges,
    markAsSaved,
    getUnsavedItemsCount,
    flushBatchedEvents
  } = useMatchStore();

  const transformGoalsToSaveFormat = useCallback((goals: MatchGoal[]) => {
    return goals
      .filter(goal => !goal.synced)
      .map(goal => ({
        playerId: goal.playerId || 0,
        playerName: goal.playerName,
        team: goal.teamName,
        type: goal.type as 'goal' | 'assist',
        time: goal.time,
        isOwnGoal: goal.isOwnGoal || false // CRITICAL FIX: Preserve own goal flag
      }));
  }, []);

  const transformCardsToSaveFormat = useCallback((cards: MatchCard[]) => {
    return cards
      .filter(card => !card.synced)
      .map(card => ({
        playerId: card.playerId,
        playerName: card.playerName,
        team: card.teamName,
        type: card.type as 'yellow' | 'red',
        time: card.time
      }));
  }, []);

  const transformPlayerTimesToSaveFormat = useCallback((playerTimes: MatchPlayerTime[]) => {
    return playerTimes
      .filter(pt => !pt.synced)
      .map(pt => ({
        playerId: pt.playerId,
        playerName: pt.playerName,
        team: pt.teamName,
        totalTime: Math.floor(pt.totalTime / 60), // Convert to minutes
        periods: pt.periods
      }));
  }, []);

  const batchSave = useCallback(async () => {
    if (!fixtureId || isSaving.current || !hasUnsavedChanges) {
      console.log('📤 GlobalBatchSaveManager: Skipping save - no changes or already saving');
      return { success: true, message: 'No changes to save' };
    }

    if (!homeTeamData || !awayTeamData) {
      console.error('❌ GlobalBatchSaveManager: Missing team data');
      toast({
        title: "Save Failed",
        description: "Missing essential team data. Cannot save.",
        variant: "destructive"
      });
      return { success: false, message: 'Missing team data' };
    }

    if (flushBatchedEvents) {
      await flushBatchedEvents();
    }

    isSaving.current = true;

    try {
      console.log('📤 GlobalBatchSaveManager: Starting batch save...', {
        fixtureId,
        homeScore,
        awayScore,
        unsavedGoals: goals.filter(g => !g.synced).length,
        unsavedCards: cards.filter(c => !c.synced).length,
        unsavedPlayerTimes: playerTimes.filter(pt => !pt.synced).length
      });

      toast({
        title: "Saving Match Data...",
        description: "Pushing local changes to the database...",
      });

      const matchData = {
        fixtureId,
        homeScore,
        awayScore,
        goals: transformGoalsToSaveFormat(goals),
        cards: transformCardsToSaveFormat(cards),
        playerTimes: transformPlayerTimesToSaveFormat(playerTimes),
        homeTeam: homeTeamData,
        awayTeam: awayTeamData
      };

      console.log('[MATCH SAVE PAYLOAD]', JSON.stringify(matchData, null, 2));

      const result = await unifiedRefereeService.saveCompleteMatchData(matchData);

      if (result.success) {
        markAsSaved();
        
        toast({
          title: "✅ Match Data Saved!",
          description: result.message,
          variant: "default"
        });

        console.log('✅ GlobalBatchSaveManager: Batch save completed successfully!');
        return { success: true, message: result.message };
      } else {
        toast({
          title: "Save Completed with Issues",
          description: `${result.message}. Errors: ${(result.errors||[]).join(', ')}`,
          variant: "destructive"
        });

        console.warn('[MATCH SAVE FAILURE]', result);
        return { success: false, message: result.message, errors: result.errors };
      }

    } catch (error) {
      console.error('[BATCH SAVE ERROR]', error);
      
      toast({
        title: "Save Failed",
        description: (error && typeof error === "object" && "message" in error) ? (error as any).message : "Failed to save match data. Please try again.",
        variant: "destructive"
      });

      return {
        success: false,
        message: 'Failed to save match data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      isSaving.current = false;
    }
  }, [
    fixtureId,
    homeScore,
    awayScore,
    goals,
    cards,
    playerTimes,
    hasUnsavedChanges,
    homeTeamData,
    awayTeamData,
    transformGoalsToSaveFormat,
    transformCardsToSaveFormat,
    transformPlayerTimesToSaveFormat,
    markAsSaved,
    toast,
    flushBatchedEvents
  ]);

  const autoSave = useCallback(async () => {
    if (hasUnsavedChanges) {
      console.log('🔄 GlobalBatchSaveManager: Auto-save triggered');
      return await batchSave();
    }
    return { success: true, message: 'No changes to auto-save' };
  }, [batchSave, hasUnsavedChanges]);

  return {
    batchSave,
    autoSave,
    isSaving: isSaving.current,
    hasUnsavedChanges,
    unsavedItemsCount: getUnsavedItemsCount ? getUnsavedItemsCount() : { goals: 0, cards: 0, playerTimes: 0 }
  };
};


import { useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { unifiedRefereeService } from '@/services/fixtures/unifiedRefereeService';
import type { LocalMatchState, LocalGoal, LocalCard, LocalPlayerTime } from './localMatchState';

interface UseBatchSaveManagerProps {
  fixtureId?: number;
  localState: LocalMatchState;
  onSaveComplete: () => void;
  homeTeamData?: { id: string; name: string };
  awayTeamData?: { id: string; name: string };
}

export const useBatchSaveManager = ({
  fixtureId,
  localState,
  onSaveComplete,
  homeTeamData,
  awayTeamData
}: UseBatchSaveManagerProps) => {
  const { toast } = useToast();
  const isSaving = useRef(false);

  const transformLocalGoalsToSaveFormat = useCallback((goals: LocalGoal[]) => {
    return goals
      .filter(goal => !goal.synced)
      .map(goal => ({
        playerId: goal.playerId || 0,
        playerName: goal.playerName,
        team: goal.teamName,
        type: goal.type as 'goal' | 'assist',
        time: goal.time
      }));
  }, []);

  const transformLocalCardsToSaveFormat = useCallback((cards: LocalCard[]) => {
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

  const transformLocalPlayerTimesToSaveFormat = useCallback((playerTimes: LocalPlayerTime[]) => {
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
    if (!fixtureId || isSaving.current || !localState.hasUnsavedChanges) {
      console.log('📤 useBatchSaveManager: Skipping save - no changes or already saving');
      return { success: true, message: 'No changes to save' };
    }

    if (!homeTeamData || !awayTeamData) {
      console.error('❌ useBatchSaveManager: Missing team data');
      return { success: false, message: 'Missing team data' };
    }

    isSaving.current = true;

    try {
      console.log('📤 useBatchSaveManager: Starting batch save...', {
        fixtureId,
        homeScore: localState.homeScore,
        awayScore: localState.awayScore,
        unsavedGoals: localState.goals.filter(g => !g.synced).length,
        unsavedCards: localState.cards.filter(c => !c.synced).length,
        unsavedPlayerTimes: localState.playerTimes.filter(pt => !pt.synced).length
      });

      toast({
        title: "Saving Match Data...",
        description: "Pushing local changes to the database",
      });

      const matchData = {
        fixtureId,
        homeScore: localState.homeScore,
        awayScore: localState.awayScore,
        goals: transformLocalGoalsToSaveFormat(localState.goals),
        cards: transformLocalCardsToSaveFormat(localState.cards),
        playerTimes: transformLocalPlayerTimesToSaveFormat(localState.playerTimes),
        homeTeam: homeTeamData,
        awayTeam: awayTeamData
      };

      console.log('📊 useBatchSaveManager: Prepared match data for save:', matchData);

      const result = await unifiedRefereeService.saveCompleteMatchData(matchData);

      if (result.success) {
        onSaveComplete();
        
        toast({
          title: "✅ Match Data Saved!",
          description: result.message,
        });

        console.log('✅ useBatchSaveManager: Batch save completed successfully');
        return { success: true, message: result.message };
      } else {
        toast({
          title: "Save Completed with Issues",
          description: `${result.message}. Errors: ${result.errors.join(', ')}`,
          variant: "destructive"
        });

        console.warn('⚠️ useBatchSaveManager: Batch save completed with errors:', result.errors);
        return { success: false, message: result.message, errors: result.errors };
      }

    } catch (error) {
      console.error('❌ useBatchSaveManager: Batch save failed:', error);
      
      toast({
        title: "Save Failed",
        description: "Failed to save match data. Please try again.",
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
    localState,
    homeTeamData,
    awayTeamData,
    transformLocalGoalsToSaveFormat,
    transformLocalCardsToSaveFormat,
    transformLocalPlayerTimesToSaveFormat,
    onSaveComplete,
    toast
  ]);

  const autoSave = useCallback(async () => {
    if (localState.hasUnsavedChanges) {
      console.log('🔄 useBatchSaveManager: Auto-save triggered');
      return await batchSave();
    }
    return { success: true, message: 'No changes to auto-save' };
  }, [batchSave, localState.hasUnsavedChanges]);

  return {
    batchSave,
    autoSave,
    isSaving: isSaving.current,
    hasUnsavedChanges: localState.hasUnsavedChanges,
    unsavedItemsCount: {
      goals: localState.goals.filter(g => !g.synced).length,
      cards: localState.cards.filter(c => !c.synced).length,
      playerTimes: localState.playerTimes.filter(pt => !pt.synced).length
    }
  };
};

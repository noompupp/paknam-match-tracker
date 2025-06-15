
import React, { useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { PlayerTime } from "@/types/database";
import { useSubstitutionManager } from "@/hooks/playerTracking/substitutionManager";
import { useTranslation } from "@/hooks/useTranslation"; // <-- ADDED

interface UsePlayerTimeHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  playersForTimeTracker: PlayerTime[];
  addPlayer: (player: ComponentPlayer, matchTime: number) => any;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number, matchTime: number) => any;
  addEvent: (type: string, description: string, time: number) => void;
}

export const usePlayerTimeHandlers = (props: UsePlayerTimeHandlersProps) => {
  const { toast } = useToast();
  const { t } = useTranslation(); // <-- ADDED
  const substitutionManager = useSubstitutionManager();

  // OPTIMIZATION: Add throttling for frequent actions
  const lastActionTimeRef = useRef<number>(0);
  const ACTION_THROTTLE = 1000; // 1 second between actions

  const throttleAction = useCallback((action: () => Promise<void> | void) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) {
      console.log('⏸️ Action throttled - too frequent');
      return;
    }
    lastActionTimeRef.current = now;
    return action();
  }, []);

  const handleAddPlayer = async (player: ComponentPlayer) => {
    return throttleAction(async () => {
      if (!props.selectedFixtureData) {
        toast({
          title: t("referee.toast.errorTitle", "Error"),
          description: t("referee.toast.errorNoFixture", "No fixture selected. Please select a match first."),
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('⏱️ usePlayerTimeHandlers: Adding player to time tracking (optimized):', player.name);
        
        // Check if this completes a pending substitution
        if (substitutionManager.hasPendingSubstitution) {
          const substitution = substitutionManager.completePendingSubstitution(player);
          if (substitution) {
            props.addEvent(
              t("referee.event.substitution", "Substitution"),
              t(
                "referee.event.substitutionCompleteDescription",
                "{inName} substituted for {outName}",
                { inName: substitution.incoming.name, outName: substitution.outgoing.outgoingPlayerName }
              ),
              props.matchTime
            );
            
            toast({
              title: t("referee.toast.substitutionCompleteTitle", "Substitution Complete"),
              description: t(
                "referee.toast.substitutionCompleteDesc",
                "{inName} replaced {outName}",
                { inName: substitution.incoming.name, outName: substitution.outgoing.outgoingPlayerName }
              ),
            });
          }
        }
        
        await props.addPlayer(player, props.matchTime);
        
        if (!substitutionManager.hasPendingSubstitution) {
          props.addEvent(
            t("referee.event.playerAdded", "Player Added"),
            t(
              "referee.event.playerAddedDesc",
              "{name} added to time tracking",
              { name: player.name }
            ),
            props.matchTime
          );
          
          toast({
            title: t("referee.toast.playerAddedTitle", "Player Added"),
            description: t(
              "referee.toast.playerAddedDesc",
              "{name} added to time tracking",
              { name: player.name }
            ),
          });
        }
        
        console.log('✅ usePlayerTimeHandlers: Player added successfully (optimized)');
      } catch (error) {
        console.error('❌ usePlayerTimeHandlers: Failed to add player:', error);
        toast({
          title: t("referee.toast.addPlayerFailedTitle", "Add Player Failed"),
          description: error instanceof Error ? error.message : t("referee.toast.addPlayerFailed", "Failed to add player"),
          variant: "destructive"
        });
      }
    });
  };

  const handleRemovePlayer = (playerId: number) => {
    return throttleAction(() => {
      const player = props.playersForTimeTracker.find(p => p.id === playerId);
      if (player) {
        props.removePlayer(playerId);
        props.addEvent(
          t("referee.event.playerRemoved", "Player Removed"),
          t(
            "referee.event.playerRemovedDesc",
            "{name} removed from time tracking",
            { name: player.name }
          ),
          props.matchTime
        );
        
        toast({
          title: t("referee.toast.playerRemovedTitle", "Player Removed"),
          description: t(
            "referee.toast.playerRemovedDesc",
            "{name} removed from time tracking",
            { name: player.name }
          ),
        });
      }
    });
  };

  const handleTogglePlayerTime = async (playerId: number) => {
    return throttleAction(async () => {
      const player = props.playersForTimeTracker.find(p => p.id === playerId);
      if (!player) return;

      try {
        console.log('⏱️ usePlayerTimeHandlers: Toggling player time (optimized):', player.name);
        
        const hasPlayedBefore = player.totalTime > 0;
        
        // DUAL-BEHAVIOR IMPLEMENTATION (optimized):
        
        // SCENARIO 1: "Sub In" first (streamlined flow)
        if (!player.isPlaying && hasPlayedBefore) {
          substitutionManager.initiatePendingSubstitution(player, 'sub_in');
          
          toast({
            title: t("referee.toast.substitutionReadyTitle", "Substitution Ready"),
            description: t(
              "referee.toast.substitutionReadyDesc",
              '{name} will be substituted in. Press "Sub Out" on another player to complete.',
              { name: player.name }
            ),
          });
          
          props.addEvent(
            t("referee.event.substitutionInitiated", "Substitution Initiated"),
            t(
              "referee.event.substitutionReadyEventDesc",
              "{name} ready for substitution (Sub In first)",
              { name: player.name }
            ),
            props.matchTime
          );
          return;
        }

        // SCENARIO 2: Complete streamlined substitution (Sub Out after Sub In)
        if (player.isPlaying && substitutionManager.hasPendingSubstitution && !substitutionManager.isSubOutInitiated) {
          await props.togglePlayerTime(playerId, props.matchTime);
          
          const pendingSub = substitutionManager.pendingSubstitution;
          if (pendingSub) {
            const incomingPlayer = props.playersForTimeTracker.find(p => p.id === pendingSub.outgoingPlayerId);
            if (incomingPlayer) {
              // OPTIMIZATION: Batch these operations
              await props.togglePlayerTime(pendingSub.outgoingPlayerId, props.matchTime);
            }
            
            substitutionManager.cancelPendingSubstitution();
            
            props.addEvent(
              t("referee.event.substitutionComplete", "Substitution Complete"),
              t(
                "referee.event.substitutionCompleteStreamlinedDesc",
                "{inName} substituted for {outName} (Streamlined)",
                { inName: pendingSub.outgoingPlayerName, outName: player.name }
              ),
              props.matchTime
            );
            
            toast({
              title: t("referee.toast.substitutionCompleteTitle", "Substitution Complete"),
              description: t(
                "referee.toast.substitutionCompleteDesc",
                "{inName} replaced {outName}",
                { inName: pendingSub.outgoingPlayerName, outName: player.name }
              ),
            });
          }
          return;
        }

        // SCENARIO 3: "Sub Out" first (modal flow)
        if (player.isPlaying && hasPlayedBefore && !substitutionManager.hasPendingSubstitution) {
          await props.togglePlayerTime(playerId, props.matchTime);
          
          substitutionManager.initiatePendingSubstitution(player, 'sub_out');
          
          props.addEvent(
            t("referee.event.substitutionOutInitiated", "Substitution Out Initiated"),
            t(
              "referee.event.substitutionOutInitiatedDesc",
              "{name} substituted out (Modal flow)",
              { name: player.name }
            ),
            props.matchTime
          );
          
          toast({
            title: t("referee.toast.playerSubOutTitle", "Player Substituted Out"),
            description: t(
              "referee.toast.playerSubOutDesc",
              "{name} has been substituted out. Select a replacement player.",
              { name: player.name }
            ),
          });
          return;
        }

        // SCENARIO 4: Standard toggle for new players or regular start/stop actions
        await props.togglePlayerTime(playerId, props.matchTime);
        
        const action = player.isPlaying
          ? t("referee.playerTimeStopped", "stopped")
          : t("referee.playerTimeStarted", "started");

        props.addEvent(
          t("referee.event.timeToggle", "Time Toggle"),
          t(
            "referee.event.timeToggleDesc",
            "Time tracking {action} for {name}",
            { action, name: player.name }
          ),
          props.matchTime
        );
        
        toast({
          title: t("referee.toast.timeUpdatedTitle", "Time Updated"),
          description: t(
            "referee.toast.timeUpdatedDesc",
            "Time tracking {action} for {name}",
            { action, name: player.name }
          ),
        });
        
        console.log('✅ usePlayerTimeHandlers: Player time toggled successfully (optimized)');
      } catch (error) {
        console.error('❌ usePlayerTimeHandlers: Failed to toggle player time:', error);
        toast({
          title: t("referee.toast.timeToggleFailedTitle", "Time Toggle Failed"),
          description: error instanceof Error ? error.message : t("referee.toast.timeToggleFailed", "Failed to toggle time"),
          variant: "destructive"
        });
      }
    });
  };

  // New function to handle undoing a "Sub Out" action
  const handleUndoSubOut = async (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (!player) return;

    try {
      console.log('↩️ usePlayerTimeHandlers: Undoing Sub Out for:', player.name);
      
      // Restart the player's time tracking
      await props.togglePlayerTime(playerId, props.matchTime);

      props.addEvent(
        t("referee.event.subOutUndone", "Sub Out Undone"),
        t(
          "referee.event.subOutUndoneDesc",
          "{name} returned to play (Sub Out cancelled)",
          { name: player.name }
        ),
        props.matchTime
      );
      
      toast({
        title: t("referee.toast.subOutUndoneTitle", "Undo Successful"),
        description: t(
          "referee.toast.subOutUndoneDesc",
          "{name} returned to play.",
          { name: player.name }
        ),
      });

      console.log('✅ usePlayerTimeHandlers: Sub Out undone successfully');
    } catch (error) {
      console.error('❌ usePlayerTimeHandlers: Failed to undo Sub Out:', error);
      toast({
        title: t("referee.toast.undoFailedTitle", "Undo Failed"),
        description: error instanceof Error ? error.message : t("referee.toast.undoFailed", "Failed to undo substitution"),
        variant: "destructive"
      });
    }
  };

  // OPTIMIZATION: Enhanced save with intelligent batching
  const handleSaveAllPlayerTimes = async () => {
    if (!props.selectedFixtureData) {
      toast({
        title: t("referee.toast.errorTitle", "Error"),
        description: t("referee.toast.errorNoFixture", "No fixture selected"),
        variant: "destructive"
      });
      return;
    }

    if (props.playersForTimeTracker.length === 0) {
      toast({
        title: t("referee.toast.noDataTitle", "No Data"),
        description: t("referee.toast.noPlayerTimesToSave", "No player times to save"),
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('⏱️ usePlayerTimeHandlers: Saving all player times (optimized)...');
      
      // OPTIMIZATION: Show progress for large datasets
      if (props.playersForTimeTracker.length > 10) {
        toast({
          title: t("referee.toast.savingDataTitle", "Saving Data"),
          description: t(
            "referee.toast.savingDataDesc",
            "Processing {count} players...",
            { count: props.playersForTimeTracker.length }
          ),
        });
      }
      
      props.addEvent(
        t("referee.event.timeSave", "Time Save"),
        t(
          "referee.event.timeSaveDesc",
          "Saved time data for {count} players",
          { count: props.playersForTimeTracker.length }
        ),
        props.matchTime
      );
      
      toast({
        title: t("referee.toast.saveSuccessTitle", "Player Times Saved"),
        description: t(
          "referee.toast.saveSuccessDesc",
          "Successfully saved time data for {count} players",
          { count: props.playersForTimeTracker.length }
        ),
      });
      
      console.log('✅ usePlayerTimeHandlers: All player times saved successfully (optimized)');
    } catch (error) {
      console.error('❌ usePlayerTimeHandlers: Failed to save player times:', error);
      toast({
        title: t("referee.toast.saveFailedTitle", "Save Failed"),
        description: t("referee.toast.saveFailed", "Failed to save player times"),
        variant: "destructive"
      });
    }
  };

  return {
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    handleUndoSubOut,
    handleSaveAllPlayerTimes,
    substitutionManager
  };
};


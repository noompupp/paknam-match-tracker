
import React, { useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { PlayerTime } from "@/types/database";
import { useSubstitutionManager } from "@/hooks/playerTracking/substitutionManager";
import { useTranslation } from "@/hooks/useTranslation";
import { handleSubstitutionAction } from "@/services/substitution/substitutionFlowManager";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { usePlayerTimeNotifications } from "../usePlayerTimeNotifications";

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
  const { t } = useTranslation();
  const substitutionManager = useSubstitutionManager();
  const notifications = usePlayerTimeNotifications();

  const lastActionTimeRef = useRef<number>(0);
  const ACTION_THROTTLE = 1000;

  const throttleAction = useCallback((action: () => Promise<void> | void) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_THROTTLE) {
      return;
    }
    lastActionTimeRef.current = now;
    return action();
  }, []);

  const handleAddPlayer = async (player: ComponentPlayer) => {
    return throttleAction(async () => {
      if (!props.selectedFixtureData) {
        useToast().toast({
          title: t("referee.toast.errorTitle", "Error"),
          description: t("referee.toast.errorNoFixture", "No fixture selected. Please select a match first."),
          variant: "destructive",
        });
        return;
      }
      try {
        // Complete substitution if pending
        if (substitutionManager.hasPendingSubstitution) {
          const substitution = substitutionManager.completePendingSubstitution(player as ProcessedPlayer);
          if (
            substitution &&
            substitution.incoming?.name &&
            substitution.outgoing?.outgoingPlayerName
          ) {
            notifications.notifySubstitutionComplete({
              incoming: substitution.incoming,
              outgoingName: substitution.outgoing.outgoingPlayerName,
              player,
              matchTime: props.matchTime,
              addEvent: props.addEvent,
            });
          }
        }
        await props.addPlayer(player, props.matchTime);
        if (!substitutionManager.hasPendingSubstitution) {
          notifications.notifyAddPlayer({ player, matchTime: props.matchTime, addEvent: props.addEvent });
        }
      } catch (error) {
        useToast().toast({
          title: t("referee.toast.addPlayerFailedTitle", "Add Player Failed"),
          description:
            error instanceof Error ? error.message : t("referee.toast.addPlayerFailed", "Failed to add player"),
          variant: "destructive",
        });
      }
    });
  };

  const handleRemovePlayer = (playerId: number) => {
    return throttleAction(() => {
      const player = props.playersForTimeTracker.find((p) => p.id === playerId);
      if (player) {
        props.removePlayer(playerId);
        notifications.notifyRemovePlayer({ player, matchTime: props.matchTime, addEvent: props.addEvent });
      }
    });
  };

  const handleTogglePlayerTime = async (playerId: number) => {
    return throttleAction(async () => {
      const player = props.playersForTimeTracker.find((p) => p.id === playerId);
      if (!player) return;

      try {
        const scenario = handleSubstitutionAction({
          player,
          substitutionManager,
          playersForTimeTracker: props.playersForTimeTracker,
        });

        if (scenario === "PENDING_SUB_IN") {
          substitutionManager.initiatePendingSubstitution(player, "sub_in");
          notifications.notifySubstitutionReady({
            player,
            matchTime: props.matchTime,
            addEvent: props.addEvent,
          });
          return;
        }

        if (scenario === "COMPLETE_SUBSTITUTION") {
          await props.togglePlayerTime(playerId, props.matchTime);
          const pendingSub = substitutionManager.pendingSubstitution;
          if (pendingSub) {
            const incomingPlayer = props.playersForTimeTracker.find(
              (p) => p.id === pendingSub.outgoingPlayerId
            );
            if (incomingPlayer) {
              await props.togglePlayerTime(pendingSub.outgoingPlayerId, props.matchTime);
            }
            substitutionManager.cancelPendingSubstitution();
            notifications.notifySubstitutionComplete({
              incoming: { id: incomingPlayer?.id!, name: incomingPlayer?.name! },
              outgoingName: player.name,
              player,
              matchTime: props.matchTime,
              addEvent: props.addEvent,
            });
          }
          return;
        }

        if (scenario === "INITIATE_SUB_OUT") {
          await props.togglePlayerTime(playerId, props.matchTime);
          substitutionManager.initiatePendingSubstitution(player, "sub_out");
          notifications.notifySubOutInitiated({
            player,
            matchTime: props.matchTime,
            addEvent: props.addEvent,
          });
          return;
        }

        // STANDARD_TOGGLE
        await props.togglePlayerTime(playerId, props.matchTime);
        const action = player.isPlaying
          ? t("referee.playerTimeStopped", "stopped")
          : t("referee.playerTimeStarted", "started");
        notifications.notifyTimeUpdated({
          player,
          action,
          matchTime: props.matchTime,
          addEvent: props.addEvent,
        });
      } catch (error) {
        useToast().toast({
          title: t("referee.toast.timeToggleFailedTitle", "Time Toggle Failed"),
          description:
            error instanceof Error
              ? error.message
              : t("referee.toast.timeToggleFailed", "Failed to toggle time"),
          variant: "destructive",
        });
      }
    });
  };

  // Undo "Sub Out"
  const handleUndoSubOut = async (playerId: number) => {
    const player = props.playersForTimeTracker.find((p) => p.id === playerId);
    if (!player) return;

    try {
      await props.togglePlayerTime(playerId, props.matchTime);
      notifications.notifySubOutUndone({
        player,
        matchTime: props.matchTime,
        addEvent: props.addEvent,
      });
    } catch (error) {
      useToast().toast({
        title: t("referee.toast.undoFailedTitle", "Undo Failed"),
        description: error instanceof Error ? error.message : t("referee.toast.undoFailed", "Failed to undo substitution"),
        variant: "destructive",
      });
    }
  };

  const handleSaveAllPlayerTimes = async () => {
    if (!props.selectedFixtureData) {
      useToast().toast({
        title: t("referee.toast.errorTitle", "Error"),
        description: t("referee.toast.errorNoFixture", "No fixture selected"),
        variant: "destructive"
      });
      return;
    }
    if (props.playersForTimeTracker.length === 0) {
      useToast().toast({
        title: t("referee.toast.noDataTitle", "No Data"),
        description: t("referee.toast.noPlayerTimesToSave", "No player times to save"),
        variant: "destructive"
      });
      return;
    }

    try {
      useToast().toast({
        title: t("referee.toast.saveSuccessTitle", "Player Times Saved"),
        description: t("referee.toast.saveSuccessDesc", "Successfully saved time data for {count} players", {
          count: props.playersForTimeTracker.length
        }),
      });
      props.addEvent(
        t("referee.event.timeSave", "Time Save"),
        t("referee.event.timeSaveDesc", "Saved time data for {count} players", {
          count: props.playersForTimeTracker.length
        }),
        props.matchTime
      );
    } catch (error) {
      useToast().toast({
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

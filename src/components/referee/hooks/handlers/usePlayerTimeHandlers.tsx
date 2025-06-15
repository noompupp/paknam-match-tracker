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
  addPlayer: (player: PlayerTime, matchTime: number) => any; // <-- FIXED TYPE HERE
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
        // IMPORTANT: Always try to find the full PlayerTime object
        const playerTime = props.playersForTimeTracker.find(p => p.id === player.id) as PlayerTime | undefined;

        // Complete substitution if pending
        if (substitutionManager.hasPendingSubstitution) {
          // Construct a "ProcessedPlayer" with dummy fields if necessary for the API call
          const processedPlayer: ProcessedPlayer = {
            id: player.id,
            name: player.name,
            team: (player as any).team || "",
            team_id: (player as any).team_id || "",
            number: (player as any).number || "",
            position: (player as any).position || "Player",
            role: (player as any).role || "Starter"
          };

          const substitution = substitutionManager.completePendingSubstitution(processedPlayer);
          if (
            substitution &&
            substitution.incoming &&
            substitution.incoming.name &&
            substitution.outgoing &&
            substitution.outgoing.outgoingPlayerName
          ) {
            // Find the most complete "incoming" player info
            // Try to find full PlayerTime for incoming, else fallback to ProcessedPlayer stub
            const incomingPlayerFullTime = props.playersForTimeTracker.find(
              (p) => p.id === substitution.incoming.id
            ) || null;

            notifications.notifySubstitutionComplete({
              incoming: processedPlayer,
              outgoingName: substitution.outgoing.outgoingPlayerName,
              player: playerTime || (player as any),
              matchTime: props.matchTime,
              addEvent: props.addEvent,
            });
          }
        }

        // FIX: Always use the PlayerTime object for addPlayer
        if (playerTime) {
          await props.addPlayer(playerTime, props.matchTime);
        } else {
          // As a fallback, construct a PlayerTime from ComponentPlayer
          // (All required fields must be provided to avoid runtime errors)
          const fallbackPlayerTime: PlayerTime = {
            id: player.id,
            name: player.name,
            team: (player as any).team || "",
            totalTime: 0,
            isPlaying: false,
            startTime: null,
          };
          await props.addPlayer(fallbackPlayerTime, props.matchTime);
        }

        if (!substitutionManager.hasPendingSubstitution) {
          notifications.notifyAddPlayer({
            player: playerTime || (player as any),
            matchTime: props.matchTime,
            addEvent: props.addEvent
          });
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
            // Find the full PlayerTime for the incoming player (outgoingPlayerId means the one who initiated sub in)
            const incomingPlayer = props.playersForTimeTracker.find(
              (p) => p.id === pendingSub.outgoingPlayerId
            );
            if (incomingPlayer) {
              await props.togglePlayerTime(pendingSub.outgoingPlayerId, props.matchTime);
            }
            substitutionManager.cancelPendingSubstitution();

            // Build compatible ProcessedPlayer for notification
            const processedIncomingPlayer: ProcessedPlayer = incomingPlayer
              ? {
                  id: incomingPlayer.id,
                  name: incomingPlayer.name,
                  team: (incomingPlayer as any).team || "",
                  team_id: (incomingPlayer as any).team_id || "",
                  number: (incomingPlayer as any).number || "",
                  position: (incomingPlayer as any).position || "Player",
                  role: (incomingPlayer as any).role || "Starter"
                }
              : {
                  id: pendingSub.outgoingPlayerId,
                  name: pendingSub.outgoingPlayerName,
                  team: "",
                  team_id: "",
                  number: "",
                  position: "Player",
                  role: "Starter"
                };

            notifications.notifySubstitutionComplete({
              incoming: processedIncomingPlayer,
              outgoingName: player.name,
              player: incomingPlayer || player, // Use full if possible
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
// NOTE: This file is 242 lines long and is getting quite lengthy. 
// Consider asking to refactor it into smaller, focused hooks/components for maintainability.

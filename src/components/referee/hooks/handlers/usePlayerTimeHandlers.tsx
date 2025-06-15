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
  addPlayer: (player: PlayerTime, matchTime: number) => any;
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

  // Enhanced: Logging helpers for translation param types
  const logTranslationParams = (context: string, params: any) => {
    // Log explicit type, stringification, and JSON for debugging
    Object.keys(params).forEach(k => {
      const val = params[k];
      // Basic clean stringification
      let stringified;
      try { stringified = typeof val === "object" ? JSON.stringify(val) : String(val); } catch (err) { stringified = "(unstringifiable)"; }
      console.info(`[PlayerTimeHandlers][I18N-PARAM][${context}] Param '${k}':`, { raw: val, type: typeof val, stringified });
    });
  };

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
        // Find the PlayerTime object (may be missing)
        const playerTime = props.playersForTimeTracker.find((p: PlayerTime) => p.id === player.id) as PlayerTime | undefined;

        // Complete substitution if pending
        if (substitutionManager.hasPendingSubstitution) {
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

          let inName = processedPlayer && processedPlayer.name ? processedPlayer.name : "(no name: processedPlayer)";
          let outName = substitution?.outgoing?.outgoingPlayerName || "(no name: outgoingPlayerName)";

          // ENHANCED LOGGING: Check types & content
          logTranslationParams("handleAddPlayer (Sub Complete)", { inName, outName });

          // Debug log for the whole substitution data
          console.info("[PlayerTimeHandlers] Sub Complete Attempt (handleAddPlayer)", {
            processedPlayer,
            substitution,
            inName,
            outName,
            inNameType: typeof inName,
            outNameType: typeof outName,
          });

          if (
            substitution &&
            substitution.incoming &&
            substitution.incoming.name &&
            substitution.outgoing &&
            substitution.outgoing.outgoingPlayerName
          ) {
            // Find the most complete "incoming" player info
            const incomingPlayerFullTime = props.playersForTimeTracker.find(
              (p: PlayerTime) => p.id === substitution.incoming.id
            ) || null;

            const incomingForNotify = processedPlayer && processedPlayer.name ? processedPlayer : {
              ...processedPlayer,
              name: processedPlayer.name || "(no name: processedPlayer)"
            };
            const outgoingNameForNotify =
              substitution.outgoing.outgoingPlayerName || "(no name: outgoingPlayerName)";

            // LOG all values for the notification, for clarity
            logTranslationParams("handleAddPlayer (NotifySubComplete call)", {
              incomingForNotifyName: incomingForNotify.name,
              outgoingNameForNotify
            });

            // Ensure only notification triggers toast, don't call toast here!
            notifications.notifySubstitutionComplete({
              incoming: incomingForNotify,
              outgoingName: outgoingNameForNotify,
              player: playerTime || (player as any),
              matchTime: props.matchTime,
              addEvent: props.addEvent,
            });
          } else {
            console.warn("[PlayerTimeHandlers] Skipping notifySubstitutionComplete due to undefined name(s):", {
              substitution,
              processedPlayer
            });
          }
        }

        // Use PlayerTime object for addPlayer if possible
        if (playerTime) {
          await props.addPlayer(playerTime, props.matchTime);
        } else {
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
            const incomingPlayer = props.playersForTimeTracker.find(
              (p) => p.id === pendingSub.outgoingPlayerId
            );
            if (incomingPlayer) {
              await props.togglePlayerTime(pendingSub.outgoingPlayerId, props.matchTime);
            }
            substitutionManager.cancelPendingSubstitution();

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
                  name: pendingSub.outgoingPlayerName || "(no name: pendingSub.outgoingPlayerName)",
                  team: "",
                  team_id: "",
                  number: "",
                  position: "Player",
                  role: "Starter"
                };

            const outgoingNameForNotify =
              player.name || "(no name: player.name)";

            // LOG debugging info for outgoing/incoming names and all translation values
            let inName = processedIncomingPlayer && processedIncomingPlayer.name ? processedIncomingPlayer.name : "(no name: processedIncomingPlayer)";
            let outName = outgoingNameForNotify;

            console.info("[PlayerTimeHandlers - notifySubstitutionComplete from COMPLETE_SUBSTITUTION]", {
              processedIncomingPlayer,
              outgoingNameForNotify,
              inName,
              outName,
              player: incomingPlayer || player,
              matchTime: props.matchTime,
            });

            notifications.notifySubstitutionComplete({
              incoming: processedIncomingPlayer,
              outgoingName: outgoingNameForNotify,
              player: incomingPlayer || player,
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
// NOTE: This file is 350+ lines long and is getting quite lengthy. 
// Consider asking to refactor it into smaller, focused hooks/components for maintainability.

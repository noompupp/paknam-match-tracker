import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PlayerTimeNotificationParams {
  player: PlayerTime;
  matchTime: number;
  addEvent: (type: string, desc: string, time: number) => void;
}

interface SubstitutionCompleteParams extends PlayerTimeNotificationParams {
  incoming: ProcessedPlayer;
  outgoingName: string;
}

export const usePlayerTimeNotifications = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  function notifyAddPlayer({ player, matchTime, addEvent }: PlayerTimeNotificationParams) {
    addEvent(
      t("referee.event.playerAdded", "Player Added"),
      t("referee.event.playerAddedDesc", "{name} added to time tracking", { name: player.name }),
      matchTime
    );
    toast({
      title: t("referee.toast.playerAddedTitle", "Player Added"),
      description: t("referee.toast.playerAddedDesc", "{name} added to time tracking", { name: player.name }),
    });
  }

  function notifyRemovePlayer({ player, matchTime, addEvent }: PlayerTimeNotificationParams) {
    addEvent(
      t("referee.event.playerRemoved", "Player Removed"),
      t("referee.event.playerRemovedDesc", "{name} removed from time tracking", { name: player.name }),
      matchTime
    );
    toast({
      title: t("referee.toast.playerRemovedTitle", "Player Removed"),
      description: t("referee.toast.playerRemovedDesc", "{name} removed from time tracking", { name: player.name }),
    });
  }

  function notifySubstitutionReady({ player, matchTime, addEvent }: PlayerTimeNotificationParams) {
    addEvent(
      t("referee.event.substitutionInitiated", "Substitution Initiated"),
      t("referee.event.substitutionReadyEventDesc", "{name} ready for substitution (Sub In first)", { name: player.name }),
      matchTime
    );
    toast({
      title: t("referee.toast.substitutionReadyTitle", "Substitution Ready"),
      description: t(
        "referee.toast.substitutionReadyDesc",
        '{name} will be substituted in. Press "Sub Out" on another player to complete.',
        { name: player.name }
      ),
    });
  }

  function notifySubstitutionComplete({ incoming, outgoingName, matchTime, addEvent, player }) {
    // Defensive fallback/defaults for missing name data
    const inName =
      (incoming && typeof incoming.name === "string" && incoming.name.trim() !== "")
        ? incoming.name
        : (player && typeof player.name === "string" && player.name.trim() !== "" ? player.name : "(no name: incoming)");

    const outName =
      (typeof outgoingName === "string" && outgoingName.trim() !== "")
        ? outgoingName
        : "(no name: outgoing)";

    // Debug (type and value of params)
    console.info("[PlayerTimeNotifications][notifySubstitutionComplete] Raw inputs", {
      incoming,
      outgoingName,
      player,
      inName,
      outName,
      inNameType: typeof inName,
      outNameType: typeof outName,
    });

    // Use correct translation keys for substitution completion!
    const eventTitle = t("referee.event.substitutionComplete", "Substitution Complete");
    // Corrected key for event description!
    const eventDesc = t(
      "referee.event.substitutionCompleteDescription",
      "{inName} substituted for {outName}",
      { inName, outName }
    );
    const toastTitle = t("referee.toast.substitutionCompleteTitle", "Substitution Complete");
    // Corrected key for toast description!
    const toastDesc = t(
      "referee.toast.substitutionCompleteDesc",
      "{inName} replaced {outName}",
      { inName, outName }
    );

    // Log translation param types & resolved values
    console.info("[PlayerTimeNotifications][I18N] Params to t():", {
      eventDescParams: { inName, outName },
      toastDescParams: { inName, outName },
    });
    console.info("[PlayerTimeNotifications] Translation output for notifySubstitutionComplete", {
      eventTitle,
      eventDesc,
      toastTitle,
      toastDesc,
    });

    addEvent(eventTitle, eventDesc, matchTime);
    toast({
      title: toastTitle,
      description: toastDesc,
    });
  }

  function notifyTimeUpdated({ player, action, matchTime, addEvent }: PlayerTimeNotificationParams & { action: string }) {
    addEvent(
      t("referee.event.timeToggle", "Time Toggle"),
      t("referee.event.timeToggleDesc", "Time tracking {action} for {name}", { action, name: player.name }),
      matchTime
    );
    toast({
      title: t("referee.toast.timeUpdatedTitle", "Time Updated"),
      description: t("referee.toast.timeUpdatedDesc", "Time tracking {action} for {name}", { action, name: player.name }),
    });
  }

  function notifySubOutInitiated({ player, matchTime, addEvent }: PlayerTimeNotificationParams) {
    addEvent(
      t("referee.event.substitutionOutInitiated", "Substitution Out Initiated"),
      t("referee.event.substitutionOutInitiatedDesc", "{name} substituted out (Modal flow)", { name: player.name }),
      matchTime
    );
    toast({
      title: t("referee.toast.playerSubOutTitle", "Player Substituted Out"),
      description: t("referee.toast.playerSubOutDesc", "{name} has been substituted out. Select a replacement player.", { name: player.name }),
    });
  }

  function notifySubOutUndone({ player, matchTime, addEvent }: PlayerTimeNotificationParams) {
    addEvent(
      t("referee.event.subOutUndone", "Sub Out Undone"),
      t("referee.event.subOutUndoneDesc", "{name} returned to play (Sub Out cancelled)", { name: player.name }),
      matchTime
    );
    toast({
      title: t("referee.toast.subOutUndoneTitle", "Undo Successful"),
      description: t("referee.toast.subOutUndoneDesc", "{name} returned to play.", { name: player.name }),
    });
  }

  return {
    notifyAddPlayer,
    notifyRemovePlayer,
    notifySubstitutionReady,
    notifySubstitutionComplete,
    notifyTimeUpdated,
    notifySubOutInitiated,
    notifySubOutUndone,
  }
}

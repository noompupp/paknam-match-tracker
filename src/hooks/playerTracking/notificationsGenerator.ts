
import { PlayerTime } from "@/types/database";
import { RoleBasedNotification } from "./types";
import { getTimeStatus } from "./timeStatusCalculator";

export const generateRoleBasedNotifications = (
  trackedPlayers: PlayerTime[],
  allPlayers: any[],
  matchTime: number,
  playerHalfTimes: Map<number, { firstHalf: number; secondHalf: number }>,
  roleBasedStops: Map<number, boolean>
): RoleBasedNotification[] => {
  const notifications: RoleBasedNotification[] = [];

  trackedPlayers.forEach(player => {
    const playerInfo = allPlayers.find(p => p.id === player.id);
    const role = playerInfo?.role || 'Starter';
    const status = getTimeStatus(player, role, matchTime, playerHalfTimes);
    const wasAutoStopped = roleBasedStops.get(player.id) || false;

    console.log('🔔 Notification check:', {
      playerName: player.name,
      role,
      status,
      wasAutoStopped
    });

    if (wasAutoStopped) {
      notifications.push({
        playerId: player.id,
        playerName: player.name,
        role,
        type: 'auto_stopped',
        message: `${player.name} was automatically substituted (S-Class 20min limit reached)`
      });
    } else if (status === 'critical') {
      notifications.push({
        playerId: player.id,
        playerName: player.name,
        role,
        type: 'warning',
        message: `${player.name} approaching ${role} time limit`
      });
    } else if (status === 'insufficient') {
      notifications.push({
        playerId: player.id,
        playerName: player.name,
        role,
        type: 'minimum_needed',
        message: `${player.name} needs more playing time (Starter minimum: 10min)`
      });
    }
  });

  console.log('🔔 Generated notifications:', notifications);
  return notifications;
};

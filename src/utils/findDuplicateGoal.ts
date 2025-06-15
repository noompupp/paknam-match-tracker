
export interface Goal {
  playerId: number;
  time: number;
  teamId: string;
  type: "goal" | "assist";
  isOwnGoal?: boolean;
}

export function findDuplicateGoal(
  goals: Goal[],
  entry: Goal
): Goal | undefined {
  // Compares key uniqueness criteria:
  // - playerId
  // - time (exact seconds)
  // - teamId
  // - type ('goal'|'assist')
  // - isOwnGoal
  return goals.find(
    g =>
      g.playerId === entry.playerId &&
      g.time === entry.time &&
      g.teamId === entry.teamId &&
      g.type === entry.type &&
      Boolean(g.isOwnGoal) === Boolean(entry.isOwnGoal)
  );
}

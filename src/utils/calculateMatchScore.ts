
/**
 * Returns the home and away team scores for a given match, using team IDs for robust calculation.
 * Falls back to 0 if data is missing.
 */

import type { MatchGoal } from "@/stores/match/types";

export interface CalculateMatchScoreOptions {
  goals: MatchGoal[] | undefined | null;
  homeTeamId: string | number | undefined;
  awayTeamId: string | number | undefined;
  homeTeamName?: string;
  awayTeamName?: string;
}

/**
 * Robustly calculates score using team ID matching (falls back to teamName if needed).
 */
export function calculateMatchScore(opts: CalculateMatchScoreOptions) {
  const { goals, homeTeamId, awayTeamId, homeTeamName, awayTeamName } = opts;
  let homeScore = 0;
  let awayScore = 0;

  if (!goals || (!homeTeamId && !homeTeamName) || (!awayTeamId && !awayTeamName)) {
    return { homeScore: 0, awayScore: 0 };
  }

  function normalize(val: string | number | undefined): string {
    return (val ?? "").toString().trim().toLowerCase();
  }

  const nHomeId = normalize(homeTeamId);
  const nAwayId = normalize(awayTeamId);
  const nHomeName = normalize(homeTeamName);
  const nAwayName = normalize(awayTeamName);

  for (const g of goals) {
    if (g.type !== "goal") continue;

    // Try match by teamId, then by teamName fallback if id missing (old data)
    const goalTeamId = normalize(g.teamId);
    const goalTeamName = normalize(g.teamName);

    if (
      nHomeId && goalTeamId && nHomeId === goalTeamId ||
      nHomeName && goalTeamName && nHomeName === goalTeamName
    ) {
      homeScore++;
    } else if (
      nAwayId && goalTeamId && nAwayId === goalTeamId ||
      nAwayName && goalTeamName && nAwayName === goalTeamName
    ) {
      awayScore++;
    }
  }

  return { homeScore, awayScore };
}

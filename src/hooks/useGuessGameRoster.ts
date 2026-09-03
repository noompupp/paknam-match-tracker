import { useQuery } from "@tanstack/react-query";
import {
  fetchCurrentSeasonId,
  fetchSeasonRoster,
  selectPlayablePlayers,
} from "@/services/game/guessGameRoster";
import type { GamePlayer } from "@/services/game/guessGameTypes";

export interface GuessGameRoster {
  seasonId: string | null;
  /** Everyone on the roster — the decoy pool for multiple-choice answers. */
  roster: GamePlayer[];
  /** Roster members with a profile photo — the only ones we can ask about. */
  playable: GamePlayer[];
}

/**
 * Roster data for the game, scoped to the current season.
 *
 * The season is resolved here rather than taken from SeasonContext so the game
 * always plays against the season the database marks as current.
 */
export const useGuessGameRoster = () =>
  useQuery<GuessGameRoster>({
    queryKey: ["guess-game", "roster"],
    queryFn: async () => {
      const seasonId = await fetchCurrentSeasonId();
      if (!seasonId) {
        return { seasonId: null, roster: [], playable: [] };
      }

      const roster = await fetchSeasonRoster(seasonId);
      return { seasonId, roster, playable: selectPlayablePlayers(roster) };
    },
    staleTime: 30 * 60 * 1000,
  });

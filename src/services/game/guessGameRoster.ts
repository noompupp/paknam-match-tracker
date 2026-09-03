import { gameDb } from "./gameSupabase";
import type { GamePlayer } from "./guessGameTypes";

/**
 * Roster access for the guess-the-member game.
 *
 * These queries deliberately target the live season schema
 * (seasons / rosters / players / teams) rather than going through the older
 * member services, so the game keeps working independently of them.
 */

interface RosterRow {
  jersey_number: string | null;
  position: string | null;
  players: {
    id: string;
    full_name: string | null;
    nickname: string | null;
    display_name: string | null;
    photo_url: string | null;
    is_active: boolean | null;
  } | null;
  teams: {
    name: string | null;
    color: string | null;
  } | null;
}

/** Resolve the season the game should use: the current default season. */
export const fetchCurrentSeasonId = async (): Promise<string | null> => {
  const { data, error } = await gameDb.from("seasons")
    .select("id, season_no, is_current_default, is_active")
    .order("is_current_default", { ascending: false })
    .order("season_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("🎮 guessGameRoster: failed to resolve current season", error);
    throw error;
  }

  return (data?.id as string) ?? null;
};

const pickDisplayName = (player: NonNullable<RosterRow["players"]>): string => {
  const candidates = [player.display_name, player.nickname, player.full_name];
  const name = candidates.find((c) => !!c && c.trim().length > 0);
  return (name ?? "").trim();
};

/**
 * Every player on the season roster.
 *
 * Players without a photo are still returned — they make good decoy answers
 * even though they can never be the subject of a question.
 */
export const fetchSeasonRoster = async (seasonId: string): Promise<GamePlayer[]> => {
  const { data, error } = await gameDb.from("rosters")
    .select(
      `
      jersey_number,
      position,
      players:player_id (
        id,
        full_name,
        nickname,
        display_name,
        photo_url,
        is_active
      ),
      teams:team_id (
        name,
        color
      )
    `
    )
    .eq("season_id", seasonId);

  if (error) {
    console.error("🎮 guessGameRoster: failed to fetch roster", error);
    throw error;
  }

  const rows = (data ?? []) as RosterRow[];
  const byId = new Map<string, GamePlayer>();

  for (const row of rows) {
    const player = row.players;
    if (!player) continue;

    const displayName = pickDisplayName(player);
    // A player with no usable name can neither be an answer nor a decoy.
    if (!displayName) continue;

    // A player can appear on more than one roster row; keep the first.
    if (byId.has(player.id)) continue;

    const photoUrl = player.photo_url?.trim();

    byId.set(player.id, {
      id: player.id,
      displayName,
      fullName: player.full_name,
      nickname: player.nickname,
      photoUrl: photoUrl ? photoUrl : null,
      jerseyNumber: row.jersey_number,
      position: row.position,
      teamName: row.teams?.name ?? null,
      teamColor: row.teams?.color ?? null,
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName, "th")
  );
};

/** Players that can actually be asked about, i.e. the ones with a photo. */
export const selectPlayablePlayers = (roster: GamePlayer[]): GamePlayer[] =>
  roster.filter((p) => !!p.photoUrl);

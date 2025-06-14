
import { Member, Team } from "@/types/database";

export function toAvatarPlayer(player: Member, index: number): Member {
  return {
    id: player.id,
    name: player.name || 'Unknown Player',
    number: player.number || (index + 1).toString(),
    position: player.position || 'Player',
    role: player.role || "Player",
    goals: player.goals || 0,
    assists: player.assists || 0,
    yellow_cards: player.yellow_cards || 0,
    red_cards: player.red_cards || 0,
    total_minutes_played: player.total_minutes_played || 0,
    matches_played: player.matches_played || 0,
    team_id: player.team_id || '',
    created_at: player.created_at || new Date().toISOString(),
    updated_at: player.updated_at || new Date().toISOString(),
    ProfileURL: player.ProfileURL,
    team: player.team,
    contributionScore: player.contributionScore
  }
}

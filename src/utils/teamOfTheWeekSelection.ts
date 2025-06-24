
import type { PlayerRatingRow, ApprovedRating } from "@/hooks/useHybridPlayerRatings";

export interface TeamOfTheWeekPlayer extends PlayerRatingRow {
  isCaptain: boolean;
  approvedRating?: ApprovedRating;
}

/**
 * Selects Team of the Week based on 7-a-side league rules:
 * - 7 players total
 * - 1 captain (highest rated among the 7)
 * - Position diversity: at least 1 from each position (GK, DF, MF, WG, FW)
 * - Remaining 2 players are wildcards from top-rated list
 */
export function selectTeamOfTheWeek(
  approvedPlayerRatings: PlayerRatingRow[],
  approvedMap: Map<number, ApprovedRating>
): TeamOfTheWeekPlayer[] {
  if (!approvedPlayerRatings || approvedPlayerRatings.length === 0) {
    return [];
  }

  // Sort all approved players by final rating (highest first)
  const sortedPlayers = [...approvedPlayerRatings].sort(
    (a, b) => b.rating_data.final_rating - a.rating_data.final_rating
  );

  // Group players by position
  const playersByPosition = sortedPlayers.reduce((acc, player) => {
    const position = player.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {} as Record<string, PlayerRatingRow[]>);

  const selectedPlayers: PlayerRatingRow[] = [];
  const requiredPositions = ['GK', 'DF', 'MF', 'WG', 'FW'];

  // Step 1: Select the best player from each required position
  for (const position of requiredPositions) {
    if (playersByPosition[position] && playersByPosition[position].length > 0) {
      // Get the highest rated player from this position who isn't already selected
      const bestInPosition = playersByPosition[position].find(
        player => !selectedPlayers.some(selected => selected.player_id === player.player_id)
      );
      
      if (bestInPosition) {
        selectedPlayers.push(bestInPosition);
      }
    }
  }

  // Step 2: Fill remaining spots (up to 7 total) with best available players
  const remainingSpots = 7 - selectedPlayers.length;
  let added = 0;
  
  for (const player of sortedPlayers) {
    if (added >= remainingSpots) break;
    
    // Skip if already selected
    if (selectedPlayers.some(selected => selected.player_id === player.player_id)) {
      continue;
    }
    
    selectedPlayers.push(player);
    added++;
  }

  // Step 3: Determine captain (highest rated among the 7)
  const finalSelection = selectedPlayers
    .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)
    .slice(0, 7);

  // Step 4: Create TeamOfTheWeekPlayer objects with captain designation
  return finalSelection.map((player, index) => ({
    ...player,
    isCaptain: index === 0, // First in sorted list is captain
    approvedRating: approvedMap.get(player.player_id)
  }));
}

/**
 * Groups the team of the week into a formation structure
 * Typical 7-a-side formation: 3-2-1 (3 defenders, 2 midfielders, 1 forward + 1 goalkeeper)
 */
export function formatTeamOfTheWeekByPosition(teamOfTheWeek: TeamOfTheWeekPlayer[]) {
  const formation = {
    goalkeeper: teamOfTheWeek.filter(p => p.position === 'GK'),
    defenders: teamOfTheWeek.filter(p => p.position === 'DF'),
    midfielders: teamOfTheWeek.filter(p => p.position === 'MF'),
    wingers: teamOfTheWeek.filter(p => p.position === 'WG'),
    forwards: teamOfTheWeek.filter(p => p.position === 'FW')
  };

  return formation;
}


import type { PlayerRatingRow, ApprovedRating } from "@/hooks/useHybridPlayerRatings";

export interface TeamOfTheWeekPlayer extends PlayerRatingRow {
  isCaptain: boolean;
  approvedRating?: ApprovedRating;
}

export interface CaptainOfTheWeekPlayer extends PlayerRatingRow {
  approvedRating?: ApprovedRating;
  isTeamCaptain: boolean;
  teamPerformanceScore: number;
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
 * Selects Captain of the Week based on team captain role and team performance:
 * - Must be a designated team captain (role: captain)
 * - Must NOT be in the Team of the Week
 * - Selected based on leadership, team performance, and bonus for multiple TOTW players
 */
export function selectCaptainOfTheWeek(
  approvedPlayerRatings: PlayerRatingRow[],
  approvedMap: Map<number, ApprovedRating>,
  teamOfTheWeek: TeamOfTheWeekPlayer[]
): CaptainOfTheWeekPlayer | null {
  if (!approvedPlayerRatings || approvedPlayerRatings.length === 0) {
    return null;
  }

  // Get team of the week player IDs for exclusion
  const totWPlayerIds = new Set(teamOfTheWeek.map(p => p.player_id));

  // For now, we'll use mock data to identify team captains since we don't have the role data
  // In a real implementation, this would come from a database query for players with role: captain
  const mockTeamCaptains = [
    { player_id: 3, team_id: "team2" }, // Mike Johnson as Team Beta captain
    { player_id: 6, team_id: "team1" }  // Alex Davis as Team Alpha captain
  ];

  // Filter approved players who are team captains and not in TOTW
  const eligibleCaptains = approvedPlayerRatings.filter(player => {
    const isTeamCaptain = mockTeamCaptains.some(captain => captain.player_id === player.player_id);
    const notInTOTW = !totWPlayerIds.has(player.player_id);
    return isTeamCaptain && notInTOTW;
  });

  if (eligibleCaptains.length === 0) {
    return null;
  }

  // Calculate team performance scores
  const teamPerformanceMap = new Map<string, number>();
  
  approvedPlayerRatings.forEach(player => {
    const currentScore = teamPerformanceMap.get(player.team_id) || 0;
    teamPerformanceMap.set(player.team_id, currentScore + player.rating_data.final_rating);
  });

  // Calculate bonus for teams with multiple TOTW players
  const teamTOTWCount = new Map<string, number>();
  teamOfTheWeek.forEach(player => {
    const currentCount = teamTOTWCount.get(player.team_id) || 0;
    teamTOTWCount.set(player.team_id, currentCount + 1);
  });

  // Score each eligible captain
  const scoredCaptains = eligibleCaptains.map(player => {
    const baseTeamPerformance = teamPerformanceMap.get(player.team_id) || 0;
    const totWBonus = (teamTOTWCount.get(player.team_id) || 0) * 2; // 2 point bonus per TOTW player
    const leadershipScore = player.rating_data.final_rating * 0.5; // Individual leadership contribution
    
    const totalScore = baseTeamPerformance + totWBonus + leadershipScore;

    return {
      ...player,
      approvedRating: approvedMap.get(player.player_id),
      isTeamCaptain: true,
      teamPerformanceScore: totalScore
    };
  });

  // Return the highest scoring captain
  return scoredCaptains.sort((a, b) => b.teamPerformanceScore - a.teamPerformanceScore)[0] || null;
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

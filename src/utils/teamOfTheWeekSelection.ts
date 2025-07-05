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
 * Enhanced Team of the Week selection for 7-a-side league with flexible position handling:
 * - 7 players total (or fewer if not enough approved ratings)
 * - 1 captain (highest rated among selected)
 * - Position diversity: prefer at least 1 from each core position when available
 * - Flexible position mapping to handle non-standard positions
 * - Progressive display (show partial teams if needed)
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

  // Enhanced position mapping to handle variations
  const normalizePosition = (position: string): string => {
    const pos = position.toUpperCase().trim();
    
    // Goalkeeper variations
    if (pos.includes('GK') || pos.includes('GOALKEEPER') || pos.includes('KEEPER')) {
      return 'GK';
    }
    
    // Defender variations - more comprehensive detection
    if (pos.includes('DF') || pos.includes('DEF') || pos.includes('DEFENDER') || 
        pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || 
        pos.includes('CENTRE-BACK') || pos.includes('FULLBACK') || 
        pos.includes('BACK') || pos.includes('DEFENCE') ||
        pos === 'CENTRE BACK' || pos === 'LEFT BACK' || pos === 'RIGHT BACK' ||
        pos === 'CENTER BACK' || pos === 'CENTERBACK' || pos === 'CENTREBACK') {
      return 'DF';
    }
    
    // Winger variations - check before midfielders to avoid overlap
    if (pos.includes('WG') || pos.includes('WING') || pos.includes('LW') || 
        pos.includes('RW') || pos.includes('LM') || pos.includes('RM') ||
        pos === 'LEFT WING' || pos === 'RIGHT WING' || pos === 'WINGER') {
      return 'WG';
    }
    
    // Midfielder variations
    if (pos.includes('MF') || pos.includes('MID') || pos.includes('CM') || 
        pos.includes('CDM') || pos.includes('CAM') || pos.includes('MIDFIELDER') ||
        pos === 'CENTRAL MIDFIELD' || pos === 'CENTRE MID' || pos === 'CENTER MID') {
      return 'MF';
    }
    
    // Forward variations
    if (pos.includes('FW') || pos.includes('FORWARD') || pos.includes('ST') || 
        pos.includes('STRIKER') || pos.includes('CF') || pos.includes('CENTRE-FORWARD') ||
        pos === 'CENTRE FORWARD' || pos === 'CENTER FORWARD' || pos === 'STRIKER') {
      return 'FW';
    }
    
    // Default fallback - treat as midfielder for flexibility
    return 'MF';
  };

  // Group players by normalized position
  const playersByPosition = sortedPlayers.reduce((acc, player) => {
    const normalizedPosition = normalizePosition(player.position);
    if (!acc[normalizedPosition]) {
      acc[normalizedPosition] = [];
    }
    acc[normalizedPosition].push(player);
    return acc;
  }, {} as Record<string, PlayerRatingRow[]>);

  const selectedPlayers: PlayerRatingRow[] = [];
  
  // Core positions for 7-a-side (in priority order)
  const corePositions = ['GK', 'DF', 'MF', 'WG', 'FW'];
  
  // Step 1: Try to get the best player from each core position
  for (const position of corePositions) {
    if (playersByPosition[position] && playersByPosition[position].length > 0) {
      const bestInPosition = playersByPosition[position].find(
        player => !selectedPlayers.some(selected => selected.player_id === player.player_id)
      );
      
      if (bestInPosition && selectedPlayers.length < 7) {
        selectedPlayers.push(bestInPosition);
      }
    }
  }

  // Step 2: Fill remaining spots with highest rated available players
  const remainingSpots = Math.min(7 - selectedPlayers.length, sortedPlayers.length - selectedPlayers.length);
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

  // Step 3: Sort final selection by rating and assign captain
  const finalSelection = selectedPlayers
    .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)
    .slice(0, 7);

  // Step 4: Create TeamOfTheWeekPlayer objects with captain designation
  return finalSelection.map((player, index) => ({
    ...player,
    isCaptain: index === 0, // Highest rated is captain
    approvedRating: approvedMap.get(player.player_id)
  }));
}

/**
 * Enhanced Captain of the Week selection - SEPARATE from Team of the Week:
 * - Must be a designated team captain (based on members table captain field or role)
 * - Must NOT be in the Team of the Week (MVP vs Captain distinction)
 * - Selected based on leadership performance and team success
 * - Different from MVP (who is highest rated in TOTW)
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

  // Enhanced logic to identify actual team captains from members table
  const identifyTeamCaptains = (players: PlayerRatingRow[]): PlayerRatingRow[] => {
    return players.filter(player => {
      // Primary: Check members table for captain designation
      // This would ideally check the actual captain field in members table
      
      // Check if approved rating has captain info
      const approvedRating = approvedMap.get(player.player_id);
      if (approvedRating?.rating_data && typeof approvedRating.rating_data === 'object') {
        const ratingData = approvedRating.rating_data as any;
        if (ratingData.is_captain || ratingData.role === 'captain') {
          return true;
        }
      }
      
      // Secondary: Check for captain indicators in player data
      const playerName = player.player_name.toLowerCase();
      if (playerName.includes('captain') || playerName.includes('cap')) {
        return true;
      }
      
      // Tertiary: High-performing team leaders (but only as fallback)
      const teamPlayers = players.filter(p => p.team_id === player.team_id);
      const isTeamTopPlayer = teamPlayers
        .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)[0]?.player_id === player.player_id;
      
      // Only consider top performers with high ratings as potential captains
      return isTeamTopPlayer && player.rating_data.final_rating >= 7.5;
    });
  };

  // Filter for eligible captains (not in TOTW)
  const eligibleCaptains = identifyTeamCaptains(approvedPlayerRatings).filter(player => 
    !totWPlayerIds.has(player.player_id)
  );

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
    const leadershipScore = player.rating_data.final_rating * 1.2; // Boost individual performance
    
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
 * Enhanced formation grouping with flexible position mapping
 * Adapts to available positions and creates balanced display
 */
export function formatTeamOfTheWeekByPosition(teamOfTheWeek: TeamOfTheWeekPlayer[]) {
  const normalizePosition = (position: string): string => {
    const pos = position.toUpperCase().trim();
    if (pos.includes('GK') || pos.includes('GOALKEEPER') || pos.includes('KEEPER')) return 'GK';
    if (pos.includes('DF') || pos.includes('DEF') || pos.includes('DEFENDER') || 
        pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || 
        pos.includes('CENTRE-BACK') || pos.includes('FULLBACK') || 
        pos.includes('BACK') || pos.includes('DEFENCE') ||
        pos === 'CENTRE BACK' || pos === 'LEFT BACK' || pos === 'RIGHT BACK' ||
        pos === 'CENTER BACK' || pos === 'CENTERBACK' || pos === 'CENTREBACK') return 'DF';
    if ((pos.includes('MF') || pos.includes('MID') || pos.includes('CM') || 
         pos.includes('CDM') || pos.includes('CAM') || pos.includes('MIDFIELDER') ||
         pos === 'CENTRAL MIDFIELD' || pos === 'CENTRE MID' || pos === 'CENTER MID') &&
         // Exclude wingers from midfielders
         !(pos.includes('WG') || pos.includes('WING') || pos.includes('LW') || 
           pos.includes('RW') || pos.includes('LM') || pos.includes('RM') ||
           pos === 'LEFT WING' || pos === 'RIGHT WING' || pos === 'WINGER')) return 'MF';
    if (pos.includes('WG') || pos.includes('WING') || pos.includes('LW') || 
        pos.includes('RW') || pos.includes('LM') || pos.includes('RM') ||
        pos === 'LEFT WING' || pos === 'RIGHT WING' || pos === 'WINGER') return 'WG';
    if (pos.includes('FW') || pos.includes('FORWARD') || pos.includes('ST') || 
        pos.includes('CF') || pos.includes('STRIKER') || pos.includes('CENTRE-FORWARD') ||
        pos === 'CENTRE FORWARD' || pos === 'CENTER FORWARD') return 'FW';
    return 'MF'; // Default fallback
  };

  const formation = {
    goalkeeper: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'GK'),
    defenders: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'DF'),
    midfielders: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'MF'),
    wingers: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'WG'),
    forwards: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'FW')
  };

  return formation;
}

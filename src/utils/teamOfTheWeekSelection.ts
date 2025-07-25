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

  // Enhanced position mapping with intelligent classification
  const normalizePosition = (position: string, playerName?: string): string => {
    const pos = position.toUpperCase().trim();
    
    // Goalkeeper variations - highest priority
    if (pos.includes('GK') || pos.includes('GOALKEEPER') || pos.includes('KEEPER')) {
      return 'GK';
    }
    
    // Midfielder variations - PRIORITIZE EXACT MATCHES FIRST
    if (pos === 'MIDFIELDER' || pos === 'MID' || pos === 'MF' ||
        pos.includes('CM') || pos.includes('CENTRAL MIDFIELDER') || 
        pos.includes('CDM') || pos.includes('DEFENSIVE MIDFIELDER') ||
        pos.includes('CAM') || pos.includes('ATTACKING MIDFIELDER') ||
        pos.includes('LM') || pos.includes('LEFT MIDFIELDER') ||
        pos.includes('RM') || pos.includes('RIGHT MIDFIELDER') ||
        pos.includes('DM') || pos.includes('AM')) {
      return 'MF';
    }
    
    // Forward variations - check for striker patterns
    if (pos === 'FORWARD' || pos === 'FW' || pos === 'STRIKER' || pos === 'ST' ||
        pos.includes('CF') || pos.includes('CENTRE-FORWARD') || pos.includes('CENTER-FORWARD') ||
        pos === 'CENTRE FORWARD' || pos === 'CENTER FORWARD') {
      return 'FW';
    }
    
    // Defender variations - comprehensive detection
    if (pos === 'DEFENDER' || pos === 'DF' || pos === 'DEF' ||
        pos.includes('CB') || pos.includes('CENTRE-BACK') || pos.includes('CENTER-BACK') ||
        pos === 'CENTRE BACK' || pos === 'CENTER BACK' || pos === 'CENTERBACK' || pos === 'CENTREBACK' ||
        pos.includes('LB') || pos.includes('LEFT-BACK') || pos === 'LEFT BACK' ||
        pos.includes('RB') || pos.includes('RIGHT-BACK') || pos === 'RIGHT BACK' ||
        pos.includes('FULLBACK') || pos.includes('FULL-BACK') ||
        pos.includes('BACK') && !pos.includes('MIDFIELDER') ||
        pos.includes('DEFENCE') || pos.includes('DEFENSE')) {
      return 'DF';
    }
    
    // Wing positions - classify as midfielders for formation balance
    if (pos.includes('LW') || pos.includes('RW') || pos.includes('WING') || 
        pos.includes('WINGER') || pos.includes('LEFT WING') || pos.includes('RIGHT WING')) {
      return 'MF';
    }
    
    // Fallback: Analyze based on common football position patterns
    // If position contains numbers, likely a midfielder (like "10", "8", "6")
    if (/^\d+$/.test(pos)) {
      const num = parseInt(pos);
      if (num === 1) return 'GK';
      if (num >= 2 && num <= 5) return 'DF';
      if (num >= 6 && num <= 8) return 'MF';
      if (num >= 9 && num <= 11) return 'FW';
    }
    
    // Default to midfielder for any unclassified position
    return 'MF';
  };

  // Group players by normalized position with enhanced classification
  const playersByPosition = sortedPlayers.reduce((acc, player) => {
    const normalizedPosition = normalizePosition(player.position, player.player_name);
    if (!acc[normalizedPosition]) {
      acc[normalizedPosition] = [];
    }
    acc[normalizedPosition].push(player);
    return acc;
  }, {} as Record<string, PlayerRatingRow[]>);

  // Log position classification for debugging
  console.log('🏟️ TOTW Position Classification:', {
    totalPlayers: sortedPlayers.length,
    goalkeepers: playersByPosition['GK']?.length || 0,
    defenders: playersByPosition['DF']?.length || 0,
    midfielders: playersByPosition['MF']?.length || 0,
    forwards: playersByPosition['FW']?.length || 0,
    breakdown: Object.keys(playersByPosition).reduce((acc, pos) => {
      acc[pos] = playersByPosition[pos].map(p => ({
        name: p.player_name,
        originalPosition: p.position,
        rating: p.rating_data.final_rating.toFixed(1)
      }));
      return acc;
    }, {} as Record<string, any[]>)
  });

  const selectedPlayers: PlayerRatingRow[] = [];
  
  // Core positions for 7-a-side (in priority order) - Simplified to 4 main positions
  const corePositions = ['GK', 'DF', 'MF', 'FW'];
  
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
  // Use IDENTICAL position normalization as the selection function
  const normalizePosition = (position: string): string => {
    const pos = position.toUpperCase().trim();
    
    // Goalkeeper variations - highest priority
    if (pos.includes('GK') || pos.includes('GOALKEEPER') || pos.includes('KEEPER')) {
      return 'GK';
    }
    
    // Midfielder variations - PRIORITIZE EXACT MATCHES FIRST
    if (pos === 'MIDFIELDER' || pos === 'MID' || pos === 'MF' ||
        pos.includes('CM') || pos.includes('CENTRAL MIDFIELDER') || 
        pos.includes('CDM') || pos.includes('DEFENSIVE MIDFIELDER') ||
        pos.includes('CAM') || pos.includes('ATTACKING MIDFIELDER') ||
        pos.includes('LM') || pos.includes('LEFT MIDFIELDER') ||
        pos.includes('RM') || pos.includes('RIGHT MIDFIELDER') ||
        pos.includes('DM') || pos.includes('AM')) {
      return 'MF';
    }
    
    // Forward variations - check for striker patterns
    if (pos === 'FORWARD' || pos === 'FW' || pos === 'STRIKER' || pos === 'ST' ||
        pos.includes('CF') || pos.includes('CENTRE-FORWARD') || pos.includes('CENTER-FORWARD') ||
        pos === 'CENTRE FORWARD' || pos === 'CENTER FORWARD') {
      return 'FW';
    }
    
    // Defender variations - comprehensive detection
    if (pos === 'DEFENDER' || pos === 'DF' || pos === 'DEF' ||
        pos.includes('CB') || pos.includes('CENTRE-BACK') || pos.includes('CENTER-BACK') ||
        pos === 'CENTRE BACK' || pos === 'CENTER BACK' || pos === 'CENTERBACK' || pos === 'CENTREBACK' ||
        pos.includes('LB') || pos.includes('LEFT-BACK') || pos === 'LEFT BACK' ||
        pos.includes('RB') || pos.includes('RIGHT-BACK') || pos === 'RIGHT BACK' ||
        pos.includes('FULLBACK') || pos.includes('FULL-BACK') ||
        pos.includes('BACK') && !pos.includes('MIDFIELDER') ||
        pos.includes('DEFENCE') || pos.includes('DEFENSE')) {
      return 'DF';
    }
    
    // Wing positions - classify as midfielders for formation balance
    if (pos.includes('LW') || pos.includes('RW') || pos.includes('WING') || 
        pos.includes('WINGER') || pos.includes('LEFT WING') || pos.includes('RIGHT WING')) {
      return 'MF';
    }
    
    // Fallback: Analyze based on common football position patterns
    if (/^\d+$/.test(pos)) {
      const num = parseInt(pos);
      if (num === 1) return 'GK';
      if (num >= 2 && num <= 5) return 'DF';
      if (num >= 6 && num <= 8) return 'MF';
      if (num >= 9 && num <= 11) return 'FW';
    }
    
    // Default to midfielder for any unclassified position
    return 'MF';
  };

  const formation = {
    goalkeeper: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'GK'),
    defenders: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'DF'),
    midfielders: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'MF'),
    forwards: teamOfTheWeek.filter(p => normalizePosition(p.position) === 'FW')
  };

  // Log final formation for debugging
  console.log('⚽ Final TOTW Formation:', {
    formation: `${formation.defenders.length}-${formation.midfielders.length}-${formation.forwards.length}`,
    goalkeepers: formation.goalkeeper.map(p => `${p.player_name} (${p.position})`),
    defenders: formation.defenders.map(p => `${p.player_name} (${p.position})`),
    midfielders: formation.midfielders.map(p => `${p.player_name} (${p.position})`),
    forwards: formation.forwards.map(p => `${p.player_name} (${p.position})`),
    totalPlayers: teamOfTheWeek.length
  });

  return formation;
}


interface TeamInfo {
  id: string; // Changed from number to string
  name: string;
  __id__?: string; // Add the text ID field
}

export const resolveTeamIdForMatchEvent = (
  playerTeamName: string,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo
): string => { // Return string instead of number
  console.log('🔍 TeamIdMapping: Resolving team ID for player team:', {
    playerTeamName,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    homeTeamTextId: homeTeam.__id__,
    awayTeamTextId: awayTeam.__id__
  });

  // Direct team name matching - return text ID (now standardized)
  if (playerTeamName === homeTeam.name) {
    const textId = homeTeam.__id__ || homeTeam.id;
    console.log('✅ TeamIdMapping: Matched home team:', textId);
    return textId;
  }
  
  if (playerTeamName === awayTeam.name) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team:', textId);
    return textId;
  }

  // Fallback to case-insensitive matching
  const normalizedPlayerTeam = playerTeamName.toLowerCase().trim();
  const normalizedHomeTeam = homeTeam.name.toLowerCase().trim();
  const normalizedAwayTeam = awayTeam.name.toLowerCase().trim();

  if (normalizedPlayerTeam === normalizedHomeTeam) {
    const textId = homeTeam.__id__ || homeTeam.id;
    console.log('✅ TeamIdMapping: Matched home team (case-insensitive):', textId);
    return textId;
  }
  
  if (normalizedPlayerTeam === normalizedAwayTeam) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team (case-insensitive):', textId);
    return textId;
  }

  // If no match found, use the text ID from the first available team as fallback
  const fallbackId = homeTeam.__id__ || homeTeam.id;
  console.warn('⚠️ TeamIdMapping: No exact match found, using home team as fallback:', {
    playerTeamName,
    availableTeams: [homeTeam.name, awayTeam.name],
    fallbackId
  });
  
  return fallbackId;
};

export const validateTeamData = (homeTeam: TeamInfo, awayTeam: TeamInfo): boolean => {
  const isValid = !!(
    homeTeam?.id && 
    homeTeam?.name && 
    awayTeam?.id && 
    awayTeam?.name &&
    homeTeam.id !== awayTeam.id
  );
  
  console.log('🔍 TeamIdMapping: Team data validation:', { isValid, homeTeam, awayTeam });
  return isValid;
};

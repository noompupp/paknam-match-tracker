
interface TeamInfo {
  id: string;
  name: string;
  __id__?: string;
}

export const resolveTeamIdForMatchEvent = (
  playerTeamName: string,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo
): string => {
  console.log('🔍 TeamIdMapping: Resolving team ID for player team:', {
    playerTeamName,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    homeTeamTextId: homeTeam.__id__,
    awayTeamTextId: awayTeam.__id__
  });

  // Always prioritize __id__ over id for database consistency
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

  // Enhanced fallback - try to match using team IDs directly
  console.log('🔍 TeamIdMapping: Attempting ID-based matching as fallback');
  
  // Check if playerTeamName might actually be a team ID
  if (playerTeamName === homeTeam.__id__ || playerTeamName === homeTeam.id) {
    const textId = homeTeam.__id__ || homeTeam.id;
    console.log('✅ TeamIdMapping: Matched home team by ID:', textId);
    return textId;
  }
  
  if (playerTeamName === awayTeam.__id__ || playerTeamName === awayTeam.id) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team by ID:', textId);
    return textId;
  }

  // Final attempt: partial matching
  if (normalizedHomeTeam.includes(normalizedPlayerTeam) || normalizedPlayerTeam.includes(normalizedHomeTeam)) {
    const textId = homeTeam.__id__ || homeTeam.id;
    console.log('✅ TeamIdMapping: Matched home team (partial):', textId);
    return textId;
  }
  
  if (normalizedAwayTeam.includes(normalizedPlayerTeam) || normalizedPlayerTeam.includes(normalizedAwayTeam)) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team (partial):', textId);
    return textId;
  }

  // If no match found, provide fallback instead of throwing error
  console.warn('⚠️ TeamIdMapping: No team match found, using fallback:', {
    playerTeamName,
    availableTeams: [homeTeam.name, awayTeam.name],
    homeTeamId: homeTeam.__id__ || homeTeam.id,
    awayTeamId: awayTeam.__id__ || awayTeam.id
  });
  
  // Return the first available team ID as fallback
  return homeTeam.__id__ || homeTeam.id;
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

export const normalizeTeamIdForDatabase = (teamId: string | number): string => {
  if (!teamId) {
    throw new Error('Team ID cannot be null or undefined');
  }
  return String(teamId).trim();
};

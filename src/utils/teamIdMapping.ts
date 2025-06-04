
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

  // If no match found, throw error instead of using fallback
  console.error('❌ TeamIdMapping: No team match found:', {
    playerTeamName,
    availableTeams: [homeTeam.name, awayTeam.name],
    homeTeamId: homeTeam.__id__ || homeTeam.id,
    awayTeamId: awayTeam.__id__ || awayTeam.id
  });
  
  throw new Error(`Cannot resolve team ID for player team "${playerTeamName}". Available teams: ${homeTeam.name}, ${awayTeam.name}`);
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

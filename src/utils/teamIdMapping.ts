
interface TeamInfo {
  id: number;
  name: string;
}

export const resolveTeamIdForMatchEvent = (
  playerTeamName: string,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo
): number => {
  console.log('🔍 TeamIdMapping: Resolving team ID for player team:', {
    playerTeamName,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name
  });

  // Direct team name matching
  if (playerTeamName === homeTeam.name) {
    console.log('✅ TeamIdMapping: Matched home team:', homeTeam.id);
    return homeTeam.id;
  }
  
  if (playerTeamName === awayTeam.name) {
    console.log('✅ TeamIdMapping: Matched away team:', awayTeam.id);
    return awayTeam.id;
  }

  // Fallback to case-insensitive matching
  const normalizedPlayerTeam = playerTeamName.toLowerCase().trim();
  const normalizedHomeTeam = homeTeam.name.toLowerCase().trim();
  const normalizedAwayTeam = awayTeam.name.toLowerCase().trim();

  if (normalizedPlayerTeam === normalizedHomeTeam) {
    console.log('✅ TeamIdMapping: Matched home team (case-insensitive):', homeTeam.id);
    return homeTeam.id;
  }
  
  if (normalizedPlayerTeam === normalizedAwayTeam) {
    console.log('✅ TeamIdMapping: Matched away team (case-insensitive):', awayTeam.id);
    return awayTeam.id;
  }

  // If no match found, throw error instead of defaulting
  console.error('❌ TeamIdMapping: No team match found for:', {
    playerTeamName,
    availableTeams: [homeTeam.name, awayTeam.name]
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

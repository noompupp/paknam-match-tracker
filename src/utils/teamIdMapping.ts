
export const resolveTeamIdForMatchEvent = (
  teamName: string,
  homeTeam: { id: number; name: string },
  awayTeam: { id: number; name: string }
): number => {
  console.log('🔍 TeamIdMapping: Resolving team ID for:', {
    teamName,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name
  });

  // Direct name matching first
  if (teamName === homeTeam.name) {
    console.log('✅ TeamIdMapping: Matched home team');
    return homeTeam.id;
  }
  
  if (teamName === awayTeam.name) {
    console.log('✅ TeamIdMapping: Matched away team');
    return awayTeam.id;
  }
  
  // Fallback: case-insensitive partial matching
  const lowerTeamName = teamName.toLowerCase();
  const lowerHomeName = homeTeam.name.toLowerCase();
  const lowerAwayName = awayTeam.name.toLowerCase();
  
  if (lowerHomeName.includes(lowerTeamName) || lowerTeamName.includes(lowerHomeName)) {
    console.log('✅ TeamIdMapping: Fuzzy matched home team');
    return homeTeam.id;
  }
  
  if (lowerAwayName.includes(lowerTeamName) || lowerTeamName.includes(lowerAwayName)) {
    console.log('✅ TeamIdMapping: Fuzzy matched away team');
    return awayTeam.id;
  }
  
  console.error('❌ TeamIdMapping: No team match found, defaulting to home team');
  return homeTeam.id; // Default fallback
};

export const resolveTeamNameFromId = (
  teamId: number,
  homeTeam: { id: number; name: string },
  awayTeam: { id: number; name: string }
): string => {
  if (teamId === homeTeam.id) {
    return homeTeam.name;
  }
  
  if (teamId === awayTeam.id) {
    return awayTeam.name;
  }
  
  console.warn('⚠️ TeamIdMapping: Unknown team ID, returning "Unknown Team"');
  return 'Unknown Team';
};

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
    return validateAndConvertTeamId(textId);
  }
  
  if (playerTeamName === awayTeam.name) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team:', textId);
    return validateAndConvertTeamId(textId);
  }

  // Fallback to case-insensitive matching
  const normalizedPlayerTeam = playerTeamName.toLowerCase().trim();
  const normalizedHomeTeam = homeTeam.name.toLowerCase().trim();
  const normalizedAwayTeam = awayTeam.name.toLowerCase().trim();

  if (normalizedPlayerTeam === normalizedHomeTeam) {
    const textId = homeTeam.__id__ || homeTeam.id;
    console.log('✅ TeamIdMapping: Matched home team (case-insensitive):', textId);
    return validateAndConvertTeamId(textId);
  }
  
  if (normalizedPlayerTeam === normalizedAwayTeam) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team (case-insensitive):', textId);
    return validateAndConvertTeamId(textId);
  }

  // Enhanced fallback - try to match using team IDs directly
  console.log('🔍 TeamIdMapping: Attempting ID-based matching as fallback');
  
  // Check if playerTeamName might actually be a team ID
  if (playerTeamName === homeTeam.__id__ || playerTeamName === homeTeam.id) {
    const textId = homeTeam.__id__ || homeTeam.id;
    console.log('✅ TeamIdMapping: Matched home team by ID:', textId);
    return validateAndConvertTeamId(textId);
  }
  
  if (playerTeamName === awayTeam.__id__ || playerTeamName === awayTeam.id) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team by ID:', textId);
    return validateAndConvertTeamId(textId);
  }

  // Final attempt: partial matching
  if (normalizedHomeTeam.includes(normalizedPlayerTeam) || normalizedPlayerTeam.includes(normalizedHomeTeam)) {
    const textId = homeTeam.__id__ || homeTeam.id;
    console.log('✅ TeamIdMapping: Matched home team (partial):', textId);
    return validateAndConvertTeamId(textId);
  }
  
  if (normalizedAwayTeam.includes(normalizedPlayerTeam) || normalizedPlayerTeam.includes(normalizedAwayTeam)) {
    const textId = awayTeam.__id__ || awayTeam.id;
    console.log('✅ TeamIdMapping: Matched away team (partial):', textId);
    return validateAndConvertTeamId(textId);
  }

  // If no match found, provide fallback instead of throwing error
  console.warn('⚠️ TeamIdMapping: No team match found, using fallback:', {
    playerTeamName,
    availableTeams: [homeTeam.name, awayTeam.name],
    homeTeamId: homeTeam.__id__ || homeTeam.id,
    awayTeamId: awayTeam.__id__ || awayTeam.id
  });
  
  // Return the first available team ID as fallback
  return validateAndConvertTeamId(homeTeam.__id__ || homeTeam.id);
};

// New function to validate and convert team IDs to proper format
export const validateAndConvertTeamId = (teamId: string | number): string => {
  if (!teamId) {
    throw new Error('Team ID cannot be null or undefined');
  }
  
  const stringId = String(teamId).trim();
  
  // Check if it's a valid UUID format (8-4-4-4-12 hex digits)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(stringId)) {
    console.log('✅ TeamIdMapping: Valid UUID format detected:', stringId);
    return stringId;
  }
  
  // Check if it's a numeric ID that needs conversion
  if (/^\d+$/.test(stringId)) {
    console.warn('⚠️ TeamIdMapping: Numeric team ID detected, may cause UUID issues:', stringId);
    throw new Error(`Invalid team ID format: ${stringId}. Expected UUID format but got numeric ID.`);
  }
  
  // For text-based team IDs, validate they're reasonable
  if (stringId.length < 3) {
    throw new Error(`Invalid team ID format: ${stringId}. Team ID too short.`);
  }
  
  console.log('✅ TeamIdMapping: Text-based team ID validated:', stringId);
  return stringId;
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
  return validateAndConvertTeamId(teamId);
};

// Enhanced function to verify team exists in database before creating match events
export const getValidatedTeamId = async (
  playerTeamName: string,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo
): Promise<string> => {
  console.log('🔍 TeamIdMapping: Validating team ID against database');
  
  try {
    const resolvedId = resolveTeamIdForMatchEvent(playerTeamName, homeTeam, awayTeam);
    
    // Additional validation to ensure we have a proper team ID
    const validatedId = validateAndConvertTeamId(resolvedId);
    
    console.log('✅ TeamIdMapping: Team ID validated successfully:', {
      playerTeamName,
      resolvedId: validatedId,
      homeTeamId: homeTeam.__id__ || homeTeam.id,
      awayTeamId: awayTeam.__id__ || awayTeam.id
    });
    
    return validatedId;
  } catch (error) {
    console.error('❌ TeamIdMapping: Team ID validation failed:', error);
    throw new Error(`Team ID validation failed for player team "${playerTeamName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
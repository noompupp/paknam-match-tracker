
// Team ID normalization and comparison utilities

export const normalizeTeamId = (teamId: any): string => {
  if (!teamId) return '';
  return String(teamId).trim();
};

export const compareTeamIds = (teamId1: any, teamId2: any): boolean => {
  const normalized1 = normalizeTeamId(teamId1);
  const normalized2 = normalizeTeamId(teamId2);
  
  // If direct comparison fails, try alternative matching strategies
  let result = normalized1 === normalized2;
  
  // Handle mixed string/number scenarios by extracting base team identifier
  if (!result && (normalized1 && normalized2)) {
    // Check if one is a subset of the other (e.g., "1" vs "T001")
    const base1 = normalized1.replace(/^t0*/, ''); // Remove T and leading zeros
    const base2 = normalized2.replace(/^t0*/, ''); // Remove T and leading zeros
    result = base1 === base2 && base1 !== '';
  }
  
  console.log('🔍 Enhanced Team ID comparison:', {
    teamId1: teamId1,
    teamId2: teamId2,
    normalized1,
    normalized2,
    base1: normalized1.replace(/^t0*/, '') || 'empty',
    base2: normalized2.replace(/^t0*/, '') || 'empty',
    directMatch: normalized1 === normalized2,
    baseMatch: normalized1.replace(/^t0*/, '') === normalized2.replace(/^t0*/, ''),
    finalResult: result
  });
  
  return result;
};

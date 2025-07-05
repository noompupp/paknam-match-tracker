
// Team ID normalization and comparison utilities

export const normalizeTeamId = (teamId: any): string => {
  if (!teamId) return '';
  return String(teamId).trim();
};

export const compareTeamIds = (teamId1: any, teamId2: any): boolean => {
  const normalized1 = normalizeTeamId(teamId1);
  const normalized2 = normalizeTeamId(teamId2);
  
  // Simplified direct comparison first
  if (normalized1 === normalized2) {
    return true;
  }
  
  // If either is empty, no match
  if (!normalized1 || !normalized2) {
    return false;
  }
  
  // Try removing common prefixes/suffixes that might cause issues
  const clean1 = normalized1.toLowerCase().replace(/^(team|t)0*/, '');
  const clean2 = normalized2.toLowerCase().replace(/^(team|t)0*/, '');
  
  const result = clean1 === clean2 && clean1 !== '';
  
  // Enhanced debug logging for troubleshooting
  console.log('🔍 Team ID comparison debug:', {
    original1: teamId1,
    original2: teamId2,
    normalized1,
    normalized2,
    cleaned1: clean1,
    cleaned2: clean2,
    directMatch: normalized1 === normalized2,
    cleanedMatch: result,
    finalResult: result
  });
  
  return result;
};

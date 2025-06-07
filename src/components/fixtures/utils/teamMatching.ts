
// Team ID normalization and comparison utilities

export const normalizeTeamId = (teamId: any): string => {
  if (!teamId) return '';
  return String(teamId).trim();
};

export const compareTeamIds = (teamId1: any, teamId2: any): boolean => {
  const normalized1 = normalizeTeamId(teamId1);
  const normalized2 = normalizeTeamId(teamId2);
  const result = normalized1 === normalized2;
  
  console.log('🔍 Team ID comparison:', {
    teamId1: teamId1,
    teamId2: teamId2,
    normalized1,
    normalized2,
    match: result
  });
  
  return result;
};

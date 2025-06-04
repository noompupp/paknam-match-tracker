
// Helper function to normalize IDs for consistent matching
export const normalizeId = (id: any): string => {
  if (id === null || id === undefined) return '';
  return String(id).trim().toLowerCase();
};

export const findTeamByMemberId = (memberId: string, teams: any[]) => {
  const normalizedMemberTeamId = normalizeId(memberId);
  return teams?.find(t => normalizeId(t.__id__) === normalizedMemberTeamId);
};

export const filterMembersByTeam = (members: any[], normalizedTeamId: string) => {
  return members?.filter(member => 
    normalizeId(member.team_id) === normalizedTeamId
  ) || [];
};

export const logTeamMemberMapping = (members: any[], teams: any[]) => {
  console.log('📊 TeamIdUtils: Team members filtering analysis:', {
    allMembersCount: members?.length || 0,
    memberMappings: members?.map(m => ({
      name: m.name,
      team_id: m.team_id,
      normalized: normalizeId(m.team_id)
    })) || []
  });
};

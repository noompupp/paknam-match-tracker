
import { normalizeId, logTeamMemberMapping } from '../teamIdUtils';

export const validateMembersData = (members: any[]) => {
  if (!members || members.length === 0) {
    console.warn('⚠️ DataProcessingUtils: No members found in database');
    return false;
  }
  return true;
};

export const logMemberTransformation = (member: any, team: any) => {
  console.log('🔄 DataProcessingUtils: Transforming member:', {
    memberName: member.name,
    memberTeamId: member.team_id,
    normalizedMemberTeamId: normalizeId(member.team_id),
    foundTeam: team ? { 
      id: team.id, 
      name: team.name, 
      textId: team.__id__,
      normalizedTextId: normalizeId(team.__id__)
    } : null
  });
};

export const logTransformationResult = (transformed: any) => {
  console.log('✅ DataProcessingUtils: Transformed member:', {
    name: transformed.name,
    hasTeam: !!transformed.team,
    teamName: transformed.team?.name
  });
};

export const logProcessingResults = (transformedMembers: any[]) => {
  console.log('✅ DataProcessingUtils: Successfully transformed members:', {
    count: transformedMembers.length,
    membersWithTeams: transformedMembers.filter(m => m.team).length,
    membersWithoutTeams: transformedMembers.filter(m => !m.team).length
  });
};

export const prepareDataProcessing = (members: any[], teams: any[]) => {
  logTeamMemberMapping(members, teams);
};

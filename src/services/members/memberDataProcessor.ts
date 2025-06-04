
import { normalizeId, findTeamByMemberId, filterMembersByTeam, logTeamMemberMapping } from './teamIdUtils';
import { transformMemberWithTeam } from './memberTransformations';

export const processAllMembersData = (members: any[], teams: any[]) => {
  if (!members || members.length === 0) {
    console.warn('⚠️ MemberDataProcessor: No members found in database');
    return [];
  }

  logTeamMemberMapping(members, teams);
  
  const transformedMembers = members.map(member => {
    const team = findTeamByMemberId(member.team_id, teams);
    
    console.log('🔄 MemberDataProcessor: Transforming member:', {
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
    
    const transformed = transformMemberWithTeam(member, team);

    console.log('✅ MemberDataProcessor: Transformed member:', {
      name: transformed.name,
      hasTeam: !!transformed.team,
      teamName: transformed.team?.name
    });

    return transformed;
  });

  console.log('✅ MemberDataProcessor: Successfully transformed members:', {
    count: transformedMembers.length,
    membersWithTeams: transformedMembers.filter(m => m.team).length,
    membersWithoutTeams: transformedMembers.filter(m => !m.team).length
  });
  
  return transformedMembers;
};

export const processTeamMembersData = (teamMembers: any[], team: any, teamId: number) => {
  if (teamMembers.length === 0) {
    console.warn('⚠️ MemberDataProcessor: No members found for team:', {
      teamId,
      teamName: team.name,
      textId: team.__id__
    });
    return [];
  }
  
  const transformedMembers = teamMembers.map(member => {
    console.log('🔄 MemberDataProcessor: Transforming team member:', {
      name: member.name,
      team_id: member.team_id,
      teamName: team.name
    });

    return transformMemberWithTeam(member, {
      id: team.id || 0,
      name: team.name || '',
      logo: team.logo || '⚽',
      founded: team.founded || '2020',
      captain: team.captain || '',
      position: team.position || 1,
      points: team.points || 0,
      played: team.played || 0,
      won: team.won || 0,
      drawn: team.drawn || 0,
      lost: team.lost || 0,
      goals_for: team.goals_for || 0,
      goals_against: team.goals_against || 0,
      goal_difference: team.goal_difference || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __id__: team.__id__
    });
  });

  console.log('✅ MemberDataProcessor: Successfully transformed team members:', {
    teamName: team.name,
    count: transformedMembers.length
  });
  
  return transformedMembers;
};

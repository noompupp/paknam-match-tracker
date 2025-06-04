
import { transformMemberWithTeam } from '../memberTransformations';

export const validateTeamMembersData = (teamMembers: any[], team: any, teamId: number) => {
  if (teamMembers.length === 0) {
    console.warn('⚠️ TeamMemberProcessor: No members found for team:', {
      teamId,
      teamName: team.name,
      textId: team.__id__
    });
    return false;
  }
  return true;
};

export const logTeamMemberTransformation = (member: any, team: any) => {
  console.log('🔄 TeamMemberProcessor: Transforming team member:', {
    name: member.name,
    team_id: member.team_id,
    teamName: team.name
  });
};

export const createTeamForTransformation = (team: any) => {
  return {
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
  };
};

export const processTeamMemberTransformation = (teamMembers: any[], team: any) => {
  const teamForTransformation = createTeamForTransformation(team);
  
  return teamMembers.map(member => {
    logTeamMemberTransformation(member, team);
    return transformMemberWithTeam(member, teamForTransformation);
  });
};

export const logTeamProcessingResults = (transformedMembers: any[], team: any) => {
  console.log('✅ TeamMemberProcessor: Successfully transformed team members:', {
    teamName: team.name,
    count: transformedMembers.length
  });
};

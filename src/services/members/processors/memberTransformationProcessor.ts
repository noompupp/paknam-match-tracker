
import { findTeamByMemberId } from '../teamIdUtils';
import { transformMemberWithTeam } from '../memberTransformations';
import { logMemberTransformation, logTransformationResult } from './dataProcessingUtils';

export const processSingleMember = (member: any, teams: any[]) => {
  const team = findTeamByMemberId(member.team_id, teams);
  
  logMemberTransformation(member, team);
  
  const transformed = transformMemberWithTeam(member, team);

  logTransformationResult(transformed);

  return transformed;
};

export const processAllMembersTransformation = (members: any[], teams: any[]) => {
  return members.map(member => processSingleMember(member, teams));
};

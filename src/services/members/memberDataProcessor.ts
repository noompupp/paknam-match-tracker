
import { 
  validateMembersData, 
  logProcessingResults, 
  prepareDataProcessing,
  processAllMembersTransformation,
  validateTeamMembersData,
  processTeamMemberTransformation,
  logTeamProcessingResults
} from './processors';

export const processAllMembersData = (members: any[], teams: any[]) => {
  if (!validateMembersData(members)) {
    return [];
  }

  prepareDataProcessing(members, teams);
  
  const transformedMembers = processAllMembersTransformation(members, teams);

  logProcessingResults(transformedMembers);
  
  return transformedMembers;
};

export const processTeamMembersData = (teamMembers: any[], team: any, teamId: number) => {
  if (!validateTeamMembersData(teamMembers, team, teamId)) {
    return [];
  }
  
  const transformedMembers = processTeamMemberTransformation(teamMembers, team);

  logTeamProcessingResults(transformedMembers, team);
  
  return transformedMembers;
};

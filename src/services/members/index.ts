
import { 
  fetchAllMembers, 
  fetchAllTeams, 
  fetchTeamByNumericId, 
  fetchMembersByTeamFilter,
  updateMemberStats
} from './memberQueries';
import { processAllMembersData, processTeamMembersData } from './memberDataProcessor';
import { normalizeId, filterMembersByTeam } from './teamIdUtils';
import { transformMemberStats } from './memberTransformations';
import { Member } from '@/types/database';

export const membersApi = {
  getAll: async () => {
    const members = await fetchAllMembers();
    const teams = await fetchAllTeams();
    return processAllMembersData(members, teams);
  },

  getByTeam: async (teamId: number) => {
    console.log('🔍 MembersAPI: Getting members by team ID:', teamId);
    
    const team = await fetchTeamByNumericId(teamId);
    if (!team) {
      return [];
    }
    
    const normalizedTeamId = normalizeId(team.__id__);
    const allMembers = await fetchMembersByTeamFilter(normalizedTeamId);
    const teamMembers = filterMembersByTeam(allMembers, normalizedTeamId);
    
    console.log('📊 MembersAPI: Team members filtering:', {
      teamName: team.name,
      targetNormalizedId: normalizedTeamId,
      allMembersCount: allMembers?.length || 0,
      filteredMembersCount: teamMembers.length
    });
    
    return processTeamMembersData(teamMembers, team, teamId);
  },

  updateStats: async (id: number, stats: { goals?: number; assists?: number }) => {
    const data = await updateMemberStats(id, stats);
    return transformMemberStats(data);
  }
};

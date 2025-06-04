
import { Member, Team } from '@/types/database';

interface RawMemberData {
  id: number;
  name: string;
  nickname?: string;
  number?: string;
  position?: string;
  role?: string;
  team_id: string;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  total_minutes_played?: number;
  matches_played?: number;
  created_at: string;
  updated_at: string;
  teams?: {
    id: number;
    __id__: string;
    name: string;
    logo?: string;
    color?: string;
  };
}

export const processAllMembersData = (rawMembers: any[], teams: Team[]): Member[] => {
  console.log('🔧 MemberDataProcessor: Processing all members data with enhanced stats:', {
    rawMembersCount: rawMembers?.length || 0,
    teamsCount: teams?.length || 0
  });

  if (!rawMembers || rawMembers.length === 0) {
    console.log('📊 MemberDataProcessor: No members to process');
    return [];
  }

  const processedMembers = rawMembers.map(member => {
    // Handle team data - check if teams property exists and is valid
    let teamData: Team | undefined;
    
    if (member.teams && typeof member.teams === 'object' && !member.teams.error) {
      // Use the joined team data if available and valid
      teamData = {
        id: member.teams.id,
        __id__: member.teams.__id__,
        name: member.teams.name || 'Unknown Team',
        logo: member.teams.logo || '⚽',
        logoURL: member.teams.logoURL,
        founded: member.teams.founded || '2020',
        captain: member.teams.captain || '',
        position: member.teams.position || 1,
        points: member.teams.points || 0,
        played: member.teams.played || 0,
        won: member.teams.won || 0,
        drawn: member.teams.drawn || 0,
        lost: member.teams.lost || 0,
        goals_for: member.teams.goals_for || 0,
        goals_against: member.teams.goals_against || 0,
        goal_difference: member.teams.goal_difference || 0,
        color: member.teams.color,
        created_at: member.teams.created_at || new Date().toISOString(),
        updated_at: member.teams.updated_at || new Date().toISOString()
      };
    } else {
      // Fallback to finding the team in the teams array
      teamData = teams.find(t => t.__id__ === member.team_id);
      if (teamData) {
        teamData = {
          ...teamData,
          created_at: teamData.created_at || new Date().toISOString(),
          updated_at: teamData.updated_at || new Date().toISOString()
        };
      }
    }
    
    const processedMember: Member = {
      id: member.id,
      name: member.name || 'Unknown Player',
      nickname: member.nickname,
      number: member.number || '',
      position: member.position || 'Player',
      role: member.role || 'Player',
      team_id: member.team_id,
      goals: member.goals || 0,
      assists: member.assists || 0,
      yellow_cards: member.yellow_cards || 0,
      red_cards: member.red_cards || 0,
      total_minutes_played: member.total_minutes_played || 0,
      matches_played: member.matches_played || 0,
      created_at: member.created_at,
      updated_at: member.updated_at,
      team: teamData
    };

    return processedMember;
  });

  console.log('✅ MemberDataProcessor: Successfully processed members with enhanced stats:', {
    processedCount: processedMembers.length,
    sampleMember: processedMembers[0] ? {
      name: processedMembers[0].name,
      goals: processedMembers[0].goals,
      assists: processedMembers[0].assists,
      yellow_cards: processedMembers[0].yellow_cards,
      red_cards: processedMembers[0].red_cards,
      team: processedMembers[0].team?.name
    } : null
  });

  return processedMembers;
};

export const processTeamMembersData = (rawMembers: any[], team: Team, teamId: number): Member[] => {
  console.log('🔧 MemberDataProcessor: Processing team members data with enhanced stats:', {
    teamName: team.name,
    teamId,
    rawMembersCount: rawMembers?.length || 0
  });

  if (!rawMembers || rawMembers.length === 0) {
    console.log('📊 MemberDataProcessor: No team members to process');
    return [];
  }

  const processedMembers = rawMembers.map(member => {
    const processedMember: Member = {
      id: member.id,
      name: member.name || 'Unknown Player',
      nickname: member.nickname,
      number: member.number || '',
      position: member.position || 'Player',
      role: member.role || 'Player',
      team_id: member.team_id,
      goals: member.goals || 0,
      assists: member.assists || 0,
      yellow_cards: member.yellow_cards || 0,
      red_cards: member.red_cards || 0,
      total_minutes_played: member.total_minutes_played || 0,
      matches_played: member.matches_played || 0,
      created_at: member.created_at,
      updated_at: member.updated_at,
      team: {
        id: team.id,
        __id__: team.__id__,
        name: team.name || 'Unknown Team',
        logo: team.logo || '⚽',
        logoURL: team.logoURL,
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
        color: team.color,
        created_at: team.created_at || new Date().toISOString(),
        updated_at: team.updated_at || new Date().toISOString()
      }
    };

    return processedMember;
  });

  console.log('✅ MemberDataProcessor: Successfully processed team members with enhanced stats:', {
    processedCount: processedMembers.length,
    teamName: team.name,
    sampleMember: processedMembers[0] ? {
      name: processedMembers[0].name,
      goals: processedMembers[0].goals,
      assists: processedMembers[0].assists,
      yellow_cards: processedMembers[0].yellow_cards,
      red_cards: processedMembers[0].red_cards
    } : null
  });

  return processedMembers;
};

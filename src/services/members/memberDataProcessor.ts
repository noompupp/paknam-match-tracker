
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

export const processAllMembersData = (rawMembers: RawMemberData[], teams: Team[]): Member[] => {
  console.log('🔧 MemberDataProcessor: Processing all members data with enhanced stats:', {
    rawMembersCount: rawMembers?.length || 0,
    teamsCount: teams?.length || 0
  });

  if (!rawMembers || rawMembers.length === 0) {
    console.log('📊 MemberDataProcessor: No members to process');
    return [];
  }

  const processedMembers = rawMembers.map(member => {
    // Find the team for this member
    const team = teams.find(t => t.__id__ === member.team_id);
    
    return {
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
      team: team ? {
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
        created_at: team.created_at,
        updated_at: team.updated_at
      } : undefined
    } as Member;
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

export const processTeamMembersData = (rawMembers: RawMemberData[], team: Team, teamId: number): Member[] => {
  console.log('🔧 MemberDataProcessor: Processing team members data with enhanced stats:', {
    teamName: team.name,
    teamId,
    rawMembersCount: rawMembers?.length || 0
  });

  if (!rawMembers || rawMembers.length === 0) {
    console.log('📊 MemberDataProcessor: No team members to process');
    return [];
  }

  const processedMembers = rawMembers.map(member => ({
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
      created_at: team.created_at,
      updated_at: team.updated_at
    }
  })) as Member[];

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

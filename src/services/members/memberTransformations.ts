
import { Member, Team } from '@/types/database';

export const transformMemberWithTeam = (member: any, team: Team | undefined): Member => {
  return {
    id: member.id || 0,
    name: member.name || '',
    number: parseInt(member.number || '0') || 0,
    position: member.position || 'Player',
    role: member.role || 'Player',
    goals: member.goals || 0,
    assists: member.assists || 0,
    team_id: team?.__id__ || '0', // Use text ID and convert to string
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team: team ? {
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
      updated_at: new Date().toISOString()
    } : undefined
  } as Member;
};

export const transformMemberStats = (member: any): Member => {
  return {
    id: member.id || 0,
    name: member.name || '',
    number: parseInt(member.number || '0') || 0,
    position: member.position || 'Player',
    role: member.role || 'Player',
    goals: member.goals || 0,
    assists: member.assists || 0,
    team_id: '0', // Default to string '0'
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Member;
};

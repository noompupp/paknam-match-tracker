
import { Member } from '@/types/database';

export const transformMemberStats = (data: any): Member => {
  console.log('🔄 MemberTransformations: Transforming member stats data:', data);
  
  return {
    id: data.id,
    name: data.name || 'Unknown Player',
    nickname: data.nickname,
    number: data.number || '',
    position: data.position || 'Player',
    role: data.role || 'Player',
    team_id: data.team_id,
    goals: data.goals || 0,
    assists: data.assists || 0,
    yellow_cards: data.yellow_cards || 0,
    red_cards: data.red_cards || 0,
    total_minutes_played: data.total_minutes_played || 0,
    matches_played: data.matches_played || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    team: data.teams ? {
      id: data.teams.id,
      __id__: data.teams.__id__,
      name: data.teams.name || 'Unknown Team',
      logo: data.teams.logo || '⚽',
      logoURL: data.teams.logoURL,
      founded: data.teams.founded || '2020',
      captain: data.teams.captain || '',
      position: data.teams.position || 1,
      points: data.teams.points || 0,
      played: data.teams.played || 0,
      won: data.teams.won || 0,
      drawn: data.teams.drawn || 0,
      lost: data.teams.lost || 0,
      goals_for: data.teams.goals_for || 0,
      goals_against: data.teams.goals_against || 0,
      goal_difference: data.teams.goal_difference || 0,
      color: data.teams.color,
      created_at: data.teams.created_at,
      updated_at: data.teams.updated_at
    } : undefined
  } as Member;
};

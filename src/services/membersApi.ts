
import { supabase } from '@/integrations/supabase/client';
import { Member } from '@/types/database';

export const membersApi = {
  getAll: async () => {
    console.log('🔍 MembersAPI: Starting getAll request...');
    
    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true });
    
    if (membersError) {
      console.error('❌ MembersAPI: Error fetching members:', membersError);
      throw membersError;
    }
    
    console.log('📊 MembersAPI: Raw members data from database:', {
      count: members?.length || 0,
      sample: members?.[0] || null,
      allData: members
    });
    
    if (!members || members.length === 0) {
      console.warn('⚠️ MembersAPI: No members found in database');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ MembersAPI: Error fetching teams for members:', teamsError);
      throw teamsError;
    }

    console.log('📊 MembersAPI: Teams data for joining:', {
      count: teams?.length || 0,
      sample: teams?.[0] || null
    });
    
    const transformedMembers = members.map(member => {
      // Find the team using the text team_id
      const team = teams?.find(t => t.__id__ === member.team_id);
      
      console.log('🔄 MembersAPI: Transforming member:', {
        memberName: member.name,
        memberTeamId: member.team_id,
        foundTeam: team ? { id: team.id, name: team.name } : null
      });
      
      return {
        id: member.id || 0,
        name: member.name || '',
        number: parseInt(member.number || '0') || 0,
        position: member.position || 'Player',
        role: member.role || 'Player',
        goals: member.goals || 0,
        assists: member.assists || 0,
        team_id: team?.id || 0,
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
    });

    console.log('✅ MembersAPI: Successfully transformed members:', {
      count: transformedMembers.length,
      firstMember: transformedMembers[0] || null,
      membersWithTeams: transformedMembers.filter(m => m.team).length
    });
    
    return transformedMembers;
  },

  getByTeam: async (teamId: number) => {
    console.log('🔍 MembersAPI: Getting members by team ID:', teamId);
    
    // First find the team's text ID using the numeric ID
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('__id__, name')
      .eq('id', teamId)
      .single();
    
    if (teamError || !team) {
      console.warn('⚠️ MembersAPI: No team found for id:', teamId, teamError);
      return [];
    }

    console.log('✅ MembersAPI: Found team text ID:', team.__id__, 'for numeric ID:', teamId);
    
    // Get members using the text team ID
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('team_id', team.__id__)
      .order('name', { ascending: true });
    
    if (membersError) {
      console.error('❌ MembersAPI: Error fetching team members:', membersError);
      throw membersError;
    }
    
    console.log('📊 MembersAPI: Raw team members data:', {
      teamName: team.name,
      count: members?.length || 0,
      members: members || []
    });
    
    if (!members || members.length === 0) {
      console.warn('⚠️ MembersAPI: No members found for team:', teamId);
      return [];
    }

    // Get the full team data for the response
    const { data: fullTeam, error: fullTeamError } = await supabase
      .from('teams')
      .select('*')
      .eq('__id__', team.__id__)
      .single();
    
    if (fullTeamError) {
      console.error('❌ MembersAPI: Error fetching full team data:', fullTeamError);
      throw fullTeamError;
    }
    
    const transformedMembers = members.map(member => ({
      id: member.id || 0,
      name: member.name || '',
      number: parseInt(member.number || '0') || 0,
      position: member.position || 'Player',
      role: member.role || 'Player',
      goals: member.goals || 0,
      assists: member.assists || 0,
      team_id: teamId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      team: fullTeam ? {
        id: fullTeam.id || 0,
        name: fullTeam.name || '',
        logo: fullTeam.logo || '⚽',
        founded: fullTeam.founded || '2020',
        captain: fullTeam.captain || '',
        position: fullTeam.position || 1,
        points: fullTeam.points || 0,
        played: fullTeam.played || 0,
        won: fullTeam.won || 0,
        drawn: fullTeam.drawn || 0,
        lost: fullTeam.lost || 0,
        goals_for: fullTeam.goals_for || 0,
        goals_against: fullTeam.goals_against || 0,
        goal_difference: fullTeam.goal_difference || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : undefined
    } as Member));

    console.log('✅ MembersAPI: Successfully transformed team members:', {
      count: transformedMembers.length,
      firstMember: transformedMembers[0] || null
    });
    
    return transformedMembers;
  },

  updateStats: async (id: number, stats: { goals?: number; assists?: number }) => {
    console.log('🔍 MembersAPI: Updating member stats:', { id, stats });
    
    const { data, error } = await supabase
      .from('members')
      .update(stats)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ MembersAPI: Error updating member stats:', error);
      throw error;
    }
    
    console.log('✅ MembersAPI: Successfully updated member:', data);
    
    return {
      id: data.id || 0,
      name: data.name || '',
      number: parseInt(data.number || '0') || 0,
      position: data.position || 'Player',
      role: data.role || 'Player',
      goals: data.goals || 0,
      assists: data.assists || 0,
      team_id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Member;
  }
};

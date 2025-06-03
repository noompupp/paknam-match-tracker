import { supabase } from '@/integrations/supabase/client';
import { Member } from '@/types/database';

// Helper function to normalize IDs for consistent matching
const normalizeId = (id: any): string => {
  if (id === null || id === undefined) return '';
  return String(id).trim().toLowerCase();
};

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
      teamIdAnalysis: members?.map(m => ({
        name: m.name,
        team_id: m.team_id,
        normalizedTeamId: normalizeId(m.team_id)
      })) || []
    });
    
    if (!members || members.length === 0) {
      console.warn('⚠️ MembersAPI: No members found in database');
      return [];
    }

    // Get all teams for joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ MembersAPI: Error fetching teams for members:', teamsError);
      throw teamsError;
    }

    console.log('📊 MembersAPI: Teams data for joining:', {
      count: teams?.length || 0,
      sample: teams?.[0] || null,
      idMappings: teams?.map(t => ({
        name: t.name,
        numericId: t.id,
        textId: t.__id__,
        normalizedTextId: normalizeId(t.__id__)
      })) || []
    });
    
    const transformedMembers = members.map(member => {
      // Find the team using normalized text ID matching
      const normalizedMemberTeamId = normalizeId(member.team_id);
      const team = teams?.find(t => normalizeId(t.__id__) === normalizedMemberTeamId);
      
      console.log('🔄 MembersAPI: Transforming member:', {
        memberName: member.name,
        memberTeamId: member.team_id,
        normalizedMemberTeamId: normalizedMemberTeamId,
        foundTeam: team ? { 
          id: team.id, 
          name: team.name, 
          textId: team.__id__,
          normalizedTextId: normalizeId(team.__id__)
        } : null,
        allTeamIds: teams?.map(t => ({ 
          name: t.name, 
          textId: t.__id__, 
          normalized: normalizeId(t.__id__) 
        })) || []
      });
      
      const transformed = {
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

      console.log('✅ MembersAPI: Transformed member:', {
        name: transformed.name,
        hasTeam: !!transformed.team,
        teamName: transformed.team?.name
      });

      return transformed;
    });

    console.log('✅ MembersAPI: Successfully transformed members:', {
      count: transformedMembers.length,
      membersWithTeams: transformedMembers.filter(m => m.team).length,
      membersWithoutTeams: transformedMembers.filter(m => !m.team).length
    });
    
    return transformedMembers;
  },

  getByTeam: async (teamId: number) => {
    console.log('🔍 MembersAPI: Getting members by team ID:', teamId);
    
    // First find the team's text ID using the numeric ID
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('__id__, name, *')
      .eq('id', teamId)
      .single();
    
    if (teamError || !team) {
      console.warn('⚠️ MembersAPI: No team found for id:', teamId, teamError);
      return [];
    }

    console.log('✅ MembersAPI: Found team:', {
      numericId: teamId,
      textId: team.__id__,
      normalizedTextId: normalizeId(team.__id__),
      name: team.name
    });
    
    // Get members using normalized text ID matching
    const normalizedTeamId = normalizeId(team.__id__);
    const { data: allMembers, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true });
    
    if (membersError) {
      console.error('❌ MembersAPI: Error fetching all members:', membersError);
      throw membersError;
    }

    // Filter members by normalized team ID
    const teamMembers = allMembers?.filter(member => 
      normalizeId(member.team_id) === normalizedTeamId
    ) || [];
    
    console.log('📊 MembersAPI: Team members filtering:', {
      teamName: team.name,
      targetNormalizedId: normalizedTeamId,
      allMembersCount: allMembers?.length || 0,
      filteredMembersCount: teamMembers.length,
      memberMappings: allMembers?.map(m => ({
        name: m.name,
        team_id: m.team_id,
        normalized: normalizeId(m.team_id),
        matches: normalizeId(m.team_id) === normalizedTeamId
      })) || []
    });
    
    if (teamMembers.length === 0) {
      console.warn('⚠️ MembersAPI: No members found for team:', {
        teamId,
        teamName: team.name,
        textId: team.__id__
      });
      return [];
    }
    
    const transformedMembers = teamMembers.map(member => {
      console.log('🔄 MembersAPI: Transforming team member:', {
        name: member.name,
        team_id: member.team_id,
        teamName: team.name
      });

      return {
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
        team: {
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
        }
      } as Member;
    });

    console.log('✅ MembersAPI: Successfully transformed team members:', {
      teamName: team.name,
      count: transformedMembers.length
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

import { supabase } from '@/integrations/supabase/client';
import { Fixture, Team, Member } from '@/types/database';
import { refereeAssignmentService, RefereeTeamAssignment } from './refereeAssignmentService';

export interface EnhancedMatchData {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeSquad: Member[];
  awaySquad: Member[];
  recentForm: {
    homeTeam: Fixture[];
    awayTeam: Fixture[];
  };
  headToHead: Fixture[];
  refereeAssignment?: RefereeTeamAssignment;
  venue?: string;
}

export const enhancedMatchDataService = {
  async getMatchData(fixtureId: number): Promise<EnhancedMatchData | null> {
    console.log('🔍 Enhanced Match Data: Fetching comprehensive data for fixture:', fixtureId);
    
    try {
      // Get fixture with teams
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('*')
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixture) {
        console.error('❌ Enhanced Match Data: Error fetching fixture:', fixtureError);
        return null;
      }

      // Get all teams for referee assignment
      const { data: allTeams, error: allTeamsError } = await supabase
        .from('teams')
        .select('*');

      if (allTeamsError) {
        console.error('❌ Enhanced Match Data: Error fetching all teams:', allTeamsError);
        return null;
      }

      // Get specific teams data
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('__id__', [fixture.home_team_id, fixture.away_team_id]);

      if (teamsError) {
        console.error('❌ Enhanced Match Data: Error fetching teams:', teamsError);
        return null;
      }

      const homeTeamData = teams?.find(t => t.__id__ === fixture.home_team_id);
      const awayTeamData = teams?.find(t => t.__id__ === fixture.away_team_id);

      if (!homeTeamData || !awayTeamData) {
        console.error('❌ Enhanced Match Data: Teams not found');
        return null;
      }

      // Transform team data to match Team interface
      const homeTeam: Team = {
        ...homeTeamData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const awayTeam: Team = {
        ...awayTeamData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Get referee assignment - use the correct property name
      const refereeAssignment = refereeAssignmentService.getRefereeAssignment(
        fixture.time || '18:00:00',
        fixture.home_team_id,
        fixture.away_team_id,
        allTeams || []
      );

      // Get squad members for both teams
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .in('team_id', [fixture.home_team_id, fixture.away_team_id]);

      if (membersError) {
        console.error('❌ Enhanced Match Data: Error fetching members:', membersError);
      }

      const homeSquad = members?.filter(m => m.team_id === fixture.home_team_id) || [];
      const awaySquad = members?.filter(m => m.team_id === fixture.away_team_id) || [];

      // Get recent form (last 5 matches for each team)
      const { data: recentMatches, error: recentError } = await supabase
        .from('fixtures')
        .select('*')
        .or(`and(home_team_id.eq.${fixture.home_team_id},away_team_id.eq.${fixture.home_team_id}),and(home_team_id.eq.${fixture.away_team_id},away_team_id.eq.${fixture.home_team_id})`)
        .eq('status', 'completed')
        .neq('id', fixtureId)
        .order('match_date', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('❌ Enhanced Match Data: Error fetching recent matches:', recentError);
      }

      // Transform fixture data to match Fixture interface
      const transformFixture = (fixtureData: any): Fixture => ({
        ...fixtureData,
        match_time: fixtureData.time || '18:00:00'
      });

      const homeRecentForm = recentMatches?.filter(m => 
        m.home_team_id === fixture.home_team_id || m.away_team_id === fixture.home_team_id
      ).slice(0, 5).map(transformFixture) || [];

      const awayRecentForm = recentMatches?.filter(m => 
        m.home_team_id === fixture.away_team_id || m.away_team_id === fixture.away_team_id
      ).slice(0, 5).map(transformFixture) || [];

      // Get head-to-head history
      const { data: headToHead, error: h2hError } = await supabase
        .from('fixtures')
        .select('*')
        .or(`and(home_team_id.eq.${fixture.home_team_id},away_team_id.eq.${fixture.away_team_id}),and(home_team_id.eq.${fixture.away_team_id},away_team_id.eq.${fixture.home_team_id})`)
        .eq('status', 'completed')
        .neq('id', fixtureId)
        .order('match_date', { ascending: false })
        .limit(5);

      if (h2hError) {
        console.error('❌ Enhanced Match Data: Error fetching head-to-head:', h2hError);
      }

      const enhancedData: EnhancedMatchData = {
        fixture: transformFixture({
          ...fixture,
          home_team: homeTeam,
          away_team: awayTeam
        }),
        homeTeam,
        awayTeam,
        homeSquad,
        awaySquad,
        recentForm: {
          homeTeam: homeRecentForm,
          awayTeam: awayRecentForm
        },
        headToHead: headToHead?.map(transformFixture) || [],
        refereeAssignment,
        venue: fixture.venue
      };

      console.log('✅ Enhanced Match Data: Successfully fetched comprehensive data:', {
        fixture: fixture.id,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeSquadSize: homeSquad.length,
        awaySquadSize: awaySquad.length,
        recentFormCount: homeRecentForm.length + awayRecentForm.length,
        headToHeadCount: headToHead?.length || 0,
        refereeAssignment: refereeAssignment ? refereeAssignmentService.formatRefereeAssignment(refereeAssignment) : 'None'
      });

      return enhancedData;
    } catch (error) {
      console.error('❌ Enhanced Match Data: Unexpected error:', error);
      return null;
    }
  }
};

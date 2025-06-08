import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from './operationLoggingService';

export interface DropdownPlayerData {
  id: number;
  name: string;
  team: string;
  team_id: string;
  number: string;
  position: string;
  role: string; // Added role field
}

export const playerDropdownService = {
  async getPlayersForDropdown(): Promise<DropdownPlayerData[]> {
    console.log('🎯 PlayerDropdownService: Fetching players specifically for dropdowns...');
    
    try {
      // Strategy 1: Try the most reliable query first - now including role field
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          team_id,
          number,
          position,
          role
        `)
        .not('name', 'is', null)
        .order('name', { ascending: true });

      if (membersError) {
        console.error('❌ PlayerDropdownService: Members query failed:', membersError);
        throw membersError;
      }

      // Strategy 2: Get teams separately to avoid relationship issues
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, __id__, name');

      if (teamsError) {
        console.error('❌ PlayerDropdownService: Teams query failed:', teamsError);
        throw teamsError;
      }

      // Manual join to ensure reliability
      const playersWithTeams = (membersData || [])
        .filter(member => member.name && member.name.trim() !== '')
        .map(member => {
          // Try to find team by both possible ID formats
          const team = teamsData?.find(t => 
            t.__id__ === member.team_id || 
            t.id.toString() === member.team_id
          );
          
          return {
            id: member.id,
            name: member.name || 'Unknown Player',
            team: team?.name || 'Unknown Team',
            team_id: member.team_id || '',
            number: member.number || '',
            position: member.position || 'Player',
            role: member.role || 'Starter' // Use role field with fallback to Starter
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      await operationLoggingService.logOperation({
        operation_type: 'player_dropdown_fetch',
        table_name: 'members',
        result: { 
          total_members: membersData?.length || 0,
          valid_players: playersWithTeams.length,
          total_teams: teamsData?.length || 0
        },
        success: true
      });

      console.log('✅ PlayerDropdownService: Successfully processed players for dropdown:', {
        totalMembers: membersData?.length || 0,
        validPlayers: playersWithTeams.length,
        totalTeams: teamsData?.length || 0,
        rolesFound: [...new Set(playersWithTeams.map(p => p.role))]
      });

      return playersWithTeams;

    } catch (error) {
      console.error('❌ PlayerDropdownService: Failed to fetch players for dropdown:', error);
      
      await operationLoggingService.logOperation({
        operation_type: 'player_dropdown_fetch_failed',
        table_name: 'members',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });

      // Return empty array to prevent UI crashes
      return [];
    }
  },

  async getPlayersByTeam(homeTeamName: string, awayTeamName: string): Promise<{
    homeTeamPlayers: DropdownPlayerData[];
    awayTeamPlayers: DropdownPlayerData[];
    allPlayers: DropdownPlayerData[];
  }> {
    console.log('🏈 PlayerDropdownService: Fetching players by team for fixture:', { homeTeamName, awayTeamName });
    
    try {
      const allPlayers = await this.getPlayersForDropdown();
      
      const homeTeamPlayers = allPlayers.filter(player => 
        player.team === homeTeamName
      );
      
      const awayTeamPlayers = allPlayers.filter(player => 
        player.team === awayTeamName
      );

      console.log('✅ PlayerDropdownService: Team players filtered:', {
        total: allPlayers.length,
        home: homeTeamPlayers.length,
        away: awayTeamPlayers.length,
        rolesFound: [...new Set(allPlayers.map(p => p.role))]
      });

      return {
        homeTeamPlayers,
        awayTeamPlayers,
        allPlayers
      };

    } catch (error) {
      console.error('❌ PlayerDropdownService: Failed to get players by team:', error);
      return {
        homeTeamPlayers: [],
        awayTeamPlayers: [],
        allPlayers: []
      };
    }
  },

  async validatePlayerDropdownData(): Promise<{
    isValid: boolean;
    issues: string[];
    summary: {
      totalPlayers: number;
      playersWithoutNames: number;
      playersWithoutTeams: number;
      teamsFound: number;
      rolesFound: number;
    };
  }> {
    console.log('🔍 PlayerDropdownService: Validating player dropdown data...');
    
    try {
      const allPlayers = await this.getPlayersForDropdown();
      const issues: string[] = [];
      
      const playersWithoutNames = allPlayers.filter(p => !p.name || p.name.trim() === '').length;
      const playersWithoutTeams = allPlayers.filter(p => !p.team || p.team === 'Unknown Team').length;
      const uniqueTeams = new Set(allPlayers.map(p => p.team)).size;
      const uniqueRoles = new Set(allPlayers.map(p => p.role)).size;

      if (allPlayers.length === 0) {
        issues.push('No players found in database');
      }
      
      if (playersWithoutNames > 0) {
        issues.push(`${playersWithoutNames} players without valid names`);
      }
      
      if (playersWithoutTeams > 0) {
        issues.push(`${playersWithoutTeams} players without valid team assignments`);
      }
      
      if (uniqueTeams < 2) {
        issues.push(`Only ${uniqueTeams} unique teams found, need at least 2 for matches`);
      }

      if (uniqueRoles === 0) {
        issues.push('No player roles found in database');
      }

      const isValid = issues.length === 0 && allPlayers.length > 0;

      const summary = {
        totalPlayers: allPlayers.length,
        playersWithoutNames,
        playersWithoutTeams,
        teamsFound: uniqueTeams,
        rolesFound: uniqueRoles
      };

      console.log('📋 PlayerDropdownService: Validation complete:', { 
        isValid, 
        issues, 
        summary,
        rolesDistribution: [...new Set(allPlayers.map(p => p.role))].map(role => ({
          role,
          count: allPlayers.filter(p => p.role === role).length
        }))
      });

      return { isValid, issues, summary };

    } catch (error) {
      console.error('❌ PlayerDropdownService: Validation failed:', error);
      return {
        isValid: false,
        issues: ['Failed to validate player data: ' + (error instanceof Error ? error.message : 'Unknown error')],
        summary: {
          totalPlayers: 0,
          playersWithoutNames: 0,
          playersWithoutTeams: 0,
          teamsFound: 0,
          rolesFound: 0
        }
      };
    }
  }
};

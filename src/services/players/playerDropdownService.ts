
import { basePlayerService } from './basePlayerService';
import { playerDataProcessor, ProcessedPlayerData } from './playerDataProcessor';
import { playerValidationService, ValidationResult } from './playerValidationService';

export interface DropdownPlayerData {
  id: number;
  name: string;
  team: string;
  team_id: string;
  number: string;
  position: string;
  role: string;
}

export const playerDropdownService = {
  async getPlayersForDropdown(): Promise<DropdownPlayerData[]> {
    console.log('🎯 PlayerDropdownService: Fetching players specifically for dropdowns...');
    
    try {
      // Fetch raw data
      const [membersData, teamsData] = await Promise.all([
        basePlayerService.fetchMembers(),
        basePlayerService.fetchTeams()
      ]);

      // Process the data
      const processedPlayers = playerDataProcessor.processPlayers(membersData, teamsData);

      // Log operation
      await basePlayerService.logOperation({
        operation_type: 'player_dropdown_fetch',
        table_name: 'members',
        result: { 
          total_members: membersData.length,
          valid_players: processedPlayers.length,
          total_teams: teamsData.length
        },
        success: true
      });

      console.log('✅ PlayerDropdownService: Successfully processed players for dropdown:', {
        totalMembers: membersData.length,
        validPlayers: processedPlayers.length,
        totalTeams: teamsData.length,
        rolesFound: playerDataProcessor.getUniqueRoles(processedPlayers)
      });

      return processedPlayers;

    } catch (error) {
      console.error('❌ PlayerDropdownService: Failed to fetch players for dropdown:', error);
      
      await basePlayerService.logOperation({
        operation_type: 'player_dropdown_fetch_failed',
        table_name: 'members',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });

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
      const teamStats = playerDataProcessor.getTeamPlayerStats(allPlayers, homeTeamName, awayTeamName);

      console.log('✅ PlayerDropdownService: Team players filtered:', {
        total: teamStats.allPlayers.length,
        home: teamStats.homeTeamPlayers.length,
        away: teamStats.awayTeamPlayers.length,
        rolesFound: teamStats.rolesFound
      });

      return {
        homeTeamPlayers: teamStats.homeTeamPlayers,
        awayTeamPlayers: teamStats.awayTeamPlayers,
        allPlayers: teamStats.allPlayers
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

  async validatePlayerDropdownData(): Promise<ValidationResult> {
    console.log('🔍 PlayerDropdownService: Validating player dropdown data...');
    
    try {
      const allPlayers = await this.getPlayersForDropdown();
      const validationResult = playerValidationService.validatePlayerData(allPlayers);
      
      playerValidationService.logValidationResults(validationResult);
      
      return validationResult;

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

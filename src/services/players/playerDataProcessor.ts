
import { BasePlayerData, TeamData } from './basePlayerService';

export interface ProcessedPlayerData {
  id: number;
  name: string;
  team: string;
  team_id: string;
  number: string;
  position: string;
  role: string;
}

export const playerDataProcessor = {
  processPlayers(members: BasePlayerData[], teams: TeamData[]): ProcessedPlayerData[] {
    return members
      .filter(member => member.name && member.name.trim() !== '')
      .map(member => {
        // Try to find team by both possible ID formats
        const team = teams.find(t => 
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
          role: member.role || 'Starter'
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  filterPlayersByTeam(players: ProcessedPlayerData[], teamName: string): ProcessedPlayerData[] {
    return players.filter(player => player.team === teamName);
  },

  getUniqueRoles(players: ProcessedPlayerData[]): string[] {
    return [...new Set(players.map(p => p.role))];
  },

  getTeamPlayerStats(players: ProcessedPlayerData[], homeTeamName: string, awayTeamName: string) {
    const homeTeamPlayers = this.filterPlayersByTeam(players, homeTeamName);
    const awayTeamPlayers = this.filterPlayersByTeam(players, awayTeamName);
    
    return {
      homeTeamPlayers,
      awayTeamPlayers,
      allPlayers: players,
      rolesFound: this.getUniqueRoles(players)
    };
  }
};

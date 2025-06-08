
import { ProcessedPlayerData } from './playerDataProcessor';

export interface ValidationSummary {
  totalPlayers: number;
  playersWithoutNames: number;
  playersWithoutTeams: number;
  teamsFound: number;
  rolesFound: number;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  summary: ValidationSummary;
  rolesDistribution?: Array<{ role: string; count: number }>;
}

export const playerValidationService = {
  validatePlayerData(players: ProcessedPlayerData[]): ValidationResult {
    console.log('🔍 PlayerValidationService: Validating player data...');
    
    const issues: string[] = [];
    
    const playersWithoutNames = players.filter(p => !p.name || p.name.trim() === '').length;
    const playersWithoutTeams = players.filter(p => !p.team || p.team === 'Unknown Team').length;
    const uniqueTeams = new Set(players.map(p => p.team)).size;
    const uniqueRoles = new Set(players.map(p => p.role)).size;

    if (players.length === 0) {
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

    const isValid = issues.length === 0 && players.length > 0;

    const summary: ValidationSummary = {
      totalPlayers: players.length,
      playersWithoutNames,
      playersWithoutTeams,
      teamsFound: uniqueTeams,
      rolesFound: uniqueRoles
    };

    const rolesDistribution = [...new Set(players.map(p => p.role))].map(role => ({
      role,
      count: players.filter(p => p.role === role).length
    }));

    console.log('📋 PlayerValidationService: Validation complete:', { 
      isValid, 
      issues, 
      summary,
      rolesDistribution
    });

    return { 
      isValid, 
      issues, 
      summary,
      rolesDistribution
    };
  },

  logValidationResults(result: ValidationResult): void {
    if (result.isValid) {
      console.log('✅ PlayerValidationService: Data validation passed');
    } else {
      console.warn('⚠️ PlayerValidationService: Data validation failed:', result.issues);
    }
  }
};

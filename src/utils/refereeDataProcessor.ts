
import { playerDropdownService, type DropdownPlayerData } from '@/services/playerDropdownService';

export interface ProcessedPlayer {
  id: number;
  name: string;
  team: string;
  team_id: string;
  number: string;
  position: string;
  role: string; // Added role field
}

export interface ProcessedFixtureData {
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers: ProcessedPlayer[];
  awayTeamPlayers: ProcessedPlayer[];
  hasValidData: boolean;
  dataIssues: string[];
}

export function processFixtureAndPlayers(
  selectedFixtureData: any,
  members: any[]
): ProcessedFixtureData | null {
  console.log('🔄 RefereeDataProcessor: Processing fixture and players...');
  console.log('  - Fixture:', selectedFixtureData?.id);
  console.log('  - Members count:', members?.length || 0);
  
  if (!selectedFixtureData) {
    console.warn('⚠️ RefereeDataProcessor: No fixture data provided');
    return null;
  }

  const homeTeamName = selectedFixtureData.home_team?.name;
  const awayTeamName = selectedFixtureData.away_team?.name;
  
  if (!homeTeamName || !awayTeamName) {
    console.warn('⚠️ RefereeDataProcessor: Missing team names in fixture');
    return {
      allPlayers: [],
      homeTeamPlayers: [],
      awayTeamPlayers: [],
      hasValidData: false,
      dataIssues: ['Missing team names in fixture data']
    };
  }

  // Enhanced member processing with better validation including role
  const validMembers = (members || []).filter(member => {
    const isValid = member && 
                   member.name && 
                   member.name.trim() !== '' &&
                   member.id &&
                   member.team;
    
    if (!isValid) {
      console.log(`⚠️ Filtering out invalid member:`, {
        id: member?.id,
        name: member?.name,
        hasTeam: !!member?.team,
        role: member?.role
      });
    }
    
    return isValid;
  });

  const allPlayers: ProcessedPlayer[] = validMembers.map(member => ({
    id: member.id,
    name: member.name.trim(),
    team: member.team?.name || 'Unknown Team',
    team_id: member.team_id || member.team?.id?.toString() || '',
    number: member.number || '',
    position: member.position || 'Player',
    role: member.role || 'Starter' // Use role field with fallback
  }));

  const homeTeamPlayers = allPlayers.filter(player => player.team === homeTeamName);
  const awayTeamPlayers = allPlayers.filter(player => player.team === awayTeamName);

  const dataIssues: string[] = [];
  
  if (allPlayers.length === 0) {
    dataIssues.push('No valid players found');
  }
  
  if (homeTeamPlayers.length === 0) {
    dataIssues.push(`No players found for home team: ${homeTeamName}`);
  }
  
  if (awayTeamPlayers.length === 0) {
    dataIssues.push(`No players found for away team: ${awayTeamName}`);
  }

  const hasValidData = dataIssues.length === 0 && allPlayers.length > 0;

  console.log('✅ RefereeDataProcessor: Processing complete:', {
    totalPlayers: allPlayers.length,
    homeTeamPlayers: homeTeamPlayers.length,
    awayTeamPlayers: awayTeamPlayers.length,
    hasValidData,
    dataIssues,
    rolesFound: [...new Set(allPlayers.map(p => p.role))]
  });

  return {
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    hasValidData,
    dataIssues
  };
}

// Enhanced function to process players specifically for dropdowns with service integration
export async function processPlayersForDropdowns(
  selectedFixtureData: any
): Promise<ProcessedFixtureData> {
  console.log('🎯 RefereeDataProcessor: Processing players for dropdowns with service integration...');
  
  if (!selectedFixtureData) {
    console.warn('⚠️ RefereeDataProcessor: No fixture data for dropdown processing');
    return {
      allPlayers: [],
      homeTeamPlayers: [],
      awayTeamPlayers: [],
      hasValidData: false,
      dataIssues: ['No fixture data provided']
    };
  }

  const homeTeamName = selectedFixtureData.home_team?.name;
  const awayTeamName = selectedFixtureData.away_team?.name;
  
  if (!homeTeamName || !awayTeamName) {
    console.warn('⚠️ RefereeDataProcessor: Missing team names for dropdown processing');
    return {
      allPlayers: [],
      homeTeamPlayers: [],
      awayTeamPlayers: [],
      hasValidData: false,
      dataIssues: ['Missing team names in fixture']
    };
  }

  try {
    // Use the dedicated dropdown service
    const { homeTeamPlayers, awayTeamPlayers, allPlayers } = 
      await playerDropdownService.getPlayersByTeam(homeTeamName, awayTeamName);

    const dataIssues: string[] = [];
    
    if (allPlayers.length === 0) {
      dataIssues.push('No players found via dropdown service');
    }
    
    if (homeTeamPlayers.length === 0) {
      dataIssues.push(`No players found for home team: ${homeTeamName}`);
    }
    
    if (awayTeamPlayers.length === 0) {
      dataIssues.push(`No players found for away team: ${awayTeamName}`);
    }

    const hasValidData = dataIssues.length === 0 && allPlayers.length > 0;

    console.log('✅ RefereeDataProcessor: Dropdown processing complete:', {
      totalPlayers: allPlayers.length,
      homeTeamPlayers: homeTeamPlayers.length,
      awayTeamPlayers: awayTeamPlayers.length,
      hasValidData,
      dataIssues,
      rolesFound: [...new Set(allPlayers.map(p => p.role))]
    });

    return {
      allPlayers: allPlayers.map(p => ({
        id: p.id,
        name: p.name,
        team: p.team,
        team_id: p.team_id,
        number: p.number,
        position: p.position,
        role: p.role // Ensure role is included
      })),
      homeTeamPlayers: homeTeamPlayers.map(p => ({
        id: p.id,
        name: p.name,
        team: p.team,
        team_id: p.team_id,
        number: p.number,
        position: p.position,
        role: p.role // Ensure role is included
      })),
      awayTeamPlayers: awayTeamPlayers.map(p => ({
        id: p.id,
        name: p.name,
        team: p.team,
        team_id: p.team_id,
        number: p.number,
        position: p.position,
        role: p.role // Ensure role is included
      })),
      hasValidData,
      dataIssues
    };

  } catch (error) {
    console.error('❌ RefereeDataProcessor: Failed to process players for dropdowns:', error);
    return {
      allPlayers: [],
      homeTeamPlayers: [],
      awayTeamPlayers: [],
      hasValidData: false,
      dataIssues: ['Failed to fetch player data: ' + (error instanceof Error ? error.message : 'Unknown error')]
    };
  }
}

export function debugPlayerDropdownData(players: ProcessedPlayer[], context: string = "Generic") {
  console.log(`🔍 ${context} - Player Dropdown Debug:`, {
    totalPlayers: players.length,
    playersWithNames: players.filter(p => p.name && p.name.trim() !== '').length,
    playersWithTeams: players.filter(p => p.team && p.team !== 'Unknown Team').length,
    uniqueTeams: [...new Set(players.map(p => p.team))],
    uniqueRoles: [...new Set(players.map(p => p.role))],
    rolesDistribution: [...new Set(players.map(p => p.role))].map(role => ({
      role,
      count: players.filter(p => p.role === role).length
    })),
    samplePlayers: players.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      team: p.team,
      number: p.number,
      role: p.role
    }))
  });
  
  if (players.length === 0) {
    console.warn(`⚠️ ${context}: NO PLAYERS AVAILABLE FOR DROPDOWN!`);
  }
}

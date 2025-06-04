
interface RawMember {
  id: number;
  name: string;
  team_id: string;
  number?: string | number;
  position?: string;
  team?: { name: string };
}

interface RawFixture {
  id: number;
  home_team_id: string;
  away_team_id: string;
  home_team?: { name: string };
  away_team?: { name: string };
}

export interface ProcessedPlayer {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

export interface ProcessedTeamInfo {
  id: string;
  name: string;
}

export interface ProcessedFixtureData {
  fixture: RawFixture;
  homeTeam: ProcessedTeamInfo;
  awayTeam: ProcessedTeamInfo;
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers: ProcessedPlayer[];
  awayTeamPlayers: ProcessedPlayer[];
}

const normalizeTeamId = (teamId: string | number): string => {
  return teamId.toString().trim();
};

const normalizePlayerNumber = (number: string | number | undefined): number => {
  if (number === undefined || number === null) return 0;
  const parsed = parseInt(String(number));
  return isNaN(parsed) ? 0 : parsed;
};

const findMembersByTeamId = (members: RawMember[], teamId: string): RawMember[] => {
  const normalizedTargetId = normalizeTeamId(teamId);
  
  console.log(`🔍 Finding members for team ID: ${teamId} (normalized: ${normalizedTargetId})`);
  
  // Multiple matching strategies for robustness
  const matchingStrategies = [
    // Strategy 1: Exact match
    (member: RawMember) => member.team_id === teamId,
    // Strategy 2: Normalized string comparison
    (member: RawMember) => normalizeTeamId(member.team_id) === normalizedTargetId,
    // Strategy 3: Loose string comparison
    (member: RawMember) => member.team_id.toString().toLowerCase().trim() === teamId.toString().toLowerCase().trim()
  ];
  
  for (let i = 0; i < matchingStrategies.length; i++) {
    const matches = members.filter(matchingStrategies[i]);
    if (matches.length > 0) {
      console.log(`✅ Found ${matches.length} members using strategy ${i + 1}`);
      return matches;
    }
  }
  
  console.log(`❌ No members found for team ID: ${teamId}`);
  console.log(`Available team IDs:`, [...new Set(members.map(m => m.team_id))]);
  
  return [];
};

const processPlayer = (member: RawMember): ProcessedPlayer => {
  return {
    id: member.id,
    name: member.name || 'Unknown Player',
    team: member.team?.name || 'Unknown Team',
    number: normalizePlayerNumber(member.number),
    position: member.position || 'Player'
  };
};

export const processFixtureAndPlayers = (
  selectedFixtureData: RawFixture,
  allMembers: RawMember[]
): ProcessedFixtureData => {
  console.log('🏗️ Processing fixture and players data...');
  console.log('📋 Fixture:', selectedFixtureData);
  console.log('👥 Total members:', allMembers?.length || 0);
  
  // Process team information
  const homeTeam: ProcessedTeamInfo = {
    id: normalizeTeamId(selectedFixtureData.home_team_id),
    name: selectedFixtureData.home_team?.name || 'Home Team'
  };
  
  const awayTeam: ProcessedTeamInfo = {
    id: normalizeTeamId(selectedFixtureData.away_team_id),
    name: selectedFixtureData.away_team?.name || 'Away Team'
  };
  
  console.log('🏠 Home team:', homeTeam);
  console.log('✈️ Away team:', awayTeam);
  
  // Find team members
  const homeTeamMembers = findMembersByTeamId(allMembers, selectedFixtureData.home_team_id);
  const awayTeamMembers = findMembersByTeamId(allMembers, selectedFixtureData.away_team_id);
  
  console.log(`👥 Found ${homeTeamMembers.length} home team members`);
  console.log(`👥 Found ${awayTeamMembers.length} away team members`);
  
  // Process players
  const homeTeamPlayers = homeTeamMembers.map(processPlayer);
  const awayTeamPlayers = awayTeamMembers.map(processPlayer);
  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
  
  console.log(`⚽ Processed ${allPlayers.length} total players`);
  
  // Debug output
  if (allPlayers.length === 0) {
    console.warn('⚠️ WARNING: No players found for this fixture!');
    console.log('Debug info:');
    console.log('- Home team ID:', selectedFixtureData.home_team_id, typeof selectedFixtureData.home_team_id);
    console.log('- Away team ID:', selectedFixtureData.away_team_id, typeof selectedFixtureData.away_team_id);
    console.log('- Available member team IDs:', [...new Set(allMembers.map(m => `${m.team_id} (${typeof m.team_id})`))]);
  }
  
  const result: ProcessedFixtureData = {
    fixture: selectedFixtureData,
    homeTeam,
    awayTeam,
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers
  };
  
  console.log('✅ Fixture and players processing complete');
  return result;
};

export const debugPlayerDropdownData = (players: ProcessedPlayer[], context: string) => {
  console.log(`🎮 Player Dropdown Debug - ${context}:`);
  console.log(`  - Total players: ${players.length}`);
  
  if (players.length > 0) {
    console.log(`  - Sample players:`, players.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      team: p.team,
      number: p.number
    })));
    
    const teamCounts = players.reduce((acc, player) => {
      acc[player.team] = (acc[player.team] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`  - Players by team:`, teamCounts);
  } else {
    console.log(`  ❌ NO PLAYERS AVAILABLE FOR DROPDOWN!`);
  }
};

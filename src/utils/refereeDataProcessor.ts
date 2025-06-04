
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
  home_team?: { name: string; __id__?: string };
  away_team?: { name: string; __id__?: string };
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
  
  // Strategy 1: Direct match with team.__id__ from fixture
  const directMatches = members.filter(member => {
    const memberTeamId = normalizeTeamId(member.team_id);
    return memberTeamId === normalizedTargetId;
  });
  
  if (directMatches.length > 0) {
    console.log(`✅ Found ${directMatches.length} members using direct team ID match`);
    return directMatches;
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
  
  // Extract team IDs from fixture - use __id__ from team objects which contain the correct string IDs
  const homeTeamId = selectedFixtureData.home_team?.__id__ || selectedFixtureData.home_team_id;
  const awayTeamId = selectedFixtureData.away_team?.__id__ || selectedFixtureData.away_team_id;
  
  // Process team information
  const homeTeam: ProcessedTeamInfo = {
    id: normalizeTeamId(homeTeamId),
    name: selectedFixtureData.home_team?.name || 'Home Team'
  };
  
  const awayTeam: ProcessedTeamInfo = {
    id: normalizeTeamId(awayTeamId),
    name: selectedFixtureData.away_team?.name || 'Away Team'
  };
  
  console.log('🏠 Home team:', homeTeam);
  console.log('✈️ Away team:', awayTeam);
  
  // Find team members using the correct team IDs
  const homeTeamMembers = findMembersByTeamId(allMembers, homeTeam.id);
  const awayTeamMembers = findMembersByTeamId(allMembers, awayTeam.id);
  
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
    console.log('- Home team ID from fixture:', homeTeamId, typeof homeTeamId);
    console.log('- Away team ID from fixture:', awayTeamId, typeof awayTeamId);
    console.log('- Home team __id__:', selectedFixtureData.home_team?.__id__);
    console.log('- Away team __id__:', selectedFixtureData.away_team?.__id__);
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

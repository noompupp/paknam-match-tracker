
export interface DebugTeamData {
  id: string | number;
  __id__?: string;
  name: string;
}

export interface DebugMemberData {
  id: number;
  name: string;
  team_id: string;
  team?: { name: string };
}

export interface DebugFixtureData {
  id: number;
  home_team_id: string;
  away_team_id: string;
  home_team?: { name: string };
  away_team?: { name: string };
}

export const debugRefereeToolsData = (
  fixtures: DebugFixtureData[] | undefined,
  members: DebugMemberData[] | undefined,
  selectedFixture: string
) => {
  console.log('🔍 REFEREE TOOLS DEBUG START 🔍');
  
  // Debug fixtures data
  console.log('📋 Fixtures Data:');
  console.log('  - Total fixtures:', fixtures?.length || 0);
  console.log('  - Selected fixture ID:', selectedFixture);
  
  if (fixtures && fixtures.length > 0) {
    const firstFixture = fixtures[0];
    console.log('  - Sample fixture structure:', {
      id: firstFixture.id,
      home_team_id: firstFixture.home_team_id,
      away_team_id: firstFixture.away_team_id,
      home_team_name: firstFixture.home_team?.name,
      away_team_name: firstFixture.away_team?.name
    });
    
    console.log('  - Team ID formats in fixtures:');
    fixtures.slice(0, 3).forEach((fixture, index) => {
      console.log(`    Fixture ${index + 1}:`, {
        home_team_id: `${fixture.home_team_id} (${typeof fixture.home_team_id})`,
        away_team_id: `${fixture.away_team_id} (${typeof fixture.away_team_id})`
      });
    });
  }
  
  // Debug members data
  console.log('👥 Members Data:');
  console.log('  - Total members:', members?.length || 0);
  
  if (members && members.length > 0) {
    const firstMember = members[0];
    console.log('  - Sample member structure:', {
      id: firstMember.id,
      name: firstMember.name,
      team_id: firstMember.team_id,
      team_name: firstMember.team?.name
    });
    
    console.log('  - Team ID formats in members:');
    const uniqueTeamIds = [...new Set(members.map(m => m.team_id))];
    uniqueTeamIds.slice(0, 5).forEach(teamId => {
      const membersInTeam = members.filter(m => m.team_id === teamId);
      console.log(`    Team ID: ${teamId} (${typeof teamId}) - ${membersInTeam.length} members`);
      if (membersInTeam[0]?.team?.name) {
        console.log(`      Team name: ${membersInTeam[0].team.name}`);
      }
    });
  }
  
  // Debug selected fixture matching
  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);
  if (selectedFixtureData) {
    console.log('🎯 Selected Fixture Analysis:');
    console.log('  - Fixture:', selectedFixtureData);
    console.log('  - Home team ID:', selectedFixtureData.home_team_id, typeof selectedFixtureData.home_team_id);
    console.log('  - Away team ID:', selectedFixtureData.away_team_id, typeof selectedFixtureData.away_team_id);
    
    if (members) {
      const homeTeamMembers = members.filter(m => 
        m.team_id === selectedFixtureData.home_team_id ||
        m.team_id === selectedFixtureData.home_team_id.toString() ||
        m.team_id.toString() === selectedFixtureData.home_team_id.toString()
      );
      
      const awayTeamMembers = members.filter(m => 
        m.team_id === selectedFixtureData.away_team_id ||
        m.team_id === selectedFixtureData.away_team_id.toString() ||
        m.team_id.toString() === selectedFixtureData.away_team_id.toString()
      );
      
      console.log('  - Home team members found:', homeTeamMembers.length);
      console.log('  - Away team members found:', awayTeamMembers.length);
      
      if (homeTeamMembers.length === 0) {
        console.log('  ❌ NO HOME TEAM MEMBERS FOUND - ID MISMATCH DETECTED');
        console.log('  - Looking for team_id:', selectedFixtureData.home_team_id);
        console.log('  - Available team_ids:', [...new Set(members.map(m => m.team_id))]);
      }
      
      if (awayTeamMembers.length === 0) {
        console.log('  ❌ NO AWAY TEAM MEMBERS FOUND - ID MISMATCH DETECTED');
        console.log('  - Looking for team_id:', selectedFixtureData.away_team_id);
        console.log('  - Available team_ids:', [...new Set(members.map(m => m.team_id))]);
      }
    }
  } else {
    console.log('❌ Selected fixture not found');
  }
  
  console.log('🔍 REFEREE TOOLS DEBUG END 🔍');
};

export const normalizeTeamId = (teamId: string | number): string => {
  return teamId.toString();
};

export const findTeamMembers = (
  members: DebugMemberData[],
  teamId: string | number
): DebugMemberData[] => {
  const normalizedTeamId = normalizeTeamId(teamId);
  
  // Try multiple matching strategies
  const strategies = [
    // Exact match
    (m: DebugMemberData) => m.team_id === teamId,
    // Normalized string match
    (m: DebugMemberData) => normalizeTeamId(m.team_id) === normalizedTeamId,
    // Type-flexible match
    (m: DebugMemberData) => m.team_id.toString() === teamId.toString()
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    const found = members.filter(strategies[i]);
    if (found.length > 0) {
      console.log(`✅ Found ${found.length} members using strategy ${i + 1} for team ID: ${teamId}`);
      return found;
    }
  }
  
  console.log(`❌ No members found for team ID: ${teamId}`);
  return [];
};

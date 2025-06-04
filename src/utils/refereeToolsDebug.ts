
export const debugRefereeToolsData = (fixtures: any[], members: any[], selectedFixture: string) => {
  console.log('🔍 REFEREE TOOLS DEBUG START 🔍');
  
  // Debug fixtures data
  console.log('📋 Fixtures Data:');
  console.log('  - Total fixtures:', fixtures?.length || 0);
  console.log('  - Selected fixture ID:', selectedFixture);
  
  if (fixtures && fixtures.length > 0) {
    const sampleFixture = fixtures[0];
    console.log('  - Sample fixture structure:', {
      id: sampleFixture.id,
      home_team_id: sampleFixture.home_team_id,
      away_team_id: sampleFixture.away_team_id,
      home_team_name: sampleFixture.home_team?.name,
      away_team_name: sampleFixture.away_team?.name
    });
    
    console.log('  - Team ID formats in fixtures:');
    fixtures.slice(0, 3).forEach((fixture, index) => {
      console.log(`    Fixture ${index + 1}: {`);
      console.log(`  "home_team_id": "${fixture.home_team_id} (${typeof fixture.home_team_id})",`);
      console.log(`  "away_team_id": "${fixture.away_team_id} (${typeof fixture.away_team_id})"`);
      console.log('    }');
    });
  }
  
  // Debug members data
  console.log('👥 Members Data:');
  console.log('  - Total members:', members?.length || 0);
  
  if (members && members.length > 0) {
    const sampleMember = members[0];
    console.log('  - Sample member structure:', {
      id: sampleMember.id,
      name: sampleMember.name,
      team_id: sampleMember.team_id,
      team_name: sampleMember.team?.name || sampleMember.teams?.name
    });
    
    // Group members by team_id
    const teamGroups = members.reduce((acc: any, member: any) => {
      const teamId = member.team_id;
      if (!acc[teamId]) {
        acc[teamId] = [];
      }
      acc[teamId].push(member);
      return acc;
    }, {});
    
    console.log('  - Team ID formats in members:');
    Object.entries(teamGroups).forEach(([teamId, teamMembers]: [string, any]) => {
      const teamName = teamMembers[0]?.team?.name || teamMembers[0]?.teams?.name || 'Unknown';
      console.log(`    Team ID: ${teamId} (${typeof teamId}) - ${teamMembers.length} members`);
      console.log(`      Team name: ${teamName}`);
    });
  }
  
  // Debug selected fixture
  if (selectedFixture && fixtures) {
    const selectedFixtureData = fixtures.find(f => f.id.toString() === selectedFixture);
    if (selectedFixtureData) {
      console.log('🎯 Selected Fixture Analysis:');
      console.log('  - Fixture:', selectedFixtureData);
      console.log('  - Home team ID:', selectedFixtureData.home_team_id, typeof selectedFixtureData.home_team_id);
      console.log('  - Away team ID:', selectedFixtureData.away_team_id, typeof selectedFixtureData.away_team_id);
      
      // Check for matching members
      if (members) {
        const homeTeamMembers = members.filter((m: any) => m.team_id === selectedFixtureData.home_team_id);
        const awayTeamMembers = members.filter((m: any) => m.team_id === selectedFixtureData.away_team_id);
        
        console.log('  - Home team members found:', homeTeamMembers.length);
        console.log('  - Away team members found:', awayTeamMembers.length);
        
        if (homeTeamMembers.length === 0) {
          console.log('  ❌ NO HOME TEAM MEMBERS FOUND - ID MISMATCH DETECTED');
          console.log('  - Looking for team_id:', selectedFixtureData.home_team_id);
          console.log('  - Available team_ids:', [...new Set(members.map((m: any) => m.team_id))]);
        }
        
        if (awayTeamMembers.length === 0) {
          console.log('  ❌ NO AWAY TEAM MEMBERS FOUND - ID MISMATCH DETECTED');
          console.log('  - Looking for team_id:', selectedFixtureData.away_team_id);
          console.log('  - Available team_ids:', [...new Set(members.map((m: any) => m.team_id))]);
        }
      }
    }
  }
  
  console.log('🔍 REFEREE TOOLS DEBUG END 🔍');
};


export const createTeamObject = (team: any) => {
  const teamObj = {
    id: team.id || 0,
    name: team.name || '',
    logo: team.logo || '⚽',
    logoURL: team.logoURL || undefined,
    color: team.color || undefined,
    founded: team.founded || '2020',
    captain: team.captain || '',
    position: team.position || 1,
    points: team.points || 0,
    played: team.played || 0,
    won: team.won || 0,
    drawn: team.drawn || 0,
    lost: team.lost || 0,
    goals_for: team.goals_for || 0,
    goals_against: team.goals_against || 0,
    goal_difference: team.goal_difference || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('🔧 TeamUtils: Created team object:', {
    name: teamObj.name,
    hasLogoURL: !!teamObj.logoURL,
    logoURL: teamObj.logoURL,
    logo: teamObj.logo
  });
  
  return teamObj;
};

export const joinFixturesWithTeams = (fixtures: any[], teams: any[]) => {
  return fixtures.map(fixture => {
    // Helper function to normalize IDs for consistent matching
    const normalizeId = (id: any): string => {
      if (id === null || id === undefined) return '';
      return String(id).trim().toLowerCase();
    };

    // Find home team using normalized team1 field
    const normalizedTeam1 = normalizeId(fixture.team1);
    const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam1);
    
    // Find away team using normalized team2 field  
    const normalizedTeam2 = normalizeId(fixture.team2);
    const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam2);

    console.log('🔄 TeamUtils: Transforming fixture:', {
      fixtureId: fixture.id,
      team1: fixture.team1,
      team2: fixture.team2,
      normalizedTeam1,
      normalizedTeam2,
      foundHomeTeam: homeTeam ? { 
        id: homeTeam.id, 
        name: homeTeam.name,
        textId: homeTeam.__id__,
        logoURL: homeTeam.logoURL,
        hasLogoURL: !!homeTeam.logoURL,
        normalized: normalizeId(homeTeam.__id__)
      } : null,
      foundAwayTeam: awayTeam ? { 
        id: awayTeam.id, 
        name: awayTeam.name,
        textId: awayTeam.__id__,
        logoURL: awayTeam.logoURL,
        hasLogoURL: !!awayTeam.logoURL,
        normalized: normalizeId(awayTeam.__id__)
      } : null,
      availableTeams: teams?.map(t => ({
        name: t.name,
        textId: t.__id__,
        logoURL: t.logoURL,
        normalized: normalizeId(t.__id__)
      })) || []
    });

    return {
      ...fixture,
      home_team: homeTeam ? createTeamObject(homeTeam) : undefined,
      away_team: awayTeam ? createTeamObject(awayTeam) : undefined
    };
  });
};


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
    updated_at: new Date().toISOString(),
    __id__: team.__id__ // Ensure we preserve the text ID
  };
  
  console.log('🔧 TeamUtils: Created team object:', {
    name: teamObj.name,
    numericId: teamObj.id,
    textId: teamObj.__id__,
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

    // Now use the standardized home_team_id and away_team_id fields
    const normalizedHomeTeamId = normalizeId(fixture.home_team_id);
    const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedHomeTeamId);
    
    const normalizedAwayTeamId = normalizeId(fixture.away_team_id);
    const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedAwayTeamId);

    console.log('🔄 TeamUtils: Transforming fixture with standardized IDs:', {
      fixtureId: fixture.id,
      homeTeamId: fixture.home_team_id,
      awayTeamId: fixture.away_team_id,
      normalizedHomeTeamId,
      normalizedAwayTeamId,
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

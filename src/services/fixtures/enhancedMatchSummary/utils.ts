
// Helper function to safely cast periods from JSON
export const safeCastPeriods = (periods: any): Array<{ start_time: number; end_time: number; duration: number; }> => {
  if (!periods || !Array.isArray(periods)) {
    return [];
  }
  
  return periods.filter((period: any) => 
    period && 
    typeof period === 'object' && 
    typeof period.start_time === 'number' && 
    typeof period.end_time === 'number' && 
    typeof period.duration === 'number'
  );
};

// Extract player ID from player name field (fallback pattern)
export const extractPlayerId = (playerName: string): number => {
  const parsed = parseInt(playerName);
  return isNaN(parsed) ? 0 : parsed;
};

// Process goals and assists from match events
export const processGoalsAndAssists = (matchEvents: any[]) => {
  return matchEvents
    ?.filter(event => event.event_type === 'goal' || event.event_type === 'assist')
    .map(event => {
      const playerId = extractPlayerId(event.player_name);
      
      return {
        id: event.id,
        playerId,
        playerName: event.player_name,
        team: event.team_id,
        teamId: event.team_id,
        type: event.event_type as 'goal' | 'assist',
        time: event.event_time,
        timestamp: new Date(event.created_at).toISOString()
      };
    }) || [];
};

// Process cards from match events
export const processCards = (matchEvents: any[]) => {
  return matchEvents
    ?.filter(event => event.event_type === 'yellow_card' || event.event_type === 'red_card')
    .map(event => {
      const playerId = extractPlayerId(event.player_name);
      const cardType = event.card_type || (event.event_type === 'yellow_card' ? 'yellow' : 'red');
      
      return {
        id: event.id,
        playerId,
        playerName: event.player_name,
        team: event.team_id,
        teamId: event.team_id,
        cardType: cardType as 'yellow' | 'red',
        type: cardType as 'yellow' | 'red',
        time: event.event_time,
        timestamp: new Date(event.created_at).toISOString()
      };
    }) || [];
};

// Process player time tracking data
export const processPlayerTimes = (playerTimeData: any[]) => {
  return playerTimeData?.map(timeRecord => ({
    playerId: timeRecord.player_id,
    playerName: timeRecord.player_name,
    team: timeRecord.team_id.toString(),
    teamId: timeRecord.team_id.toString(),
    totalMinutes: timeRecord.total_minutes,
    periods: safeCastPeriods(timeRecord.periods)
  })) || [];
};

// Calculate summary statistics
export const calculateSummaryStats = (goals: any[], cards: any[], playerTimes: any[], fixture: any) => {
  const homeTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.teamId === fixture.home_team_id
  ).length;
  
  const awayTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.teamId === fixture.away_team_id
  ).length;

  const homeTeamCards = cards.filter(card => 
    card.teamId === fixture.home_team_id
  ).length;
  
  const awayTeamCards = cards.filter(card => 
    card.teamId === fixture.away_team_id
  ).length;

  return {
    totalGoals: goals.filter(g => g.type === 'goal').length,
    totalAssists: goals.filter(g => g.type === 'assist').length,
    totalCards: cards.length,
    playersTracked: playerTimes.length,
    homeTeamGoals,
    awayTeamGoals,
    homeTeamCards,
    awayTeamCards
  };
};

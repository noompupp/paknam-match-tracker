
// Unified data processing - using Enhanced Timeline as primary source
export const processUnifiedMatchData = (enhancedData: any) => {
  if (!enhancedData?.timelineEvents) {
    console.log('⚠️ processUnifiedMatchData: No timeline events found');
    return { goals: [], cards: [], timelineEvents: [] };
  }

  const timelineEvents = enhancedData.timelineEvents;
  
  // Extract goals and cards from timeline events
  const goals = timelineEvents.filter((event: any) => event.type === 'goal');
  const cards = timelineEvents.filter((event: any) => 
    event.type === 'yellow_card' || event.type === 'red_card'
  );

  console.log('📊 Unified data processing:', {
    timelineEvents: timelineEvents.length,
    goals: goals.length,
    cards: cards.length,
    goalsData: goals,
    cardsData: cards
  });

  return { goals, cards, timelineEvents };
};

// Enhanced team ID normalization and comparison
export const normalizeTeamId = (teamId: any): string => {
  if (!teamId) return '';
  return String(teamId).trim();
};

export const compareTeamIds = (teamId1: any, teamId2: any): boolean => {
  const normalized1 = normalizeTeamId(teamId1);
  const normalized2 = normalizeTeamId(teamId2);
  const result = normalized1 === normalized2;
  
  console.log('🔍 Team ID comparison:', {
    teamId1: teamId1,
    teamId2: teamId2,
    normalized1,
    normalized2,
    match: result
  });
  
  return result;
};

// Enhanced goal filtering with fallback logic
export const filterGoalsByTeam = (goals: any[], teamId: any, teamName?: string): any[] => {
  console.log('🎯 Filtering goals by team:', {
    totalGoals: goals.length,
    targetTeamId: teamId,
    targetTeamName: teamName,
    goalsData: goals.map(g => ({
      id: g.id,
      teamId: getGoalTeamId(g),
      playerName: getGoalPlayerName(g),
      time: getGoalTime(g)
    }))
  });

  const filtered = goals.filter(goal => {
    const goalTeamId = getGoalTeamId(goal);
    
    // Primary match: team ID comparison
    if (compareTeamIds(goalTeamId, teamId)) {
      console.log('✅ Goal matched by team ID:', {
        goalId: goal.id,
        goalTeamId,
        targetTeamId: teamId,
        player: getGoalPlayerName(goal)
      });
      return true;
    }
    
    // Fallback: team name comparison if available
    if (teamName && goal.team && String(goal.team).toLowerCase().includes(teamName.toLowerCase())) {
      console.log('✅ Goal matched by team name fallback:', {
        goalId: goal.id,
        goalTeam: goal.team,
        targetTeamName: teamName,
        player: getGoalPlayerName(goal)
      });
      return true;
    }
    
    console.log('❌ Goal not matched:', {
      goalId: goal.id,
      goalTeamId,
      targetTeamId: teamId,
      goalTeam: goal.team,
      targetTeamName: teamName,
      player: getGoalPlayerName(goal)
    });
    
    return false;
  });

  console.log(`🎯 Team ${teamId} goals filtered:`, {
    totalGoals: goals.length,
    filteredGoals: filtered.length,
    teamId,
    teamName
  });

  return filtered;
};

// Unified helper functions for both data sources
export const getGoalTeamId = (goal: any): string => {
  const teamId = goal.teamId || goal.team_id || goal.team || '';
  return normalizeTeamId(teamId);
};

export const getGoalPlayerName = (goal: any): string => goal.playerName || goal.player_name || '';
export const getGoalTime = (goal: any): number => goal.time || goal.event_time || 0;

export const getCardTeamId = (card: any): string => {
  const teamId = card.teamId || card.team_id || card.team || '';
  return normalizeTeamId(teamId);
};

export const getCardPlayerName = (card: any): string => card.playerName || card.player_name || '';
export const getCardTime = (card: any): number => card.time || card.event_time || 0;
export const getCardType = (card: any): string => {
  const type = card.type || card.cardType || card.event_type || '';
  return type.includes('red') ? 'red card' : 'yellow card';
};
export const isCardRed = (card: any): boolean => {
  const type = card.type || card.cardType || card.event_type || '';
  return type.includes('red');
};


// Unified data processing - using Enhanced Timeline as primary source
export const processUnifiedMatchData = (enhancedData: any) => {
  if (!enhancedData?.timelineEvents) {
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
    cards: cards.length
  });

  return { goals, cards, timelineEvents };
};

// Unified helper functions for both data sources
export const getGoalTeamId = (goal: any): string => goal.teamId || goal.team_id || '';
export const getGoalPlayerName = (goal: any): string => goal.playerName || goal.player_name || '';
export const getGoalTime = (goal: any): number => goal.time || goal.event_time || 0;

export const getCardTeamId = (card: any): string => card.teamId || card.team_id || '';
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

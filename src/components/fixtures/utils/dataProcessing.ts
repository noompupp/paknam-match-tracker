
import { getGoalTeamId, getGoalPlayerName } from './dataExtractors';

// Unified data processing - using Enhanced Timeline as primary source
export const processUnifiedMatchData = (enhancedData: any) => {
  if (!enhancedData?.timelineEvents) {
    console.log('⚠️ processUnifiedMatchData: No timeline events found');
    return { goals: [], cards: [], timelineEvents: [] };
  }

  const timelineEvents = enhancedData.timelineEvents;
  
  // Extract goals from timeline events while preserving assist information
  const goals = timelineEvents
    .filter((event: any) => event.type === 'goal')
    .map((event: any) => ({
      ...event,
      // Ensure assist information is preserved
      assistPlayerName: event.assistPlayerName || null,
      assistTeamId: event.assistTeamId || null
    }));
  
  const cards = timelineEvents.filter((event: any) => 
    event.type === 'yellow_card' || event.type === 'red_card'
  );

  console.log('📊 Unified data processing - Enhanced with assist preservation:', {
    timelineEvents: timelineEvents.length,
    goals: goals.length,
    cards: cards.length,
    goalsWithAssists: goals.filter(g => g.assistPlayerName).length,
    sampleGoalWithAssist: goals.find(g => g.assistPlayerName) ? {
      id: goals.find(g => g.assistPlayerName).id,
      player: goals.find(g => g.assistPlayerName).playerName,
      assist: goals.find(g => g.assistPlayerName).assistPlayerName,
      time: goals.find(g => g.assistPlayerName).time
    } : 'No assists found',
    allGoalStructures: goals.map(g => ({
      id: g.id,
      teamId: getGoalTeamId(g),
      playerName: getGoalPlayerName(g),
      assistPlayerName: g.assistPlayerName,
      time: g.time,
      hasAssist: !!g.assistPlayerName
    }))
  });

  return { goals, cards, timelineEvents };
};

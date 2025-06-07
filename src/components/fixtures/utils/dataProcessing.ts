
import { getGoalTeamId, getGoalPlayerName } from './dataExtractors';

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

  console.log('📊 Unified data processing - Enhanced debugging:', {
    timelineEvents: timelineEvents.length,
    goals: goals.length,
    cards: cards.length,
    sampleGoalStructure: goals.length > 0 ? {
      id: goals[0].id,
      type: goals[0].type,
      teamId: goals[0].teamId,
      team_id: goals[0].team_id,
      team: goals[0].team,
      playerName: goals[0].playerName,
      player_name: goals[0].player_name,
      time: goals[0].time,
      event_time: goals[0].event_time,
      fullStructure: goals[0]
    } : 'No goals found',
    allGoalTeamIds: goals.map(g => ({
      id: g.id,
      teamId: getGoalTeamId(g),
      rawTeamId: g.teamId,
      rawTeam_id: g.team_id,
      rawTeam: g.team,
      playerName: getGoalPlayerName(g)
    }))
  });

  return { goals, cards, timelineEvents };
};

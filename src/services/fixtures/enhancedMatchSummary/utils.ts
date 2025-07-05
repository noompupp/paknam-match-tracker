
import { EnhancedMatchSummaryData, Goal, Card, PlayerTime, TimelineEvent, SummaryStats } from './types';

export const processGoalsAndAssists = (matchEvents: any[]): Goal[] => {
  return matchEvents
    .filter(event => ['goal', 'assist'].includes(event.event_type))
    .map(event => ({
      id: event.id,
      playerId: event.player_id || 0,
      playerName: event.player_name,
      team: event.team_name || event.team_id,
      teamId: event.team_id,
      type: event.event_type,
      time: event.event_time,
      timestamp: new Date(event.created_at).getTime(),
      assistPlayerName: event.assist_player_name || null,
      assistTeamId: event.assist_team_id || null,
      isOwnGoal: event.is_own_goal || false // Use standardized column
    }));
};

export const processCards = (matchEvents: any[]): Card[] => {
  return matchEvents
    .filter(event => ['yellow_card', 'red_card'].includes(event.event_type))
    .map(event => ({
      id: event.id,
      playerId: event.player_id || 0,
      playerName: event.player_name,
      team: event.team_name || event.team_id,
      teamId: event.team_id,
      cardType: event.card_type,
      type: event.card_type,
      time: event.event_time,
      timestamp: new Date(event.created_at).getTime()
    }));
};

export const processPlayerTimes = (playerTimeData: any[]): PlayerTime[] => {
  return playerTimeData.map(pt => ({
    playerId: pt.player_id,
    playerName: pt.player_name,
    team: pt.team_name || pt.team_id?.toString() || 'Unknown',
    teamId: pt.team_id?.toString() || '',
    totalMinutes: pt.total_minutes || 0,
    periods: pt.periods || []
  }));
};

export const processTimelineEvents = (matchEvents: any[]): TimelineEvent[] => {
  return matchEvents
    .filter(event => ['goal', 'assist', 'yellow_card', 'red_card'].includes(event.event_type))
    .map(event => ({
      id: event.id,
      type: event.event_type,
      time: event.event_time,
      playerName: event.player_name,
      teamId: event.team_id,
      teamName: event.team_name || event.team_id,
      cardType: event.card_type,
      assistPlayerName: event.assist_player_name || null,
      assistTeamId: event.assist_team_id || null,
      description: event.description,
      timestamp: new Date(event.created_at).getTime(),
      isOwnGoal: event.is_own_goal || false // Use standardized column
    }))
    .sort((a, b) => a.time - b.time || a.timestamp - b.timestamp);
};

export const calculateSummaryStats = (
  goals: Goal[], 
  cards: Card[], 
  playerTimes: PlayerTime[], 
  fixture: any
): SummaryStats => {
  const regularGoals = goals.filter(g => g.type === 'goal' && !g.isOwnGoal);
  const ownGoals = goals.filter(g => g.type === 'goal' && g.isOwnGoal);
  const assists = goals.filter(g => g.type === 'assist');

  return {
    totalGoals: goals.filter(g => g.type === 'goal').length,
    totalRegularGoals: regularGoals.length,
    totalOwnGoals: ownGoals.length,
    totalAssists: assists.length,
    totalCards: cards.length,
    homeTeamGoals: goals.filter(g => g.type === 'goal' && g.teamId === fixture?.home_team_id).length,
    awayTeamGoals: goals.filter(g => g.type === 'goal' && g.teamId === fixture?.away_team_id).length,
    homeTeamRegularGoals: regularGoals.filter(g => g.teamId === fixture?.home_team_id).length,
    awayTeamRegularGoals: regularGoals.filter(g => g.teamId === fixture?.away_team_id).length,
    homeTeamOwnGoals: ownGoals.filter(g => g.teamId === fixture?.home_team_id).length,
    awayTeamOwnGoals: ownGoals.filter(g => g.teamId === fixture?.away_team_id).length,
    homeTeamCards: cards.filter(c => c.teamId === fixture?.home_team_id).length,
    awayTeamCards: cards.filter(c => c.teamId === fixture?.away_team_id).length,
    playersTracked: playerTimes.length
  };
};

export const processEnhancedFunctionData = (functionResult: any): EnhancedMatchSummaryData => {
  console.log('🔧 Processing enhanced function data with standardized own goal support:', functionResult);
  
  // Use the JSONB data directly from the database function (no JSON.parse needed)
  const goals = (functionResult.goals || []).map((goal: any) => ({
    ...goal,
    isOwnGoal: goal.isOwnGoal || false // Ensure standardized own goal flag is preserved
  }));
  
  const cards = functionResult.cards || [];
  const playerTimes = functionResult.player_times || [];
  const timelineEvents = (functionResult.timeline_events || []).map((event: any) => ({
    ...event,
    isOwnGoal: event.isOwnGoal || false // Ensure standardized own goal flag is preserved in timeline
  }));
  
  const summaryStats = functionResult.summary_stats || {};

  console.log('✅ Enhanced function data processed with standardized own goal support:', {
    goalsCount: goals.length,
    regularGoalsCount: goals.filter((g: any) => g.type === 'goal' && !g.isOwnGoal).length,
    ownGoalsCount: goals.filter((g: any) => g.type === 'goal' && g.isOwnGoal).length,
    assistsCount: goals.filter((g: any) => g.type === 'assist').length,
    cardsCount: cards.length,
    playerTimesCount: playerTimes.length,
    timelineEventsCount: timelineEvents.length
  });

  return {
    goals,
    cards,
    playerTimes,
    timelineEvents,
    summary: summaryStats
  };
};

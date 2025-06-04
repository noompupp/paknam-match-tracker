
import { EnhancedMatchSummaryData } from './types';

// Process goals and assists from match events
export const processGoalsAndAssists = (matchEvents: any[]) => {
  return matchEvents
    .filter(event => event.event_type === 'goal' || event.event_type === 'assist')
    .map(event => ({
      id: event.id,
      playerId: event.player_id || 0,
      playerName: event.player_name,
      team: event.team_name || event.team_id,
      teamId: event.team_id,
      type: event.event_type as 'goal' | 'assist',
      time: event.event_time,
      timestamp: event.created_at,
      assistPlayerName: event.assist_player_name,
      assistTeamId: event.assist_team_id
    }));
};

// Process cards from match events
export const processCards = (matchEvents: any[]) => {
  return matchEvents
    .filter(event => event.event_type === 'yellow_card' || event.event_type === 'red_card')
    .map(event => ({
      id: event.id,
      playerId: event.player_id || 0,
      playerName: event.player_name,
      team: event.team_name || event.team_id,
      teamId: event.team_id,
      cardType: event.card_type as 'yellow' | 'red',
      type: event.card_type as 'yellow' | 'red',
      time: event.event_time,
      timestamp: event.created_at
    }));
};

// Process player time tracking data
export const processPlayerTimes = (playerTimeData: any[]) => {
  return playerTimeData.map(player => ({
    playerId: player.player_id,
    playerName: player.player_name,
    team: player.team_name || player.team_id,
    teamId: player.team_id?.toString() || '',
    totalMinutes: player.total_minutes,
    periods: player.periods || []
  }));
};

// Process timeline events from match events
export const processTimelineEvents = (matchEvents: any[]) => {
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
      assistPlayerName: event.assist_player_name,
      assistTeamId: event.assist_team_id,
      description: event.description,
      timestamp: event.created_at
    }))
    .sort((a, b) => a.time - b.time);
};

// Calculate summary statistics
export const calculateSummaryStats = (goals: any[], cards: any[], playerTimes: any[], fixture: any) => {
  const homeTeamGoals = goals.filter(goal => goal.teamId === fixture.home_team_id && goal.type === 'goal').length;
  const awayTeamGoals = goals.filter(goal => goal.teamId === fixture.away_team_id && goal.type === 'goal').length;
  const homeTeamCards = cards.filter(card => card.teamId === fixture.home_team_id).length;
  const awayTeamCards = cards.filter(card => card.teamId === fixture.away_team_id).length;

  return {
    totalGoals: goals.filter(item => item.type === 'goal').length,
    totalAssists: goals.filter(item => item.type === 'assist').length,
    totalCards: cards.length,
    playersTracked: playerTimes.length,
    homeTeamGoals,
    awayTeamGoals,
    homeTeamCards,
    awayTeamCards
  };
};

// Process enhanced data from the new database function
export const processEnhancedFunctionData = (functionResult: any): EnhancedMatchSummaryData => {
  console.log('🔄 Processing enhanced function data:', functionResult);

  const goals = Array.isArray(functionResult.goals) ? functionResult.goals : [];
  const cards = Array.isArray(functionResult.cards) ? functionResult.cards : [];
  const playerTimes = Array.isArray(functionResult.player_times) ? functionResult.player_times : [];
  const timelineEvents = Array.isArray(functionResult.timeline_events) ? functionResult.timeline_events : [];

  return {
    goals,
    cards,
    playerTimes,
    timelineEvents,
    summary: functionResult.summary_stats || {
      totalGoals: 0,
      totalAssists: 0,
      totalCards: 0,
      playersTracked: 0,
      homeTeamGoals: 0,
      awayTeamGoals: 0,
      homeTeamCards: 0,
      awayTeamCards: 0
    }
  };
};

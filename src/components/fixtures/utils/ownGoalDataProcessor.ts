
export const processOwnGoalData = (events: any[]) => {
  const ownGoals = events.filter(event => 
    event.event_type === 'goal' && event.own_goal === true
  );

  return ownGoals.map(goal => ({
    id: goal.id,
    playerId: goal.player_id || 0,
    playerName: goal.player_name,
    teamId: goal.team_id,
    time: goal.event_time,
    timestamp: goal.created_at,
    isOwnGoal: true,
    description: goal.description
  }));
};

export const separateOwnGoalsFromRegular = (goals: any[]) => {
  const regularGoals = goals.filter(goal => !goal.isOwnGoal);
  const ownGoals = goals.filter(goal => goal.isOwnGoal);
  
  return {
    regularGoals,
    ownGoals,
    totalGoals: goals.length,
    regularGoalCount: regularGoals.length,
    ownGoalCount: ownGoals.length
  };
};

export const getOwnGoalTeamId = (goal: any) => {
  return goal.teamId || goal.team_id || '';
};

export const getOwnGoalPlayerName = (goal: any) => {
  return goal.playerName || goal.player_name || 'Unknown Player';
};

export const getOwnGoalTime = (goal: any) => {
  return goal.time || goal.event_time || 0;
};


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

// Enhanced goal filtering with comprehensive fallback logic
export const filterGoalsByTeam = (goals: any[], teamId: any, teamName?: string): any[] => {
  console.log('🎯 Enhanced goal filtering - Input analysis:', {
    totalGoals: goals.length,
    targetTeamId: teamId,
    targetTeamName: teamName,
    goalStructures: goals.map(g => ({
      id: g.id,
      teamId: g.teamId,
      team_id: g.team_id,
      team: g.team,
      playerName: g.playerName || g.player_name,
      time: g.time || g.event_time,
      extractedTeamId: getGoalTeamId(g),
      extractedPlayerName: getGoalPlayerName(g),
      extractedTime: getGoalTime(g)
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
    
    // Secondary match: Check against string representation of team ID
    if (goalTeamId && String(goalTeamId) === String(teamId)) {
      console.log('✅ Goal matched by string team ID:', {
        goalId: goal.id,
        goalTeamId,
        targetTeamId: teamId,
        player: getGoalPlayerName(goal)
      });
      return true;
    }
    
    // Tertiary match: team name comparison if available
    if (teamName && goal.team && String(goal.team).toLowerCase().includes(teamName.toLowerCase())) {
      console.log('✅ Goal matched by team name fallback:', {
        goalId: goal.id,
        goalTeam: goal.team,
        targetTeamName: teamName,
        player: getGoalPlayerName(goal)
      });
      return true;
    }
    
    // Quaternary match: Check if goal.teamName matches target team name
    if (teamName && goal.teamName && String(goal.teamName).toLowerCase().includes(teamName.toLowerCase())) {
      console.log('✅ Goal matched by teamName property:', {
        goalId: goal.id,
        goalTeamName: goal.teamName,
        targetTeamName: teamName,
        player: getGoalPlayerName(goal)
      });
      return true;
    }
    
    console.log('❌ Goal not matched - All attempts failed:', {
      goalId: goal.id,
      goalTeamId,
      targetTeamId: teamId,
      goalTeam: goal.team,
      goalTeamName: goal.teamName,
      targetTeamName: teamName,
      player: getGoalPlayerName(goal),
      goalStructure: {
        teamId: goal.teamId,
        team_id: goal.team_id,
        team: goal.team,
        teamName: goal.teamName
      }
    });
    
    return false;
  });

  console.log(`🎯 Team ${teamId} (${teamName}) goals filtered:`, {
    totalGoals: goals.length,
    filteredGoals: filtered.length,
    teamId,
    teamName,
    filteredGoalIds: filtered.map(g => g.id)
  });

  return filtered;
};

// Enhanced helper functions with improved data extraction
export const getGoalTeamId = (goal: any): string => {
  // Try multiple possible team ID fields with enhanced debugging
  const possibleTeamIds = [
    goal.teamId,
    goal.team_id, 
    goal.team,
    goal.teamName,
    goal.player?.team_id,
    goal.player?.teamId
  ];
  
  console.log('🔍 getGoalTeamId - Analyzing goal:', {
    goalId: goal.id,
    possibleTeamIds,
    selectedTeamId: possibleTeamIds.find(id => id !== undefined && id !== null) || ''
  });
  
  const teamId = possibleTeamIds.find(id => id !== undefined && id !== null) || '';
  return normalizeTeamId(teamId);
};

export const getGoalPlayerName = (goal: any): string => {
  // Try multiple possible player name fields
  const possibleNames = [
    goal.playerName,
    goal.player_name,
    goal.player?.name,
    goal.scorer,
    goal.name
  ];
  
  const playerName = possibleNames.find(name => name && name.trim() !== '') || '';
  
  console.log('🔍 getGoalPlayerName - Analyzing goal:', {
    goalId: goal.id,
    possibleNames,
    selectedName: playerName
  });
  
  return playerName;
};

export const getGoalAssistPlayerName = (goal: any): string => {
  // Try multiple possible assist player name fields
  const possibleAssistNames = [
    goal.assistPlayerName,
    goal.assist_player_name,
    goal.assistPlayer?.name,
    goal.assist?.player_name,
    goal.assist?.name
  ];
  
  const assistPlayerName = possibleAssistNames.find(name => name && name.trim() !== '') || '';
  
  console.log('🅰️ getGoalAssistPlayerName - Analyzing goal:', {
    goalId: goal.id,
    possibleAssistNames,
    selectedAssistName: assistPlayerName,
    hasAssist: !!assistPlayerName
  });
  
  return assistPlayerName;
};

export const getGoalTime = (goal: any): number => {
  // Try multiple possible time fields
  const possibleTimes = [
    goal.time,
    goal.event_time,
    goal.minute,
    goal.matchTime
  ];
  
  const time = possibleTimes.find(t => t !== undefined && t !== null) || 0;
  return Number(time);
};

export const getCardTeamId = (card: any): string => {
  const possibleTeamIds = [
    card.teamId,
    card.team_id,
    card.team,
    card.teamName,
    card.player?.team_id,
    card.player?.teamId
  ];
  
  const teamId = possibleTeamIds.find(id => id !== undefined && id !== null) || '';
  return normalizeTeamId(teamId);
};

export const getCardPlayerName = (card: any): string => {
  const possibleNames = [
    card.playerName,
    card.player_name,
    card.player?.name,
    card.name
  ];
  
  return possibleNames.find(name => name && name.trim() !== '') || '';
};

export const getCardTime = (card: any): number => {
  const possibleTimes = [
    card.time,
    card.event_time,
    card.minute,
    card.matchTime
  ];
  
  const time = possibleTimes.find(t => t !== undefined && t !== null) || 0;
  return Number(time);
};

export const getCardType = (card: any): string => {
  const type = card.type || card.cardType || card.event_type || '';
  return type.includes('red') ? 'red card' : 'yellow card';
};

export const isCardRed = (card: any): boolean => {
  const type = card.type || card.cardType || card.event_type || '';
  return type.includes('red');
};

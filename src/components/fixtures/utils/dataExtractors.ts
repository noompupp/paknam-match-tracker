
import { normalizeTeamId } from './teamMatching';

// Data extraction utilities for goals and cards

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
  // Enhanced database function returns properly structured data
  const possibleNames = [
    goal.playerName,     // From enhanced function
    goal.player_name,    // Fallback format
    goal.player?.name,   // Nested format
    goal.scorer,         // Alternative field
    goal.name           // Direct name field
  ];
  
  const playerName = possibleNames.find(name => name && name.trim() !== '') || 'Unknown Player';
  
  console.log('🔍 getGoalPlayerName - Enhanced extraction:', {
    goalId: goal.id,
    goalType: goal.type,
    possibleNames: possibleNames.map((name, i) => ({ [`field_${i}`]: name })),
    selectedName: playerName,
    isOwnGoal: goal.isOwnGoal || goal.is_own_goal,
    rawGoal: goal
  });
  
  return playerName;
};

export const getGoalAssistPlayerName = (goal: any): string => {
  // Enhanced own goal detection - check multiple possible fields
  const isOwnGoal = !!(
    goal.own_goal || 
    goal.isOwnGoal || 
    goal.is_own_goal ||
    (goal.description && goal.description.toLowerCase().includes('own goal'))
  );
  
  if (isOwnGoal) {
    console.log('🅰️ getGoalAssistPlayerName - Skipping assist for own goal:', {
      goalId: goal.id,
      player: goal.playerName,
      isOwnGoal: true,
      ownGoalFlags: {
        own_goal: goal.own_goal,
        isOwnGoal: goal.isOwnGoal,
        is_own_goal: goal.is_own_goal,
        description: goal.description
      }
    });
    return '';
  }

  // Enhanced assist extraction with comprehensive field checking
  const possibleAssistNames = [
    goal.assistPlayerName,
    goal.assist_player_name,
    goal.assistPlayer?.name,
    goal.assist?.player_name,
    goal.assist?.name,
    goal.assist?.playerName,
    goal.assist_name,
    goal.assistName
  ];
  
  const assistPlayerName = possibleAssistNames.find(name => name && name.trim() !== '') || '';
  
  console.log('🅰️ getGoalAssistPlayerName - Enhanced extraction:', {
    goalId: goal.id,
    player: goal.playerName,
    goalType: goal.type,
    isOwnGoal,
    possibleAssistNames,
    selectedAssistName: assistPlayerName,
    hasAssist: !!assistPlayerName,
    rawGoalStructure: {
      assistPlayerName: goal.assistPlayerName,
      assist_player_name: goal.assist_player_name,
      assistTeamId: goal.assistTeamId,
      assist_team_id: goal.assist_team_id,
      assistName: goal.assistName,
      assist_name: goal.assist_name
    }
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
    card.playerName,     // From enhanced function
    card.player_name,    // Fallback format
    card.player?.name,   // Nested format
    card.name           // Direct name field
  ];
  
  const playerName = possibleNames.find(name => name && name.trim() !== '') || 'Unknown Player';
  
  console.log('🔍 getCardPlayerName - Enhanced extraction:', {
    cardId: card.id,
    cardType: card.type || card.cardType,
    possibleNames: possibleNames.map((name, i) => ({ [`field_${i}`]: name })),
    selectedName: playerName,
    rawCard: card
  });
  
  return playerName;
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
  // Enhanced database function provides consistent card type
  const possibleTypes = [
    card.cardType,      // From enhanced function
    card.type,          // Alternative field
    card.event_type     // Fallback format
  ];
  
  const type = possibleTypes.find(t => t && t.trim() !== '') || 'yellow_card';
  const normalizedType = type.replace('_card', '').toLowerCase();
  
  console.log('🔍 getCardType - Enhanced extraction:', {
    cardId: card.id,
    possibleTypes,
    selectedType: type,
    normalizedType,
    isRed: normalizedType.includes('red')
  });
  
  return normalizedType.includes('red') ? 'red card' : 'yellow card';
};

export const isCardRed = (card: any): boolean => {
  const type = card.type || card.cardType || card.event_type || '';
  return type.includes('red');
};


import { getGoalTeamId, getGoalPlayerName, getGoalAssistPlayerName } from './dataExtractors';

// Enhanced unified data processing with improved assist correlation and own goal preservation
export const processUnifiedMatchData = (enhancedData: any) => {
  if (!enhancedData?.timelineEvents) {
    console.log('⚠️ processUnifiedMatchData: No timeline events found');
    return { goals: [], cards: [], timelineEvents: [] };
  }

  const timelineEvents = enhancedData.timelineEvents;
  
  console.log('📊 Processing unified data with enhanced own goal preservation:', {
    totalTimelineEvents: timelineEvents.length,
    goalEvents: timelineEvents.filter((e: any) => e.type === 'goal').length,
    assistEvents: timelineEvents.filter((e: any) => e.type === 'assist').length,
    ownGoalEvents: timelineEvents.filter((e: any) => e.type === 'goal' && (e.isOwnGoal || e.own_goal)).length,
    rawOwnGoalData: timelineEvents.filter((e: any) => e.type === 'goal').map((g: any) => ({
      id: g.id,
      player: g.playerName,
      isOwnGoal: g.isOwnGoal,
      own_goal: g.own_goal,
      hasOwnGoalFlag: !!(g.isOwnGoal || g.own_goal)
    }))
  });
  
  // Extract goals from timeline events while preserving and enhancing assist information AND own goal flags
  const goals = timelineEvents
    .filter((event: any) => event.type === 'goal')
    .map((event: any) => {
      // Enhanced own goal flag preservation - check multiple possible fields
      const isOwnGoal = !!(
        event.isOwnGoal || 
        event.own_goal || 
        event.is_own_goal ||
        (event.description && event.description.toLowerCase().includes('own goal'))
      );

      // Enhanced goal processing with comprehensive own goal support
      const enhancedGoal = {
        ...event,
        // Preserve original own goal flags and add standardized flag
        isOwnGoal,
        own_goal: isOwnGoal, // Maintain backwards compatibility
        is_own_goal: isOwnGoal, // Database standard
        // Enhanced assist preservation and correlation
        assistPlayerName: event.assistPlayerName || event.assist_player_name || null,
        assistTeamId: event.assistTeamId || event.assist_team_id || null
      };

      // If this is an own goal, explicitly clear any assist data
      if (isOwnGoal) {
        enhancedGoal.assistPlayerName = null;
        enhancedGoal.assistTeamId = null;
        console.log('🔴 processUnifiedMatchData: Own goal detected, clearing assists for:', {
          player: event.playerName,
          goalId: event.id,
          isOwnGoal: true
        });
      } else {
        // If no assist found in the event itself, try to find one from separate assist events
        if (!enhancedGoal.assistPlayerName) {
          const correspondingAssist = timelineEvents.find((e: any) => 
            e.type === 'assist' && 
            Math.abs(e.time - event.time) <= 15 && // Within 15 seconds
            e.teamId === event.teamId &&
            e.playerName !== event.playerName
          );
          
          if (correspondingAssist) {
            enhancedGoal.assistPlayerName = correspondingAssist.playerName;
            enhancedGoal.assistTeamId = correspondingAssist.teamId;
            console.log('✅ Found corresponding assist for goal by', event.playerName, '- assist by', correspondingAssist.playerName);
          }
        }
      }

      return enhancedGoal;
    });
  
  const cards = timelineEvents.filter((event: any) => 
    event.type === 'yellow_card' || event.type === 'red_card'
  );

  console.log('📊 Unified data processing - Enhanced with comprehensive own goal preservation:', {
    timelineEvents: timelineEvents.length,
    goals: goals.length,
    cards: cards.length,
    regularGoals: goals.filter(g => !g.isOwnGoal).length,
    ownGoals: goals.filter(g => g.isOwnGoal).length,
    goalsWithAssists: goals.filter(g => getGoalAssistPlayerName(g) && !g.isOwnGoal).length,
    ownGoalsWithClearedAssists: goals.filter(g => g.isOwnGoal && !g.assistPlayerName).length,
    detailedOwnGoalAnalysis: goals.filter(g => g.isOwnGoal).map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      isOwnGoal: g.isOwnGoal,
      own_goal: g.own_goal,
      is_own_goal: g.is_own_goal,
      assistPlayerName: g.assistPlayerName,
      extractedAssist: getGoalAssistPlayerName(g),
      time: g.time
    })),
    detailedRegularGoalAnalysis: goals.filter(g => !g.isOwnGoal).map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      assistPlayerName: g.assistPlayerName,
      extractedAssist: getGoalAssistPlayerName(g),
      time: g.time,
      hasAssist: !!getGoalAssistPlayerName(g)
    })),
    assistCorrelationResults: {
      originalGoalsWithAssists: timelineEvents.filter((e: any) => e.type === 'goal' && e.assistPlayerName && !e.isOwnGoal).length,
      enhancedGoalsWithAssists: goals.filter(g => g.assistPlayerName && !g.isOwnGoal).length,
      extractorGoalsWithAssists: goals.filter(g => getGoalAssistPlayerName(g) && !g.isOwnGoal).length
    }
  });

  return { goals, cards, timelineEvents };
};

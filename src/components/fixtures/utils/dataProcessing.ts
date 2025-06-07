
import { getGoalTeamId, getGoalPlayerName, getGoalAssistPlayerName } from './dataExtractors';

// Enhanced unified data processing with improved assist correlation
export const processUnifiedMatchData = (enhancedData: any) => {
  if (!enhancedData?.timelineEvents) {
    console.log('⚠️ processUnifiedMatchData: No timeline events found');
    return { goals: [], cards: [], timelineEvents: [] };
  }

  const timelineEvents = enhancedData.timelineEvents;
  
  console.log('📊 Processing unified data with enhanced assist correlation:', {
    totalTimelineEvents: timelineEvents.length,
    goalEvents: timelineEvents.filter((e: any) => e.type === 'goal').length,
    assistEvents: timelineEvents.filter((e: any) => e.type === 'assist').length,
    rawAssistData: timelineEvents.filter((e: any) => e.type === 'goal').map((g: any) => ({
      id: g.id,
      assistPlayerName: g.assistPlayerName,
      assist_player_name: g.assist_player_name
    }))
  });
  
  // Extract goals from timeline events while preserving and enhancing assist information
  const goals = timelineEvents
    .filter((event: any) => event.type === 'goal')
    .map((event: any) => {
      // Enhanced assist preservation and correlation
      const enhancedGoal = {
        ...event,
        assistPlayerName: event.assistPlayerName || event.assist_player_name || null,
        assistTeamId: event.assistTeamId || event.assist_team_id || null
      };

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

      return enhancedGoal;
    });
  
  const cards = timelineEvents.filter((event: any) => 
    event.type === 'yellow_card' || event.type === 'red_card'
  );

  console.log('📊 Unified data processing - Enhanced with comprehensive assist correlation:', {
    timelineEvents: timelineEvents.length,
    goals: goals.length,
    cards: cards.length,
    goalsWithAssists: goals.filter(g => getGoalAssistPlayerName(g)).length,
    detailedAssistAnalysis: goals.map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      assistPlayerName: g.assistPlayerName,
      extractedAssist: getGoalAssistPlayerName(g),
      time: g.time,
      hasAssist: !!getGoalAssistPlayerName(g)
    })),
    sampleGoalWithAssist: goals.find(g => getGoalAssistPlayerName(g)) ? {
      id: goals.find(g => getGoalAssistPlayerName(g)).id,
      player: getGoalPlayerName(goals.find(g => getGoalAssistPlayerName(g))),
      assist: getGoalAssistPlayerName(goals.find(g => getGoalAssistPlayerName(g))),
      time: goals.find(g => getGoalAssistPlayerName(g)).time,
      rawStructure: {
        assistPlayerName: goals.find(g => getGoalAssistPlayerName(g)).assistPlayerName,
        assist_player_name: goals.find(g => getGoalAssistPlayerName(g)).assist_player_name,
        assistTeamId: goals.find(g => getGoalAssistPlayerName(g)).assistTeamId
      }
    } : 'No goals with assists found',
    assistCorrelationResults: {
      originalGoalsWithAssists: timelineEvents.filter((e: any) => e.type === 'goal' && e.assistPlayerName).length,
      enhancedGoalsWithAssists: goals.filter(g => g.assistPlayerName).length,
      extractorGoalsWithAssists: goals.filter(g => getGoalAssistPlayerName(g)).length
    }
  });

  return { goals, cards, timelineEvents };
};

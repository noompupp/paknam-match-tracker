
import { compareTeamIds } from './teamMatching';
import { getGoalTeamId, getGoalPlayerName } from './dataExtractors';

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
      extractedPlayerName: getGoalPlayerName(g)
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

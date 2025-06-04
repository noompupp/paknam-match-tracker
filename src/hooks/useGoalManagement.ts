
import { useState } from "react";
import { assignGoalToPlayer } from "@/services/fixtures/goalAssignmentService";
import { resolveTeamIdForMatchEvent } from "@/utils/teamIdMapping";

interface GoalData {
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  type: 'goal' | 'assist';
}

export const useGoalManagement = () => {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState("");
  const [selectedGoalType, setSelectedGoalType] = useState<'goal' | 'assist'>('goal');

  const assignGoal = async (
    player: any, 
    matchTime: number, 
    fixtureId: number, 
    homeTeam: { id: number; name: string }, 
    awayTeam: { id: number; name: string }
  ) => {
    if (!player) {
      throw new Error('Player is required for goal assignment');
    }

    console.log('⚽ useGoalManagement: Starting goal assignment:', {
      player: player.name,
      team: player.team,
      type: selectedGoalType,
      time: matchTime,
      fixtureId,
      homeTeam: homeTeam?.name,
      awayTeam: awayTeam?.name
    });

    const newGoal: GoalData = {
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      time: matchTime,
      type: selectedGoalType
    };

    // Always add to local state first
    setGoals(prev => [...prev, newGoal]);
    setSelectedGoalPlayer("");

    // If we have all required data, also save to database
    if (fixtureId && homeTeam && awayTeam) {
      try {
        console.log('💾 useGoalManagement: Resolving team ID for database save...');
        
        // Resolve the numeric team ID for the match events table
        const teamId = resolveTeamIdForMatchEvent(player.team, homeTeam, awayTeam);
        
        console.log('✅ useGoalManagement: Team ID resolved:', {
          playerTeam: player.team,
          resolvedTeamId: teamId,
          homeTeam: homeTeam.name,
          awayTeam: awayTeam.name
        });

        await assignGoalToPlayer({
          fixtureId,
          playerId: player.id,
          playerName: player.name,
          teamId,
          eventTime: matchTime,
          type: selectedGoalType
        });
        
        console.log('✅ useGoalManagement: Goal successfully assigned to database');
      } catch (error) {
        console.error('❌ useGoalManagement: Failed to assign goal to database:', error);
        
        // Remove from local state if database save failed
        setGoals(prev => prev.filter(g => 
          !(g.playerId === player.id && g.time === matchTime && g.type === selectedGoalType)
        ));
        
        // Re-throw the error so the calling component can handle it
        throw error;
      }
    } else {
      console.warn('⚠️ useGoalManagement: Missing required data for database save:', {
        hasFixtureId: !!fixtureId,
        hasHomeTeam: !!homeTeam,
        hasAwayTeam: !!awayTeam
      });
    }

    return newGoal;
  };

  const resetGoals = () => {
    setGoals([]);
    setSelectedGoalPlayer("");
    setSelectedGoalType('goal');
  };

  return {
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    assignGoal,
    resetGoals
  };
};

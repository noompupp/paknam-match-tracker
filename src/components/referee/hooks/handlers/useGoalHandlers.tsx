
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { unifiedGoalService } from "@/services/unifiedGoalService";
import { resolveTeamIdForMatchEvent } from "@/utils/teamIdMapping";
import { useDataRefresh } from "@/hooks/useDataRefresh";

interface UseGoalHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  selectedGoalType: 'goal' | 'assist';
  addGoal: (team: 'home' | 'away') => void;
  removeGoal: (team: 'home' | 'away') => void;
  addEvent: (type: string, description: string, time: number) => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
}

export const useGoalHandlers = (props: UseGoalHandlersProps) => {
  const { toast } = useToast();
  const { refreshPlayerStats, refreshFixtures } = useDataRefresh();

  const handleAddGoal = (team: 'home' | 'away') => {
    props.addGoal(team);
    const goalText = team === 'home' 
      ? `Goal for ${props.selectedFixtureData?.home_team?.name}`
      : `Goal for ${props.selectedFixtureData?.away_team?.name}`;
    props.addEvent('Goal', goalText, props.matchTime);
  };

  const handleRemoveGoal = (team: 'home' | 'away') => {
    props.removeGoal(team);
    const goalText = team === 'home' 
      ? `Goal removed for ${props.selectedFixtureData?.home_team?.name}`
      : `Goal removed for ${props.selectedFixtureData?.away_team?.name}`;
    props.addEvent('Goal Removed', goalText, props.matchTime);
  };

  const handleAssignGoal = async (player: ComponentPlayer) => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected. Please select a match first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('⚽ useGoalHandlers: Starting improved goal assignment with auto-score update:', {
        player: player.name,
        team: player.team,
        type: props.selectedGoalType,
        fixture: props.selectedFixtureData.id
      });

      // Prepare proper team data for assignment
      const homeTeam = {
        id: props.selectedFixtureData.home_team_id,
        name: props.selectedFixtureData.home_team?.name
      };
      
      const awayTeam = {
        id: props.selectedFixtureData.away_team_id,
        name: props.selectedFixtureData.away_team?.name
      };

      // Validate team data
      if (!homeTeam.id || !homeTeam.name || !awayTeam.id || !awayTeam.name) {
        throw new Error('Invalid fixture team data');
      }

      // Resolve team ID for the player
      const teamId = resolveTeamIdForMatchEvent(player.team, homeTeam, awayTeam);

      // Use the improved unified goal service
      const result = await unifiedGoalService.assignGoalWithScoreUpdate({
        fixtureId: props.selectedFixtureData.id,
        playerId: player.id,
        playerName: player.name,
        teamId,
        teamName: player.team,
        goalType: props.selectedGoalType,
        eventTime: props.matchTime,
        homeTeam,
        awayTeam
      });
      
      if (result.success) {
        props.addEvent('Goal Assignment', `${props.selectedGoalType} assigned to ${player.name}`, props.matchTime);
        
        // If this is a goal assignment and auto-score was updated, update local UI
        if (props.selectedGoalType === 'goal' && result.autoScoreUpdated) {
          const teamName = player.team;
          if (teamName === homeTeam.name) {
            props.addGoal('home');
          } else if (teamName === awayTeam.name) {
            props.addGoal('away');
          }
          
          toast({
            title: "Goal Assigned & Score Updated!",
            description: `Goal assigned to ${player.name} and score automatically updated.`,
          });
        } else {
          toast({
            title: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
            description: `${props.selectedGoalType} assigned to ${player.name} and saved to database.`,
          });
        }

        // Refresh dashboard data after successful assignment
        refreshPlayerStats();
        refreshFixtures();
        
        console.log('✅ useGoalHandlers: Goal assignment completed successfully with auto-score update');
      } else if (result.duplicatePrevented) {
        toast({
          title: "Duplicate Prevented",
          description: result.message || "This goal/assist has already been assigned",
          variant: "destructive"
        });
      } else {
        throw new Error(result.message || 'Failed to assign goal');
      }
    } catch (error) {
      console.error('❌ useGoalHandlers: Failed to assign goal:', error);
      
      let errorMessage = 'Failed to assign goal';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    handleAddGoal,
    handleRemoveGoal,
    handleAssignGoal
  };
};

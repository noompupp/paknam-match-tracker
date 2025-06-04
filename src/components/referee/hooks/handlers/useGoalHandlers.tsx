
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { assignGoalToPlayer } from "@/services/fixtures/simplifiedGoalAssignmentService";

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

  const handleAddGoal = (team: 'home' | 'away') => {
    props.addGoal(team);
    props.addEvent('Goal', `${team === 'home' ? 'Home' : 'Away'} team goal`, props.matchTime);
    
    toast({
      title: "Goal Added",
      description: `${team === 'home' ? 'Home' : 'Away'} team goal added`,
    });
  };

  const handleRemoveGoal = (team: 'home' | 'away') => {
    props.removeGoal(team);
    props.addEvent('Goal Removed', `${team === 'home' ? 'Home' : 'Away'} team goal removed`, props.matchTime);
    
    toast({
      title: "Goal Removed",
      description: `${team === 'home' ? 'Home' : 'Away'} team goal removed`,
    });
  };

  const handleAssignGoal = async (player: ComponentPlayer) => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('⚽ useGoalHandlers: Assigning goal with simplified service:', {
        player: player.name,
        team: player.team,
        type: props.selectedGoalType,
        fixture: props.selectedFixtureData.id
      });

      // Determine team ID using the player's teamId or derive from fixture
      let teamId: string;
      if (player.teamId) {
        teamId = player.teamId;
      } else if (player.team === props.selectedFixtureData.home_team?.name) {
        teamId = props.selectedFixtureData.home_team.__id__ || props.selectedFixtureData.home_team_id;
      } else if (player.team === props.selectedFixtureData.away_team?.name) {
        teamId = props.selectedFixtureData.away_team.__id__ || props.selectedFixtureData.away_team_id;
      } else {
        throw new Error(`Cannot determine team ID for player ${player.name} on team ${player.team}`);
      }

      const result = await assignGoalToPlayer({
        fixtureId: props.selectedFixtureData.id,
        playerId: player.id,
        playerName: player.name,
        teamId,
        eventTime: props.matchTime,
        type: props.selectedGoalType
      });

      if (result) {
        props.addEvent(
          props.selectedGoalType,
          `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} (${player.team})`,
          props.matchTime
        );

        toast({
          title: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
          description: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} and stats updated`,
        });
      }
    } catch (error) {
      console.error('❌ useGoalHandlers: Error assigning goal:', error);
      
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : 'Failed to assign goal/assist',
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


import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { assignGoalToPlayer } from "@/services/fixtures/simplifiedGoalAssignmentService";
import { resolveTeamIdForMatchEvent, normalizeTeamIdForDatabase } from "@/utils/teamIdMapping";

interface UseGoalHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  selectedGoalType: 'goal' | 'assist';
  addGoal: (team: 'home' | 'away', additionalParam?: any) => void;
  removeGoal: (team: 'home' | 'away', additionalParam?: any) => void;
  addEvent: (type: string, description: string, time: number) => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  updateFixtureScore: any;
}

export const useGoalHandlers = (props: UseGoalHandlersProps) => {
  const { toast } = useToast();

  const handleAddGoal = (team: 'home' | 'away', additionalParam?: any) => {
    console.log('⚽ useGoalHandlers: Adding goal for team:', team);
    props.addGoal(team, additionalParam);
    props.addEvent('Goal', `${team === 'home' ? 'Home' : 'Away'} team goal`, props.matchTime);
    
    toast({
      title: "Goal Added",
      description: `${team === 'home' ? 'Home' : 'Away'} team goal added`,
    });
  };

  const handleRemoveGoal = (team: 'home' | 'away', additionalParam?: any) => {
    console.log('🗑️ useGoalHandlers: Removing goal for team:', team);
    props.removeGoal(team, additionalParam);
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
      console.log('⚽ useGoalHandlers: Assigning goal with enhanced score sync:', {
        player: player.name,
        team: player.team,
        type: props.selectedGoalType,
        fixture: props.selectedFixtureData.id
      });

      // Validate team data
      if (!props.selectedFixtureData.home_team || !props.selectedFixtureData.away_team) {
        throw new Error('Missing team data in fixture');
      }

      // Use the team ID resolution utility
      const teamId = resolveTeamIdForMatchEvent(
        player.team,
        {
          id: props.selectedFixtureData.home_team_id || props.selectedFixtureData.home_team?.id?.toString(),
          name: props.selectedFixtureData.home_team?.name,
          __id__: props.selectedFixtureData.home_team?.__id__ || props.selectedFixtureData.home_team_id
        },
        {
          id: props.selectedFixtureData.away_team_id || props.selectedFixtureData.away_team?.id?.toString(),
          name: props.selectedFixtureData.away_team?.name,
          __id__: props.selectedFixtureData.away_team?.__id__ || props.selectedFixtureData.away_team_id
        }
      );

      const normalizedTeamId = normalizeTeamIdForDatabase(teamId);

      console.log('🔍 useGoalHandlers: Team ID resolution result:', {
        playerTeam: player.team,
        resolvedTeamId: teamId,
        normalizedTeamId,
        homeTeam: props.selectedFixtureData.home_team?.name,
        awayTeam: props.selectedFixtureData.away_team?.name
      });

      const result = await assignGoalToPlayer({
        fixtureId: props.selectedFixtureData.id,
        playerId: player.id,
        playerName: player.name,
        teamId: normalizedTeamId,
        eventTime: props.matchTime,
        type: props.selectedGoalType
      });

      if (result) {
        // Update local score if it's a goal (not assist)
        if (props.selectedGoalType === 'goal') {
          const isHomeTeam = player.team === props.selectedFixtureData.home_team?.name;
          const team = isHomeTeam ? 'home' : 'away';
          
          console.log('📊 useGoalHandlers: Automatically updating score for goal:', {
            team,
            player: player.name,
            isHomeTeam
          });
          
          props.addGoal(team);
        }

        props.addEvent(
          props.selectedGoalType,
          `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} (${player.team})`,
          props.matchTime
        );

        toast({
          title: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
          description: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} and ${props.selectedGoalType === 'goal' ? 'score updated' : 'stats updated'}`,
        });

        console.log('✅ useGoalHandlers: Goal assignment completed with score sync');
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

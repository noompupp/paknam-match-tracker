
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { assignGoalToPlayer } from "@/services/fixtures/simplifiedGoalAssignmentService";
import { getValidatedTeamId, normalizeTeamIdForDatabase, validateTeamData } from "@/utils/teamIdMapping";

interface UseGoalHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  selectedGoalType: 'goal' | 'assist';
  addGoal: (team: 'home' | 'away', additionalParam?: any) => void;
  removeGoal: (team: 'home' | 'away', additionalParam?: any) => void;
  addEvent: (type: string, description: string, time: number) => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  updateFixtureScore: any;
  forceRefresh?: () => Promise<void>;
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
      console.log('⚽ useGoalHandlers: Assigning goal with enhanced team ID resolution:', {
        player: player.name,
        team: player.team,
        type: props.selectedGoalType,
        fixture: props.selectedFixtureData.id
      });

      // Enhanced team data structure with proper __id__ prioritization
      const homeTeam = {
        id: props.selectedFixtureData.home_team_id || props.selectedFixtureData.home_team?.id?.toString(),
        name: props.selectedFixtureData.home_team?.name,
        __id__: props.selectedFixtureData.home_team?.__id__ || props.selectedFixtureData.home_team_id
      };

      const awayTeam = {
        id: props.selectedFixtureData.away_team_id || props.selectedFixtureData.away_team?.id?.toString(),
        name: props.selectedFixtureData.away_team?.name,
        __id__: props.selectedFixtureData.away_team?.__id__ || props.selectedFixtureData.away_team_id
      };

      // Validate team data
      if (!validateTeamData(homeTeam, awayTeam)) {
        throw new Error('Invalid team data in fixture - missing required team information');
      }

      // Enhanced team ID resolution with database validation
      let teamId: string;
      try {
        teamId = await getValidatedTeamId(player.team, homeTeam, awayTeam);
      } catch (resolutionError) {
        console.error('❌ useGoalHandlers: Team ID resolution failed:', resolutionError);
        
        // Provide fallback logic
        const isHomeTeam = player.team === homeTeam.name;
        teamId = isHomeTeam ? (homeTeam.__id__ || homeTeam.id) : (awayTeam.__id__ || awayTeam.id);
        
        console.log('🔧 useGoalHandlers: Using fallback team ID:', teamId);
        
        toast({
          title: "Warning",
          description: `Team matching was approximate. Please verify the goal assignment.`,
          variant: "default"
        });
      }

      const normalizedTeamId = normalizeTeamIdForDatabase(teamId);

      console.log('🔍 useGoalHandlers: Enhanced team ID resolution result:', {
        playerTeam: player.team,
        resolvedTeamId: teamId,
        normalizedTeamId,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name
      });

      // Show loading state
      toast({
        title: "Processing...",
        description: `Adding ${props.selectedGoalType} for ${player.name}`,
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
          const isHomeTeam = player.team === homeTeam.name;
          const team = isHomeTeam ? 'home' : 'away';
          
          console.log('📊 useGoalHandlers: Automatically updating score for goal:', {
            team,
            player: player.name,
            isHomeTeam
          });
          
          props.addGoal(team);
          
          // Trigger immediate score refresh to sync with database
          if (props.forceRefresh) {
            console.log('🔄 useGoalHandlers: Triggering immediate score refresh after goal assignment');
            setTimeout(() => {
              props.forceRefresh?.();
            }, 100); // Small delay to ensure database write completes
          }
        }

        props.addEvent(
          props.selectedGoalType,
          `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} (${player.team})`,
          props.matchTime
        );

        toast({
          title: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
          description: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} and ${props.selectedGoalType === 'goal' ? 'score updated with real-time sync' : 'stats updated'}`,
        });

        console.log('✅ useGoalHandlers: Goal assignment completed with immediate score sync');
      }
    } catch (error) {
      console.error('❌ useGoalHandlers: Error assigning goal:', error);
      
      // Enhanced error messaging
      let errorMessage = 'Failed to assign goal/assist';
      if (error instanceof Error) {
        if (error.message.includes('not found in database')) {
          errorMessage = 'Team data mismatch - please verify fixture team information';
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'This goal/assist has already been assigned';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Database constraint error - team data may be inconsistent';
        } else {
          errorMessage = error.message;
        }
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

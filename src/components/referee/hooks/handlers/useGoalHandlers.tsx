
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { unifiedGoalService } from "@/services/unifiedGoalService";
import { getValidatedTeamId, normalizeTeamIdForDatabase, validateTeamData } from "@/utils/teamIdMapping";

interface UseGoalHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  selectedGoalType: 'goal' | 'assist';
  addGoal: (team: 'home' | 'away', additionalParam?: any) => void;
  removeGoal: (team: 'home' | 'away', additionalParam?: any) => void;
  addEvent: (type: string, description: string, time: number) => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any, isOwnGoal?: boolean) => any;
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

  const handleAssignGoal = async (player: ComponentPlayer, isOwnGoal: boolean = false) => {
    console.log('🎯 useGoalHandlers: Starting goal assignment with enhanced own goal support:', {
      player: player.name,
      team: player.team,
      type: props.selectedGoalType,
      fixture: props.selectedFixtureData?.id,
      isOwnGoal,
      timestamp: new Date().toISOString()
    });

    if (!props.selectedFixtureData) {
      const errorMsg = 'No fixture selected';
      console.error('❌ useGoalHandlers:', errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    try {
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

      console.log('🔍 useGoalHandlers: Team data prepared for goal assignment:', {
        homeTeam,
        awayTeam,
        playerTeam: player.team,
        isOwnGoal
      });

      // Validate team data
      if (!validateTeamData(homeTeam, awayTeam)) {
        throw new Error('Invalid team data in fixture - missing required team information');
      }

      // Enhanced team ID resolution with database validation
      let teamId: string;
      try {
        teamId = await getValidatedTeamId(player.team, homeTeam, awayTeam);
        console.log('✅ useGoalHandlers: Team ID resolved successfully:', teamId);
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
        awayTeam: awayTeam.name,
        isOwnGoal
      });

      // Show loading state
      toast({
        title: "Processing...",
        description: `Adding ${isOwnGoal ? 'own goal' : props.selectedGoalType} for ${player.name}`,
      });

      // Use unified goal service with proper isOwnGoal parameter
      console.log('🚀 useGoalHandlers: Calling unified goal service with own goal support:', {
        fixtureId: props.selectedFixtureData.id,
        playerId: player.id,
        playerName: player.name,
        teamId: normalizedTeamId,
        teamName: player.team,
        goalType: props.selectedGoalType,
        eventTime: props.matchTime,
        homeTeam,
        awayTeam,
        isOwnGoal
      });

      const result = await unifiedGoalService.addGoal({
        fixtureId: props.selectedFixtureData.id,
        playerId: player.id,
        playerName: player.name,
        teamId: normalizedTeamId,
        teamName: player.team,
        goalType: props.selectedGoalType,
        eventTime: props.matchTime,
        homeTeam,
        awayTeam,
        isOwnGoal // Critical: Include the isOwnGoal parameter
      });

      console.log('📊 useGoalHandlers: Unified goal service result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Goal assignment failed');
      }

      // Update local score if it's a goal (not assist)
      if (props.selectedGoalType === 'goal') {
        const isHomeTeam = player.team === homeTeam.name;
        let scoringTeam: 'home' | 'away';
        
        if (isOwnGoal) {
          // Own goal benefits the opposing team
          scoringTeam = isHomeTeam ? 'away' : 'home';
        } else {
          // Regular goal benefits the player's team
          scoringTeam = isHomeTeam ? 'home' : 'away';
        }
        
        console.log('📊 useGoalHandlers: Updating local score with own goal logic:', {
          scoringTeam,
          player: player.name,
          isHomeTeam,
          isOwnGoal
        });
        
        props.addGoal(scoringTeam);
        
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
        `${isOwnGoal ? 'Own goal' : (props.selectedGoalType === 'goal' ? 'Goal' : 'Assist')} assigned to ${player.name} (${player.team})`,
        props.matchTime
      );

      toast({
        title: `${props.selectedGoalType === 'goal' ? (isOwnGoal ? 'Own Goal' : 'Goal') : 'Assist'} Assigned!`,
        description: `${props.selectedGoalType === 'goal' ? (isOwnGoal ? 'Own goal' : 'Goal') : 'Assist'} assigned to ${player.name} and ${props.selectedGoalType === 'goal' ? 'score updated with real-time sync' : 'stats updated'}`,
      });

      console.log('✅ useGoalHandlers: Goal assignment completed with immediate score sync and own goal support');
      return result;

    } catch (error) {
      console.error('❌ useGoalHandlers: Error assigning goal:', error);
      
      // Enhanced error messaging with better visibility
      let errorMessage = 'Failed to assign goal/assist';
      if (error instanceof Error) {
        if (error.message.includes('not found in database')) {
          errorMessage = 'Team data mismatch - please verify fixture team information';
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'This goal/assist has already been assigned';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Database constraint error - team data may be inconsistent';
        } else if (error.message.includes('uuid')) {
          errorMessage = 'Team ID format error - please contact support';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show detailed error toast
      toast({
        title: "Goal Assignment Failed",
        description: errorMessage,
        variant: "destructive"
      });

      // Also add to event log for debugging
      props.addEvent('error', `Goal assignment failed: ${errorMessage}`, props.matchTime);

      throw error;
    }
  };

  return {
    handleAddGoal,
    handleRemoveGoal,
    handleAssignGoal
  };
};

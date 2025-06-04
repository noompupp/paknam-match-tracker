import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer, PlayerTimeTrackerPlayer } from "./useRefereeState";
import { playerTimeTrackingService } from "@/services/fixtures/playerTimeTrackingService";
import { matchResetService, enhancedDuplicatePreventionService, unifiedRefereeService } from "@/services/fixtures";

interface UseRefereeHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  allPlayers: ComponentPlayer[];
  playersForTimeTracker: PlayerTimeTrackerPlayer[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedTimePlayer: string;
  saveAttempts: number;
  setSaveAttempts: (value: number | ((prev: number) => number)) => void;
  updateFixtureScore: any;
  createMatchEvent: any;
  updatePlayerStats: any;
  goals: any[];
  addGoal: (team: 'home' | 'away') => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  resetScore: () => void;
  resetEvents: () => void;
  resetCards: () => void;
  resetTracking: () => void;
  resetGoals: () => void;
  addEvent: (type: string, description: string, time: number) => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  addCard: (player: ComponentPlayer, team: string, matchTime: number, cardType: 'yellow' | 'red') => any;
  addPlayer: (player: ComponentPlayer, matchTime: number) => any;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number, matchTime: number) => any;
  checkForSecondYellow: (playerName: string) => boolean;
  removeGoal: (team: 'home' | 'away') => void;
}

export const useRefereeHandlers = (props: UseRefereeHandlersProps) => {
  const { toast } = useToast();

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

  const handleToggleTimer = () => {
    props.toggleTimer();
    const action = props.isRunning ? 'paused' : 'started';
    props.addEvent('Timer', `Match timer ${action} at ${props.formatTime(props.matchTime)}`, props.matchTime);
  };

  const handleResetMatch = () => {
    props.resetTimer();
    props.resetScore();
    props.resetEvents();
    props.resetCards();
    props.resetTracking();
    props.resetGoals();
    props.addEvent('Reset', 'Match reset', 0);
  };

  const handleSaveMatch = async () => {
    if (!props.selectedFixtureData) return;
    
    props.setSaveAttempts(prev => prev + 1);
    
    try {
      console.log('💾 useRefereeHandlers: Starting unified match save...');
      
      // Prepare match data for unified save
      const matchData = {
        fixtureId: props.selectedFixtureData.id,
        homeScore: props.homeScore,
        awayScore: props.awayScore,
        goals: props.goals.map(goal => ({
          playerId: goal.playerId,
          playerName: goal.playerName,
          team: goal.team,
          type: goal.type as 'goal' | 'assist',
          time: goal.time
        })),
        cards: [], // Cards are handled separately in the current implementation
        playerTimes: props.playersForTimeTracker.map(player => ({
          playerId: player.id,
          playerName: player.name,
          team: player.team,
          totalTime: Math.floor(player.totalTime / 60), // Convert to minutes
          periods: [{
            start_time: player.startTime || 0,
            end_time: props.matchTime,
            duration: Math.floor(player.totalTime / 60)
          }]
        })),
        homeTeam: {
          id: props.selectedFixtureData.home_team_id,
          name: props.selectedFixtureData.home_team?.name
        },
        awayTeam: {
          id: props.selectedFixtureData.away_team_id,
          name: props.selectedFixtureData.away_team?.name
        }
      };

      const result = await unifiedRefereeService.saveCompleteMatchData(matchData);
      
      if (result.success) {
        props.addEvent('Save', `Match saved successfully: ${result.message}`, props.matchTime);
        toast({
          title: "Match Saved Successfully!",
          description: result.message,
        });
      } else {
        toast({
          title: "Save Completed with Issues",
          description: `${result.message}\n\nErrors: ${result.errors.join(', ')}`,
          variant: "destructive"
        });
      }
      
      console.log('✅ useRefereeHandlers: Unified match save completed');
    } catch (error) {
      console.error('❌ useRefereeHandlers: Failed to save match:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save match. Please try again.",
        variant: "destructive"
      });
    }
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
      console.log('⚽ useRefereeHandlers: Starting improved goal assignment with auto-score update:', {
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

      const goalResult = await props.assignGoal(
        player, 
        props.matchTime, 
        props.selectedFixtureData.id, 
        homeTeam,
        awayTeam
      );
      
      if (goalResult) {
        props.addEvent('Goal Assignment', `${props.selectedGoalType} assigned to ${player.name}`, props.matchTime);
        
        // If this is a goal assignment, automatically update the local score
        if (props.selectedGoalType === 'goal' && goalResult.autoScoreUpdated) {
          const teamName = player.team;
          if (teamName === homeTeam.name) {
            props.addGoal('home');
          } else if (teamName === awayTeam.name) {
            props.addGoal('away');
          }
          
          toast({
            title: "Goal Assigned & Score Updated!",
            description: `Goal assigned to ${player.name} and score automatically updated in the UI.`,
          });
        } else {
          toast({
            title: `${props.selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
            description: `${props.selectedGoalType} assigned to ${player.name} and saved to database.`,
          });
        }
        
        console.log('✅ useRefereeHandlers: Goal assignment completed successfully with auto-score update');
      }
    } catch (error) {
      console.error('❌ useRefereeHandlers: Failed to assign goal:', error);
      
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

  const handleAddCard = async (playerName: string, team: string, cardType: "yellow" | "red", time: number) => {
    const player = props.allPlayers.find(p => p.name === playerName);
    if (!player) {
      toast({
        title: "Error",
        description: "Player not found",
        variant: "destructive"
      });
      return;
    }

    try {
      const cardResult = await props.addCard(player, team, props.matchTime, cardType);
      props.addEvent('Card', `${cardType} card for ${playerName} (${team})`, props.matchTime);
      
      if (cardResult && cardResult.isSecondYellow) {
        props.addEvent('Red Card', `Second yellow card - automatic red for ${playerName}`, props.matchTime);
        toast({
          title: "Second Yellow Card",
          description: `${playerName} receives automatic red card for second yellow`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Card Issued",
          description: `${cardType} card given to ${playerName} and saved to database`,
        });
      }
    } catch (error) {
      console.error('❌ useRefereeHandlers: Failed to add card:', error);
      
      let errorMessage = 'Failed to add card';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Card Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleAddPlayer = (player: ComponentPlayer) => {
    props.addPlayer(player, props.matchTime);
    props.addEvent('Player Added', `${player.name} started tracking`, props.matchTime);
  };

  const handleRemovePlayer = async (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (player && props.selectedFixtureData) {
      // Save player time data to database before removing
      try {
        const teamId = player.team === props.selectedFixtureData.home_team?.name 
          ? props.selectedFixtureData.home_team_id 
          : props.selectedFixtureData.away_team_id;

        await playerTimeTrackingService.savePlayerTime({
          fixture_id: props.selectedFixtureData.id,
          player_id: playerId,
          player_name: player.name,
          team_id: teamId,
          total_minutes: player.totalTime,
          periods: [{
            start_time: player.startTime || 0,
            end_time: props.matchTime,
            duration: player.totalTime
          }]
        });

        console.log('✅ Player time data saved to database');
        toast({
          title: "Player Time Saved",
          description: `${player.name}'s playing time has been saved to the database`,
        });
      } catch (error) {
        console.error('❌ Failed to save player time data:', error);
        toast({
          title: "Warning",
          description: `Failed to save ${player.name}'s time data to database`,
          variant: "destructive"
        });
      }

      props.removePlayer(playerId);
      props.addEvent('Player Removed', `${player.name} stopped tracking`, props.matchTime);
    }
  };

  const handleTogglePlayerTime = (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (player) {
      const result = props.togglePlayerTime(playerId, props.matchTime);
      const action = result ? 'started' : 'stopped';
      props.addEvent('Player Time', `${player.name} ${action} playing`, props.matchTime);
    }
  };

  const handleExportSummary = () => {
    // Enhanced export functionality with time in minutes
    const summaryData = {
      fixture: props.selectedFixtureData,
      score: `${props.homeScore}-${props.awayScore}`,
      duration: `${Math.floor(props.matchTime / 60)} minutes`,
      match_info: {
        home_team: props.selectedFixtureData?.home_team?.name,
        away_team: props.selectedFixtureData?.away_team?.name,
        home_score: props.homeScore,
        away_score: props.awayScore,
        match_date: props.selectedFixtureData?.match_date,
        venue: props.selectedFixtureData?.venue
      },
      events: props.goals,
      goals_and_assists: props.goals.map(goal => ({
        player: goal.playerName,
        team: goal.team,
        type: goal.type,
        time: `${Math.floor(goal.time / 60)} min`
      })),
      player_times: props.playersForTimeTracker.map(player => ({
        name: player.name,
        team: player.team,
        total_time: `${Math.floor(player.totalTime / 60)} minutes`,
        is_playing: player.isPlaying
      })),
      statistics: {
        total_events: props.goals.length,
        total_goals: props.goals.filter(g => g.type === 'goal').length,
        total_assists: props.goals.filter(g => g.type === 'assist').length,
        players_tracked: props.playersForTimeTracker.length,
        match_duration: `${Math.floor(props.matchTime / 60)} minutes`
      },
      export_timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `enhanced-match-summary-${props.selectedFixtureData?.home_team?.name}-vs-${props.selectedFixtureData?.away_team?.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Enhanced Match Summary Exported",
      description: "Complete match data with statistics has been downloaded as JSON file.",
    });
  };

  const handleSaveAllPlayerTimes = async () => {
    if (!props.selectedFixtureData || props.playersForTimeTracker.length === 0) return;

    try {
      const savePromises = props.playersForTimeTracker.map(async (player) => {
        const teamId = player.team === props.selectedFixtureData.home_team?.name 
          ? props.selectedFixtureData.home_team_id 
          : props.selectedFixtureData.away_team_id;

        return playerTimeTrackingService.savePlayerTime({
          fixture_id: props.selectedFixtureData.id,
          player_id: player.id,
          player_name: player.name,
          team_id: teamId,
          total_minutes: Math.floor(player.totalTime / 60), // Convert to minutes
          periods: [{
            start_time: player.startTime || 0,
            end_time: props.matchTime,
            duration: Math.floor(player.totalTime / 60)
          }]
        });
      });

      await Promise.all(savePromises);
      
      toast({
        title: "Player Times Saved",
        description: `All ${props.playersForTimeTracker.length} player time records saved to database`,
      });
    } catch (error) {
      console.error('❌ Failed to save player time data:', error);
      toast({
        title: "Save Failed",
        description: "Some player time data could not be saved",
        variant: "destructive"
      });
    }
  };

  const handleResetMatchData = async () => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected for reset",
        variant: "destructive"
      });
      return;
    }

    const safetyCheck = await matchResetService.confirmResetSafety(props.selectedFixtureData.id);
    
    if (!safetyCheck.canReset) {
      toast({
        title: "Reset Not Safe",
        description: "Cannot safely reset this match data",
        variant: "destructive"
      });
      return;
    }

    const confirmReset = window.confirm(
      `Are you sure you want to reset all match data for this fixture?\n\n` +
      `This will delete:\n` +
      `- ${safetyCheck.info.eventsToDelete} match events\n` +
      `- ${safetyCheck.info.cardsToDelete} cards\n` +
      `- ${safetyCheck.info.playerTimesToDelete} player time records\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmReset) {
      return;
    }

    try {
      console.log('🔄 useRefereeHandlers: Starting match data reset...');
      
      const resetResult = await matchResetService.resetMatchData(props.selectedFixtureData.id);
      
      if (resetResult.success) {
        props.resetTimer();
        props.resetScore();
        props.resetEvents();
        props.resetCards();
        props.resetTracking();
        props.resetGoals();
        
        toast({
          title: "Match Data Reset",
          description: resetResult.message,
        });
        
        console.log('✅ useRefereeHandlers: Match data reset completed successfully');
      } else {
        toast({
          title: "Reset Partial Success",
          description: `${resetResult.message}\n\nErrors: ${resetResult.errors.join(', ')}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ useRefereeHandlers: Failed to reset match data:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset match data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected for cleanup",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🧹 useRefereeHandlers: Starting duplicate cleanup...');
      
      const cleanupResult = await enhancedDuplicatePreventionService.cleanupAllDuplicateEvents();
      
      if (cleanupResult.errors.length === 0) {
        toast({
          title: "Duplicates Cleaned",
          description: `Successfully removed ${cleanupResult.removedCount} duplicate events`,
        });
      } else {
        toast({
          title: "Cleanup Partial Success",
          description: `Removed ${cleanupResult.removedCount} duplicates with ${cleanupResult.errors.length} errors`,
          variant: "destructive"
        });
      }
      
      console.log('✅ useRefereeHandlers: Duplicate cleanup completed');
    } catch (error) {
      console.error('❌ useRefereeHandlers: Failed to cleanup duplicates:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup duplicates. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddGoal,
    handleRemoveGoal,
    handleToggleTimer,
    handleResetMatch,
    handleSaveMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    handleExportSummary,
    handleSaveAllPlayerTimes,
    handleResetMatchData,
    handleCleanupDuplicates
  };
};

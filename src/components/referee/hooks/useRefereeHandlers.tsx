
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer, PlayerTimeTrackerPlayer } from "./useRefereeState";
import { playerTimeTrackingService } from "@/services/fixtures/playerTimeTrackingService";

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
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, teamId: number) => any;
  addCard: (player: ComponentPlayer, team: string, matchTime: number, cardType: 'yellow' | 'red') => any;
  addPlayer: (player: ComponentPlayer, matchTime: number) => any;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number, matchTime: number) => any;
  checkForSecondYellow: (playerName: string, teamName: string) => boolean;
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
      await props.updateFixtureScore.mutateAsync({
        id: props.selectedFixtureData.id,
        homeScore: props.homeScore,
        awayScore: props.awayScore
      });
      
      props.addEvent('Save', `Match saved with score ${props.homeScore}-${props.awayScore}`, props.matchTime);
      toast({
        title: "Match Saved",
        description: `Score updated: ${props.homeScore}-${props.awayScore}`,
      });
    } catch (error) {
      console.error('Failed to save match:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save match. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAssignGoal = async (player: ComponentPlayer) => {
    if (!props.selectedFixtureData) return;
    
    try {
      const newGoal = await props.assignGoal(
        player, 
        props.matchTime, 
        props.selectedFixtureData.id, 
        player.team === props.selectedFixtureData.home_team?.name ? props.selectedFixtureData.home_team_id : props.selectedFixtureData.away_team_id
      );
      if (newGoal) {
        props.addEvent('Goal Assignment', `${props.selectedGoalType} assigned to ${player.name}`, props.matchTime);
        toast({
          title: "Goal Assigned",
          description: `${props.selectedGoalType} assigned to ${player.name}`,
        });
      }
    } catch (error) {
      console.error('Failed to assign goal:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddCard = (playerName: string, team: string, cardType: "yellow" | "red", time: number) => {
    const player = props.allPlayers.find(p => p.name === playerName);
    if (!player) return;

    const cardResult = props.addCard(player, team, props.matchTime, cardType);
    props.addEvent('Card', `${cardType} card for ${playerName} (${team})`, props.matchTime);
    
    if (cardResult && cardResult.isSecondYellow) {
      props.addEvent('Red Card', `Second yellow card - automatic red for ${playerName}`, props.matchTime);
      toast({
        title: "Second Yellow Card",
        description: `${playerName} receives automatic red card for second yellow`,
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
    const summaryData = {
      fixture: props.selectedFixtureData,
      score: `${props.homeScore}-${props.awayScore}`,
      duration: props.formatTime(props.matchTime),
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
        time: props.formatTime(goal.time)
      })),
      cards: [],
      player_times: props.playersForTimeTracker.map(player => ({
        name: player.name,
        team: player.team,
        total_time: props.formatTime(player.totalTime),
        is_playing: player.isPlaying
      })),
      statistics: {
        total_events: props.goals.length,
        total_goals: props.goals.filter(g => g.type === 'goal').length,
        total_assists: props.goals.filter(g => g.type === 'assist').length,
        players_tracked: props.playersForTimeTracker.length,
        match_duration: props.formatTime(props.matchTime)
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

  // Save all player time data at the end of match
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
          total_minutes: player.totalTime,
          periods: [{
            start_time: player.startTime || 0,
            end_time: props.matchTime,
            duration: player.totalTime
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
    handleSaveAllPlayerTimes
  };
};

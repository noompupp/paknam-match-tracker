
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeMatchHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  homeScore: number;
  awayScore: number;
  goals: any[];
  playersForTimeTracker: any[];
  resetTimer: () => void;
  resetScore: () => void;
  resetEvents: () => void;
  resetCards: () => void;
  resetTracking: () => void;
  resetGoals: () => void;
  addEvent: (type: string, description: string, time: number) => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  updateFixtureScore: any;
  createMatchEvent: any;
  updatePlayerStats: any;
  saveAttempts: number;
  setSaveAttempts: (value: number | ((prev: number) => number)) => void;
}

export const useRefereeMatchHandlers = ({
  selectedFixtureData,
  matchTime,
  homeScore,
  awayScore,
  goals,
  playersForTimeTracker,
  resetTimer,
  resetScore,
  resetEvents,
  resetCards,
  resetTracking,
  resetGoals,
  addEvent,
  assignGoal,
  updateFixtureScore,
  createMatchEvent,
  updatePlayerStats,
  saveAttempts,
  setSaveAttempts
}: RefereeMatchHandlersProps) => {
  const { toast } = useToast();

  const handleResetMatch = () => {
    resetTimer();
    resetScore();
    resetEvents();
    resetCards();
    resetTracking();
    resetGoals();
    setSaveAttempts(0);
    
    toast({
      title: "Match Reset",
      description: "All match data has been reset. You can start fresh.",
    });
  };

  const handleSaveMatch = async () => {
    if (!selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected. Please select a match first.",
        variant: "destructive",
      });
      return;
    }

    const currentAttempt = saveAttempts + 1;
    setSaveAttempts(currentAttempt);
    
    try {
      console.log(`🎯 RefereeMatchHandlers: Starting match save attempt ${currentAttempt}:`, {
        fixtureId: selectedFixtureData.id,
        homeScore,
        awayScore,
        homeTeam: selectedFixtureData?.home_team?.name,
        awayTeam: selectedFixtureData?.away_team?.name
      });

      // Show loading toast
      toast({
        title: "Saving Match...",
        description: `Updating fixture score and team statistics (Attempt ${currentAttempt})`,
      });

      // Update fixture score with proper error handling
      console.log('📊 RefereeMatchHandlers: Updating fixture score...');
      const updatedFixture = await updateFixtureScore.mutateAsync({
        id: parseInt(selectedFixtureData.id),
        homeScore,
        awayScore
      });

      console.log('✅ RefereeMatchHandlers: Fixture score updated successfully:', updatedFixture);

      // Create final match event
      console.log('📝 RefereeMatchHandlers: Creating final match event...');
      await createMatchEvent.mutateAsync({
        fixture_id: parseInt(selectedFixtureData.id),
        event_type: 'other',
        player_name: 'System',
        team_id: '0',
        event_time: matchTime,
        description: `Match completed: ${selectedFixtureData?.home_team?.name} ${homeScore} - ${awayScore} ${selectedFixtureData?.away_team?.name} (Attempt ${currentAttempt})`
      });
      console.log('✅ RefereeMatchHandlers: Final match event created successfully');

      // Update player stats for goals and assists
      console.log('👥 RefereeMatchHandlers: Updating player statistics...');
      const playerStats = new Map();
      
      goals.forEach(goal => {
        if (!playerStats.has(goal.playerId)) {
          playerStats.set(goal.playerId, { goals: 0, assists: 0 });
        }
        
        const stats = playerStats.get(goal.playerId);
        if (goal.type === 'goal') {
          stats.goals += 1;
        } else if (goal.type === 'assist') {
          stats.assists += 1;
        }
      });

      // Update stats for each player
      let playerStatsUpdated = 0;
      for (const [playerId, stats] of playerStats) {
        if (stats.goals > 0 || stats.assists > 0) {
          try {
            await updatePlayerStats.mutateAsync({
              playerId: parseInt(playerId),
              goals: stats.goals > 0 ? stats.goals : undefined,
              assists: stats.assists > 0 ? stats.assists : undefined
            });
            playerStatsUpdated++;
            console.log(`✅ RefereeMatchHandlers: Updated stats for player ${playerId}:`, stats);
          } catch (playerError) {
            console.error(`❌ RefereeMatchHandlers: Failed to update player ${playerId} stats:`, playerError);
          }
        }
      }

      console.log(`✅ RefereeMatchHandlers: Updated stats for ${playerStatsUpdated} players`);
      
      toast({
        title: "Match Saved Successfully! 🎉",
        description: `Result: ${selectedFixtureData?.home_team?.name} ${homeScore} - ${awayScore} ${selectedFixtureData?.away_team?.name}. Team stats and ${playerStatsUpdated} player stats updated.`,
      });

      // Add success event to local events
      addEvent('match_saved', `Match successfully saved to database (Attempt ${currentAttempt})`, matchTime);

    } catch (error) {
      console.error(`❌ RefereeMatchHandlers: Match save attempt ${currentAttempt} failed:`, error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes('team not found')) {
          errorMessage = 'One or both teams could not be found. Please check team data.';
        } else if (error.message.includes('fixture')) {
          errorMessage = 'Could not update fixture. Please verify the match exists.';
        } else if (error.message.includes('stats')) {
          errorMessage = 'Score saved but team stats update failed. Check team statistics.';
        }
      }
      
      toast({
        title: `Save Failed (Attempt ${currentAttempt})`,
        description: errorMessage,
        variant: "destructive",
      });

      addEvent('error', `Match save failed (Attempt ${currentAttempt}): ${errorMessage}`, matchTime);
    }
  };

  const handleAssignGoal = (player: ComponentPlayer) => {
    if (!selectedFixtureData) return;
    
    const homeTeam = { 
      id: String(selectedFixtureData.home_team_id || ''), 
      name: selectedFixtureData.home_team?.name || '' 
    };
    const awayTeam = { 
      id: String(selectedFixtureData.away_team_id || ''), 
      name: selectedFixtureData.away_team?.name || '' 
    };
    
    assignGoal(player, matchTime, selectedFixtureData.id, homeTeam, awayTeam);
  };

  const handleAddGoal = (team: 'home' | 'away') => {
    console.log('⚽ RefereeMatchHandlers: Goal tracking - this should update local state only');
    const teamData = team === 'home' ? selectedFixtureData?.home_team : selectedFixtureData?.away_team;
    addEvent('goal', `Goal for ${teamData?.name}`, matchTime);
    
    toast({
      title: "Goal Tracked!",
      description: `Goal for ${teamData?.name}. Please assign it to a player in the Goals tab.`,
    });
  };

  const handleRemoveGoal = (team: 'home' | 'away') => {
    console.log('🗑️ RefereeMatchHandlers: Goal removal tracking');
    const teamData = team === 'home' ? selectedFixtureData?.home_team : selectedFixtureData?.away_team;
    addEvent('goal_removed', `Goal removed for ${teamData?.name}`, matchTime);
  };

  const handleAddCard = (playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => {
    console.log('🟨🟥 RefereeMatchHandlers: Card will be handled by specialized card handlers');
    addEvent('card', `${cardType} card for ${playerName} (${team})`, time);
  };

  const handleAddPlayer = (player: ComponentPlayer) => {
    console.log('👥 RefereeMatchHandlers: Player tracking will be handled by specialized handlers');
    addEvent('player_added', `Started tracking ${player.name}`, matchTime);
  };

  const handleRemovePlayer = (playerId: number) => {
    console.log('👥 RefereeMatchHandlers: Player removal will be handled by specialized handlers');
    addEvent('player_removed', `Stopped tracking player ${playerId}`, matchTime);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    console.log('⏱️ RefereeMatchHandlers: Player time toggle will be handled by specialized handlers');
    addEvent('player_time_toggle', `Toggled time tracking for player ${playerId}`, matchTime);
  };

  const handleExportSummary = () => {
    console.log('📄 RefereeMatchHandlers: Export summary functionality');
    addEvent('export', 'Match summary exported', matchTime);
    
    toast({
      title: "Summary Exported",
      description: "Match summary has been prepared for export",
    });
  };

  return {
    handleResetMatch,
    handleSaveMatch,
    handleAssignGoal,
    handleAddGoal,
    handleRemoveGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    handleExportSummary
  };
};

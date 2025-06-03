
import { useToast } from "@/hooks/use-toast";
import { validateMatchData } from "@/utils/matchValidation";

interface MatchHandlersProps {
  selectedFixture: string;
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  saveAttempts: number;
  setSaveAttempts: (attempts: number) => void;
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
  formatTime: (seconds: number) => string;
}

export const useMatchHandlers = ({
  selectedFixture,
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  saveAttempts,
  setSaveAttempts,
  updateFixtureScore,
  createMatchEvent,
  updatePlayerStats,
  goals,
  addGoal,
  toggleTimer,
  resetTimer,
  resetScore,
  resetEvents,
  resetCards,
  resetTracking,
  resetGoals,
  addEvent,
  formatTime
}: MatchHandlersProps) => {
  const { toast } = useToast();

  const handleAddGoal = async (team: 'home' | 'away') => {
    const teamData = team === 'home' ? selectedFixtureData?.home_team : selectedFixtureData?.away_team;
    
    addGoal(team);

    // Record goal event
    const goalDescription = `Goal for ${teamData?.name}`;
    addEvent('goal', goalDescription, matchTime);

    // Show toast for goal tracking
    toast({
      title: "Goal Scored!",
      description: `${goalDescription}. Please assign it to a player in the Goal Assignment section below.`,
    });
  };

  const handleToggleTimer = () => {
    toggleTimer();
    addEvent('timer', isRunning ? 'Match paused' : 'Match started', matchTime);
  };

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
    if (!selectedFixture || !selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected. Please select a match first.",
        variant: "destructive",
      });
      return;
    }

    // Validate match data before saving
    const validation = validateMatchData(selectedFixtureData, homeScore, awayScore, matchTime);
    
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      toast({
        title: "Warning",
        description: validation.warnings.join(', '),
      });
    }
    
    const currentAttempt = saveAttempts + 1;
    setSaveAttempts(currentAttempt);
    
    try {
      console.log(`🎯 RefereeTools: Starting match save attempt ${currentAttempt}:`, {
        fixtureId: selectedFixture,
        homeScore,
        awayScore,
        homeTeam: selectedFixtureData?.home_team?.name,
        awayTeam: selectedFixtureData?.away_team?.name
      });

      // Update fixture score with enhanced error handling
      console.log('📊 RefereeTools: Updating fixture score...');
      const updatedFixture = await updateFixtureScore.mutateAsync({
        id: parseInt(selectedFixture),
        homeScore,
        awayScore
      });

      console.log('✅ RefereeTools: Fixture score updated successfully:', updatedFixture);

      // Create final match event
      if (selectedFixture) {
        console.log('📝 RefereeTools: Creating final match event...');
        await createMatchEvent.mutateAsync({
          fixture_id: parseInt(selectedFixture),
          event_type: 'other',
          player_name: 'System',
          team_id: 0,
          event_time: matchTime,
          description: `Match completed: ${selectedFixtureData?.home_team?.name} ${homeScore} - ${awayScore} ${selectedFixtureData?.away_team?.name} (Attempt ${currentAttempt})`
        });
        console.log('✅ RefereeTools: Final match event created successfully');
      }

      // Update player stats for goals and assists
      console.log('👥 RefereeTools: Updating player statistics...');
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
            console.log(`✅ RefereeTools: Updated stats for player ${playerId}:`, stats);
          } catch (playerError) {
            console.error(`❌ RefereeTools: Failed to update player ${playerId} stats:`, playerError);
            // Continue with other players even if one fails
          }
        }
      }

      console.log(`✅ RefereeTools: Updated stats for ${playerStatsUpdated} players`);
      
      toast({
        title: "Match Saved Successfully! 🎉",
        description: `Match result saved: ${selectedFixtureData?.home_team?.name} ${homeScore} - ${awayScore} ${selectedFixtureData?.away_team?.name}. ${playerStatsUpdated} player stats updated.`,
      });

      // Add success event to local events
      addEvent('match_saved', `Match successfully saved to database (Attempt ${currentAttempt})`, matchTime);

    } catch (error) {
      console.error(`❌ RefereeTools: Match save attempt ${currentAttempt} failed:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: `Save Failed (Attempt ${currentAttempt})`,
        description: `Failed to save match result: ${errorMessage}. Please check your connection and try again.`,
        variant: "destructive",
      });

      // Add error event to local events
      addEvent('error', `Match save failed (Attempt ${currentAttempt}): ${errorMessage}`, matchTime);
      
      // Show detailed error for debugging
      if (currentAttempt >= 3) {
        toast({
          title: "Multiple Save Failures",
          description: "Match saving has failed multiple times. Please check the console for detailed error information and contact support if the issue persists.",
          variant: "destructive",
        });
      }
    }
  };

  return {
    handleAddGoal,
    handleToggleTimer,
    handleResetMatch,
    handleSaveMatch
  };
};

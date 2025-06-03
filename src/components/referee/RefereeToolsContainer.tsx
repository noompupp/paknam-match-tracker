
import { useState } from "react";
import { useFixtures } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useCreateMatchEvent, useUpdatePlayerStats } from "@/hooks/useMatchEvents";
import { useToast } from "@/hooks/use-toast";
import { useMatchTimer } from "@/hooks/useMatchTimer";
import { useScoreManagement } from "@/hooks/useScoreManagement";
import { useCardManagement } from "@/hooks/useCardManagement";
import { usePlayerTracking } from "@/hooks/usePlayerTracking";
import { useGoalManagement } from "@/hooks/useGoalManagement";
import { useLocalMatchEvents } from "@/hooks/useMatchEvents";
import { validateMatchData } from "@/utils/matchValidation";
import MatchSelection from "./MatchSelection";
import MatchTimer from "./MatchTimer";
import ScoreManagement from "./ScoreManagement";
import CardManagement from "./CardManagement";
import PlayerTimeTracker from "./PlayerTimeTracker";
import MatchEvents from "./MatchEvents";
import GoalAssignment from "./GoalAssignment";

const RefereeToolsContainer = () => {
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { data: members } = useMembers();
  const updateFixtureScore = useUpdateFixtureScore();
  const createMatchEvent = useCreateMatchEvent();
  const updatePlayerStats = useUpdatePlayerStats();
  const { toast } = useToast();

  const [selectedFixture, setSelectedFixture] = useState("");
  const [saveAttempts, setSaveAttempts] = useState(0);

  // Custom hooks
  const { matchTime, isRunning, toggleTimer, resetTimer, formatTime } = useMatchTimer();
  const { homeScore, awayScore, addGoal, removeGoal, resetScore } = useScoreManagement();
  const { 
    cards, 
    playerName, 
    selectedTeam, 
    cardReason,
    setPlayerName, 
    setSelectedTeam, 
    setCardReason,
    addCard, 
    resetCards,
    checkForSecondYellow 
  } = useCardManagement();
  const { 
    trackedPlayers, 
    selectedPlayer, 
    setSelectedPlayer, 
    addPlayer, 
    removePlayer, 
    togglePlayerTime, 
    resetTracking,
    getPlayersNeedingSubstitution 
  } = usePlayerTracking(isRunning);
  const { goals, selectedGoalPlayer, selectedGoalType, setSelectedGoalPlayer, setSelectedGoalType, assignGoal, resetGoals } = useGoalManagement();
  const { events, addEvent, resetEvents } = useLocalMatchEvents();

  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);
  
  // Get all players from both teams of the selected fixture
  const allPlayers = members?.filter(member => 
    selectedFixtureData && (
      member.team_id === selectedFixtureData.home_team_id || 
      member.team_id === selectedFixtureData.away_team_id
    )
  ).map(member => ({
    id: member.id,
    name: member.name,
    team: member.team?.name || '',
    number: member.number,
    position: member.position
  })) || [];

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

  const handleAssignGoal = () => {
    if (!selectedGoalPlayer) return;

    const player = allPlayers.find(p => p.id === parseInt(selectedGoalPlayer));
    if (!player) return;

    const goal = assignGoal(player, matchTime);
    if (goal) {
      addEvent(selectedGoalType, `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} by ${player.name} (${player.team})`, matchTime);
      
      toast({
        title: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
        description: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} at ${formatTime(matchTime)}.`,
      });
    }
  };

  const handleAddCard = (type: 'yellow' | 'red') => {
    if (!selectedFixtureData) return;

    const teamName = selectedTeam === 'home' 
      ? selectedFixtureData.home_team?.name || 'Home'
      : selectedFixtureData.away_team?.name || 'Away';

    // Check for second yellow card
    const isSecondYellow = type === 'yellow' && checkForSecondYellow(playerName, teamName);
    
    const card = addCard(type, teamName, matchTime, cardReason);
    if (card) {
      addEvent(type === 'yellow' ? 'yellow_card' : 'red_card', `${type} card for ${card.player} (${card.team})`, matchTime);
      
      let toastTitle = `${type === 'yellow' ? 'Yellow' : 'Red'} Card Issued!`;
      let toastDescription = `${type === 'yellow' ? 'Yellow' : 'Red'} card issued to ${card.player} at ${formatTime(matchTime)}.`;
      
      if (isSecondYellow) {
        toastTitle = "Second Yellow Card!";
        toastDescription += " Player should receive an automatic red card.";
        toast({
          title: "Warning",
          description: `${card.player} now has 2 yellow cards and should be sent off.`,
          variant: "destructive"
        });
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
      });
    }
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

  const handleAddPlayer = () => {
    if (!selectedPlayer) return;

    const player = allPlayers.find(p => p.id === parseInt(selectedPlayer));
    if (player) {
      const playerTime = addPlayer(player, matchTime);
      if (playerTime) {
        addEvent('player_on', `${player.name} entered the field`, matchTime);
      }
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = removePlayer(playerId);
    if (player) {
      addEvent('player_removed', `${player.name} removed from tracking`, matchTime);
    }
  };

  const handleTogglePlayerTime = (playerId: number) => {
    const player = togglePlayerTime(playerId, matchTime);
    if (player) {
      addEvent(
        player.isPlaying ? 'player_on' : 'player_off',
        `${player.name} ${player.isPlaying ? 'entered' : 'left'} the field`,
        matchTime
      );
    }
  };

  // Check for players needing substitution
  const playersNeedingSub = getPlayersNeedingSubstitution(allPlayers);

  if (fixturesLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center pb-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center text-white mb-6">
          <h1 className="text-3xl font-bold">Referee Tools</h1>
          <p className="text-white/80 mt-2">Manage matches, track time, and record events</p>
          {saveAttempts > 0 && (
            <p className="text-yellow-300 text-sm mt-1">
              Save attempts: {saveAttempts} {saveAttempts >= 3 && "(Multiple failures detected)"}
            </p>
          )}
          {playersNeedingSub.length > 0 && (
            <div className="bg-orange-500/20 border border-orange-400 rounded-lg p-3 mt-2">
              <p className="text-orange-100 text-sm">
                ⚠️ {playersNeedingSub.length} player(s) need substitution due to time limits
              </p>
            </div>
          )}
        </div>

        <MatchSelection
          fixtures={fixtures || []}
          selectedFixture={selectedFixture}
          onFixtureChange={setSelectedFixture}
        />

        {selectedFixtureData && (
          <>
            <MatchTimer
              selectedFixtureData={selectedFixtureData}
              homeScore={homeScore}
              awayScore={awayScore}
              matchTime={matchTime}
              isRunning={isRunning}
              formatTime={formatTime}
            />

            <ScoreManagement
              selectedFixtureData={selectedFixtureData}
              homeScore={homeScore}
              awayScore={awayScore}
              isRunning={isRunning}
              isPending={updateFixtureScore.isPending}
              onAddGoal={handleAddGoal}
              onRemoveGoal={removeGoal}
              onToggleTimer={handleToggleTimer}
              onResetMatch={handleResetMatch}
              onSaveMatch={handleSaveMatch}
            />

            <GoalAssignment
              allPlayers={allPlayers}
              goals={goals}
              selectedPlayer={selectedGoalPlayer}
              selectedGoalType={selectedGoalType}
              matchTime={matchTime}
              onPlayerSelect={setSelectedGoalPlayer}
              onGoalTypeChange={setSelectedGoalType}
              onAssignGoal={handleAssignGoal}
              formatTime={formatTime}
            />

            <CardManagement
              selectedFixtureData={selectedFixtureData}
              playerName={playerName}
              selectedTeam={selectedTeam}
              cards={cards}
              onPlayerNameChange={setPlayerName}
              onTeamChange={setSelectedTeam}
              onAddCard={handleAddCard}
              formatTime={formatTime}
            />

            <PlayerTimeTracker
              trackedPlayers={trackedPlayers}
              selectedPlayer={selectedPlayer}
              allPlayers={allPlayers}
              onPlayerSelect={setSelectedPlayer}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onTogglePlayerTime={handleTogglePlayerTime}
              formatTime={formatTime}
            />

            <MatchEvents
              events={events}
              formatTime={formatTime}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RefereeToolsContainer;

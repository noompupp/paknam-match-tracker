
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

  // Custom hooks
  const { matchTime, isRunning, toggleTimer, resetTimer, formatTime } = useMatchTimer();
  const { homeScore, awayScore, addGoal, removeGoal, resetScore } = useScoreManagement();
  const { cards, playerName, selectedTeam, setPlayerName, setSelectedTeam, addCard, resetCards } = useCardManagement();
  const { trackedPlayers, selectedPlayer, setSelectedPlayer, addPlayer, removePlayer, togglePlayerTime, resetTracking } = usePlayerTracking(isRunning);
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

  const handleSaveMatch = async () => {
    if (!selectedFixture) return;
    
    try {
      // Update fixture score
      await updateFixtureScore.mutateAsync({
        id: parseInt(selectedFixture),
        homeScore,
        awayScore
      });

      // Create final match event
      if (selectedFixture) {
        await createMatchEvent.mutateAsync({
          fixture_id: parseInt(selectedFixture),
          event_type: 'other',
          player_name: '',
          team_id: 0,
          event_time: matchTime,
          description: `Match ended: ${selectedFixtureData?.home_team?.name} ${homeScore} - ${awayScore} ${selectedFixtureData?.away_team?.name}`
        });
      }

      // Update player stats for goals and assists
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
      for (const [playerId, stats] of playerStats) {
        if (stats.goals > 0 || stats.assists > 0) {
          await updatePlayerStats.mutateAsync({
            playerId: parseInt(playerId),
            goals: stats.goals > 0 ? stats.goals : undefined,
            assists: stats.assists > 0 ? stats.assists : undefined
          });
        }
      }
      
      toast({
        title: "Match Saved",
        description: "Match result and all events have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save match result.",
        variant: "destructive",
      });
    }
  };

  const handleAddCard = (type: 'yellow' | 'red') => {
    const teamName = selectedTeam === 'home' 
      ? selectedFixtureData?.home_team?.name 
      : selectedFixtureData?.away_team?.name;

    const card = addCard(type, teamName || '', matchTime);
    if (card) {
      addEvent('card', `${type.charAt(0).toUpperCase() + type.slice(1)} card for ${card.player} (${teamName})`, matchTime);

      // Create match event in database
      if (selectedFixture) {
        const teamId = selectedTeam === 'home' 
          ? selectedFixtureData?.home_team_id 
          : selectedFixtureData?.away_team_id;

        createMatchEvent.mutate({
          fixture_id: parseInt(selectedFixture),
          event_type: type === 'yellow' ? 'yellow_card' : 'red_card',
          player_name: card.player,
          team_id: teamId || 0,
          event_time: matchTime,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} card for ${card.player}`
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

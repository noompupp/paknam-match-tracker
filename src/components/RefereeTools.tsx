import { useState, useEffect, useRef } from "react";
import { useFixtures } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useCreateMatchEvent, useUpdatePlayerStats } from "@/hooks/useMatchEvents";
import { useToast } from "@/hooks/use-toast";
import MatchSelection from "./referee/MatchSelection";
import MatchTimer from "./referee/MatchTimer";
import ScoreManagement from "./referee/ScoreManagement";
import CardManagement from "./referee/CardManagement";
import PlayerTimeTracker from "./referee/PlayerTimeTracker";
import MatchEvents from "./referee/MatchEvents";
import GoalAssignment from "./referee/GoalAssignment";
import { PlayerTime } from "@/types/database";

interface MatchEvent {
  id: number;
  type: string;
  description: string;
  time: number;
}

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
}

interface GoalData {
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  type: 'goal' | 'assist';
}

const RefereeTools = () => {
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { data: members } = useMembers();
  const updateFixtureScore = useUpdateFixtureScore();
  const createMatchEvent = useCreateMatchEvent();
  const updatePlayerStats = useUpdatePlayerStats();
  const { toast } = useToast();

  const [selectedFixture, setSelectedFixture] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchTime, setMatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("home");
  const [cards, setCards] = useState<CardData[]>([]);
  const [trackedPlayers, setTrackedPlayers] = useState<PlayerTime[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [goals, setGoals] = useState<GoalData[]>([]);
  
  // New state for goal assignment
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState("");
  const [selectedGoalType, setSelectedGoalType] = useState<'goal' | 'assist'>('goal');

  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setMatchTime(prev => prev + 1);
        
        // Update tracked players' time
        setTrackedPlayers(prev => prev.map(player => {
          if (player.isPlaying) {
            return { ...player, totalTime: player.totalTime + 1 };
          }
          return player;
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addEvent = (type: string, description: string) => {
    const newEvent: MatchEvent = {
      id: Date.now(),
      type,
      description,
      time: matchTime
    };
    setEvents(prev => [...prev, newEvent]);

    // Create match event in database if fixture is selected
    if (selectedFixture) {
      createMatchEvent.mutate({
        fixture_id: parseInt(selectedFixture),
        event_type: type as any,
        player_name: '',
        team_id: 0,
        event_time: matchTime,
        description
      });
    }
  };

  const handleAddGoal = async (team: 'home' | 'away') => {
    const teamData = team === 'home' ? selectedFixtureData?.home_team : selectedFixtureData?.away_team;
    
    if (team === 'home') {
      setHomeScore(prev => prev + 1);
    } else {
      setAwayScore(prev => prev + 1);
    }

    // Record goal event
    const goalDescription = `Goal for ${teamData?.name}`;
    addEvent('goal', goalDescription);

    // Show toast for goal tracking
    toast({
      title: "Goal Scored!",
      description: `${goalDescription}. Please assign it to a player in the Goal Assignment section below.`,
    });
  };

  const handleRemoveGoal = (team: 'home' | 'away') => {
    if (team === 'home' && homeScore > 0) {
      setHomeScore(prev => prev - 1);
    } else if (team === 'away' && awayScore > 0) {
      setAwayScore(prev => prev - 1);
    }
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
    addEvent('timer', isRunning ? 'Match paused' : 'Match started');
  };

  const handleResetMatch = () => {
    setMatchTime(0);
    setHomeScore(0);
    setAwayScore(0);
    setIsRunning(false);
    setEvents([]);
    setCards([]);
    setTrackedPlayers([]);
    setGoals([]);
    setSelectedGoalPlayer("");
  };

  const handleAssignGoal = () => {
    if (!selectedGoalPlayer) return;

    const player = allPlayers.find(p => p.id === parseInt(selectedGoalPlayer));
    if (!player) return;

    const newGoal: GoalData = {
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      time: matchTime,
      type: selectedGoalType
    };

    setGoals(prev => [...prev, newGoal]);
    addEvent(selectedGoalType, `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} by ${player.name} (${player.team})`);
    setSelectedGoalPlayer("");
    
    toast({
      title: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
      description: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} at ${formatTime(matchTime)}.`,
    });
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
    if (!playerName.trim()) return;

    const teamName = selectedTeam === 'home' 
      ? selectedFixtureData?.home_team?.name 
      : selectedFixtureData?.away_team?.name;

    const newCard: CardData = {
      id: Date.now(),
      player: playerName,
      team: teamName || '',
      type,
      time: matchTime
    };

    setCards(prev => [...prev, newCard]);
    addEvent('card', `${type.charAt(0).toUpperCase() + type.slice(1)} card for ${playerName} (${teamName})`);
    setPlayerName("");

    // Create match event in database
    if (selectedFixture) {
      const teamId = selectedTeam === 'home' 
        ? selectedFixtureData?.home_team_id 
        : selectedFixtureData?.away_team_id;

      createMatchEvent.mutate({
        fixture_id: parseInt(selectedFixture),
        event_type: type === 'yellow' ? 'yellow_card' : 'red_card',
        player_name: playerName,
        team_id: teamId || 0,
        event_time: matchTime,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} card for ${playerName}`
      });
    }
  };

  const handleAddPlayer = () => {
    if (!selectedPlayer) return;

    const player = allPlayers.find(p => p.id === parseInt(selectedPlayer));
    if (!player) return;

    const newPlayerTime: PlayerTime = {
      id: player.id,
      name: player.name,
      team: player.team,
      totalTime: 0,
      isPlaying: true,
      startTime: matchTime
    };

    setTrackedPlayers(prev => [...prev, newPlayerTime]);
    addEvent('player_on', `${player.name} entered the field`);
    setSelectedPlayer("");
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = trackedPlayers.find(p => p.id === playerId);
    if (player) {
      addEvent('player_removed', `${player.name} removed from tracking`);
    }
    setTrackedPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const handleTogglePlayerTime = (playerId: number) => {
    setTrackedPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newIsPlaying = !player.isPlaying;
        addEvent(
          newIsPlaying ? 'player_on' : 'player_off',
          `${player.name} ${newIsPlaying ? 'entered' : 'left'} the field`
        );
        return {
          ...player,
          isPlaying: newIsPlaying,
          startTime: newIsPlaying ? matchTime : null
        };
      }
      return player;
    }));
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
              onRemoveGoal={handleRemoveGoal}
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

export default RefereeTools;

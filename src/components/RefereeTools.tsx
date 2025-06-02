
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useFixtures, useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { PlayerTime } from "@/types/database";
import MatchSelection from "./referee/MatchSelection";
import MatchTimer from "./referee/MatchTimer";
import ScoreManagement from "./referee/ScoreManagement";
import CardManagement from "./referee/CardManagement";
import PlayerTimeTracker from "./referee/PlayerTimeTracker";
import MatchEvents from "./referee/MatchEvents";

const RefereeTools = () => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchTime, setMatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cards, setCards] = useState<Array<{id: number, player: string, team: string, type: 'yellow' | 'red', time: number}>>([]);
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("home");
  const [events, setEvents] = useState<Array<{id: number, type: string, description: string, time: number}>>([]);
  const [trackedPlayers, setTrackedPlayers] = useState<PlayerTime[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedFixture, setSelectedFixture] = useState("");

  // Get upcoming fixtures and all members
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { data: members, isLoading: membersLoading } = useMembers();
  const updateFixtureScore = useUpdateFixtureScore();

  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);

  // Get all players from both teams
  const getAllPlayers = () => {
    if (!selectedFixtureData || !members) return [];
    
    const homeTeamMembers = members.filter(m => m.team_id === selectedFixtureData.home_team_id);
    const awayTeamMembers = members.filter(m => m.team_id === selectedFixtureData.away_team_id);
    
    const allPlayers: Array<{name: string, team: string, number: number, position: string, id: number}> = [];
    
    homeTeamMembers.forEach(player => {
      allPlayers.push({
        id: player.id,
        name: player.name,
        team: selectedFixtureData.home_team?.name || 'Home Team',
        number: player.number,
        position: player.position
      });
    });
    
    awayTeamMembers.forEach(player => {
      allPlayers.push({
        id: player.id,
        name: player.name,
        team: selectedFixtureData.away_team?.name || 'Away Team',
        number: player.number,
        position: player.position
      });
    });
    
    return allPlayers;
  };

  // Update player times when match timer is running
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTrackedPlayers(prev => prev.map(player => {
          if (player.isPlaying && player.startTime !== null) {
            return {
              ...player,
              totalTime: player.totalTime + 1
            };
          }
          return player;
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const addGoal = (team: 'home' | 'away') => {
    if (team === 'home') {
      setHomeScore(prev => prev + 1);
    } else {
      setAwayScore(prev => prev + 1);
    }
    
    const teamName = team === 'home' 
      ? selectedFixtureData?.home_team?.name || 'Home Team'
      : selectedFixtureData?.away_team?.name || 'Away Team';
    
    const newEvent = {
      id: Date.now(),
      type: 'goal',
      description: `Goal scored by ${teamName}`,
      time: matchTime
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const removeGoal = (team: 'home' | 'away') => {
    if (team === 'home' && homeScore > 0) {
      setHomeScore(prev => prev - 1);
    } else if (team === 'away' && awayScore > 0) {
      setAwayScore(prev => prev - 1);
    }
  };

  const addCard = (type: 'yellow' | 'red') => {
    if (!playerName.trim() || !selectedFixtureData) return;
    
    const teamName = selectedTeam === 'home' 
      ? selectedFixtureData.home_team?.name || 'Home Team'
      : selectedFixtureData.away_team?.name || 'Away Team';
    
    const newCard = {
      id: Date.now(),
      player: playerName,
      team: teamName,
      type,
      time: matchTime
    };
    
    setCards(prev => [...prev, newCard]);
    
    const newEvent = {
      id: Date.now(),
      type: 'card',
      description: `${type === 'yellow' ? 'Yellow' : 'Red'} card for ${playerName} (${teamName})`,
      time: matchTime
    };
    setEvents(prev => [...prev, newEvent]);
    
    setPlayerName("");
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      const interval = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
      
      (window as any).matchInterval = interval;
    } else {
      clearInterval((window as any).matchInterval);
    }
  };

  const resetMatch = () => {
    setHomeScore(0);
    setAwayScore(0);
    setMatchTime(0);
    setIsRunning(false);
    setCards([]);
    setEvents([]);
    setTrackedPlayers([]);
    clearInterval((window as any).matchInterval);
  };

  const saveMatch = async () => {
    if (!selectedFixtureData) return;
    
    try {
      await updateFixtureScore.mutateAsync({
        id: selectedFixtureData.id,
        homeScore,
        awayScore
      });
      
      const newEvent = {
        id: Date.now(),
        type: 'match_saved',
        description: `Match result saved: ${homeScore}-${awayScore}`,
        time: matchTime
      };
      setEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const addPlayerToTracker = () => {
    if (!selectedPlayer) return;
    
    const allPlayers = getAllPlayers();
    const playerData = allPlayers.find(p => p.id.toString() === selectedPlayer);
    
    if (!playerData) return;
    
    const newPlayer: PlayerTime = {
      id: Date.now(),
      name: playerData.name,
      team: playerData.team,
      totalTime: 0,
      isPlaying: false,
      startTime: null
    };
    
    setTrackedPlayers(prev => [...prev, newPlayer]);
    setSelectedPlayer("");
    
    const newEvent = {
      id: Date.now(),
      type: 'player_added',
      description: `${playerData.name} added to time tracker (${playerData.team})`,
      time: matchTime
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const removePlayerFromTracker = (playerId: number) => {
    const player = trackedPlayers.find(p => p.id === playerId);
    if (player) {
      setTrackedPlayers(prev => prev.filter(p => p.id !== playerId));
      
      const newEvent = {
        id: Date.now(),
        type: 'player_removed',
        description: `${player.name} removed from time tracker`,
        time: matchTime
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const togglePlayerTime = (playerId: number) => {
    setTrackedPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newIsPlaying = !player.isPlaying;
        const updatedPlayer = {
          ...player,
          isPlaying: newIsPlaying,
          startTime: newIsPlaying ? matchTime : null
        };
        
        const newEvent = {
          id: Date.now(),
          type: newIsPlaying ? 'player_on' : 'player_off',
          description: `${player.name} ${newIsPlaying ? 'entered' : 'left'} the field`,
          time: matchTime
        };
        setEvents(prev => [...prev, newEvent]);
        
        return updatedPlayer;
      }
      return player;
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (fixturesLoading || membersLoading) {
    return (
      <div className="min-h-screen gradient-bg pb-20">
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Referee Tools</h1>
              <p className="text-white/80">Match Management System</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="card-shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-24 w-full" />
                <div className="grid md:grid-cols-2 gap-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Referee Tools</h1>
            <p className="text-white/80">Match Management System</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Fixture Selection */}
        <MatchSelection
          fixtures={fixtures || []}
          selectedFixture={selectedFixture}
          onFixtureChange={setSelectedFixture}
        />

        {selectedFixtureData && (
          <>
            {/* Current Match */}
            <MatchTimer
              selectedFixtureData={selectedFixtureData}
              homeScore={homeScore}
              awayScore={awayScore}
              matchTime={matchTime}
              isRunning={isRunning}
              formatTime={formatTime}
            />

            <div className="grid md:grid-cols-2 gap-6">
              {/* Score Management */}
              <ScoreManagement
                selectedFixtureData={selectedFixtureData}
                homeScore={homeScore}
                awayScore={awayScore}
                isRunning={isRunning}
                isPending={updateFixtureScore.isPending}
                onAddGoal={addGoal}
                onRemoveGoal={removeGoal}
                onToggleTimer={toggleTimer}
                onResetMatch={resetMatch}
                onSaveMatch={saveMatch}
              />

              {/* Card Management */}
              <CardManagement
                selectedFixtureData={selectedFixtureData}
                playerName={playerName}
                selectedTeam={selectedTeam}
                cards={cards}
                onPlayerNameChange={setPlayerName}
                onTeamChange={setSelectedTeam}
                onAddCard={addCard}
                formatTime={formatTime}
              />
            </div>

            {/* Player Time Tracker */}
            <PlayerTimeTracker
              trackedPlayers={trackedPlayers}
              selectedPlayer={selectedPlayer}
              allPlayers={getAllPlayers()}
              onPlayerSelect={setSelectedPlayer}
              onAddPlayer={addPlayerToTracker}
              onRemovePlayer={removePlayerFromTracker}
              onTogglePlayerTime={togglePlayerTime}
              formatTime={formatTime}
            />

            {/* Match Events */}
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

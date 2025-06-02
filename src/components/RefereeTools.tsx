
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Minus, Clock, Play, Square, RotateCcw, Timer, UserPlus, UserMinus } from "lucide-react";
import { useFixtures, useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { PlayerTime } from "@/types/database";

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

  // Filter upcoming fixtures
  const upcomingFixtures = fixtures?.filter(f => f.status === 'scheduled') || [];
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
        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle>Select Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fixture">Choose Fixture</Label>
                <Select value={selectedFixture} onValueChange={setSelectedFixture}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fixture to manage" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingFixtures.map((fixture) => (
                      <SelectItem key={fixture.id} value={fixture.id.toString()}>
                        {fixture.home_team?.name} vs {fixture.away_team?.name} - {new Date(fixture.match_date).toLocaleDateString()} {fixture.match_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedFixtureData && (
          <>
            {/* Current Match */}
            <Card className="card-shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Current Match</CardTitle>
                <p className="text-center text-muted-foreground">
                  {new Date(selectedFixtureData.match_date).toLocaleDateString()} • {selectedFixtureData.match_time}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedFixtureData.home_team?.name}</h3>
                    <div className="text-4xl font-bold text-primary mt-2">{homeScore}</div>
                  </div>
                  <div className="mx-8">
                    <div className="text-2xl font-bold mb-2">{formatTime(matchTime)}</div>
                    <Badge variant={isRunning ? "default" : "secondary"}>
                      {isRunning ? "LIVE" : "PAUSED"}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedFixtureData.away_team?.name}</h3>
                    <div className="text-4xl font-bold text-primary mt-2">{awayScore}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Score Management */}
              <Card className="card-shadow-lg">
                <CardHeader>
                  <CardTitle>Score Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedFixtureData.home_team?.name}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => removeGoal('home')}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold w-8 text-center">{homeScore}</span>
                        <Button size="sm" onClick={() => addGoal('home')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedFixtureData.away_team?.name}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => removeGoal('away')}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold w-8 text-center">{awayScore}</span>
                        <Button size="sm" onClick={() => addGoal('away')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={toggleTimer} className="flex-1">
                      {isRunning ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isRunning ? 'Stop' : 'Start'}
                    </Button>
                    <Button variant="outline" onClick={resetMatch}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={saveMatch} 
                    className="w-full" 
                    disabled={updateFixtureScore.isPending}
                  >
                    {updateFixtureScore.isPending ? 'Saving...' : 'Save Match Result'}
                  </Button>
                </CardContent>
              </Card>

              {/* Card Management */}
              <Card className="card-shadow-lg">
                <CardHeader>
                  <CardTitle>Cards & Fouls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="player">Player Name</Label>
                      <Input
                        id="player"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter player name"
                      />
                    </div>
                    
                    <div>
                      <Label>Team</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          variant={selectedTeam === 'home' ? 'default' : 'outline'}
                          onClick={() => setSelectedTeam('home')}
                        >
                          {selectedFixtureData.home_team?.name}
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedTeam === 'away' ? 'default' : 'outline'}
                          onClick={() => setSelectedTeam('away')}
                        >
                          {selectedFixtureData.away_team?.name}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => addCard('yellow')}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                        disabled={!playerName.trim()}
                      >
                        Yellow Card
                      </Button>
                      <Button
                        onClick={() => addCard('red')}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        disabled={!playerName.trim()}
                      >
                        Red Card
                      </Button>
                    </div>
                  </div>

                  {cards.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="font-semibold text-sm">Cards Issued</h4>
                      {cards.map((card) => (
                        <div key={card.id} className="flex items-center justify-between text-sm">
                          <span>{card.player} ({card.team})</span>
                          <Badge variant={card.type === 'yellow' ? 'outline' : 'destructive'}>
                            {card.type} • {formatTime(card.time)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Player Time Tracker */}
            <Card className="card-shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Player Time Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Player Section */}
                <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-semibold text-sm">Add Player to Track</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="playerSelect">Select Player</Label>
                      <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a player" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllPlayers().map((player) => (
                            <SelectItem 
                              key={player.id} 
                              value={player.id.toString()}
                            >
                              #{player.number} {player.name} ({player.team}) - {player.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={addPlayerToTracker}
                        disabled={!selectedPlayer}
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Player
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tracked Players */}
                {trackedPlayers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No players being tracked</p>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Tracked Players</h4>
                    {trackedPlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="font-medium">{player.name}</span>
                            <p className="text-sm text-muted-foreground">{player.team}</p>
                          </div>
                          <Badge variant={player.isPlaying ? "default" : "secondary"}>
                            {player.isPlaying ? "ON FIELD" : "OFF FIELD"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-mono text-lg font-bold">
                              {formatTime(player.totalTime)}
                            </div>
                            <p className="text-xs text-muted-foreground">playing time</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={player.isPlaying ? "destructive" : "default"}
                              onClick={() => togglePlayerTime(player.id)}
                            >
                              {player.isPlaying ? "Sub Out" : "Sub In"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removePlayerFromTracker(player.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Match Events */}
            <Card className="card-shadow-lg">
              <CardHeader>
                <CardTitle>Match Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No events recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {events.slice().reverse().map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(event.time)}
                          </Badge>
                          <span className="font-medium">{event.description}</span>
                        </div>
                        <Badge variant={
                          event.type === 'goal' ? 'default' : 
                          event.type === 'card' ? 'destructive' :
                          event.type.includes('player') ? 'secondary' :
                          'outline'
                        }>
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default RefereeTools;

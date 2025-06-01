import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Clock, Play, Square, RotateCcw, Timer, UserPlus, UserMinus } from "lucide-react";

interface PlayerTime {
  id: number;
  name: string;
  team: string;
  totalTime: number;
  isPlaying: boolean;
  startTime: number | null;
}

interface Player {
  name: string;
  number: number;
  position: string;
  role: string;
  goals: number;
  assists: number;
}

interface Team {
  id: number;
  name: string;
  logo: string;
  founded: string;
  players: number;
  captain: string;
  position: number;
  points: number;
  squad?: Player[];
}

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
  const [newPlayerTeam, setNewPlayerTeam] = useState("home");

  // Sample match data
  const currentMatch = {
    homeTeam: "Bangkok FC",
    awayTeam: "Paknam FC",
    date: "Dec 20, 2024",
    time: "15:00"
  };

  // Teams and players data
  const teams: Team[] = [
    {
      id: 1,
      name: "Bangkok FC",
      logo: "🔴",
      founded: "2018",
      players: 16,
      captain: "Somchai Srisai",
      position: 1,
      points: 25,
      squad: [
        { name: "Somchai Srisai", number: 10, position: "Forward", role: "Captain", goals: 8, assists: 4 },
        { name: "Preecha Jai", number: 7, position: "Midfielder", role: "S-Class", goals: 5, assists: 6 },
        { name: "Sutin Krai", number: 9, position: "Forward", role: "S-Class", goals: 7, assists: 2 },
        { name: "Wanchai Dee", number: 4, position: "Defender", role: "Regular", goals: 0, assists: 3 },
        { name: "Niran Mai", number: 23, position: "Midfielder", role: "Regular", goals: 1, assists: 5 },
      ]
    },
    {
      id: 2,
      name: "Paknam FC",
      logo: "🟣",
      founded: "2019",
      players: 17,
      captain: "Niran Prakob",
      position: 2,
      points: 23,
      squad: [
        { name: "Niran Prakob", number: 10, position: "Forward", role: "Captain", goals: 10, assists: 5 },
        { name: "Manit Klang", number: 7, position: "Midfielder", role: "S-Class", goals: 6, assists: 8 },
        { name: "Sombat Dee", number: 9, position: "Forward", role: "S-Class", goals: 5, assists: 3 },
        { name: "Chai Yen", number: 4, position: "Defender", role: "Regular", goals: 1, assists: 2 },
        { name: "Wit Sam", number: 23, position: "Midfielder", role: "Regular", goals: 2, assists: 4 },
      ]
    }
  ];

  // Get all players from both teams
  const getAllPlayers = () => {
    const homeTeam = teams.find(team => team.name === currentMatch.homeTeam);
    const awayTeam = teams.find(team => team.name === currentMatch.awayTeam);
    
    const allPlayers: Array<{name: string, team: string, number: number, position: string}> = [];
    
    if (homeTeam?.squad) {
      homeTeam.squad.forEach(player => {
        allPlayers.push({
          name: player.name,
          team: homeTeam.name,
          number: player.number,
          position: player.position
        });
      });
    }
    
    if (awayTeam?.squad) {
      awayTeam.squad.forEach(player => {
        allPlayers.push({
          name: player.name,
          team: awayTeam.name,
          number: player.number,
          position: player.position
        });
      });
    }
    
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
    
    const newEvent = {
      id: Date.now(),
      type: 'goal',
      description: `Goal scored by ${team === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam}`,
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
    if (!playerName.trim()) return;
    
    const newCard = {
      id: Date.now(),
      player: playerName,
      team: selectedTeam === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam,
      type,
      time: matchTime
    };
    
    setCards(prev => [...prev, newCard]);
    
    const newEvent = {
      id: Date.now(),
      type: 'card',
      description: `${type === 'yellow' ? 'Yellow' : 'Red'} card for ${playerName} (${newCard.team})`,
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
      
      // Store interval ID for cleanup
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

  const addPlayerToTracker = () => {
    if (!selectedPlayer) return;
    
    const allPlayers = getAllPlayers();
    const playerData = allPlayers.find(p => `${p.name}-${p.team}` === selectedPlayer);
    
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
        {/* Current Match */}
        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Current Match</CardTitle>
            <p className="text-center text-muted-foreground">{currentMatch.date} • {currentMatch.time}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{currentMatch.homeTeam}</h3>
                <div className="text-4xl font-bold text-primary mt-2">{homeScore}</div>
              </div>
              <div className="mx-8">
                <div className="text-2xl font-bold mb-2">{formatTime(matchTime)}</div>
                <Badge variant={isRunning ? "default" : "secondary"}>
                  {isRunning ? "LIVE" : "PAUSED"}
                </Badge>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{currentMatch.awayTeam}</h3>
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
                  <span className="font-medium">{currentMatch.homeTeam}</span>
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
                  <span className="font-medium">{currentMatch.awayTeam}</span>
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
                      {currentMatch.homeTeam}
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTeam === 'away' ? 'default' : 'outline'}
                      onClick={() => setSelectedTeam('away')}
                    >
                      {currentMatch.awayTeam}
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
                          key={`${player.name}-${player.team}`} 
                          value={`${player.name}-${player.team}`}
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
      </div>
    </div>
  );
};

export default RefereeTools;

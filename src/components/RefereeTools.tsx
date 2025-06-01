
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Clock, Play, Square, RotateCcw } from "lucide-react";

const RefereeTools = () => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchTime, setMatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cards, setCards] = useState<Array<{id: number, player: string, team: string, type: 'yellow' | 'red', time: number}>>([]);
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("home");
  const [events, setEvents] = useState<Array<{id: number, type: string, description: string, time: number}>>([]);

  // Sample match data
  const currentMatch = {
    homeTeam: "Bangkok FC",
    awayTeam: "Paknam FC",
    date: "Dec 20, 2024",
    time: "15:00"
  };

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
    clearInterval((window as any).matchInterval);
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
                    <Badge variant={event.type === 'goal' ? 'default' : 'secondary'}>
                      {event.type}
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

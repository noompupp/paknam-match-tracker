
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

const Teams = () => {
  const teams = [
    {
      id: 1,
      name: "Bangkok FC",
      logo: "🔴",
      founded: "2018",
      players: 16,
      captain: "Somchai Srisai",
      position: 1,
      points: 25
    },
    {
      id: 2,
      name: "Paknam FC",
      logo: "🟣",
      founded: "2019",
      players: 17,
      captain: "Niran Prakob",
      position: 2,
      points: 23
    },
    {
      id: 3,
      name: "Thonburi United",
      logo: "🟡",
      founded: "2017",
      players: 15,
      captain: "Wichai Thong",
      position: 3,
      points: 19
    },
    {
      id: 4,
      name: "Samut Prakan",
      logo: "🔵",
      founded: "2020",
      players: 16,
      captain: "Preecha Chai",
      position: 4,
      points: 15
    },
    {
      id: 5,
      name: "Nonthaburi FC",
      logo: "🟢",
      founded: "2018",
      players: 15,
      captain: "Thana Suk",
      position: 5,
      points: 8
    },
    {
      id: 6,
      name: "Pathum Thani",
      logo: "🟠",
      founded: "2019",
      players: 16,
      captain: "Kritsada Noi",
      position: 6,
      points: 4
    }
  ];

  const samplePlayers = [
    { name: "Niran Prakob", number: 10, position: "Forward", role: "Captain", goals: 10, assists: 5 },
    { name: "Manit Klang", number: 7, position: "Midfielder", role: "S-Class", goals: 6, assists: 8 },
    { name: "Sombat Dee", number: 9, position: "Forward", role: "S-Class", goals: 5, assists: 3 },
    { name: "Chai Yen", number: 4, position: "Defender", role: "Regular", goals: 1, assists: 2 },
    { name: "Wit Sam", number: 23, position: "Midfielder", role: "Regular", goals: 2, assists: 4 },
  ];

  return (
    <div className="min-h-screen gradient-bg pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Teams & Players</h1>
            <p className="text-white/80">Meet our 6 competing teams</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="card-shadow-lg hover:card-shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{team.logo}</div>
                <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">#{team.position}</Badge>
                  <Badge className="bg-primary text-primary-foreground text-xs">{team.points} pts</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Founded:</span>
                  <span className="font-semibold">{team.founded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Captain:</span>
                  <span className="font-semibold">{team.captain}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {team.players}
                  </span>
                </div>
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary/90" 
                  size="sm"
                >
                  View Squad <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Player Squad - Paknam FC */}
        <Card className="card-shadow-lg animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🟣</span>
                <div>
                  <CardTitle className="text-2xl font-bold">Paknam FC Squad</CardTitle>
                  <p className="text-muted-foreground">Current season players</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground">17 Players</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {samplePlayers.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {player.number}
                    </div>
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{player.position}</span>
                        <Badge 
                          variant={player.role === "Captain" ? "default" : player.role === "S-Class" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {player.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{player.goals}G / {player.assists}A</p>
                    <p className="text-muted-foreground">This season</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View Full Squad <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Teams;

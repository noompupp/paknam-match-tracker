
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const standings = [
    { pos: 1, team: "Bangkok FC", played: 10, won: 8, drawn: 1, lost: 1, gf: 25, ga: 8, gd: 17, pts: 25 },
    { pos: 2, team: "Paknam FC", played: 10, won: 7, drawn: 2, lost: 1, gf: 22, ga: 10, gd: 12, pts: 23 },
    { pos: 3, team: "Thonburi United", played: 10, won: 6, drawn: 1, lost: 3, gf: 18, ga: 15, gd: 3, pts: 19 },
    { pos: 4, team: "Samut Prakan", played: 10, won: 4, drawn: 3, lost: 3, gf: 16, ga: 14, gd: 2, pts: 15 },
    { pos: 5, team: "Nonthaburi FC", played: 10, won: 2, drawn: 2, lost: 6, gf: 12, ga: 20, gd: -8, pts: 8 },
    { pos: 6, team: "Pathum Thani", played: 10, won: 1, drawn: 1, lost: 8, gf: 8, ga: 24, gd: -16, pts: 4 },
  ];

  const topScorers = [
    { name: "Somchai Srisai", team: "Bangkok FC", goals: 12 },
    { name: "Niran Prakob", team: "Paknam FC", goals: 10 },
    { name: "Wichai Thong", team: "Thonburi United", goals: 8 },
    { name: "Preecha Chai", team: "Samut Prakan", goals: 7 },
    { name: "Manit Klang", team: "Paknam FC", goals: 6 },
  ];

  const recentResults = [
    { date: "Dec 15", homeTeam: "Paknam FC", homeScore: 3, awayScore: 1, awayTeam: "Nonthaburi FC" },
    { date: "Dec 12", homeTeam: "Bangkok FC", homeScore: 2, awayScore: 0, awayTeam: "Pathum Thani" },
    { date: "Dec 10", homeTeam: "Thonburi United", homeScore: 1, awayScore: 2, awayTeam: "Samut Prakan" },
  ];

  const upcomingFixtures = [
    { date: "Dec 20", homeTeam: "Paknam FC", awayTeam: "Bangkok FC", time: "15:00" },
    { date: "Dec 22", homeTeam: "Samut Prakan", awayTeam: "Thonburi United", time: "16:00" },
    { date: "Dec 24", homeTeam: "Nonthaburi FC", awayTeam: "Pathum Thani", time: "14:00" },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Paknam FC League</h1>
            <p className="text-white/80">Community Football Championship</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* League Table */}
        <Card className="card-shadow-lg animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">League Table</CardTitle>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-sm">
                    <th className="text-left p-3 font-semibold">Pos</th>
                    <th className="text-left p-3 font-semibold">Team</th>
                    <th className="text-center p-3 font-semibold">P</th>
                    <th className="text-center p-3 font-semibold">W</th>
                    <th className="text-center p-3 font-semibold">D</th>
                    <th className="text-center p-3 font-semibold">L</th>
                    <th className="text-center p-3 font-semibold">GD</th>
                    <th className="text-center p-3 font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team) => (
                    <tr key={team.pos} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold">{team.pos}</td>
                      <td className="p-3 font-semibold">{team.team}</td>
                      <td className="p-3 text-center">{team.played}</td>
                      <td className="p-3 text-center">{team.won}</td>
                      <td className="p-3 text-center">{team.drawn}</td>
                      <td className="p-3 text-center">{team.lost}</td>
                      <td className="p-3 text-center font-semibold">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                      <td className="p-3 text-center font-bold text-primary">{team.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Scorers */}
          <Card className="card-shadow-lg animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Top Scorers</CardTitle>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {topScorers.map((scorer, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-semibold">{scorer.name}</p>
                      <p className="text-sm text-muted-foreground">{scorer.team}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">{scorer.goals}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card className="card-shadow-lg animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Recent Results</CardTitle>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {recentResults.map((match, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="text-xs text-muted-foreground mb-2">{match.date}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{match.homeTeam}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="px-3 py-1">
                        {match.homeScore} - {match.awayScore}
                      </Badge>
                    </div>
                    <span className="font-semibold text-sm">{match.awayTeam}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Fixtures */}
        <Card className="card-shadow-lg animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Upcoming Fixtures</CardTitle>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingFixtures.map((fixture, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{fixture.date} • {fixture.time}</div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">{fixture.homeTeam}</span>
                  <span className="text-muted-foreground text-sm">vs</span>
                  <span className="font-semibold">{fixture.awayTeam}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

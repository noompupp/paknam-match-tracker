
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { useTopScorers } from "@/hooks/useMembers";
import { useRecentFixtures, useUpcomingFixtures } from "@/hooks/useFixtures";

const Dashboard = () => {
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: topScorers, isLoading: scorersLoading } = useTopScorers();
  const { data: recentFixtures, isLoading: recentLoading } = useRecentFixtures();
  const { data: upcomingFixtures, isLoading: upcomingLoading } = useUpcomingFixtures();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (teamsError) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="text-white/80">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

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
                  {teamsLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3"><Skeleton className="h-4 w-6" /></td>
                        <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                      </tr>
                    ))
                  ) : (
                    teams?.map((team) => (
                      <tr key={team.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold">{team.position}</td>
                        <td className="p-3 font-semibold">{team.name}</td>
                        <td className="p-3 text-center">{team.played}</td>
                        <td className="p-3 text-center">{team.won}</td>
                        <td className="p-3 text-center">{team.drawn}</td>
                        <td className="p-3 text-center">{team.lost}</td>
                        <td className="p-3 text-center font-semibold">
                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                        </td>
                        <td className="p-3 text-center font-bold text-primary">{team.points}</td>
                      </tr>
                    ))
                  )}
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
              {scorersLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-8" />
                  </div>
                ))
              ) : (
                topScorers.map((scorer, index) => (
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
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card className="card-shadow-lg animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Recent Results</CardTitle>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/20">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                recentFixtures?.map((fixture) => (
                  <div key={fixture.id} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(fixture.match_date)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{fixture.home_team?.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="px-3 py-1">
                          {fixture.home_score} - {fixture.away_score}
                        </Badge>
                      </div>
                      <span className="font-semibold text-sm">{fixture.away_team?.name}</span>
                    </div>
                  </div>
                ))
              )}
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
            {upcomingLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-6" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))
            ) : (
              upcomingFixtures?.map((fixture) => (
                <div key={fixture.id} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(fixture.match_date)} • {fixture.match_time}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold">{fixture.home_team?.name}</span>
                    <span className="text-muted-foreground text-sm">vs</span>
                    <span className="font-semibold">{fixture.away_team?.name}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

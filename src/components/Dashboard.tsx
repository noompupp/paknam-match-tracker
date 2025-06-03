
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { useTopScorers } from "@/hooks/useMembers";
import { useRecentFixtures, useUpcomingFixtures } from "@/hooks/useFixtures";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import DebugPanel from "./DebugPanel";
import TournamentLogo from "./TournamentLogo";
import TeamLogo from "./teams/TeamLogo";

const Dashboard = () => {
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: topScorers, isLoading: scorersLoading } = useTopScorers();
  const { data: recentFixtures, isLoading: recentLoading } = useRecentFixtures();
  const { data: upcomingFixtures, isLoading: upcomingLoading } = useUpcomingFixtures();

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
            <div className="flex items-center justify-center gap-3 mb-3">
              <TournamentLogo size="large" />
              <h1 className="text-3xl font-bold text-white">Paknam FC League</h1>
            </div>
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
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                        <td className="p-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                      </tr>
                    ))
                  ) : teams && teams.length > 0 ? (
                    teams.map((team) => (
                      <tr key={team.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold">{team.position}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <TeamLogo team={team} size="small" showColor />
                            <span className="font-semibold">{team.name}</span>
                          </div>
                        </td>
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
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No teams data available
                      </td>
                    </tr>
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
              ) : topScorers && topScorers.length > 0 ? (
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
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No scorer data available
                </div>
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
              ) : recentFixtures && recentFixtures.length > 0 ? (
                recentFixtures.map((fixture) => (
                  <div key={fixture.id} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDateDisplay(fixture.match_date)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TeamLogo team={fixture.home_team} size="small" />
                        <span className="font-semibold text-sm">{fixture.home_team?.name || 'TBD'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="px-3 py-1">
                          {fixture.home_score} - {fixture.away_score}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{fixture.away_team?.name || 'TBD'}</span>
                        <TeamLogo team={fixture.away_team} size="small" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No recent results available
                </div>
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
            ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
              upcomingFixtures.map((fixture) => (
                <div key={fixture.id} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {formatDateDisplay(fixture.match_date)} • {formatTimeDisplay(fixture.match_time)}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-2 mt-2">
                    <div className="col-span-2 flex items-center gap-2 justify-end">
                      <span className="font-semibold text-right">{fixture.home_team?.name || 'TBD'}</span>
                      <TeamLogo team={fixture.home_team} size="small" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <span className="text-muted-foreground text-sm font-medium">vs</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <TeamLogo team={fixture.away_team} size="small" />
                      <span className="font-semibold">{fixture.away_team?.name || 'TBD'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No upcoming fixtures available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
};

export default Dashboard;

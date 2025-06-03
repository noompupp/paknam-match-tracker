import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import { useFixtures, useUpcomingFixtures, useRecentFixtures } from "@/hooks/useFixtures";
import TeamLogo from "./teams/TeamLogo";
import TournamentLogo from "./TournamentLogo";

const Fixtures = () => {
  const { data: allFixtures, isLoading: allLoading, error } = useFixtures();
  const { data: upcomingFixtures, isLoading: upcomingLoading } = useUpcomingFixtures();
  const { data: recentFixtures, isLoading: recentLoading } = useRecentFixtures();

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center pb-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error Loading Fixtures</h2>
          <p className="text-white/80">Please check your connection and try again.</p>
          <p className="text-white/60 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Create a combined date-time for proper sorting with fallback for missing times
  const getFixtureDateTime = (fixture: any) => {
    const dateStr = fixture.match_date;
    const timeStr = fixture.match_time || '18:00:00'; // Default time fallback
    
    try {
      return new Date(`${dateStr}T${timeStr}`);
    } catch {
      // Fallback if date parsing fails
      return new Date(dateStr + 'T18:00:00');
    }
  };

  const FixtureCard = ({ fixture, showScore = false }: { fixture: any, showScore?: boolean }) => (
    <Card className="card-shadow-lg hover:card-shadow-lg hover:scale-105 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(fixture.match_date)}
            </span>
          </div>
          <Badge variant={fixture.status === 'completed' ? 'default' : 'outline'}>
            {fixture.status}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <TeamLogo team={fixture.home_team} size="small" />
              <div>
                <p className="font-semibold">{fixture.home_team?.name || 'TBD'}</p>
                <p className="text-xs text-muted-foreground">Home</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mx-4">
              {showScore && fixture.status === 'completed' ? (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {fixture.home_score || 0} - {fixture.away_score || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Final</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {formatTime(fixture.match_time)}
                  </div>
                  <p className="text-xs text-muted-foreground">Kick off</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="text-right">
                <p className="font-semibold">{fixture.away_team?.name || 'TBD'}</p>
                <p className="text-xs text-muted-foreground">Away</p>
              </div>
              <TeamLogo team={fixture.away_team} size="small" />
            </div>
          </div>

          {/* Venue */}
          {fixture.venue && fixture.venue !== 'TBD' && (
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{fixture.venue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const LoadingCard = () => (
    <Card className="card-shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Sort all fixtures with proper date-time handling and validation
  const sortedAllFixtures = allFixtures?.slice().sort((a, b) => {
    try {
      const dateTimeA = getFixtureDateTime(a);
      const dateTimeB = getFixtureDateTime(b);
      
      // For completed fixtures, show most recent first
      if (a.status === 'completed' && b.status === 'completed') {
        return dateTimeB.getTime() - dateTimeA.getTime();
      }
      
      // For scheduled/upcoming fixtures, show earliest first
      if (a.status !== 'completed' && b.status !== 'completed') {
        return dateTimeA.getTime() - dateTimeB.getTime();
      }
      
      // Mixed status: completed fixtures first, then upcoming
      if (a.status === 'completed') return -1;
      if (b.status === 'completed') return 1;
      
      return dateTimeA.getTime() - dateTimeB.getTime();
    } catch (error) {
      console.warn('Error sorting fixtures:', error, { fixtureA: a, fixtureB: b });
      // Fallback: sort by ID if date parsing fails
      return (a.id || 0) - (b.id || 0);
    }
  });

  return (
    <div className="min-h-screen gradient-bg pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TournamentLogo />
              <h1 className="text-3xl font-bold text-white">Fixtures</h1>
            </div>
            <p className="text-white/80">Match schedule and results</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Upcoming Fixtures */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Upcoming Matches</h2>
          </div>
          
          <div className="grid gap-4">
            {upcomingLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <LoadingCard key={index} />
              ))
            ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
              upcomingFixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))
            ) : (
              <Card className="card-shadow-lg">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming fixtures scheduled</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Recent Results</h2>
          </div>
          
          <div className="grid gap-4">
            {recentLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <LoadingCard key={index} />
              ))
            ) : recentFixtures && recentFixtures.length > 0 ? (
              recentFixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} showScore />
              ))
            ) : (
              <Card className="card-shadow-lg">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent results available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All Fixtures */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">All Fixtures</h2>
          </div>
          
          <div className="grid gap-4">
            {allLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} />
              ))
            ) : sortedAllFixtures && sortedAllFixtures.length > 0 ? (
              sortedAllFixtures.map((fixture) => (
                <FixtureCard 
                  key={fixture.id} 
                  fixture={fixture} 
                  showScore={fixture.status === 'completed'} 
                />
              ))
            ) : (
              <Card className="card-shadow-lg">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fixtures found</p>
                  <p className="text-sm">Fixtures will appear here once they are added to the database.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fixtures;

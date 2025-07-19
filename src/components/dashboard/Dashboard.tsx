
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LeagueTable from "./LeagueTable";
import RecentResults from "./RecentResults";
import UpcomingFixtures from "./UpcomingFixtures";
import TopScorers from "./TopScorers";
import TopAssists from "./TopAssists";
import PositionTrackingDebug from "../debug/PositionTrackingDebug";
import { useTeams } from "@/hooks/useTeams";
import { useFixtures } from "@/hooks/useFixtures";
import { Settings, Trophy, Calendar, Target, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [showDebugTools, setShowDebugTools] = useState(false);
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();

  // Calculate some quick stats
  const totalMatches = fixtures?.filter(f => f.status === 'completed').length || 0;
  const upcomingMatches = fixtures?.filter(f => f.status === 'scheduled').length || 0;
  const totalTeams = teams?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">League Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of the current season's performance and standings
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebugTools(!showDebugTools)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Debug Tools
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {totalTeams} Teams
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {totalMatches} Played
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {upcomingMatches} Upcoming
            </Badge>
          </div>
        </div>
      </div>

      {/* Debug Tools */}
      {showDebugTools && (
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Position Tracking Debug Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PositionTrackingDebug />
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">League Table</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LeagueTable teams={teams} isLoading={teamsLoading} />
            </div>
            <div className="space-y-6">
              <TopScorers />
              <TopAssists />
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <RecentResults />
            <UpcomingFixtures />
          </div>
        </TabsContent>

        <TabsContent value="table">
          <LeagueTable teams={teams} isLoading={teamsLoading} />
        </TabsContent>

        <TabsContent value="fixtures" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RecentResults />
            <UpcomingFixtures />
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TopScorers />
            <TopAssists />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

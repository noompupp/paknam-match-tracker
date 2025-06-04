
import { useTeams } from "@/hooks/useTeams";
import { useEnhancedTopScorers, useEnhancedTopAssists } from "@/hooks/useEnhancedPlayerStats";
import { useRecentFixtures, useUpcomingFixtures } from "@/hooks/useFixtures";
import DashboardHeader from "./dashboard/DashboardHeader";
import LeagueTable from "./dashboard/LeagueTable";
import TopScorersCard from "./dashboard/TopScorersCard";
import TopAssistsCard from "./dashboard/TopAssistsCard";
import RecentResultsCard from "./dashboard/RecentResultsCard";
import UpcomingFixturesCard from "./dashboard/UpcomingFixturesCard";

const Dashboard = () => {
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: topScorers, isLoading: scorersLoading, error: scorersError } = useEnhancedTopScorers(5);
  const { data: topAssists, isLoading: assistsLoading, error: assistsError } = useEnhancedTopAssists(5);
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
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <LeagueTable teams={teams} isLoading={teamsLoading} />

        <div className="grid md:grid-cols-2 gap-8">
          <TopScorersCard 
            topScorers={topScorers} 
            isLoading={scorersLoading} 
            error={scorersError}
          />
          <TopAssistsCard 
            topAssists={topAssists} 
            isLoading={assistsLoading} 
            error={assistsError}
          />
          <RecentResultsCard recentFixtures={recentFixtures} isLoading={recentLoading} />
        </div>

        <UpcomingFixturesCard upcomingFixtures={upcomingFixtures} isLoading={upcomingLoading} />
      </div>
    </div>
  );
};

export default Dashboard;

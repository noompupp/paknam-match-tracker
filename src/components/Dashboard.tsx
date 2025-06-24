
import { useTeams } from "@/hooks/useTeams";
import { useEnhancedTopScorers, useEnhancedTopAssists } from "@/hooks/useEnhancedPlayerStats";
import { useRecentFixtures, useUpcomingFixtures } from "@/hooks/useFixtures";
import DashboardHeader from "./dashboard/DashboardHeader";
import LeagueTable from "./dashboard/LeagueTable";
import TopScorersCard from "./dashboard/TopScorersCard";
import TopAssistsCard from "./dashboard/TopAssistsCard";
import TeamOfTheWeekCard from "./dashboard/TeamOfTheWeekCard";
import EnhancedRecentResultsCard from "./dashboard/EnhancedRecentResultsCard";
import UpcomingFixturesCard from "./dashboard/UpcomingFixturesCard";
import MatchPreviewModal from "./fixtures/MatchPreviewModal";
import { useState } from "react";
import { Fixture } from "@/types/database";

interface DashboardProps {
  onNavigateToResults?: () => void;
  onNavigateToFixtures?: () => void;
}

const Dashboard = ({ onNavigateToResults, onNavigateToFixtures }: DashboardProps) => {
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: topScorers, isLoading: scorersLoading, error: scorersError } = useEnhancedTopScorers(5);
  const { data: topAssists, isLoading: assistsLoading, error: assistsError } = useEnhancedTopAssists(5);
  const { data: recentFixtures, isLoading: recentLoading } = useRecentFixtures();
  const { data: upcomingFixtures, isLoading: upcomingLoading } = useUpcomingFixtures();

  // Match Preview Modal state
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleViewAllRecentResults = () => {
    console.log('Dashboard: handleViewAllRecentResults called');
    if (onNavigateToResults) {
      onNavigateToResults();
    }
  };

  const handleViewAllUpcomingFixtures = () => {
    console.log('Dashboard: handleViewAllUpcomingFixtures called');
    console.log('Dashboard: onNavigateToFixtures exists:', !!onNavigateToFixtures);
    if (onNavigateToFixtures) {
      console.log('Dashboard: Calling onNavigateToFixtures');
      onNavigateToFixtures();
    } else {
      console.error('Dashboard: onNavigateToFixtures is not available');
    }
  };

  const handleFixturePreview = (fixture: Fixture) => {
    setSelectedFixture(fixture);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setSelectedFixture(null);
    setIsPreviewModalOpen(false);
  };

  if (teamsError) {
    return (
      <div className="gradient-bg flex items-center justify-center min-h-screen">
        <div className="text-center text-foreground container-responsive">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="gradient-bg">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto container-responsive py-8 space-y-8 mobile-content-spacing">
          <LeagueTable teams={teams} isLoading={teamsLoading} />

          <div className="grid md:grid-cols-3 gap-8">
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
            <TeamOfTheWeekCard />
          </div>

          <EnhancedRecentResultsCard 
            recentFixtures={recentFixtures} 
            isLoading={recentLoading}
            onViewAll={handleViewAllRecentResults}
          />

          <UpcomingFixturesCard 
            upcomingFixtures={upcomingFixtures} 
            isLoading={upcomingLoading}
            onViewAll={handleViewAllUpcomingFixtures}
            onFixturePreview={handleFixturePreview}
          />
        </div>
      </div>

      {/* Match Preview Modal */}
      <MatchPreviewModal
        fixture={selectedFixture}
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
      />
    </>
  );
};

export default Dashboard;

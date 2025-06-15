
import { useTeams } from "@/hooks/useTeams";
import { useEnhancedTopScorers, useEnhancedTopAssists } from "@/hooks/useEnhancedPlayerStats";
import { useRecentFixtures, useUpcomingFixtures } from "@/hooks/useFixtures";
import DashboardHeader from "./dashboard/DashboardHeader";
import LeagueTable from "./dashboard/LeagueTable";
import TopScorersCard from "./dashboard/TopScorersCard";
import TopAssistsCard from "./dashboard/TopAssistsCard";
import EnhancedRecentResultsCard from "./dashboard/EnhancedRecentResultsCard";
import UpcomingFixturesCard from "./dashboard/UpcomingFixturesCard";
import MatchPreviewModal from "./fixtures/MatchPreviewModal";
import { useState } from "react";
import { Fixture, Team } from "@/types/database";

interface DashboardProps {
  onNavigateToResults?: () => void;
  onNavigateToFixtures?: () => void;
}

// Helper function to transform team data to match Team interface
const transformTeamData = (teamData: any): Team | undefined => {
  if (!teamData) return undefined;
  
  return {
    id: teamData.id || 0,
    name: teamData.name || '',
    logo: teamData.logo || '⚽',
    logoURL: teamData.logoURL,
    founded: teamData.founded || '2020',
    captain: teamData.captain || '',
    position: teamData.position || 1,
    previous_position: teamData.previous_position || null,
    points: teamData.points || 0,
    played: teamData.played || 0,
    won: teamData.won || 0,
    drawn: teamData.drawn || 0,
    lost: teamData.lost || 0,
    goals_for: teamData.goals_for || 0,
    goals_against: teamData.goals_against || 0,
    goal_difference: teamData.goal_difference || 0,
    color: teamData.color,
    created_at: teamData.created_at || new Date().toISOString(),
    updated_at: teamData.updated_at || new Date().toISOString(),
    __id__: teamData.__id__ || ''
  };
};

// Helper function to transform fixture data to match Fixture interface
const transformFixtureData = (fixture: any): Fixture => {
  return {
    id: fixture.id,
    home_team_id: fixture.home_team_id || '',
    away_team_id: fixture.away_team_id || '',
    match_date: fixture.match_date,
    match_time: fixture.time || fixture.match_time || '18:00:00',
    home_score: fixture.home_score,
    away_score: fixture.away_score,
    status: fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed',
    venue: fixture.venue,
    created_at: fixture.created_at,
    updated_at: fixture.updated_at,
    __id__: fixture.__id__,
    home_team: transformTeamData(fixture.home_team),
    away_team: transformTeamData(fixture.away_team),
  };
};

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

  const handleFixturePreview = (fixture: any) => {
    const transformedFixture = transformFixtureData(fixture);
    setSelectedFixture(transformedFixture);
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

  // Transform fixtures to match the Fixture interface
  const transformedRecentFixtures = recentFixtures?.map(transformFixtureData);
  const transformedUpcomingFixtures = upcomingFixtures?.map(transformFixtureData);

  return (
    <>
      <div className="gradient-bg">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto container-responsive py-8 space-y-8 mobile-content-spacing">
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
          </div>

          <EnhancedRecentResultsCard 
            recentFixtures={transformedRecentFixtures} 
            isLoading={recentLoading}
            onViewAll={handleViewAllRecentResults}
          />

          <UpcomingFixturesCard 
            upcomingFixtures={transformedUpcomingFixtures} 
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

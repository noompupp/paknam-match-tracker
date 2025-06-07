
import { useState } from "react";
import { useFixtures, useUpcomingFixtures, useRecentFixtures } from "@/hooks/useFixtures";
import { sortFixtures } from "@/utils/fixtureUtils";
import FixturesHeader from "./fixtures/FixturesHeader";
import UpcomingFixturesSection from "./fixtures/UpcomingFixturesSection";
import RecentResultsSection from "./fixtures/RecentResultsSection";
import AllFixturesSection from "./fixtures/AllFixturesSection";
import MatchSummaryDialog from "./fixtures/MatchSummaryDialog";

const Fixtures = () => {
  const { data: allFixtures, isLoading: allLoading, error } = useFixtures();
  const { data: upcomingFixtures, isLoading: upcomingLoading } = useUpcomingFixtures();
  const { data: recentFixtures, isLoading: recentLoading } = useRecentFixtures();
  
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);

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

  const handleFixtureClick = (fixture: any) => {
    if (fixture.status === 'completed') {
      setSelectedFixture(fixture);
      setShowSummary(true);
    }
  };

  // Sort all fixtures with proper date-time handling and validation
  const sortedAllFixtures = sortFixtures(allFixtures || []);

  return (
    <>
      <div className="min-h-screen gradient-bg pb-20">
        <FixturesHeader />

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <UpcomingFixturesSection 
            upcomingFixtures={upcomingFixtures || []}
            isLoading={upcomingLoading}
            onFixtureClick={handleFixtureClick}
          />

          <RecentResultsSection 
            recentFixtures={recentFixtures || []}
            isLoading={recentLoading}
            onFixtureClick={handleFixtureClick}
          />

          <AllFixturesSection 
            sortedAllFixtures={sortedAllFixtures}
            isLoading={allLoading}
            onFixtureClick={handleFixtureClick}
          />
        </div>
      </div>

      {/* Match Summary Dialog */}
      <MatchSummaryDialog 
        fixture={selectedFixture}
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          setSelectedFixture(null);
        }}
      />
    </>
  );
};

export default Fixtures;


import { useState } from "react";
import { useFixtures, useUpcomingFixtures } from "@/hooks/useFixtures";
import { sortFixtures } from "@/utils/fixtureUtils";
import FixturesHeader from "./fixtures/FixturesHeader";
import UpcomingFixturesSection from "./fixtures/UpcomingFixturesSection";
import AllFixturesSection from "./fixtures/AllFixturesSection";
import MatchSummaryDialog from "./fixtures/MatchSummaryDialog";
import MatchPreviewModal from "./fixtures/MatchPreviewModal";
import UnifiedContainer from "./shared/UnifiedContainer";

const Fixtures = () => {
  const { data: allFixtures, isLoading: allLoading, error } = useFixtures();
  const { data: upcomingFixtures, isLoading: upcomingLoading } = useUpcomingFixtures();
  
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [previewFixture, setPreviewFixture] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (error) {
    return (
      <UnifiedContainer variant="content" className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-foreground">
          <h2 className="text-2xl font-bold mb-4">Error Loading Fixtures</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
          <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        </div>
      </UnifiedContainer>
    );
  }

  const handleFixtureClick = (fixture: any) => {
    if (fixture.status === 'completed') {
      setSelectedFixture(fixture);
      setShowSummary(true);
    }
  };

  const handlePreviewClick = (fixture: any) => {
    setPreviewFixture(fixture);
    setShowPreview(true);
  };

  // Sort all fixtures with proper date-time handling and validation
  const sortedAllFixtures = sortFixtures(allFixtures || []);

  return (
    <>
      <FixturesHeader />

      <UnifiedContainer variant="content" spacing="normal">
        <UpcomingFixturesSection 
          upcomingFixtures={upcomingFixtures || []}
          allFixtures={allFixtures || []}
          isLoading={upcomingLoading}
          onFixtureClick={handleFixtureClick}
          onPreviewClick={handlePreviewClick}
        />

        <AllFixturesSection 
          sortedAllFixtures={sortedAllFixtures}
          isLoading={allLoading}
          onFixtureClick={handleFixtureClick}
          onPreviewClick={handlePreviewClick}
        />
      </UnifiedContainer>

      {/* Match Summary Dialog */}
      <MatchSummaryDialog 
        fixture={selectedFixture}
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          setSelectedFixture(null);
        }}
      />

      {/* Match Preview Modal */}
      <MatchPreviewModal 
        fixture={previewFixture}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewFixture(null);
        }}
      />
    </>
  );
};

export default Fixtures;

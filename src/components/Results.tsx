
import { useRecentFixtures, useFixtures } from "@/hooks/useFixtures";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import CompactFixtureCard from "./shared/CompactFixtureCard";
import LoadingCard from "./fixtures/LoadingCard";
import MatchSummaryDialog from "./fixtures/MatchSummaryDialog";
import ResultsHeader from "./results/ResultsHeader";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import RecentResultsSection from "./fixtures/RecentResultsSection";
import UnifiedContainer from "./shared/UnifiedContainer";

const Results = () => {
  const { data: recentFixtures, isLoading, error } = useRecentFixtures();
  const { data: allFixtures } = useFixtures(); // Get all fixtures for gameweek calculation
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  if (error) {
    return (
      <UnifiedContainer variant="content" className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-foreground">
          <h2 className="text-2xl font-bold mb-4">Error Loading Results</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
          <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        </div>
      </UnifiedContainer>
    );
  }

  const handleFixtureClick = (fixture: any) => {
    setSelectedFixture(fixture);
    setShowSummary(true);
  };

  return (
    <>
      <ResultsHeader />

      <UnifiedContainer variant="content" spacing="normal">
        <RecentResultsSection 
          recentFixtures={recentFixtures || []}
          allFixtures={allFixtures || []}
          isLoading={isLoading}
          onFixtureClick={handleFixtureClick}
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
    </>
  );
};

export default Results;

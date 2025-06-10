
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

const Results = () => {
  const { data: recentFixtures, isLoading, error } = useRecentFixtures();
  const { data: allFixtures } = useFixtures(); // Get all fixtures for gameweek calculation
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  if (error) {
    return (
      <div className="gradient-bg flex items-center justify-center min-h-screen">
        <div className="text-center text-foreground container-responsive">
          <h2 className="text-2xl font-bold mb-4">Error Loading Results</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
          <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const handleFixtureClick = (fixture: any) => {
    setSelectedFixture(fixture);
    setShowSummary(true);
  };

  return (
    <>
      <div className="gradient-bg">
        <ResultsHeader />

        {/* Results Content */}
        <div className="max-w-7xl mx-auto container-responsive py-8 space-y-8 mobile-content-spacing">
          <RecentResultsSection 
            recentFixtures={recentFixtures || []}
            allFixtures={allFixtures || []}
            isLoading={isLoading}
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

export default Results;

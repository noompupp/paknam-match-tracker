
import { useRecentFixtures } from "@/hooks/useFixtures";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import FixtureCard from "./fixtures/FixtureCard";
import LoadingCard from "./fixtures/LoadingCard";
import MatchSummaryDialog from "./fixtures/MatchSummaryDialog";
import ResultsHeader from "./results/ResultsHeader";

const Results = () => {
  const { data: recentFixtures, isLoading, error } = useRecentFixtures();
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);

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
    if (fixture.status === 'completed') {
      setSelectedFixture(fixture);
      setShowSummary(true);
    }
  };

  return (
    <>
      <div className="gradient-bg">
        <ResultsHeader />

        {/* Results Content */}
        <div className="max-w-7xl mx-auto container-responsive py-8 space-y-8 mobile-content-spacing">
          <Card className="card-shadow-lg">
            <CardHeader className="flex flex-row items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <LoadingCard key={index} />
                ))
              ) : recentFixtures && recentFixtures.length > 0 ? (
                recentFixtures.map((fixture) => (
                  <FixtureCard 
                    key={fixture.id} 
                    fixture={fixture} 
                    showScore 
                    onFixtureClick={handleFixtureClick}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <div className="space-y-2">
                    <div className="text-4xl">⚽</div>
                    <p className="text-lg font-medium">No results available</p>
                    <p className="text-sm">Check back after matches have been completed</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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


import { useRecentFixtures } from "@/hooks/useFixtures";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import FixtureCard from "./shared/FixtureCard";
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
          <Card className="border border-emerald-200 bg-emerald-500/5 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-200">
                <Trophy className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-foreground">Recent Results</CardTitle>
                <p className="text-sm text-muted-foreground">Latest completed matches</p>
              </div>
              {recentFixtures && recentFixtures.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">{recentFixtures.length}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <LoadingCard key={index} />
                ))
              ) : recentFixtures && recentFixtures.length > 0 ? (
                recentFixtures.map((fixture) => (
                  <FixtureCard 
                    key={fixture.id} 
                    fixture={fixture} 
                    onClick={handleFixtureClick}
                    useCompactLayout={true}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <div className="space-y-3">
                    <div className="text-6xl opacity-30">⚽</div>
                    <div>
                      <p className="text-lg font-medium">No results available</p>
                      <p className="text-sm mt-1">Check back after matches have been completed</p>
                    </div>
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


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { useState } from "react";
import MatchSummaryDialog from "../fixtures/MatchSummaryDialog";
import FixtureCard from "../shared/FixtureCard";

interface EnhancedRecentResultsCardProps {
  recentFixtures: Fixture[] | undefined;
  isLoading: boolean;
  onViewAll: () => void;
}

const EnhancedRecentResultsCard = ({ recentFixtures, isLoading, onViewAll }: EnhancedRecentResultsCardProps) => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  const handleFixtureClick = (fixture: Fixture) => {
    setSelectedFixture(fixture);
  };

  const handleCloseDialog = () => {
    setSelectedFixture(null);
  };

  // Limit to 3 most recent fixtures for dashboard display
  const displayedFixtures = recentFixtures?.slice(0, 3) || [];

  return (
    <>
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Results</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-muted-foreground hover:text-foreground"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/20 flex items-center justify-center">
                  <div className="flex items-center gap-8 w-full max-w-md">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedFixtures.length > 0 ? (
            <div className="space-y-3">
              {displayedFixtures.map((fixture) => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  onClick={handleFixtureClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <div className="space-y-2">
                <div className="text-4xl">⚽</div>
                <p className="text-lg font-medium">No recent results available</p>
                <p className="text-sm">Check back after matches have been played</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Summary Dialog */}
      {selectedFixture && (
        <MatchSummaryDialog
          fixture={selectedFixture}
          isOpen={!!selectedFixture}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default EnhancedRecentResultsCard;

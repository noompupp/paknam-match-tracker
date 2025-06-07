
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { useState } from "react";
import MatchSummaryDialog from "../fixtures/MatchSummaryDialog";
import FixtureCard from "../shared/FixtureCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedRecentResultsCardProps {
  recentFixtures: Fixture[] | undefined;
  isLoading: boolean;
  onViewAll: () => void;
}

const EnhancedRecentResultsCard = ({ recentFixtures, isLoading, onViewAll }: EnhancedRecentResultsCardProps) => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const isMobile = useIsMobile();

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
        <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
          <CardTitle className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Recent Results
          </CardTitle>
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            onClick={onViewAll}
            className={`text-muted-foreground hover:text-foreground transition-colors ${
              isMobile ? 'min-h-[44px] min-w-[44px] px-3' : ''
            }`}
          >
            <span className={isMobile ? 'text-sm' : 'text-sm'}>
              View All
            </span>
            <ArrowRight className={`ml-1 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </CardHeader>
        <CardContent className={`space-y-3 ${isMobile ? 'px-4 pb-4' : 'px-6 pb-6'}`}>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={`rounded-lg bg-muted/20 flex items-center justify-center ${
                  isMobile ? 'p-3' : 'p-4'
                }`}>
                  {isMobile ? (
                    // Mobile skeleton: vertical layout
                    <div className="flex flex-col items-center space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 w-12" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ) : (
                    // Desktop skeleton: horizontal layout
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
                  )}
                  <div className="absolute top-2 right-2">
                    <Skeleton className={`${isMobile ? 'h-2 w-12' : 'h-3 w-16'}`} />
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
                <div className={`${isMobile ? 'text-3xl' : 'text-4xl'}`}>⚽</div>
                <p className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>No recent results available</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Check back after matches have been played</p>
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

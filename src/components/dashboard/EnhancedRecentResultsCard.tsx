
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { useState } from "react";
import MatchSummaryDialog from "../fixtures/MatchSummaryDialog";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface EnhancedRecentResultsCardProps {
  recentFixtures: Fixture[] | undefined;
  isLoading: boolean;
  onViewAll: () => void;
}

const EnhancedRecentResultsCard = ({ recentFixtures, isLoading, onViewAll }: EnhancedRecentResultsCardProps) => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

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
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold">Recent Results</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
          >
            <span className="hidden sm:inline mr-1">View All</span>
            <span className="sm:hidden text-xs mr-1">All</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </CardHeader>
        <CardContent className={`${isMobilePortrait ? 'space-y-3 px-3' : 'space-y-4 px-6'}`}>
          {isLoading ? (
            <div className={`${isMobilePortrait ? 'space-y-2' : 'space-y-3'}`}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={`${isMobilePortrait ? 'p-2' : 'p-4'} rounded-lg bg-muted/20 relative`}>
                  <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8">
                    <div className="flex items-center gap-1 sm:gap-3 flex-1 justify-end">
                      <Skeleton className="h-3 w-10 sm:h-4 sm:w-20" />
                      <Skeleton className="h-5 w-5 sm:h-8 sm:w-8 rounded-full flex-shrink-0" />
                    </div>
                    <Skeleton className="h-5 w-10 sm:h-8 sm:w-16 flex-shrink-0" />
                    <div className="flex items-center gap-1 sm:gap-3 flex-1 justify-start">
                      <Skeleton className="h-5 w-5 sm:h-8 sm:w-8 rounded-full flex-shrink-0" />
                      <Skeleton className="h-3 w-10 sm:h-4 sm:w-20" />
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <Skeleton className="h-2 w-8 sm:h-3 sm:w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedFixtures.length > 0 ? (
            <div className={`${isMobilePortrait ? 'space-y-2' : 'space-y-3'}`}>
              {displayedFixtures.map((fixture) => (
                <CompactFixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  onFixtureClick={handleFixtureClick}
                  showDate={true}
                  showVenue={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4 sm:py-8">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-4xl">⚽</div>
                <p className="text-sm sm:text-lg font-medium">No recent results available</p>
                <p className="text-xs sm:text-sm">Check back after matches have been played</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Summary Dialog - Mobile optimized */}
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

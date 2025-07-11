
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import DateGroupHeader from "../shared/DateGroupHeader";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { groupFixturesByDate, initializeGameweekMappings } from "@/utils/dateGroupingUtils";
import { useEffect } from "react";

interface RecentResultsSectionProps {
  recentFixtures: any[];
  allFixtures?: any[]; // Add this to initialize gameweek mappings
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
}

const RecentResultsSection = ({ 
  recentFixtures, 
  allFixtures = [],
  isLoading, 
  onFixtureClick 
}: RecentResultsSectionProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;
  
  // Initialize gameweek mappings when fixtures are available
  useEffect(() => {
    if (allFixtures.length > 0) {
      initializeGameweekMappings(allFixtures);
    }
  }, [allFixtures]);
  
  // Filter to only show completed fixtures
  const completedFixtures = recentFixtures.filter(fixture => fixture.status === 'completed');

  if (completedFixtures.length === 0 && !isLoading) {
    return null; // Don't show section if no results
  }

  // Group fixtures by date
  const groupedFixtures = groupFixturesByDate(completedFixtures);

  return (
    <div id="recent-results" className="scroll-mt-20 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground py-1 px-3 rounded-lg bg-gradient-to-r from-muted via-background to-muted/60 shadow-sm">
          All Results
        </h2>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : (
          groupedFixtures.map((group) => (
            <div key={group.date} className="space-y-3">
              <DateGroupHeader
                date={group.date}
                displayDate={group.displayDate}
                fixtureCount={group.fixtures.length}
                gameweek={group.gameweek}
                gameweekLabel={group.gameweekLabel}
                isFinalGameweek={group.isFinalGameweek}
              />
              <div className="grid gap-3">
                {group.fixtures.map((fixture) => (
                  <CompactFixtureCard 
                    key={fixture.id} 
                    fixture={fixture} 
                    onFixtureClick={onFixtureClick}
                    showDate={true}
                    showVenue={true}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentResultsSection;

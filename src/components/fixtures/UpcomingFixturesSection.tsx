
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import DateGroupHeader from "../shared/DateGroupHeader";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { groupFixturesByDate, initializeGameweekMappings } from "@/utils/dateGroupingUtils";
import { useEffect } from "react";

interface UpcomingFixturesSectionProps {
  upcomingFixtures: any[];
  allFixtures?: any[]; // Add this to initialize gameweek mappings
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
  onPreviewClick?: (fixture: any) => void;
}

const UpcomingFixturesSection = ({ 
  upcomingFixtures, 
  allFixtures = [],
  isLoading, 
  onFixtureClick,
  onPreviewClick
}: UpcomingFixturesSectionProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  // Initialize gameweek mappings when fixtures are available
  useEffect(() => {
    if (allFixtures.length > 0) {
      initializeGameweekMappings(allFixtures);
    }
  }, [allFixtures]);

  // Group fixtures by date
  const groupedFixtures = groupFixturesByDate(upcomingFixtures || []);

  return (
    <div id="upcoming-fixtures" className="scroll-mt-20">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-white" />
        <h2 className="text-2xl font-bold text-white">Upcoming Matches</h2>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : groupedFixtures && groupedFixtures.length > 0 ? (
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
                    onPreviewClick={onPreviewClick}
                    showDate={false}
                    showVenue={true}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <Card className="card-shadow-lg">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming fixtures scheduled</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpcomingFixturesSection;

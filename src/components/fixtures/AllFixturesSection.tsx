import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import DateGroupHeader from "../shared/DateGroupHeader";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { groupFixturesByDate } from "@/utils/dateGroupingUtils";

interface AllFixturesSectionProps {
  sortedAllFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
  onPreviewClick?: (fixture: any) => void;
}

const AllFixturesSection = ({ 
  sortedAllFixtures, 
  isLoading, 
  onFixtureClick,
  onPreviewClick
}: AllFixturesSectionProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  // Group fixtures by date, but keep chronological order for mixed status
  const groupedFixtures = groupFixturesByDate(sortedAllFixtures || []);

  return (
    <div id="all-fixtures" className="scroll-mt-20">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6 text-white" />
        <h2 className="text-2xl font-bold text-white">All Fixtures</h2>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
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
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No fixtures found</p>
              <p className="text-sm">Fixtures will appear here once they are added to the database.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllFixturesSection;
